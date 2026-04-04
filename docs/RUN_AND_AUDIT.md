# Run and Audit

## Validate course files

```bash
python scripts/validate_courses.py
```

Checks:
- missing `course.json`
- fewer than 2 modules
- modules with no lessons
- invalid JSON

## Seed courses

```bash
python scripts/seed_courses.py
```

Environment variables:
- `DB_URI`
- `DB_NAME` (optional, defaults to `ai_academy`)

## What this does
- upserts courses by `slug`
- does not delete user data
- preserves progress, subscriptions, and purchases

## Audit checklist
- all public course folders contain `course.json`
- all courses validate successfully
- seeded course count matches expected total
- frontend loads seeded courses without empty states
- locked/free access matches pricing rules
