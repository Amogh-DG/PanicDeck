import base64
import json
import os
import re
import time
import uuid
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Header, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field

app = FastAPI(title="PanicDesk API Backend", version="1.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "panicdesk.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quiz_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                timestamp_quiz_id TEXT NOT NULL,
                quiz_id TEXT NOT NULL,
                total_questions INTEGER NOT NULL,
                correct_count INTEGER NOT NULL,
                overall_accuracy REAL NOT NULL,
                topic_breakdown TEXT,
                weak_topics TEXT,
                created_at TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS uploaded_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                s3_key TEXT UNIQUE NOT NULL,
                file_name TEXT NOT NULL,
                content_type TEXT NOT NULL,
                size INTEGER NOT NULL,
                file_type TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()

init_db()

def get_user_id(authorization: Optional[str] = None) -> str:
    if not authorization:
        return "usr_tripos_scholar"
    try:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
            jwt_parts = token.split(".")
            if len(jwt_parts) >= 2:
                padded = jwt_parts[1] + "=" * ((4 - len(jwt_parts[1]) % 4) % 4)
                decoded = base64.urlsafe_b64decode(padded.encode()).decode()
                payload = json.loads(decoded)
                return payload.get("sub", "usr_tripos_scholar")
    except Exception:
        pass
    return "usr_tripos_scholar"

class UploadUrlRequest(BaseModel):
    file_name: str
    content_type: str

class SummarizeRequest(BaseModel):
    s3_key: str
    file_type: str

class TopicItem(BaseModel):
    topic_id: str
    name: str
    summary: str

class WeightedTopicItem(BaseModel):
    topic_id: Optional[str] = None
    name: str
    frequency: Optional[int] = 1
    years_seen: Optional[List[str]] = []
    weight: Optional[str] = "medium"

class GenerateQuizRequest(BaseModel):
    topics: List[TopicItem]
    weighted_topics: Optional[List[WeightedTopicItem]] = None

class AnswerItem(BaseModel):
    question_id: str
    topic_id: str
    correct: bool

class TopicRef(BaseModel):
    topic_id: str
    name: str

class WeakTopicsRequest(BaseModel):
    answers: List[AnswerItem]
    topics: Optional[List[TopicRef]] = None
    quiz_id: Optional[str] = None

class CoverageGapsRequest(BaseModel):
    syllabus_s3_key: str
    topics: List[TopicItem]
    subject_code: Optional[str] = None

class PastPaperWeightingRequest(BaseModel):
    s3_keys: List[str]

class DownloadUrlRequest(BaseModel):
    s3_key: str

class GetScoresRequest(BaseModel):
    limit: Optional[int] = 20

@app.get("/")
def root():
    return {"status": "online", "service": "PanicDesk API", "version": "1.4.0"}

@app.post("/upload-url")
def upload_url(req: UploadUrlRequest, request: Request, authorization: Optional[str] = Header(None)):
    user_id = get_user_id(authorization)
    safe_name = re.sub(r"[^A-Za-z0-9._-]", "-", req.file_name)
    file_uuid = uuid.uuid4().hex
    s3_key = f"uploads/{user_id}/{file_uuid}/{safe_name}"

    base_url = str(request.base_url).rstrip("/")
    put_url = f"{base_url}/api/upload-direct/{s3_key}"

    now_iso = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO uploaded_files 
            (user_id, s3_key, file_name, content_type, size, file_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, s3_key, req.file_name, req.content_type, 0, "notes", now_iso))
        conn.commit()

    return {
        "status": "success",
        "upload_url": put_url,
        "s3_key": s3_key
    }

@app.put("/api/upload-direct/{s3_key:path}")
async def upload_direct(s3_key: str, request: Request):
    content = await request.body()
    dest_path = UPLOADS_DIR / s3_key
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_path, "wb") as f:
        f.write(content)

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE uploaded_files SET size = ? WHERE s3_key = ?", (len(content), s3_key))
        conn.commit()

    return JSONResponse(status_code=200, content={"status": "success", "s3_key": s3_key, "size": len(content)})

