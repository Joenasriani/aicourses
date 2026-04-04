import json
import os
import sys

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'content', 'courses')

errors = []
validated = 0

if not os.path.isdir(BASE_DIR):
    print(f'❌ Missing courses directory: {BASE_DIR}')
    sys.exit(1)

for slug in sorted(os.listdir(BASE_DIR)):
    course_dir = os.path.join(BASE_DIR, slug)
    if not os.path.isdir(course_dir):
        continue

    course_path = os.path.join(course_dir, 'course.json')
    if not os.path.exists(course_path):
        errors.append(f'{slug}: missing course.json')
        continue

    try:
        with open(course_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        errors.append(f'{slug}: invalid JSON ({e})')
        continue

    modules = data.get('modules')
    if not isinstance(modules, list) or len(modules) < 2:
        errors.append(f"{slug}: modules missing or fewer than 2")
        continue

    for idx, module in enumerate(modules, start=1):
        lessons = module.get('lessons')
        if not isinstance(lessons, list) or len(lessons) == 0:
            title = module.get('title', f'Module {idx}')
            errors.append(f"{slug}: module '{title}' has no lessons")

    validated += 1

if errors:
    print('❌ VALIDATION FAILED')
    for err in errors:
        print(f'- {err}')
    sys.exit(1)

print(f'✅ ALL COURSES VALID ({validated} validated)')
