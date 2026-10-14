import os
import re
from pathlib import Path
import requests

BASE_URL = "http://localhost:8082"
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = WORKSPACE_ROOT / "report-service/src/main/resources/report-templates"

session = requests.Session()

# 1. Login
login_page = session.get(f"{BASE_URL}/login")
csrf_match = re.search(r'name="_csrf"\s+value="([^"]+)"', login_page.text)
csrf_token = csrf_match.group(1) if csrf_match else None

login_res = session.post(
    f"{BASE_URL}/login",
    data={
        "username": "sarankon",
        "password": "sarankon",
        "_csrf": csrf_token
    }
)
print("Login status:", login_res.status_code)

# Get CSRF from page for subsequent API calls
home_res = session.get(f"{BASE_URL}/data-sources")
csrf_match = re.search(r'name="_csrf"\s+content="([^"]+)"', home_res.text) or re.search(r'name="_csrf"\s+value="([^"]+)"', home_res.text)
csrf_token = csrf_match.group(1) if csrf_match else None
headers = {"X-CSRF-TOKEN": csrf_token} if csrf_token else {}

# 2. Check or create Data Source
ds_list = session.get(f"{BASE_URL}/api/data-sources").json()
print("Existing Data Sources:", len(ds_list))
ds_id = None
if ds_list:
    ds_id = ds_list[0]["id"]
else:
    ds_payload = {
        "databaseName": "sic_app",
        "connectionLabel": "SIC Database",
        "databaseType": "PostgreSQL",
        "hostAddress": "sic-database",
        "port": 5432,
        "username": "administrator",
        "password": "Sic2026",
        "connectTimeoutSeconds": 10,
        "socketTimeoutSeconds": 30
    }
    create_ds_res = session.post(f"{BASE_URL}/api/data-sources", json=ds_payload, headers=headers)
    print("Create DS response:", create_ds_res.status_code)
    ds_id = create_ds_res.json()["id"]

print(f"Using DataSource ID: {ds_id}")

# 3. Check or create Access Token
target_token = "sw7vuLj4VcTyksKN9ZFNYDRmtu_O2uYk"
tokens_list = session.get(f"{BASE_URL}/api/access-tokens").json()
print("Existing Access Tokens:", len(tokens_list))
if not tokens_list:
    token_payload = {
        "tokenName": "SIC Backend",
        "description": "Token for SIC Spring Backend API",
        "expiryPolicy": "Never",
        "status": "Active"
    }
    create_token_res = session.post(f"{BASE_URL}/api/access-tokens", json=token_payload, headers=headers)
    token_id = create_token_res.json()["id"]
    reg_res = session.post(f"{BASE_URL}/api/access-tokens/{token_id}/register", json={"tokenValue": target_token}, headers=headers)
    print("Registered Access Token:", reg_res.status_code)
else:
    print("Access token already exists.")

# 4. Upload all 12 templates
existing_templates = session.get(f"{BASE_URL}/api/report-templates").json()
existing_codes = {t.get("templateCode", "").upper() for t in existing_templates}
print("Existing template codes:", existing_codes)

files = sorted(list(TEMPLATES_DIR.glob("*.jrxml")))
print(f"Found {len(files)} JRXML files in {TEMPLATES_DIR}")

for file_path in files:
    base_name = file_path.stem
    code = base_name.replace("_", "").upper()
    if code in existing_codes:
        print(f"Template {code} already exists, skipping.")
        continue

    print(f"Uploading {file_path.name} (Code: {code})...")
    with open(file_path, "rb") as f:
        upload_res = session.post(
            f"{BASE_URL}/api/report-templates/upload",
            files={"file": (file_path.name, f, "application/xml")},
            headers=headers
        )
    
    if upload_res.status_code != 200:
        print(f"Failed to upload {file_path.name}: {upload_res.status_code} {upload_res.text}")
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
        print(f"Successfully created template {code} ({base_name})")
    else:
        print(f"Failed to create template {code}: {save_res.status_code} {save_res.text}")

print("All reports import process finished!")
