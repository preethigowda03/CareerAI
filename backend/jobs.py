from fastapi import APIRouter

router = APIRouter()


jobs = [
    {
        "title": "Python Developer",
        "company": "TCS",
        "location": "Bangalore",
        "skills": [
            "python",
            "sql",
            "git"
        ],
        "type": "Full Time"
    },
    {
        "title": "Machine Learning Engineer",
        "company": "Infosys",
        "location": "Bangalore",
        "skills": [
            "python",
            "machine learning",
            "scikit-learn",
            "pandas"
        ],
        "type": "Full Time"
    },
    {
        "title": "Frontend Developer",
        "company": "Wipro",
        "location": "Bangalore",
        "skills": [
            "html",
            "css",
            "javascript",
            "react"
        ],
        "type": "Full Time"
    },
    {
        "title": "Data Scientist",
        "company": "Accenture",
        "location": "Bangalore",
        "skills": [
            "python",
            "sql",
            "pandas",
            "numpy",
            "machine learning"
        ],
        "type": "Full Time"
    },
    {
        "title": "Backend Developer",
        "company": "Cognizant",
        "location": "Bangalore",
        "skills": [
            "python",
            "fastapi",
            "mongodb",
            "sql"
        ],
        "type": "Full Time"
    }
]


@router.get("/jobs")
def get_jobs():

    return {
        "status": "success",
        "count": len(jobs),
        "jobs": jobs
    }