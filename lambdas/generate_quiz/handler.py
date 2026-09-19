import os
import json
import base64
import urllib.request
import urllib.error
import time
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

        gemini_model = os.environ.get("GEMINI_MODEL")
        gemini_api_key = os.environ.get("GEMINI_API_KEY")

        if not gemini_model or not gemini_api_key:
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

        topics = payload.get("topics")

        if not isinstance(topics, list) or not topics:
            return create_response(
                400,
                {
                    "status": "error",
                    "message": "topics must be a non-empty list"
                }
            )

        valid_topic_ids = set()

        for t in topics:
            if not isinstance(t, dict):
                return create_response(
                    400,
                    {
                        "status": "error",
                        "message": "topic must be an object"
                    }
                )

            tid = t.get("topic_id")
            name = t.get("name")
            summary = t.get("summary")

            if (
                not isinstance(tid, str)
                or not isinstance(name, str)
                or not isinstance(summary, str)
            ):
                return create_response(
                    400,
                    {
                        "status": "error",
                        "message": "topic must have string topic_id, name, and summary"
                    }
                )

            valid_topic_ids.add(tid)

        weighted_topics = payload.get("weighted_topics")

        if weighted_topics is not None and not isinstance(weighted_topics, list):
            return create_response(
                400,
                {
                    "status": "error",
                    "message": "weighted_topics must be a list"
                }
            )

        msg_text = f"Notes Topics:\n{json.dumps(topics)}\n\n"

        if weighted_topics is not None:
            msg_text += f"Weighted Topics:\n{json.dumps(weighted_topics)}\n\n"
            msg_text += (
                "Match the Weighted Topics to the Notes Topics by meaning. "
                "Write 5 questions for notes topics matching a high weight, "
                "3 for medium, and 2 for low. Every question must use the "
                "topic_id of one of the provided Notes Topics, never one "
                "from Weighted Topics."
            )
        else:
            msg_text += "Write 3 multiple-choice questions per topic based on the Notes Topics."

        payload_data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": msg_text
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "properties": {
                        "questions": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "topic_id": {
                                        "type": "STRING"
                                    },
                                    "question": {
                                        "type": "STRING"
                                    },
                                    "options": {
                                        "type": "ARRAY",
                                        "items": {
                                            "type": "STRING"
                                        }
                                    },
                                    "correct_answer_index": {
                                        "type": "INTEGER"
                                    }
                                },
                                "required": [
                                    "topic_id",
                                    "question",
                                    "options",
                                    "correct_answer_index"
                                ]
                            }
                        }
                    },
                    "required": [
                        "questions"
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
        questions = parsed.get("questions", [])

        if not questions:
            return create_response(
                500,
                {
                    "status": "error",
                    "message": "no questions returned"
                }
            )

        valid_questions = []

        for q in questions:
            if not isinstance(q, dict):
                continue

            tid = q.get("topic_id")
            text = q.get("question")
            options = q.get("options")
            idx = q.get("correct_answer_index")

            if tid not in valid_topic_ids:
                continue

            if not isinstance(text, str) or not text.strip():
                continue

            if not isinstance(options, list) or len(options) != 4:
                continue

            if (
                not isinstance(idx, int)
                or isinstance(idx, bool)
                or idx < 0
                or idx > 3
            ):
                continue

            valid_questions.append(
                {
                    "topic_id": str(tid),
                    "question": str(text),
                    "options": [str(o) for o in options],
                    "correct_answer_index": int(idx)
                }
            )

        if not valid_questions:
            return create_response(
                500,
                {
                    "status": "error",
                    "message": "no valid questions returned"
                }
            )

        final_questions = []

        for i, q in enumerate(valid_questions):
            final_questions.append(
                {
                    "id": f"q{i + 1}",
                    "topic_id": q["topic_id"],
                    "question": q["question"],
                    "options": q["options"],
                    "correct_answer_index": q["correct_answer_index"]
                }
            )

        return create_response(
            200,
            {
                "status": "success",
                "questions": final_questions
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