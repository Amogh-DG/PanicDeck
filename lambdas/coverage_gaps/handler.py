import os
import json
import base64
import boto3
import urllib.request
import urllib.error
import time
from botocore.exceptions import ClientError


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


class ModelRateLimitError(Exception):
    pass

class ModelInvalidResponseError(Exception):
    pass

def call_gemini(req, context):
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
            return create_response(
                500,
                {
                    "status": "error",
                    "message": "missing environment variables"
                }
            )

        payload = event

        if "body" in event:
            body_data = event["body"]

            if event.get("isBase64Encoded"):
                body_data = base64.b64decode(body_data).decode("utf-8")

            if isinstance(body_data, str):
                payload = json.loads(body_data)

        s3_key = payload.get("syllabus_s3_key")
        topics = payload.get("topics")
        subject_code = payload.get("subject_code")

        if subject_code is not None:
            if not isinstance(subject_code, str) or not subject_code.strip():
                return create_response(
                    400,
                    {
                        "status": "error",
                        "message": "invalid subject_code"
                    }
                )

            subject_code = subject_code.strip()

        if not isinstance(s3_key, str) or not s3_key.strip():
            return create_response(
                400,
                {
                    "status": "error",
                    "message": "invalid syllabus_s3_key"
                }
            )

        s3_key = s3_key.strip()

        if require_auth and not s3_key.startswith(f"uploads/{user_id}/"):
            return create_response(403, {"status": "error", "message": "not allowed"})

        if not isinstance(topics, list) or not topics:
            return create_response(
                400,
                {
                    "status": "error",
                    "message": "topics must be a non-empty list"
                }
            )

        for t in topics:
            if not isinstance(t, dict):
                return create_response(
                    400,
                    {
                        "status": "error",
                        "message": "topic must be an object"
                    }
                )

            if (
                not isinstance(t.get("topic_id"), str)
                or not isinstance(t.get("name"), str)
                or not isinstance(t.get("summary"), str)
            ):
                return create_response(
                    400,
                    {
                        "status": "error",
                        "message": "topic must have string topic_id, name, and summary"
                    }
                )

        ext = s3_key.split(".")[-1].lower() if "." in s3_key else ""

        if ext == "jpg":
            ext = "jpeg"

        if ext not in ["pdf", "png", "jpeg", "gif", "webp", "txt"]:
            return create_response(
                400,
                {
                    "status": "error",
                    "message": "unsupported extension"
                }
            )

        s3 = boto3.client("s3", region_name=aws_region)

        try:
            s3_response = s3.get_object(
                Bucket=s3_bucket,
                Key=s3_key
            )

            raw_bytes = s3_response["Body"].read()

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")

            if error_code in ("NoSuchKey", "404", "NoSuchBucket"):
                return create_response(
                    400,
                    {
                        "status": "error",
                        "message": "file not found"
                    }
                )

            raise

        parts = []

        if ext == "pdf":
            parts.append(
                {
                    "inline_data": {
                        "mime_type": "application/pdf",
                        "data": base64.b64encode(raw_bytes).decode("utf-8")
                    }
                }
            )

        elif ext in ["png", "jpeg", "gif", "webp"]:
            parts.append(
                {
                    "inline_data": {
                        "mime_type": f"image/{ext}",
                        "data": base64.b64encode(raw_bytes).decode("utf-8")
                    }
                }
            )

        elif ext == "txt":
            parts.append(
                {
                    "text": raw_bytes.decode(
                        "utf-8",
                        errors="replace"
                    )
                }
            )

        topics_text_lines = []

        for t in topics:
            t_name = t.get("name", "")
            t_summary = t.get("summary", "")[:300]

            topics_text_lines.append(
                f"Name: {t_name}\nSummary: {t_summary}"
            )

        parts.append(
            {
                "text": (
                    "Notes topics:\n"
                    + "\n\n".join(topics_text_lines)
                )
            }
        )

        if subject_code is not None:
            parts.append(
                {
                    "text": (
                        "The syllabus covers multiple subjects. "
                        f"Locate the section for the exact subject code "
                        f"'{subject_code}'. "
                        "Identify topics from that specific section "
                        "that are missing from the notes or only very "
                        "thinly covered, matching by meaning rather than "
                        "exact wording, and give a one-sentence reason "
                        "for each. "
                        "If the exact subject code cannot be found, set "
                        "subject_found to false and return an empty gaps array."
                    )
                }
            )
        else:
            parts.append(
                {
                    "text": (
                        "Identify syllabus topics that are missing from "
                        "the notes or only very thinly covered, matching "
                        "by meaning rather than exact wording, and give "
                        "a one-sentence reason for each."
                    )
                }
            )

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
                        "gaps": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "name": {
                                        "type": "STRING"
                                    },
                                    "reason": {
                                        "type": "STRING"
                                    }
                                },
                                "required": [
                                    "name",
                                    "reason"
                                ]
                            }
                        },
                        "subject_found": {
                            "type": "BOOLEAN"
                        }
                    },
                    "required": [
                        "gaps",
                        "subject_found"
                    ]
                }
            }
        }

        url = (
            "https://generativelanguage.googleapis.com/"
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

        subject_found = parsed.get("subject_found", True)
        gaps_result = parsed.get("gaps", [])

        valid_gaps = []

        if isinstance(gaps_result, list):
            for g in gaps_result:
                if not isinstance(g, dict):
                    continue

                name = str(g.get("name", "")).strip()
                reason = str(g.get("reason", "")).strip()

                if name and reason:
                    valid_gaps.append(
                        {
                            "name": name,
                            "reason": reason
                        }
                    )

        return create_response(
            200,
            {
                "status": "success",
                "subject_found": bool(subject_found),
                "gaps": valid_gaps
            }
        )

    except ModelRateLimitError:
        return create_response(500, {"status": "error", "message": "model rate limit reached, try again in a minute"})
    except ModelInvalidResponseError:
        return create_response(500, {"status": "error", "message": "model returned an invalid response"})
    except Exception:
        import traceback
        traceback.print_exc()

        return create_response(
            500,
            {
                "status": "error",
                "message": "internal error"
            }
        )