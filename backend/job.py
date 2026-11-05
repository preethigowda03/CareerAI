from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class JobRequest(BaseModel):
    career: Optional[str] = "Machine Learning Engineer"
    location: Optional[str] = "India"


JOBS = [
    {
        "title": "Machine Learning Engineer",
        "company": "AI Technology Company",
        "location": "Bangalore, India",
        "type": "Full Time",
        "skills": ["Python", "Machine Learning", "SQL", "Pandas"],
        "description": "Build and deploy machine learning solutions."
    },
    {
        "title": "Python Developer",
        "company": "Software Solutions",
        "location": "Bangalore, India",
        "type": "Full Time",
        "skills": ["Python", "FastAPI", "MongoDB", "Git"],
        "description": "Develop backend applications using Python."
    },
    {
        "title": "Data Scientist",
        "company": "Analytics Company",
        "location": "Hyderabad, India",
        "type": "Full Time",
        "skills": ["Python", "Pandas", "NumPy", "Machine Learning"],
        "description": "Analyze data and build predictive models."
    },
    {
        "title": "Backend Developer",
        "company": "Technology Company",
        "location": "Remote",
        "type": "Full Time",
        "skills": ["Python", "FastAPI", "MongoDB", "APIs"],
        "description": "Build scalable backend services."
    },
]


@router.get("/jobs")
def get_jobs(
    career: Optional[str] = None,
    location: Optional[str] = None,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    results = JOBS

    if career:
        career_lower = career.lower()

        filtered = [
            job for job in results
            if career_lower in job["title"].lower()
        ]

        if filtered:
            results = filtered

    if location:
        location_lower = location.lower()

        filtered = [
            job for job in results
            if location_lower in job["location"].lower()
        ]

        if filtered:
            results = filtered

    return {
        "status": "success",
        "jobs": results
    }