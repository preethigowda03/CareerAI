from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
import random

router = APIRouter()


class AnswerRequest(BaseModel):
    question: str
    answer: str
    career: str


QUESTIONS = {
    "Machine Learning Engineer": [
        "What is supervised learning?",
        "Explain the difference between classification and regression.",
        "What is overfitting?",
        "What is cross-validation?",
        "Explain precision and recall."
    ],
    "Python Developer": [
        "What are Python lists and tuples?",
        "What is object-oriented programming?",
        "What is exception handling in Python?",
        "What are decorators?",
        "What is the difference between a list and a dictionary?"
    ],
    "Data Scientist": [
        "What is data preprocessing?",
        "What is feature engineering?",
        "What is exploratory data analysis?",
        "What is the difference between mean and median?",
        "How do you handle missing data?"
    ]
}


@router.get("/interview/questions")
def get_questions(
    career: str = "Machine Learning Engineer",
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    questions = QUESTIONS.get(
        career,
        QUESTIONS["Machine Learning Engineer"]
    )

    return {
        "status": "success",
        "career": career,
        "questions": questions
    }


@router.post("/interview/evaluate")
def evaluate_answer(
    request: AnswerRequest,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    answer = request.answer.strip()

    if len(answer) == 0:
        raise HTTPException(
            status_code=400,
            detail="Answer cannot be empty"
        )

    words = len(answer.split())

    if words >= 40:
        score = random.randint(80, 95)
    elif words >= 20:
        score = random.randint(65, 80)
    elif words >= 10:
        score = random.randint(50, 65)
    else:
        score = random.randint(30, 50)

    if score >= 80:
        feedback = "Excellent answer. Your explanation is detailed and relevant."
    elif score >= 60:
        feedback = "Good answer, but you can add more technical details."
    else:
        feedback = "Try to explain the concept with an example."

    return {
        "status": "success",
        "score": score,
        "feedback": feedback,
        "strength": "Your answer addresses the main concept.",
        "improvement": "Add examples and explain the reasoning clearly."
    }