import base64
import json
import os
import traceback
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config

def create_response(status_code, body):
    body_str = body if isinstance(body, str) else json.dumps(body)
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS"
        },
        "body": body_str
    }

def handler(event, context):
    try:
        req_method = event.get("requestContext", {}).get("http", {}).get("method")
        if not req_method:
            req_method = event.get("httpMethod")
        if req_method == "OPTIONS":
            return create_response(200, "")

        authorizer = event.get("requestContext", {}).get("authorizer", {})
        user_id = authorizer.get("jwt", {}).get("claims", {}).get("sub")
        require_auth = os.environ.get("REQUIRE_AUTH", "true").lower() == "true"

        if require_auth and not user_id:
            return create_response(401, {"status": "error", "message": "unauthorized"})
        elif not require_auth:
            user_id = "anonymous"

        s3_bucket = os.environ.get("S3_BUCKET")
        aws_region = os.environ.get("AWS_REGION")

        if not s3_bucket or not aws_region:
            return create_response(500, {
                "status": "error",
                "message": "missing environment variables"
            })

        payload = event
        if "body" in event:
            body_data = event["body"]
            if event.get("isBase64Encoded"):
                body_data = base64.b64decode(body_data).decode("utf-8")
            if isinstance(body_data, str):
                try:
                    payload = json.loads(body_data)
                except Exception:
                    payload = {}

        s3_key = payload.get("s3_key")
        if not isinstance(s3_key, str) or not s3_key.strip():
            return create_response(400, {
                "status": "error",
                "message": "invalid s3_key"
            })

        if not s3_key.startswith(f"uploads/{user_id}/"):
            return create_response(403, {
                "status": "error",
                "message": "not allowed"
            })

        s3 = boto3.client("s3", region_name=aws_region, config=Config(signature_version="s3v4"))
        
        try:
            s3.head_object(Bucket=s3_bucket, Key=s3_key)
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code in ["404", "NoSuchKey"]:
                return create_response(400, {
                    "status": "error",
                    "message": "file not found"
                })
            raise

        url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": s3_bucket,
                "Key": s3_key,
                "ResponseContentDisposition": "inline"
            },
            ExpiresIn=300
        )

        return create_response(200, {
            "status": "success",
            "download_url": url
        })
        
    except Exception:
        import traceback
        traceback.print_exc()
        return create_response(500, {
            "status": "error",
            "message": "internal error"
        })
