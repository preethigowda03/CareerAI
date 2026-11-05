from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "careerai-super-secret-key-for-careerai-2026-secure"
)

router = APIRouter()


# ============================================================
# AUTHENTICATION
# ============================================================

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
        ).strip()

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


# ============================================================
# CHAT REQUEST
# ============================================================

class ChatRequest(BaseModel):

    message: str


# ============================================================
# CHAT RESPONSE
# ============================================================

def generate_response(message):

    text = message.lower().strip()

    if not text:

        return (
            "Please type a question and I will help "
            "you with your career. 😊"
        )

    # --------------------------------------------------------
    # GREETING
    # --------------------------------------------------------

    if any(
        word in text
        for word in [
            "hello",
            "hi",
            "hey",
            "hii"
        ]
    ):

        return (
            "Hello! 👋 I am CareerAI Assistant. "
            "I can help you with career planning, "
            "skills, projects, interviews, DSA, "
            "SQL and resume improvement."
        )

    # --------------------------------------------------------
    # MACHINE LEARNING
    # --------------------------------------------------------

    if (
        "machine learning" in text
        or "ml engineer" in text
        or "ml developer" in text
    ):

        return (
            "🚀 To become a Machine Learning Engineer, "
            "follow this order:\n\n"
            "1. Python\n"
            "2. NumPy and Pandas\n"
            "3. Statistics\n"
            "4. Machine Learning algorithms\n"
            "5. Scikit-learn\n"
            "6. Deep Learning\n"
            "7. TensorFlow or PyTorch\n"
            "8. Build 2–3 projects\n"
            "9. GitHub portfolio\n"
            "10. Interview preparation\n\n"
            "Your Career Roadmap contains these steps."
        )

    # --------------------------------------------------------
    # DATA SCIENCE
    # --------------------------------------------------------

    if (
        "data scientist" in text
        or "data science" in text
    ):

        return (
            "📊 For Data Science, focus on:\n\n"
            "• Python\n"
            "• NumPy\n"
            "• Pandas\n"
            "• Statistics\n"
            "• Data visualization\n"
            "• SQL\n"
            "• Machine Learning\n"
            "• Power BI/Tableau\n"
            "• Real-world projects\n\n"
            "Build projects using real datasets "
            "and publish them on GitHub."
        )

    # --------------------------------------------------------
    # PYTHON
    # --------------------------------------------------------

    if "python" in text:

        return (
            "🐍 Improve Python in this order:\n\n"
            "1. Variables and data types\n"
            "2. Functions\n"
            "3. Lists, tuples and dictionaries\n"
            "4. OOP\n"
            "5. Exception handling\n"
            "6. File handling\n"
            "7. APIs\n"
            "8. Libraries such as NumPy and Pandas\n\n"
            "Then build practical projects."
        )

    # --------------------------------------------------------
    # DSA
    # --------------------------------------------------------

    if (
        "dsa" in text
        or "data structures" in text
        or "coding interview" in text
    ):

        return (
            "🧠 For DSA preparation, follow:\n\n"
            "1. Arrays\n"
            "2. Strings\n"
            "3. Linked Lists\n"
            "4. Stack and Queue\n"
            "5. Hashing\n"
            "6. Trees\n"
            "7. Graphs\n"
            "8. Sorting and Searching\n"
            "9. Dynamic Programming\n\n"
            "Practice problems regularly rather than "
            "only watching tutorials."
        )

    # --------------------------------------------------------
    # SQL
    # --------------------------------------------------------

    if "sql" in text or "database" in text:

        return (
            "🗄️ SQL topics you should learn:\n\n"
            "• SELECT\n"
            "• WHERE\n"
            "• GROUP BY\n"
            "• ORDER BY\n"
            "• JOINs\n"
            "• Subqueries\n"
            "• Aggregate functions\n"
            "• Window functions\n"
            "• Indexes\n\n"
            "Practice SQL problems using real datasets."
        )

    # --------------------------------------------------------
    # INTERVIEW
    # --------------------------------------------------------

    if (
        "interview" in text
        or "placement" in text
        or "job preparation" in text
    ):

        return (
            "🎯 For placement preparation, focus on:\n\n"
            "• DSA\n"
            "• SQL\n"
            "• Core CS concepts\n"
            "• Aptitude\n"
            "• Communication\n"
            "• Resume explanation\n"
            "• Project explanation\n"
            "• Mock interviews\n\n"
            "Be ready to explain every project "
            "mentioned on your resume."
        )

    # --------------------------------------------------------
    # PROJECTS
    # --------------------------------------------------------

    if (
        "project" in text
        or "projects" in text
    ):

        return (
            "💡 Good project ideas for an AI/ML student:\n\n"
            "1. Resume Analyzer\n"
            "2. Student Performance Prediction\n"
            "3. Disease Prediction System\n"
            "4. Recommendation System\n"
            "5. Sentiment Analysis\n"
            "6. Image Classification\n\n"
            "Choose projects where you can explain "
            "the dataset, model, implementation and results."
        )

    # --------------------------------------------------------
    # GITHUB
    # --------------------------------------------------------

    if "github" in text:

        return (
            "🐙 Your GitHub should contain:\n\n"
            "• Clean project code\n"
            "• README file\n"
            "• Screenshots\n"
            "• Technologies used\n"
            "• Installation instructions\n"
            "• Project explanation\n\n"
            "Try to keep your repositories organized "
            "and regularly updated."
        )

    # --------------------------------------------------------
    # RESUME
    # --------------------------------------------------------

    if (
        "resume" in text
        or "cv" in text
    ):

        return (
            "📄 A strong resume should contain:\n\n"
            "• Short professional summary\n"
            "• Technical skills\n"
            "• Education\n"
            "• Projects\n"
            "• Internship/experience\n"
            "• GitHub\n"
            "• LinkedIn\n\n"
            "Use measurable results wherever possible "
            "and keep the resume easy to scan."
        )

    # --------------------------------------------------------
    # CAREER
    # --------------------------------------------------------

    if (
        "career" in text
        or "which job" in text
        or "what should i learn" in text
    ):

        return (
            "🎯 Based on an AI/ML profile, some career "
            "paths you can consider are:\n\n"
            "• Machine Learning Engineer\n"
            "• Data Scientist\n"
            "• Python Developer\n"
            "• Backend Developer\n"
            "• Data Analyst\n"
            "• AI Engineer\n\n"
            "Use your Resume Analysis and Career Roadmap "
            "to identify the skills you need next."
        )

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    if (
        "skill" in text
        or "learn" in text
    ):

        return (
            "📚 Important skills for an AI/ML career:\n\n"
            "• Python\n"
            "• SQL\n"
            "• Machine Learning\n"
            "• Statistics\n"
            "• Pandas\n"
            "• NumPy\n"
            "• Git/GitHub\n"
            "• Deep Learning\n"
            "• Problem Solving\n"
            "• Communication\n\n"
            "Focus on one skill at a time and build projects."
        )

    # --------------------------------------------------------
    # DEFAULT
    # --------------------------------------------------------

    return (
        "🤖 I can help you with:\n\n"
        "• Machine Learning\n"
        "• Data Science\n"
        "• Python\n"
        "• DSA\n"
        "• SQL\n"
        "• Projects\n"
        "• GitHub\n"
        "• Resume improvement\n"
        "• Interviews\n"
        "• Career planning\n\n"
        "Try asking: "
        "\"How can I become a Machine Learning Engineer?\""
    )


# ============================================================
# CHAT ENDPOINT
# ============================================================

@router.post("/chat")
def chat(
    request: ChatRequest,
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    response = generate_response(
        request.message
    )

    return {
        "status": "success",
        "user_id": user_id,
        "message": request.message,
        "response": response
    }


# ============================================================
# CHATBOT TEST
# ============================================================

@router.get("/chat-test")
def chat_test():

    return {
        "status": "success",
        "message": "CareerAI chatbot is working"
    }