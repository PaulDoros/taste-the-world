from PIL import Image
import os
import io

files_to_check = [
    'assets/images/splash-icon.png',
    'assets/images/icon.png',
    'assets/images/android-icon-192x192.png'
]

for file_path in files_to_check:
    if os.path.exists(file_path):
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
                
            img = Image.open(io.BytesIO(content))
            print(f"File {file_path} is format: {img.format}")
            
            if img.format != 'PNG':
                print(f"Converting {file_path} to PNG...")
                img.save(file_path, 'PNG')
                print(f"Success: {file_path} is now proper PNG.")
            else:
                print(f"Skipping: {file_path} is already PNG.")
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    else:
        print(f"File not found: {file_path}")
