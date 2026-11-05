from fastapi import APIRouter, Header, HTTPException

router = APIRouter()


@router.get("/progress")
def get_progress(
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    return {
        "status": "success",
        "progress": {
            "resume": 100,
            "skills": 80,
            "roadmap": 35,
            "interview": 60,
            "projects": 50
        }
    }