from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "careerai-super-secret-key-for-careerai-2026-secure"
)

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set in .env")

if len(JWT_SECRET.encode("utf-8")) < 32:
    raise RuntimeError(
        "JWT_SECRET must be at least 32 bytes long"
    )

client = MongoClient(MONGO_URI)

db = client["careerai"]
users_collection = db["users"]

router = APIRouter()


# ============================================================
# MODELS
# ============================================================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ProfileUpdateRequest(BaseModel):
    name: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ============================================================
# PASSWORD
# ============================================================

def hash_password(password: str) -> str:

    password_bytes = password.encode("utf-8")[:72]

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


def verify_password(
    password: str,
    hashed_password: str
) -> bool:

    password_bytes = password.encode("utf-8")[:72]

    return bcrypt.checkpw(
        password_bytes,
        hashed_password.encode("utf-8")
    )


# ============================================================
# JWT
# ============================================================

def create_access_token(user_id: str):

    expire = datetime.now(
        timezone.utc
    ) + timedelta(hours=24)

    payload = {
        "user_id": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm="HS256"
    )


def get_user_id_from_token(
    authorization: str
):

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
# REGISTER
# ============================================================

@router.post("/register")
def register_user(
    user: RegisterRequest
):

    email = user.email.lower().strip()

    existing_user = users_collection.find_one(
        {"email": email}
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if len(user.password.encode("utf-8")) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters"
        )

    if not user.name.strip():

        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    hashed_password = hash_password(
        user.password
    )

    user_data = {

        "name": user.name.strip(),

        "email": email,

        "password": hashed_password,

        "created_at": datetime.now(
            timezone.utc
        )
    }

    result = users_collection.insert_one(
        user_data
    )

    return {

        "status": "success",

        "message": "Registration successful",

        "user_id": str(
            result.inserted_id
        ),

        "name": user.name.strip(),

        "email": email
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login_user(
    user: LoginRequest
):

    email = user.email.lower().strip()

    existing_user = users_collection.find_one(
        {"email": email}
    )

    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        str(existing_user["_id"])
    )

    return {

        "status": "success",

        "message": "Login successful",

        "access_token": access_token,

        "token_type": "bearer",

        "user": {

            "id": str(
                existing_user["_id"]
            ),

            "name": existing_user.get(
                "name",
                ""
            ),

            "email": existing_user.get(
                "email",
                ""
            )
        }
    }


# ============================================================
# FORGOT PASSWORD
# ============================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest
):

    email = request.email.lower().strip()

    user = users_collection.find_one(
        {"email": email}
    )

    return {

        "status": "success",

        "message":
        "If the email exists, password reset instructions will be sent."
    }


# ============================================================
# GET PROFILE
# ============================================================

@router.get("/profile")
def get_profile(
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    try:

        user = users_collection.find_one(
            {
                "_id": ObjectId(user_id)
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    created_at = user.get(
        "created_at"
    )

    return {

        "status": "success",

        "user": {

            "id": str(user["_id"]),

            "name": user.get(
                "name",
                ""
            ),

            "email": user.get(
                "email",
                ""
            ),

            "created_at":
                created_at.isoformat()
                if created_at
                else None
        }
    }


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put("/profile")
def update_profile(
    profile: ProfileUpdateRequest,
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    name = profile.name.strip()

    if len(name) < 2:

        raise HTTPException(
            status_code=400,
            detail="Name must contain at least 2 characters"
        )

    try:

        result = users_collection.update_one(

            {
                "_id": ObjectId(user_id)
            },

            {
                "$set": {
                    "name": name
                }
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user = users_collection.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )

    return {

        "status": "success",

        "message": "Profile updated successfully",

        "user": {

            "id": str(user["_id"]),

            "name": user.get(
                "name",
                ""
            ),

            "email": user.get(
                "email",
                ""
            )
        }
    }


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.put("/change-password")
def change_password(
    request: ChangePasswordRequest,
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(
        authorization
    )

    if len(
        request.new_password.encode("utf-8")
    ) < 6:

        raise HTTPException(
            status_code=400,
            detail="New password must contain at least 6 characters"
        )

    try:

        user = users_collection.find_one(
            {
                "_id": ObjectId(user_id)
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        request.current_password,
        user["password"]
    ):

        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    if request.current_password == request.new_password:

        raise HTTPException(
            status_code=400,
            detail="New password must be different"
        )

    new_hash = hash_password(
        request.new_password
    )

    users_collection.update_one(

        {
            "_id": ObjectId(user_id)
        },

        {
            "$set": {
                "password": new_hash
            }
        }
    )

    return {

        "status": "success",

        "message": "Password changed successfully"
    }


# ============================================================
# TEST
# ============================================================

@router.get("/auth-test")
def auth_test():

    return {

        "status": "success",

        "message":
        "Authentication system is working"
    }