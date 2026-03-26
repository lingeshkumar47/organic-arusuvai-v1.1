#!/bin/sh
echo "🔄 Running migrations..."
python manage.py migrate --noinput

echo "📦 Seeding data..."
python manage.py seed_data

echo "🚀 Starting Django server..."
python manage.py runserver 0.0.0.0:8000
