import os
import re
import sys
import time
from pathlib import Path
import requests

BASE_URL = os.environ.get("REPORT_SERVICE_URL", "http://sic-report-service:80")
TEMPLATES_DIR = Path(os.environ.get("TEMPLATES_DIR", "/templates"))
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "sarankon")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "sarankon")
TARGET_TOKEN = os.environ.get("REPORT_SERVICE_TOKEN", "sw7vuLj4VcTyksKN9ZFNYDRmtu_O2uYk")

DB_HOST = os.environ.get("POSTGRES_HOST", "sic-database")
DB_PORT = int(os.environ.get("POSTGRES_PORT", "5432"))
DB_NAME = os.environ.get("POSTGRES_DB", "sic_app")
DB_USER = os.environ.get("POSTGRES_USER", "administrator")
DB_PASS = os.environ.get("POSTGRES_PASSWORD", "Sic2026")

session = requests.Session()

print(f"Waiting for Report Service at {BASE_URL} to become ready...")
for attempt in range(60):
    try:
        res = session.get(f"{BASE_URL}/login", timeout=3)
        if res.status_code == 200:
            print("Report Service is online!")
            break
    except Exception:
        pass
    time.sleep(2)
else:
    print("Report Service did not become ready in time. Exiting.")
    sys.exit(1)

# 1. Login
login_page = session.get(f"{BASE_URL}/login")
csrf_match = re.search(r'name="_csrf"\s+value="([^"]+)"', login_page.text)
csrf_token = csrf_match.group(1) if csrf_match else None

login_res = session.post(
    f"{BASE_URL}/login",
    data={
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD,
        "_csrf": csrf_token
    }
)
if login_res.status_code != 200 and "login?error" in login_res.url:
    print(f"Failed to log in as {ADMIN_USERNAME}. Exiting.")
    sys.exit(1)
print(f"Logged in as {ADMIN_USERNAME} successfully.")

# Get CSRF token for API calls
home_res = session.get(f"{BASE_URL}/data-sources")
csrf_match = re.search(r'name="_csrf"\s+content="([^"]+)"', home_res.text) or re.search(r'name="_csrf"\s+value="([^"]+)"', home_res.text)
csrf_token = csrf_match.group(1) if csrf_match else None
headers = {"X-CSRF-TOKEN": csrf_token} if csrf_token else {}

# 2. Check / Create Data Source
ds_list = session.get(f"{BASE_URL}/api/data-sources").json()
ds_id = None
if ds_list:
    ds_id = ds_list[0]["id"]
    print(f"Data Source already exists: ID={ds_id}")
else:
    ds_payload = {
        "databaseName": DB_NAME,
        "connectionLabel": "SIC Database",
        "databaseType": "PostgreSQL",
        "hostAddress": DB_HOST,
        "port": DB_PORT,
        "username": DB_USER,
        "password": DB_PASS,
        "connectTimeoutSeconds": 10,
        "socketTimeoutSeconds": 30
    }
    create_ds_res = session.post(f"{BASE_URL}/api/data-sources", json=ds_payload, headers=headers)
    if create_ds_res.status_code == 200:
        ds_id = create_ds_res.json()["id"]
        print(f"Created Data Source: ID={ds_id}")
    else:
        print("Failed to create Data Source:", create_ds_res.status_code, create_ds_res.text)

# 3. Check / Create Access Token
tokens_list = session.get(f"{BASE_URL}/api/access-tokens").json()
if not tokens_list:
    token_payload = {
        "tokenName": "SIC Backend",
        "description": "Token for SIC Spring Backend API",
        "expiryPolicy": "Never",
        "status": "Active"
    }
    create_token_res = session.post(f"{BASE_URL}/api/access-tokens", json=token_payload, headers=headers)
    if create_token_res.status_code == 200:
        token_id = create_token_res.json()["id"]
        session.post(f"{BASE_URL}/api/access-tokens/{token_id}/register", json={"tokenValue": TARGET_TOKEN}, headers=headers)
        print("Created and registered Access Token.")
else:
    print("Access token already exists.")

# 4. Check / Upload Templates
existing_templates = session.get(f"{BASE_URL}/api/report-templates").json()
existing_codes = {t.get("templateCode", "").upper() for t in existing_templates}

files = sorted(list(TEMPLATES_DIR.glob("*.jrxml")))
print(f"Checking {len(files)} JRXML templates...")

for file_path in files:
    base_name = file_path.stem
    code = base_name.replace("_", "").upper()
    if code in existing_codes:
        continue

    print(f"Uploading template {code} ({file_path.name})...")
    with open(file_path, "rb") as f:
        upload_res = session.post(
            f"{BASE_URL}/api/report-templates/upload",
            files={"file": (file_path.name, f, "application/xml")},
            headers=headers
        )
    if upload_res.status_code != 200:
        print(f"Failed to upload {file_path.name}: {upload_res.status_code}")
        continue

    upload_token = upload_res.json()["uploadToken"]
    save_payload = {
        "templateCode": code,
        "templateName": base_name,
        "description": f"Bundled SIC template: {base_name}",
        "dataSourceId": ds_id,
        "uploadToken": upload_token
    }
    save_res = session.post(f"{BASE_URL}/api/report-templates", json=save_payload, headers=headers)
    if save_res.status_code == 200:
        print(f"Successfully registered template {code}")
    else:
        print(f"Failed to register template {code}: {save_res.text}")

print("Report Service initialization completed successfully.")
