from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from database.mongodb import db
from bson import ObjectId
import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "careerai-super-secret-key-for-careerai-2026-secure"
)

router = APIRouter()

roadmap_collection = db["roadmaps"]


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
# REQUEST MODEL
# ============================================================

class TaskUpdate(BaseModel):
    status: str


# ============================================================
# ROADMAP GENERATOR
# ============================================================

def create_roadmap(career_goal):

    if career_goal == "Machine Learning Engineer":

        return [
            {
                "step": 1,
                "title": "Strengthen Python",
                "description": "Build strong Python programming fundamentals.",
                "tasks": [
                    {
                        "id": "python-advanced",
                        "title": "Advanced Python",
                        "status": "not_started"
                    },
                    {
                        "id": "python-oop",
                        "title": "Object Oriented Programming",
                        "status": "not_started"
                    },
                    {
                        "id": "python-files",
                        "title": "File Handling",
                        "status": "not_started"
                    },
                    {
                        "id": "python-api",
                        "title": "Working with APIs",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 2,
                "title": "Machine Learning",
                "description": "Learn the core machine learning algorithms.",
                "tasks": [
                    {
                        "id": "ml-regression",
                        "title": "Regression",
                        "status": "not_started"
                    },
                    {
                        "id": "ml-classification",
                        "title": "Classification",
                        "status": "not_started"
                    },
                    {
                        "id": "ml-clustering",
                        "title": "Clustering",
                        "status": "not_started"
                    },
                    {
                        "id": "ml-evaluation",
                        "title": "Model Evaluation",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 3,
                "title": "Deep Learning",
                "description": "Move from traditional ML to neural networks.",
                "tasks": [
                    {
                        "id": "dl-neural",
                        "title": "Neural Networks",
                        "status": "not_started"
                    },
                    {
                        "id": "dl-framework",
                        "title": "TensorFlow / PyTorch",
                        "status": "not_started"
                    },
                    {
                        "id": "dl-cnn",
                        "title": "Convolutional Neural Networks",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 4,
                "title": "Build Projects",
                "description": "Create projects that demonstrate your practical skills.",
                "tasks": [
                    {
                        "id": "project-one",
                        "title": "Build an ML project",
                        "status": "not_started"
                    },
                    {
                        "id": "project-two",
                        "title": "Build a Deep Learning project",
                        "status": "not_started"
                    },
                    {
                        "id": "project-github",
                        "title": "Upload projects to GitHub",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 5,
                "title": "Job Preparation",
                "description": "Prepare for internships and placements.",
                "tasks": [
                    {
                        "id": "job-dsa",
                        "title": "Practice DSA",
                        "status": "not_started"
                    },
                    {
                        "id": "job-sql",
                        "title": "Practice SQL",
                        "status": "not_started"
                    },
                    {
                        "id": "job-aptitude",
                        "title": "Practice Aptitude",
                        "status": "not_started"
                    },
                    {
                        "id": "job-interview",
                        "title": "Interview Preparation",
                        "status": "not_started"
                    }
                ]
            }
        ]

    elif career_goal == "Data Scientist":

        return [
            {
                "step": 1,
                "title": "Python & Data Analysis",
                "description": "Strengthen your data analysis foundation.",
                "tasks": [
                    {
                        "id": "ds-python",
                        "title": "Advanced Python",
                        "status": "not_started"
                    },
                    {
                        "id": "ds-numpy",
                        "title": "NumPy",
                        "status": "not_started"
                    },
                    {
                        "id": "ds-pandas",
                        "title": "Pandas",
                        "status": "not_started"
                    },
                    {
                        "id": "ds-visualization",
                        "title": "Data Visualization",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 2,
                "title": "Statistics",
                "description": "Learn statistics required for data science.",
                "tasks": [
                    {
                        "id": "stats-probability",
                        "title": "Probability",
                        "status": "not_started"
                    },
                    {
                        "id": "stats-descriptive",
                        "title": "Descriptive Statistics",
                        "status": "not_started"
                    },
                    {
                        "id": "stats-hypothesis",
                        "title": "Hypothesis Testing",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 3,
                "title": "Machine Learning",
                "description": "Learn practical machine learning.",
                "tasks": [
                    {
                        "id": "ds-regression",
                        "title": "Regression",
                        "status": "not_started"
                    },
                    {
                        "id": "ds-classification",
                        "title": "Classification",
                        "status": "not_started"
                    },
                    {
                        "id": "ds-clustering",
                        "title": "Clustering",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 4,
                "title": "Projects",
                "description": "Build a strong data science portfolio.",
                "tasks": [
                    {
                        "id": "ds-project1",
                        "title": "Data Analysis Project",
                        "status": "not_started"
                    },
                    {
                        "id": "ds-project2",
                        "title": "Machine Learning Project",
                        "status": "not_started"
                    },
                    {
                        "id": "ds-github",
                        "title": "Upload projects to GitHub",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 5,
                "title": "Job Preparation",
                "description": "Prepare for data science interviews.",
                "tasks": [
                    {
                        "id": "ds-sql",
                        "title": "SQL",
                        "status": "not_started"
                    },
                    {
                        "id": "ds-dsa",
                        "title": "DSA",
                        "status": "not_started"
                    },
                    {
                        "id": "ds-interview",
                        "title": "Interview Preparation",
                        "status": "not_started"
                    }
                ]
            }
        ]

    elif career_goal == "Frontend Developer":

        return [
            {
                "step": 1,
                "title": "Web Fundamentals",
                "description": "Master the basics of modern web development.",
                "tasks": [
                    {
                        "id": "fe-html",
                        "title": "HTML",
                        "status": "not_started"
                    },
                    {
                        "id": "fe-css",
                        "title": "CSS",
                        "status": "not_started"
                    },
                    {
                        "id": "fe-js",
                        "title": "JavaScript",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 2,
                "title": "React",
                "description": "Learn modern React development.",
                "tasks": [
                    {
                        "id": "react-components",
                        "title": "React Components",
                        "status": "not_started"
                    },
                    {
                        "id": "react-hooks",
                        "title": "React Hooks",
                        "status": "not_started"
                    },
                    {
                        "id": "react-api",
                        "title": "API Integration",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 3,
                "title": "Projects",
                "description": "Create frontend projects.",
                "tasks": [
                    {
                        "id": "fe-project1",
                        "title": "Build a React project",
                        "status": "not_started"
                    },
                    {
                        "id": "fe-project2",
                        "title": "Build a portfolio website",
                        "status": "not_started"
                    },
                    {
                        "id": "fe-github",
                        "title": "Upload projects to GitHub",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 4,
                "title": "Job Preparation",
                "description": "Prepare for frontend interviews.",
                "tasks": [
                    {
                        "id": "fe-js-interview",
                        "title": "JavaScript Interview Questions",
                        "status": "not_started"
                    },
                    {
                        "id": "fe-react-interview",
                        "title": "React Interview Questions",
                        "status": "not_started"
                    },
                    {
                        "id": "fe-coding",
                        "title": "Coding Practice",
                        "status": "not_started"
                    }
                ]
            }
        ]

    else:

        return [
            {
                "step": 1,
                "title": "Programming Fundamentals",
                "description": "Build a strong programming foundation.",
                "tasks": [
                    {
                        "id": "fund-python",
                        "title": "Learn Python",
                        "status": "not_started"
                    },
                    {
                        "id": "fund-oop",
                        "title": "Learn OOP",
                        "status": "not_started"
                    },
                    {
                        "id": "fund-problem",
                        "title": "Problem Solving",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 2,
                "title": "Database Skills",
                "description": "Learn database concepts.",
                "tasks": [
                    {
                        "id": "db-sql",
                        "title": "SQL",
                        "status": "not_started"
                    },
                    {
                        "id": "db-mongodb",
                        "title": "MongoDB",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 3,
                "title": "Projects",
                "description": "Build practical projects.",
                "tasks": [
                    {
                        "id": "general-project",
                        "title": "Build 2 projects",
                        "status": "not_started"
                    },
                    {
                        "id": "general-github",
                        "title": "Upload projects to GitHub",
                        "status": "not_started"
                    }
                ]
            },
            {
                "step": 4,
                "title": "Job Preparation",
                "description": "Prepare for placements.",
                "tasks": [
                    {
                        "id": "general-dsa",
                        "title": "DSA",
                        "status": "not_started"
                    },
                    {
                        "id": "general-sql",
                        "title": "SQL",
                        "status": "not_started"
                    },
                    {
                        "id": "general-interview",
                        "title": "Interview Preparation",
                        "status": "not_started"
                    }
                ]
            }
        ]


# ============================================================
# CALCULATE PROGRESS
# ============================================================

def calculate_progress(steps):

    total = 0
    completed = 0

    for step in steps:

        for task in step["tasks"]:

            total += 1

            if task["status"] == "completed":
                completed += 1

    if total == 0:
        return 0

    return round(
        (completed / total) * 100
    )


# ============================================================
# GET ROADMAP
# ============================================================

@router.get("/roadmap")
def get_roadmap(
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    roadmap = roadmap_collection.find_one(
        {
            "user_id": user_id
        }
    )

    if roadmap:

        roadmap["_id"] = str(
            roadmap["_id"]
        )

        return {
            "status": "success",
            "roadmap": roadmap
        }

    career_goal = "Machine Learning Engineer"

    steps = create_roadmap(
        career_goal
    )

    roadmap_data = {
        "user_id": user_id,
        "career_goal": career_goal,
        "steps": steps,
        "progress": calculate_progress(steps),
        "created_at": datetime.now(
            timezone.utc
        ),
        "updated_at": datetime.now(
            timezone.utc
        )
    }

    result = roadmap_collection.insert_one(
        roadmap_data
    )

    roadmap_data["_id"] = str(
        result.inserted_id
    )

    return {
        "status": "success",
        "roadmap": roadmap_data
    }


# ============================================================
# UPDATE TASK
# ============================================================

@router.put("/roadmap/task/{task_id}")
def update_task(
    task_id: str,
    request: TaskUpdate,
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    allowed_status = [
        "not_started",
        "in_progress",
        "completed"
    ]

    if request.status not in allowed_status:

        raise HTTPException(
            status_code=400,
            detail="Invalid task status"
        )

    roadmap = roadmap_collection.find_one(
        {
            "user_id": user_id
        }
    )

    if not roadmap:

        raise HTTPException(
            status_code=404,
            detail="Roadmap not found"
        )

    found = False

    for step in roadmap["steps"]:

        for task in step["tasks"]:

            if task["id"] == task_id:

                task["status"] = request.status

                found = True

                break

        if found:
            break

    if not found:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    progress = calculate_progress(
        roadmap["steps"]
    )

    roadmap_collection.update_one(
        {
            "user_id": user_id
        },
        {
            "$set": {
                "steps": roadmap["steps"],
                "progress": progress,
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        }
    )

    return {
        "status": "success",
        "message": "Roadmap task updated",
        "progress": progress,
        "task_id": task_id,
        "task_status": request.status
    }


# ============================================================
# RESET ROADMAP
# ============================================================

@router.post("/roadmap/reset")
def reset_roadmap(
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    career_goal = "Machine Learning Engineer"

    steps = create_roadmap(
        career_goal
    )

    roadmap_collection.update_one(
        {
            "user_id": user_id
        },
        {
            "$set": {
                "career_goal": career_goal,
                "steps": steps,
                "progress": 0,
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        },
        upsert=True
    )

    return {
        "status": "success",
        "message": "Roadmap reset successfully",
        "progress": 0
    }