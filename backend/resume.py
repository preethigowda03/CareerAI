from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from pypdf import PdfReader
from database.mongodb import resumes_collection
from bson import ObjectId
import os
import uuid
import jwt
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
        token = authorization.replace("Bearer ", "")

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


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):

    user_id = get_user_id_from_token(authorization)

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    original_filename = file.filename or "resume.pdf"

    temp_filename = f"temp_{uuid.uuid4().hex}.pdf"

    try:

        with open(temp_filename, "wb") as f:
            f.write(contents)

        reader = PdfReader(temp_filename)

        text = ""

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF"
            )

        resume_data = {
            "user_id": user_id,
            "filename": original_filename,
            "text": text,
            "status": "uploaded"
        }

        existing_resume = resumes_collection.find_one({
            "user_id": user_id,
            "filename": original_filename
        })

        if existing_resume:

            resumes_collection.update_one(
                {"_id": existing_resume["_id"]},
                {
                    "$set": {
                        "text": text,
                        "status": "uploaded"
                    },
                    "$unset": {
                        "analysis": ""
                    }
                }
            )

            resume_id = str(
                existing_resume["_id"]
            )

        else:

            result = resumes_collection.insert_one(
                resume_data
            )

            resume_id = str(
                result.inserted_id
            )

        return {
            "status": "success",
            "message": "Resume uploaded successfully",
            "resume_id": resume_id,
            "filename": original_filename,
            "text_length": len(text)
        }

    finally:

        if os.path.exists(temp_filename):
            os.remove(temp_filename)