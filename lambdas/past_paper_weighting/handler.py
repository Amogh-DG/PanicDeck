import os
import json
import base64
import boto3
import urllib.request
import urllib.error
import time
from botocore.exceptions import ClientError
from collections import defaultdict
import re


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


def process_paper(
    s3_key,
    s3_bucket,
    gemini_model,
    gemini_api_key,
    aws_region,
    context
):
    ext = s3_key.split(".")[-1].lower() if "." in s3_key else ""

    if ext == "jpg":
        ext = "jpeg"

    if ext not in ["pdf", "png", "jpeg", "gif", "webp", "txt"]:
        raise ValueError("unsupported extension")

    s3 = boto3.client(
        "s3",
        region_name=aws_region
    )

    try:
        s3_response = s3.get_object(
            Bucket=s3_bucket,
            Key=s3_key
        )

        raw_bytes = s3_response["Body"].read()

    except ClientError:
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

    parts.append(
        {
            "text": (
                "Use short, generic, chapter-level topic names "
                "that would be the same across different years' "
                "papers, and count how many questions or "
                "marks-bearing parts relate to each topic."
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
                    "topics": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "name": {
                                    "type": "STRING"
                                },
                                "count": {
                                    "type": "INTEGER"
                                }
                            },
                            "required": [
                                "name",
                                "count"
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
    topics = parsed.get("topics", [])

    valid = []

    for t in topics:
        if not isinstance(t, dict):
            continue

        name = str(t.get("name", "")).strip()
        count = t.get("count")

        if (
            name
            and isinstance(count, int)
            and not isinstance(count, bool)
            and count > 0
        ):
            valid.append(
                {
                    "name": name,
                    "count": count
                }
            )

    year_match = re.search(
        r"20\d{2}",
        s3_key
    )

    year = (
        year_match.group(0)
        if year_match
        else "unknown"
    )

    return {
        "year": year,
        "topics": valid
    }


def handler(event, context):
    try:
        req_method = (
            event
            .get("requestContext", {})
            .get("http", {})
            .get("method")
        )

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

        if (
            not s3_bucket
            or not gemini_model
            or not gemini_api_key
            or not aws_region
        ):
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
                body_data = base64.b64decode(
                    body_data
                ).decode("utf-8")

            if isinstance(body_data, str):
                payload = json.loads(body_data)

        s3_keys = payload.get("s3_keys")

        if (
            not isinstance(s3_keys, list)
            or not s3_keys
            or len(s3_keys) > 5
        ):
            return create_response(
                400,
                {
                    "status": "error",
                    "message": "s3_keys must be a list of 1 to 5 items"
                }
            )

        for k in s3_keys:
            if not isinstance(k, str) or not k.strip():
                return create_response(
                    400,
                    {
                        "status": "error",
                        "message": "each s3_key must be a string"
                    }
                )
            if require_auth and not k.startswith(f"uploads/{user_id}/"):
                return create_response(403, {"status": "error", "message": "not allowed"})

        results = []
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            futures = {executor.submit(process_paper, k, s3_bucket, gemini_model, gemini_api_key, aws_region, context): k for k in s3_keys}
            for future in concurrent.futures.as_completed(futures):
                try:
                    results.append(future.result())
                except ClientError as e:
                    error_code = e.response.get("Error", {}).get("Code")
                    if error_code in ("NoSuchKey", "404", "NoSuchBucket"):
                        return create_response(400, {"status": "error", "message": "file not found"})
                    raise
                except ValueError as e:
                    return create_response(400, {"status": "error", "message": str(e)})

        topic_stats = defaultdict(
            lambda: {
                "count": 0,
                "years_seen": set()
            }
        )

        for r in results:
            year = r["year"]

            for t in r["topics"]:
                name = t["name"].lower()

                topic_stats[name]["count"] += t["count"]
                topic_stats[name]["years_seen"].add(year)
                topic_stats[name]["original_name"] = t["name"]

        if not topic_stats:
            return create_response(
                500,
                {
                    "status": "error",
                    "message": "no topics returned"
                }
            )

        weighted_topics = []

        for i, (lower_name, stats) in enumerate(
            topic_stats.items()
        ):
            count = stats["count"]

            weight = "low"

            if count >= 5:
                weight = "high"
            elif count >= 3:
                weight = "medium"

            years_list = sorted(
                list(stats["years_seen"])
            )

            weighted_topics.append(
                {
                    "topic_id": f"t{i + 1}",
                    "name": stats["original_name"],
                    "frequency": count,
                    "years_seen": years_list,
                    "weight": weight
                }
            )

        return create_response(
            200,
            {
                "status": "success",
                "weighted_topics": weighted_topics
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