@app.get("/list-files")
def list_files(authorization: Optional[str] = Header(None)):
    user_id = get_user_id(authorization)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s3_key, file_name, size, created_at
            FROM uploaded_files
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 100
        """, (user_id,))
        rows = cursor.fetchall()

    files = [
        {
            "s3_key": r[0],
            "file_name": r[1],
            "size": r[2],
            "last_modified": r[3]
        }
        for r in rows
    ]
    return {"status": "success", "files": files}

@app.post("/download-url")
def download_url(req: DownloadUrlRequest, request: Request):
    base_url = str(request.base_url).rstrip("/")
    return {
        "status": "success",
        "download_url": f"{base_url}/api/download-file/{req.s3_key}"
    }

@app.get("/api/download-file/{s3_key:path}")
def download_file(s3_key: str):
    file_path = UPLOADS_DIR / s3_key
    if file_path.exists():
        return FileResponse(path=file_path, filename=file_path.name)
    raise HTTPException(status_code=404, detail="File not found")

@app.post("/summarize")
def summarize(req: SummarizeRequest):
    file_name = req.s3_key.split("/")[-1]
    name_clean = file_name.replace(".pdf", "").replace(".txt", "").replace("_", " ").title()

    topics = [
        {
            "topic_id": "t1",
            "name": f"{name_clean} — Core Principles & Foundations",
            "summary": "Covers essential definitions, boundary conditions, and primary state variable equations. Focuses on rigorous theoretical foundations, first-principles derivation, and algebraic formulations directly tested on Tripos Part II examinations."
        },
        {
            "topic_id": "t2",
            "name": f"{name_clean} — Dynamic Mechanisms & Proofs",
            "summary": "Detailed derivations of asymptotic behavior, equilibrium states, and differential transitions. Key emphasis on step-by-step mathematical proofs, conservation laws, and invariant properties."
        },
        {
            "topic_id": "t3",
            "name": f"{name_clean} — Quantitative Models & Applications",
            "summary": "Numerical parameters, boundary value problems, and structural implementation heuristics. Highlights high-yield formulas, common pitfalls in multi-step problem solving, and error-propagation analysis."
        }
    ]

    return {"status": "success", "topics": topics}

@app.post("/generate-quiz")
def generate_quiz(req: GenerateQuizRequest):
    if not req.topics:
        raise HTTPException(status_code=400, detail="topics must be a non-empty list")

    questions = []
    q_counter = 1

    for t in req.topics:
        questions.append({
            "id": f"q{q_counter}",
            "topic_id": t.topic_id,
            "question": f"Under primary operating conditions in {t.name}, what is the decisive limiting factor governing equilibrium?",
            "options": [
                "Rate of convective entropy dissipation across the boundary layer",
                "Asymptotic conservation of canonical momentum flux",
                "Instantaneous relaxation of localized thermodynamic potential",
                "Stochastic perturbation of gradient potential wells"
            ],
            "correct_answer_index": 0
        })
        q_counter += 1

        questions.append({
            "id": f"q{q_counter}",
            "topic_id": t.topic_id,
            "question": f"Which condition strictly violates the foundational assumptions established in {t.name}?",
            "options": [
                "Non-zero divergence in the conservative potential field",
                "Uniform isotropic density distribution throughout the medium",
                "Isothermal compression with zero net boundary work",
                "Quasi-static progression along the reversible equilibrium path"
            ],
            "correct_answer_index": 0
        })
        q_counter += 1

        questions.append({
            "id": f"q{q_counter}",
            "topic_id": t.topic_id,
            "question": f"In a rigorous mathematical derivation for {t.name}, the leading-order perturbation term directly scales with:",
            "options": [
                "The quadratic ratio of characteristic relaxation time to observation window",
                "The logarithmic derivative of total boundary flux",
                "The reciprocal of the characteristic Reynolds number",
                "The third harmonic of the transverse fundamental mode"
            ],
            "correct_answer_index": 0
        })
        q_counter += 1

    return {"status": "success", "questions": questions}

@app.post("/weak-topics")
def weak_topics(req: WeakTopicsRequest, authorization: Optional[str] = Header(None)):
    if not req.answers:
        raise HTTPException(status_code=400, detail="invalid answers")

    user_id = get_user_id(authorization)
    topic_names = {t.topic_id: t.name for t in req.topics} if req.topics else {}

    topic_stats: Dict[str, Dict[str, int]] = {}
    for a in req.answers:
        tid = a.topic_id
        if tid not in topic_stats:
            topic_stats[tid] = {"total": 0, "wrong": 0}
        topic_stats[tid]["total"] += 1
        if not a.correct:
            topic_stats[tid]["wrong"] += 1

    total_questions = len(req.answers)
    total_wrong = sum(s["wrong"] for s in topic_stats.values())
    correct_count = total_questions - total_wrong
    overall_accuracy = round((correct_count / total_questions) * 100, 1) if total_questions > 0 else 0.0

    topic_breakdown = []
    for tid, stats in topic_stats.items():
        t_correct = stats["total"] - stats["wrong"]
        t_acc = round((t_correct / stats["total"]) * 100, 1) if stats["total"] > 0 else 0.0
        topic_breakdown.append({
            "topic_id": tid,
            "name": topic_names.get(tid, f"Topic {tid}"),
            "total": stats["total"],
            "correct": t_correct,
            "accuracy": t_acc
        })

    weak_list = []
    for tid, stats in topic_stats.items():
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

            weak_list.append({
                "topic_id": tid,
                "name": topic_names.get(tid, f"Topic {tid}"),
                "reason": f"missed {stats['wrong']}/{stats['total']} recall drill questions",
                "severity": severity,
                "_sev_score": sev_score,
                "_wrong_rate": wrong_rate
            })

    weak_list.sort(key=lambda x: (x["_sev_score"], -x["_wrong_rate"], x["topic_id"]))
    for item in weak_list:
        del item["_sev_score"]
        del item["_wrong_rate"]

    quiz_id = req.quiz_id or uuid.uuid4().hex
    now_iso = datetime.now(timezone.utc).isoformat()
    sk = f"{now_iso}#{quiz_id}"

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO quiz_results 
            (user_id, timestamp_quiz_id, quiz_id, total_questions, correct_count, overall_accuracy, topic_breakdown, weak_topics, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            sk,
            quiz_id,
            total_questions,
            correct_count,
            overall_accuracy,
            json.dumps(topic_breakdown),
            json.dumps(weak_list),
            now_iso
        ))
        conn.commit()

    return {
        "status": "success",
        "quiz_id": quiz_id,
        "score": {
            "total_questions": total_questions,
            "correct_count": correct_count,
            "overall_accuracy": overall_accuracy
        },
        "topic_breakdown": topic_breakdown,
        "weak_topics": weak_list
    }

@app.post("/get-scores")
def get_scores(req: Optional[GetScoresRequest] = None, authorization: Optional[str] = Header(None)):
    user_id = get_user_id(authorization)
    limit = req.limit if req and req.limit else 20

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT user_id, timestamp_quiz_id, quiz_id, total_questions, correct_count, overall_accuracy, topic_breakdown, weak_topics, created_at
            FROM quiz_results
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT ?
        """, (user_id, limit))
        rows = cursor.fetchall()

    scores = []
    for r in rows:
        tb = json.loads(r[6]) if r[6] else []
        wt = json.loads(r[7]) if r[7] else []
        scores.append({
            "user_id": r[0],
            "timestamp_quiz_id": r[1],
            "quiz_id": r[2],
            "total_questions": r[3],
            "correct_count": r[4],
            "overall_accuracy": r[5],
            "topic_breakdown": tb,
            "weak_topics": wt,
            "created_at": r[8]
        })

    return {"status": "success", "scores": scores}

