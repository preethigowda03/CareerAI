from fastapi import APIRouter, Header, HTTPException

router = APIRouter()


LEARNING = [
    {
        "skill": "Python",
        "level": "Intermediate",
        "topics": [
            "Advanced Python",
            "OOP",
            "File Handling",
            "APIs"
        ]
    },
    {
        "skill": "Machine Learning",
        "level": "Intermediate",
        "topics": [
            "Regression",
            "Classification",
            "Clustering",
            "Model Evaluation"
        ]
    },
    {
        "skill": "SQL",
        "level": "Beginner",
        "topics": [
            "SELECT",
            "JOIN",
            "GROUP BY",
            "Subqueries"
        ]
    },
    {
        "skill": "Deep Learning",
        "level": "Beginner",
        "topics": [
            "Neural Networks",
            "TensorFlow",
            "PyTorch",
            "CNN"
        ]
    },
    {
        "skill": "Communication",
        "level": "Beginner",
        "topics": [
            "Presentation",
            "Interview Communication",
            "Technical Explanation"
        ]
    }
]


@router.get("/learning")
def get_learning(
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    return {
        "status": "success",
        "learning": LEARNING
    }