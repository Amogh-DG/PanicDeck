import base64
import json
import os
import traceback
from decimal import Decimal

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

def decimal_to_native(obj):
    if isinstance(obj, list):
        return [decimal_to_native(i) for i in obj]
    if isinstance(obj, dict):
        return {k: decimal_to_native(v) for k, v in obj.items()}
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj

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

        table_name = os.environ.get("DYNAMODB_TABLE_SCORES")
        aws_region = os.environ.get("AWS_REGION")

        if not table_name or not aws_region:
            return create_response(500, {
                "status": "error",
                "message": "missing environment variables"
            })

        payload = {}
        if "body" in event and event["body"]:
            body_data = event["body"]
            if event.get("isBase64Encoded"):
                body_data = base64.b64decode(body_data).decode("utf-8")
            if isinstance(body_data, str) and body_data.strip():
                try:
                    payload = json.loads(body_data)
                except Exception:
                    payload = {}

        limit = payload.get("limit", 20)
        if not isinstance(limit, int) or limit < 1:
            limit = 20
        limit = min(limit, 100)

        import boto3
        from boto3.dynamodb.conditions import Key

        dynamodb = boto3.resource("dynamodb", region_name=aws_region)
        table = dynamodb.Table(table_name)

        resp = table.query(
            KeyConditionExpression=Key("user_id").eq(user_id),
            ScanIndexForward=False,
            Limit=limit
        )

        raw_items = resp.get("Items", [])
        items = decimal_to_native(raw_items)

        return create_response(200, {
            "status": "success",
            "scores": items
        })

    except Exception:
        traceback.print_exc()
        return create_response(500, {"status": "error", "message": "internal error"})
