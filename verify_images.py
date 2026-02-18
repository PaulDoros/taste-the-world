import imghdr
import os

files_to_check = [
    'assets/images/splash-icon.png',
    'assets/images/icon.png',
    'assets/images/android-icon-192x192.png'
]

print("Verifying image formats...")
for file_path in files_to_check:
    if os.path.exists(file_path):
        try:
            format = imghdr.what(file_path)
            print(f"File: {file_path}, Detected Format: {format}")
            if format == 'png':
                print(f"✅ {file_path} is a valid PNG.")
            else:
                print(f"❌ {file_path} is NOT a PNG (it is {format}).")
        except Exception as e:
            print(f"Error checking {file_path}: {e}")
    else:
        print(f"File not found: {file_path}")
