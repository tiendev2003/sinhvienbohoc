import os
import sys
from pathlib import Path

# Add project directory to Python path
project_dir = Path(__file__).parent
sys.path.append(str(project_dir))

# Import settings from the app
from app.core.config import settings

print(f"Checking upload directory configuration:")
print(f"UPLOAD_DIR setting: {settings.UPLOAD_DIR}")
print(f"BASE_DIR: {settings.BASE_DIR}")

# Check if directory exists
if os.path.exists(settings.UPLOAD_DIR):
    print(f"Directory exists: {settings.UPLOAD_DIR}")
    print(f"Is directory: {os.path.isdir(settings.UPLOAD_DIR)}")
    print(f"Is writable: {os.access(settings.UPLOAD_DIR, os.W_OK)}")
    
    # List files
    try:
        files = os.listdir(settings.UPLOAD_DIR)
        print(f"Files count: {len(files)}")
        print(f"Files (first 5): {files[:5] if files else 'No files'}")
    except Exception as e:
        print(f"Error listing files: {str(e)}")
else:
    print(f"Directory does not exist: {settings.UPLOAD_DIR}")
    print("Attempting to create directory...")
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        print(f"Created directory: {settings.UPLOAD_DIR}")
        print(f"Is writable: {os.access(settings.UPLOAD_DIR, os.W_OK)}")
    except Exception as e:
        print(f"Error creating directory: {str(e)}")
