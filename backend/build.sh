#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Optional: Load initial data or mock users if this is a fresh database
# python manage.py shell < create_mock_users.py
