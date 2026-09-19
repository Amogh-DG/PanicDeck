import json
import os
import traceback
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

        s3 = boto3.client("s3", region_name=aws_region, config=Config(signature_version="s3v4"))
        prefix = f"uploads/{user_id}/"
        
        paginator = s3.get_paginator("list_objects_v2")
        all_objects = []
        for page in paginator.paginate(Bucket=s3_bucket, Prefix=prefix):
            if "Contents" in page:
                all_objects.extend(page["Contents"])
                
        all_objects.sort(key=lambda x: x["LastModified"], reverse=True)
        all_objects = all_objects[:200]
        
        files = []
        for obj in all_objects:
            key = obj["Key"]
            file_name = key.split("/")[-1] if "/" in key else key
            files.append({
                "s3_key": key,
                "file_name": file_name,
                "size": obj["Size"],
                "last_modified": obj["LastModified"].isoformat()
            })
            
        return create_response(200, {
            "status": "success",
            "files": files
        })
        
    except Exception:
        import traceback
        traceback.print_exc()
        return create_response(500, {
            "status": "error",
            "message": "internal error"
        })