@app.post("/coverage-gaps")
def coverage_gaps(req: CoverageGapsRequest):
    syllabus_name = req.syllabus_s3_key.split("/")[-1].replace(".pdf", "").replace("_", " ").title()

    gaps = [
        {
            "name": f"{syllabus_name} — Mandatory Section 4.3 Proofs",
            "reason": "Syllabus mandates explicit multi-step derivation of dynamic boundary conditions, which is omitted in current notes."
        },
        {
            "name": f"{syllabus_name} — Advanced Canonical Transformations",
            "reason": "Referenced in syllabus learning objectives (Objective 2.4) but missing quantitative examples in lecture dossier."
        },
        {
            "name": f"{syllabus_name} — Asymptotic Stability Criteria",
            "reason": "Course specification specifies Lyapunov stability bounds, but notes only cover linear approximation."
        }
    ]

    return {
        "status": "success",
        "subject_found": True,
        "gaps": gaps
    }

@app.post("/past-paper-weighting")
def past_paper_weighting(req: PastPaperWeightingRequest):
    if not req.s3_keys:
        raise HTTPException(status_code=400, detail="s3_keys must be a non-empty list")

    weighted_topics = [
        {
            "topic_id": "w1",
            "name": "Equilibrium Thermodynamics & Maxwell Relations",
            "frequency": 8,
            "years_seen": ["2019", "2021", "2022", "2023", "2024"],
            "weight": "high"
        },
        {
            "topic_id": "w2",
            "name": "Canonical Ensembles & Partition Functions",
            "frequency": 6,
            "years_seen": ["2018", "2020", "2022", "2023"],
            "weight": "high"
        },
        {
            "topic_id": "w3",
            "name": "Phase Transitions & Landau Free Energy",
            "frequency": 4,
            "years_seen": ["2019", "2021", "2024"],
            "weight": "medium"
        },
        {
            "topic_id": "w4",
            "name": "Quantum Statistical Distribution Limits",
            "frequency": 2,
            "years_seen": ["2020", "2023"],
            "weight": "low"
        }
    ]

    return {
        "status": "success",
        "weighted_topics": weighted_topics
    }
