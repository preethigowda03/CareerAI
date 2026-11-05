from fastapi import APIRouter, Header, HTTPException
from database.mongodb import resumes_collection
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "careerai-secret-key-change-this"
)

router = APIRouter()


def get_user_id_from_token(authorization: str):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    try:

        token = authorization.replace(
            "Bearer ",
            ""
        )

        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        return payload["user_id"]

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


@router.get("/resume-history")
def get_resume_history(
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    resumes = resumes_collection.find(
        {
            "user_id": user_id
        },
        {
            "text": 0
        }
    ).sort("_id", -1)

    history = []

    for resume in resumes:

        history.append({
            "resume_id": str(
                resume["_id"]
            ),
            "filename": resume.get(
                "filename"
            ),
            "status": resume.get(
                "analysis_status",
                "uploaded"
            ),
            "analysis": resume.get(
                "analysis",
                None
            )
        })

    return {
        "status": "success",
        "count": len(history),
        "resumes": history
    }