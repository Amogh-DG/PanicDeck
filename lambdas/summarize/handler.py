import os
import json
import base64
import boto3
import urllib.request
import urllib.error
from botocore.exceptions import ClientError

class ModelRateLimitError(Exception):
    pass

class ModelInvalidResponseError(Exception):
    pass

def call_gemini(req, context):
    import time
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=25) as response:
                response_data = json.loads(response.read().decode("utf-8"))
            candidate = response_data.get("candidates", [{}])[0]
            if candidate.get("finishReason") != "STOP":
                raise ValueError
            output_text = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
            return json.loads(output_text)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                if attempt == 0 and context and hasattr(context, "get_remaining_time_in_millis") and context.get_remaining_time_in_millis() > 12000:
                    time.sleep(2)
                    continue
                raise ModelRateLimitError
            raise
        except (ValueError, json.JSONDecodeError, TypeError, KeyError):
            if attempt == 0:
                continue
            raise ModelInvalidResponseError


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

        s3_bucket = os.environ.get("S3_BUCKET")
        gemini_model = os.environ.get("GEMINI_MODEL")
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        aws_region = os.environ.get("AWS_REGION")

        if not s3_bucket or not gemini_model or not gemini_api_key or not aws_region:
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

        s3_key = payload.get("s3_key")
        file_type = payload.get("file_type")

        if not isinstance(s3_key, str) or not s3_key.strip():
            return create_response(400, {
                "status": "error",
                "message": "invalid s3_key"
            })

        if require_auth and not s3_key.startswith(f"uploads/{user_id}/"):
            return create_response(403, {"status": "error", "message": "not allowed"})

        if file_type not in ["pdf", "image", "text"]:
            return create_response(400, {
                "status": "error",
                "message": "invalid file_type"
            })

        ext = s3_key.split(".")[-1].lower() if "." in s3_key else ""

        if file_type == "image":
            if ext == "jpg":
                ext = "jpeg"

            if ext not in ["png", "jpeg", "gif", "webp"]:
                return create_response(400, {
                    "status": "error",
                    "message": "invalid image extension"
                })

        elif file_type == "pdf":
            if ext != "pdf":
                return create_response(400, {
                    "status": "error",
                    "message": "invalid pdf extension"
                })

        elif file_type == "text":
            if ext != "txt":
                return create_response(400, {
                    "status": "error",
                    "message": "invalid text extension"
                })

        s3 = boto3.client("s3", region_name=aws_region)

        try:
            s3_response = s3.get_object(
                Bucket=s3_bucket,
                Key=s3_key
            )

            raw_bytes = s3_response["Body"].read()

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")

            if error_code in ["NoSuchKey", "404", "NoSuchBucket"]:
                return create_response(400, {
                    "status": "error",
                    "message": "file not found"
                })

            raise

        parts = []

        if ext == "pdf":
            parts.append({
                "inline_data": {
                    "mime_type": "application/pdf",
                    "data": base64.b64encode(raw_bytes).decode("utf-8")
                }
            })

        elif ext in ["png", "jpeg", "gif", "webp"]:
            parts.append({
                "inline_data": {
                    "mime_type": f"image/{ext}",
                    "data": base64.b64encode(raw_bytes).decode("utf-8")
                }
            })

        elif ext == "txt":
            parts.append({
                "text": raw_bytes.decode("utf-8", errors="replace")
            })

        parts.append({
            "text": "Extract the distinct study topics from the material and write a concise markdown summary for each."
        })

        payload_data = {
            "contents": [
                {
                    "parts": parts
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "properties": {
                        "topics": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "topic_id": {
                                        "type": "STRING"
                                    },
                                    "name": {
                                        "type": "STRING"
                                    },
                                    "summary": {
                                        "type": "STRING"
                                    }
                                },
                                "required": [
                                    "topic_id",
                                    "name",
                                    "summary"
                                ]
                            }
                        }
                    },
                    "required": [
                        "topics"
                    ]
                }
            }
        }

        url = (
            f"https://generativelanguage.googleapis.com/"
            f"v1beta/models/{gemini_model}:generateContent"
        )

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": gemini_api_key
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload_data).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        parsed = call_gemini(req, context)
        topics = parsed.get("topics", [])

        if not topics:
            return create_response(500, {
                "status": "error",
                "message": "no topics returned"
            })

        valid_topics = []

        for t in topics:
            if isinstance(t, dict):
                tid = str(t.get("topic_id", "")).strip()
                name = str(t.get("name", "")).strip()
                summary = str(t.get("summary", "")).strip()

                if tid and name and summary:
                    valid_topics.append({
                        "topic_id": tid,
                        "name": name,
                        "summary": summary
                    })

        if not valid_topics:
            return create_response(500, {
                "status": "error",
                "message": "no valid topics returned"
            })

        return create_response(200, {
            "status": "success",
            "topics": valid_topics
        })

    except ModelRateLimitError:
        return create_response(500, {"status": "error", "message": "model rate limit reached, try again in a minute"})
    except ModelInvalidResponseError:
        return create_response(500, {"status": "error", "message": "model returned an invalid response"})
    except Exception as e:
        import traceback
        traceback.print_exc()

        return create_response(500, {
            "status": "error",
            "message": "internal error"
        })