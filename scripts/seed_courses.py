import json
import os
from pymongo import MongoClient

DB_URI = os.getenv('DB_URI', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'ai_academy')

client = MongoClient(DB_URI)
db = client[DB_NAME]

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'content', 'courses')

seeded = 0

for slug in os.listdir(BASE_DIR):
    course_dir = os.path.join(BASE_DIR, slug)
    if not os.path.isdir(course_dir):
        continue

    course_path = os.path.join(course_dir, 'course.json')
    if not os.path.exists(course_path):
        continue

    with open(course_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    db.courses.update_one(
        {"slug": data["slug"]},
        {"$set": data},
        upsert=True
    )

    seeded += 1

print(f'✅ SEEDED {seeded} COURSES')
