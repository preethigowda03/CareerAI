from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import certifi
import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Get MongoDB URI
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI is not set. Check backend/.env"
    )


# -----------------------------------------
# MongoDB Connection
# -----------------------------------------

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=20000,
    connectTimeoutMS=20000,
    socketTimeoutMS=20000,
)


# -----------------------------------------
# Database
# -----------------------------------------

db = client["careerai"]


# -----------------------------------------
# Collections
# -----------------------------------------

users_collection = db["users"]

resumes_collection = db["resumes"]


# -----------------------------------------
# Test Connection
# -----------------------------------------

try:
    client.admin.command("ping")

    print("===================================")
    print("MongoDB connected successfully!")
    print("Database: careerai")
    print("Collections: users, resumes")
    print("===================================")

except ServerSelectionTimeoutError as e:

    print("===================================")
    print("MongoDB connection failed!")
    print("===================================")
    print(e)