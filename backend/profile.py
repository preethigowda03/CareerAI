from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from database.mongodb import users_collection
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "careerai-super-secret-key-for-careerai-2026-secure"
)

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


class ProfileUpdate(BaseModel):
    name: str
    email: str


def get_user_id_from_token(authorization: str):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization format"
            )

        token = authorization.replace(
            "Bearer ",
            "",
            1
        ).strip()

        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


@router.get(
    "",
    operation_id="get_user_profile"
)
def get_profile(
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    user = users_collection.find_one(
        {
            "_id": user_id
        }
    )

    if not user:
        try:
            from bson import ObjectId

            user = users_collection.find_one(
                {
                    "_id": ObjectId(user_id)
                }
            )
        except Exception:
            user = None

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "status": "success",
        "profile": {
            "name": user.get("name", ""),
            "email": user.get("email", "")
        }
    }


@router.put(
    "",
    operation_id="update_user_profile"
)
def update_profile(
    profile: ProfileUpdate,
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    name = profile.name.strip()
    email = profile.email.strip().lower()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email cannot be empty"
        )

    result = users_collection.update_one(
        {
            "_id": user_id
        },
        {
            "$set": {
                "name": name,
                "email": email
            }
        }
    )

    if result.matched_count == 0:

        try:
            from bson import ObjectId

            result = users_collection.update_one(
                {
                    "_id": ObjectId(user_id)
                },
                {
                    "$set": {
                        "name": name,
                        "email": email
                    }
                }
            )

        except Exception:
            pass

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "profile": {
            "name": name,
            "email": email
        }
    }