import os
from motor.motor_asyncio import AsyncIOMotorClient

# The connection string includes the database name (.../student-management),
# so get_default_database() resolves to it without hardcoding the name here.
MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()

users_collection = db["users"]


async def ensure_indexes():
    """Enforce one account per email at the database level."""
    await users_collection.create_index("email", unique=True)
