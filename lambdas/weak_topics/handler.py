import base64
import json
import os
import uuid
import traceback
from datetime import datetime, timezone
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

        payload = event
        if "body" in event:
            body_data = event["body"]
            if event.get("isBase64Encoded"):
                body_data = base64.b64decode(body_data).decode("utf-8")
            if isinstance(body_data, str):
                payload = json.loads(body_data)

        answers = payload.get("answers")
        if not isinstance(answers, list) or not answers:
            return create_response(400, {"status": "error", "message": "invalid answers"})

        for item in answers:
            if not isinstance(item, dict):
                return create_response(400, {"status": "error", "message": "invalid answer format"})
            if not isinstance(item.get("question_id"), str):
                return create_response(400, {"status": "error", "message": "invalid question_id"})
            if not isinstance(item.get("topic_id"), str):
                return create_response(400, {"status": "error", "message": "invalid topic_id"})
            if not isinstance(item.get("correct"), bool):
                return create_response(400, {"status": "error", "message": "invalid correct"})

        topics = payload.get("topics", [])
        topic_names = {}
        if isinstance(topics, list):
            for t in topics:
                if isinstance(t, dict):
                    tid = t.get("topic_id")
                    tname = t.get("name")
                    if isinstance(tid, str) and isinstance(tname, str):
                        topic_names[tid] = tname

        final_answers = {}
        for item in answers:
            final_answers[item["question_id"]] = {
                "topic_id": item["topic_id"],
                "correct": item["correct"]
            }

        topic_stats = {}
        for q_id, data in final_answers.items():
            t_id = data["topic_id"]
            if t_id not in topic_stats:
                topic_stats[t_id] = {"total": 0, "wrong": 0}
            topic_stats[t_id]["total"] += 1
            if not data["correct"]:
                topic_stats[t_id]["wrong"] += 1

        total_questions = len(final_answers)
        total_wrong = sum(s["wrong"] for s in topic_stats.values())
        correct_count = total_questions - total_wrong
        overall_accuracy = round((correct_count / total_questions) * 100, 1) if total_questions > 0 else 0.0

        topic_breakdown = []
        for t_id, stats in topic_stats.items():
            t_correct = stats["total"] - stats["wrong"]
            t_acc = round((t_correct / stats["total"]) * 100, 1) if stats["total"] > 0 else 0.0
            topic_breakdown.append({
                "topic_id": t_id,
                "name": topic_names.get(t_id, t_id),
                "total": stats["total"],
                "correct": t_correct,
                "accuracy": t_acc
            })

        weak_topics = []
        for t_id, stats in topic_stats.items():
            if stats["wrong"] > 0:
                wrong_rate = stats["wrong"] / stats["total"]
                if wrong_rate >= 0.67:
                    severity = "high"
                    sev_score = 0
                elif wrong_rate >= 0.34:
                    severity = "medium"
                    sev_score = 1
                else:
                    severity = "low"
                    sev_score = 2
                
                weak_topics.append({
                    "topic_id": t_id,
                    "name": topic_names.get(t_id, t_id),
                    "reason": f"missed {stats['wrong']}/{stats['total']} quiz questions",
                    "severity": severity,
                    "_sev_score": sev_score,
                    "_wrong_rate": wrong_rate
                })

        weak_topics.sort(key=lambda x: (x["_sev_score"], -x["_wrong_rate"], x["topic_id"]))

        for item in weak_topics:
            del item["_sev_score"]
            del item["_wrong_rate"]

        now_iso = datetime.now(timezone.utc).isoformat()
        quiz_id = payload.get("quiz_id")
        if not isinstance(quiz_id, str) or not quiz_id.strip():
            quiz_id = uuid.uuid4().hex

        table_name = os.environ.get("DYNAMODB_TABLE_SCORES")
        aws_region = os.environ.get("AWS_REGION")

        if table_name and aws_region:
            import boto3
            dynamodb = boto3.resource("dynamodb", region_name=aws_region)
            table = dynamodb.Table(table_name)
            sk = f"{now_iso}#{quiz_id}"
            db_item = {
                "user_id": user_id,
                "timestamp_quiz_id": sk,
                "quiz_id": quiz_id,
                "total_questions": total_questions,
                "correct_count": correct_count,
                "overall_accuracy": Decimal(str(overall_accuracy)),
                "topic_breakdown": [
                    {
                        "topic_id": tb["topic_id"],
                        "name": tb["name"],
                        "total": tb["total"],
                        "correct": tb["correct"],
                        "accuracy": Decimal(str(tb["accuracy"]))
                    }
                    for tb in topic_breakdown
                ],
                "weak_topics": weak_topics,
                "created_at": now_iso
            }
            table.put_item(Item=db_item)

        return create_response(200, {
            "status": "success",
            "quiz_id": quiz_id,
            "score": {
                "total_questions": total_questions,
                "correct_count": correct_count,
                "overall_accuracy": overall_accuracy
            },
            "topic_breakdown": topic_breakdown,
            "weak_topics": weak_topics
        })

    except Exception:
        traceback.print_exc()
        return create_response(500, {"status": "error", "message": "internal error"})
