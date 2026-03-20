#!/usr/bin/env python3
"""
Build script: generates KevAppts.json and dist/bundle.gs from src/.

Usage:
    python3 build.py

Outputs:
  - KevAppts.json  (GAS project file for clasp push)
  - dist/bundle.gs (full bundle: .gs code + HTML templates for Loader.gs)
"""

import json
import os
import uuid
import sys

SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
OUTPUT_JSON = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'KevAppts.json')
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
OUTPUT_BUNDLE = os.path.join(DIST_DIR, 'bundle.gs')

EXT_TO_TYPE = {
    '.gs': 'server_js',
    '.html': 'html',
    '.json': 'json',
}

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

# .gs files included in the bundle (dependency order)
BUNDLE_GS_ORDER = [
    'Config.gs',
    'Utils.gs',
    'Data.gs',
    'CalendarService.gs',
    'EmailService.gs',
    'WebApp.gs',
    'AdminApi.gs',
    'Install.gs',
    'Uninstall.gs',
]

# HTML files included in the bundle as templates
BUNDLE_HTML = [
    'Index.html',
    'Cancel.html',
    'DocAction.html',
    'Admin.html',
]

# All public functions proxied by Loader.gs
PUBLIC_FUNCTIONS = [
    # WebApp.gs
    'doGet',
    'apiInit',
    'apiGetDateOptions',
    'apiGetAvailability',
    'apiBook',
    'apiGetCancelInfo',
    'apiCancelAppointment',
    'apiDoctorAction',
    # AdminApi.gs
    'apiAdminGetDashboard',
    'apiAdminGetDateAppointments',
    'apiAdminMarkDoctorOff',
    'apiAdminAddExtraSlots',
    'apiAdminProcessAppointments',
    'apiAdminRemoveDoctorOff',
    'apiAdminRemoveExtraSlots',
    'apiAdminNotifyPatients',
    # EmailService.gs (trigger)
    'sendDailyDoctorSchedule_',
    # Install.gs
    'install',
    'repairSheets',
    'setWebAppUrl',
    'setDoctorEmail',
    'setPottersLocation',
    'setSpinolaLocation',
    'setDoubleCheckCalendar',
    'setMaxActiveAppointmentsPerPerson',
    'generateAdminLink',
    'setWebAppUrlAuto',
    # Uninstall.gs
    'armUninstall',
    'armUninstallForce',
    'disarmUninstall',
    'uninstallDryRun',
    'uninstallEverything',
    'uninstallKeepCalendar',
]


def load_existing_ids():
    ids = {}
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON, 'r') as f:
                data = json.load(f)
            for fi in data.get('files', []):
                ids[fi['name']] = fi['id']
        except (json.JSONDecodeError, KeyError):
            pass
    return ids


def build_json():
    """Build KevAppts.json from src/ files."""
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

    for filename in sorted(os.listdir(SRC_DIR)):
        if filename not in FILE_ORDER:
            _, ext = os.path.splitext(filename)
            if ext in EXT_TO_TYPE:
                print(f'  WARNING: {filename} exists in src/ but not in FILE_ORDER')

    with open(OUTPUT_JSON, 'w') as f:
        json.dump({'files': files}, f, ensure_ascii=False)

    print(f'\n  => {OUTPUT_JSON} ({len(files)} files)')


def sanitize_smart_quotes(s):
    """Replace Unicode smart quotes with straight ASCII equivalents."""
    return (s
        .replace('\u2018', "'").replace('\u2019', "'")   # ' '
        .replace('\u201C', '"').replace('\u201D', '"'))   # " "


def js_string_escape(s):
    """Escape a string for embedding inside a JS string literal (backtick template)."""
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


def build_bundle():
    """Build dist/bundle.gs with all .gs code + HTML templates."""
    os.makedirs(DIST_DIR, exist_ok=True)

    parts = []

    # 1. Concatenate all .gs files
    for filename in BUNDLE_GS_ORDER:
        filepath = os.path.join(SRC_DIR, filename)
        if not os.path.exists(filepath):
            print(f'  WARNING: {filename} not found, skipping')
            continue

        with open(filepath, 'r') as f:
            source = f.read()

        # Sanitize smart quotes that GAS editor may silently introduce
        source = sanitize_smart_quotes(source)

        parts.append(f'// ===== {filename} =====')
        parts.append(source)

    # 2. Build _HTML_TEMPLATES object from HTML files
    html_entries = []
    for filename in BUNDLE_HTML:
        filepath = os.path.join(SRC_DIR, filename)
        if not os.path.exists(filepath):
            print(f'  WARNING: {filename} not found, skipping')
            continue

        with open(filepath, 'r') as f:
            html_content = f.read()

        name = os.path.splitext(filename)[0]
        escaped = js_string_escape(html_content)
        html_entries.append(f'    {name}: `{escaped}`')
        print(f'  {filename} ({len(html_content)} chars) -> template')

    html_obj = ',\n'.join(html_entries)

    # 3. Build exports
    exports = ',\n'.join(f'    {fn}: {fn}' for fn in PUBLIC_FUNCTIONS)

    # 4. Wrap in IIFE
    bundle = (
        '// Auto-generated bundle - do not edit directly\n'
        '// Built by build.py from src/*.gs + src/*.html\n'
        '//\n'
        '// _BUNDLE  = object with all public function references\n'
        '// _HTML_TEMPLATES = object with HTML content keyed by name\n'
        '\n'
        'var _HTML_TEMPLATES = {\n'
        + html_obj + '\n'
        '};\n'
        '\n'
        'var _BUNDLE = (function() {\n'
        '\n'
        + '\n'.join(parts) + '\n'
        '\n'
        '  return {\n'
        + exports + '\n'
        '  };\n'
        '})();\n'
    )

    with open(OUTPUT_BUNDLE, 'w') as f:
        f.write(bundle)

    size_kb = len(bundle) / 1024
    print(f'\n  => {OUTPUT_BUNDLE} ({size_kb:.1f} KB, {len(PUBLIC_FUNCTIONS)} exports)')

    if size_kb > 95:
        print(f'  WARNING: Bundle is {size_kb:.1f} KB. CacheService limit is 100KB per key.')
        print(f'  Loader.gs uses chunked caching to handle this.')


if __name__ == '__main__':
    print('Building KevAppts.json from src/...\n')
    build_json()

    print('\nBuilding dist/bundle.gs...\n')
    build_bundle()

    print('\nDone!')
    sys.exit(0)
