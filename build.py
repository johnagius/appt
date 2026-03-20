#!/usr/bin/env python3
"""
Build script: generates KevAppts.json from individual files in src/.

Usage:
    python3 build.py

This reads all .gs, .html, and .json files from src/ and assembles them
into KevAppts.json in the Google Apps Script project file format.

Existing file IDs are preserved when updating; new files get new UUIDs.
"""

import json
import os
import uuid
import sys

SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'KevAppts.json')

# Map file extensions to GAS types
EXT_TO_TYPE = {
    '.gs': 'server_js',
    '.html': 'html',
    '.json': 'json',
}

# Define file order (matches original project structure)
FILE_ORDER = [
    'appsscript.json',
    'Config.gs',
    'Install.gs',
    'Utils.gs',
    'Data.gs',
    'CalendarService.gs',
    'EmailService.gs',
    'WebApp.gs',
    'AdminApi.gs',
    'Index.html',
    'Cancel.html',
    'DocAction.html',
    'Admin.html',
    'Uninstall.gs',
]


def load_existing_ids():
    """Load existing file IDs from KevAppts.json if it exists."""
    ids = {}
    if os.path.exists(OUTPUT):
        try:
            with open(OUTPUT, 'r') as f:
                data = json.load(f)
            for fi in data.get('files', []):
                ids[fi['name']] = fi['id']
        except (json.JSONDecodeError, KeyError):
            pass
    return ids


def build():
    existing_ids = load_existing_ids()
    files = []

    for filename in FILE_ORDER:
        filepath = os.path.join(SRC_DIR, filename)
        if not os.path.exists(filepath):
            print(f'  WARNING: {filename} not found in src/, skipping')
            continue

        name, ext = os.path.splitext(filename)
        file_type = EXT_TO_TYPE.get(ext)
        if not file_type:
            print(f'  WARNING: Unknown extension {ext} for {filename}, skipping')
            continue

        with open(filepath, 'r') as f:
            source = f.read()

        file_id = existing_ids.get(name, str(uuid.uuid4()))

        files.append({
            'id': file_id,
            'name': name,
            'type': file_type,
            'source': source,
        })

        print(f'  {filename} ({len(source)} chars)')

    # Check for any files in src/ not in FILE_ORDER
    for filename in sorted(os.listdir(SRC_DIR)):
        if filename not in FILE_ORDER:
            _, ext = os.path.splitext(filename)
            if ext in EXT_TO_TYPE:
                print(f'  WARNING: {filename} exists in src/ but not in FILE_ORDER, skipping')

    output = {'files': files}

    with open(OUTPUT, 'w') as f:
        json.dump(output, f, ensure_ascii=False)

    print(f'\nGenerated {OUTPUT} with {len(files)} files')
    return 0


if __name__ == '__main__':
    print('Building KevAppts.json from src/...\n')
    sys.exit(build())
