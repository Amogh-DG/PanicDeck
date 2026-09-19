import base64
import json
import os
import re
import traceback
import uuid
import boto3
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
                payload = json.loads(body_data)

        file_name = payload.get("file_name")
        content_type = payload.get("content_type")

        if not isinstance(file_name, str) or not file_name.strip():
            return create_response(400, {
                "status": "error",
                "message": "file_name must be a non-empty string"
            })

        allowed_types = {
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp",
            "text/plain"
        }

        if content_type not in allowed_types:
            return create_response(400, {
                "status": "error",
                "message": "unsupported content_type"
            })

        base = os.path.basename(file_name)
        safe = re.sub(r"[^A-Za-z0-9._-]", "-", base)
        safe = re.sub(r"-+", "-", safe)
        safe = safe.lstrip(".-")
        safe = safe[-100:]
        if not safe:
            safe = "file"

        s3_key = f"uploads/{user_id}/{uuid.uuid4().hex}/{safe}"

        s3 = boto3.client("s3", region_name=aws_region, config=Config(signature_version="s3v4"))
        url = s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": s3_bucket,
                "Key": s3_key,
                "ContentType": content_type
            },
            ExpiresIn=300
        )

        return create_response(200, {
            "status": "success",
            "upload_url": url,
            "s3_key": s3_key
        })

    except Exception:
        import traceback
        traceback.print_exc()
        return create_response(500, {
            "status": "error",
            "message": "internal error"
        })
