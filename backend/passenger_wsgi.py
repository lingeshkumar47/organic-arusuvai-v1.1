import os
import sys

# Path to the current directory
path = os.path.dirname(__file__)
if path not in sys.path:
    sys.path.insert(0, path)

# Set the Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'oa_backend.settings'

# Get the WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
