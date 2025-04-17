import os
import glob

# Directories to check
directories = [
    'backend/staticfiles',
    'backend/static',
    'frontend/build/static',  # If you have a frontend folder
]

# Files to find
files_to_find = [
    '**/js/main*.js',
    '**/css/main*.css',
    '**/manifest.json',
]

base_dir = os.path.dirname(os.path.abspath(__file__))

print("Checking for static files...")
for directory in directories:
    dir_path = os.path.join(base_dir, directory)
    if os.path.exists(dir_path):
        print(f"\nChecking in {dir_path}")
        for file_pattern in files_to_find:
            full_pattern = os.path.join(dir_path, file_pattern)
            matching_files = glob.glob(full_pattern, recursive=True)
            if matching_files:
                print(f"✓ Found matching {file_pattern}:")
                for file in matching_files:
                    print(f"  - {file}")
            else:
                print(f"✗ No matching {file_pattern}")
    else:
        print(f"\n✗ Directory does not exist: {dir_path}")

print("\nDone checking for static files.")
