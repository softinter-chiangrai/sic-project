# -*- coding: utf-8 -*-
import os
import re
import json

WORKSPACE = r"c:\Users\lovew\Student\Project-Main\Java-intern\sic-project"

def read_file_content(filename):
    path = os.path.join(WORKSPACE, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def main():
    print("Parsing architecture summaries...")
    backend_summary = read_file_content("สรุปหน้าที่ไฟล์ทั้งหมด_Backend_Spring_Boot_ระบบ_SIC.txt")
    ai_summary = read_file_content("สรุปกลไก_AI_ดึงข้อมูลและคุม_Scope.txt")
    approval_summary = read_file_content("สรุปกลไก_Approval_Flow_ระบบ_SIC.txt")
    trace_summary = read_file_content("สรุปกลไก_TraceLink_และ_Traceability_ระบบ_SIC.txt")
    doc_rel_summary = read_file_content("สรุปความสัมพันธ์ของเอกสารในระบบ_SIC.txt")
    db_summary = read_file_content("สรุปหน้าที่ตารางฐานข้อมูลทั้งหมด_ระบบ_SIC.txt")

    file_records = []
    current_layer = "General"
    current_category = "General"

    lines = backend_summary.split("\n")
    for line in lines:
        sline = line.strip()
        if "หมวดที่ 1" in sline or "Root Entry Point & Config" in sline:
            current_layer = "Config & Root"
            current_category = "Configuration & Infrastructure"
        elif "หมวดที่ 2" in sline or "Interceptors & Security" in sline:
            current_layer = "Interceptor"
            current_category = "Security & Multi-Tenancy"
        elif "หมวดที่ 3" in sline or "Controllers" in sline:
            current_layer = "Controller"
            current_category = "REST Endpoints"
        elif "กลุ่ม 3." in sline:
            current_layer = "Controller"
            current_category = sline.replace("กลุ่ม ", "").strip()
        elif "หมวดที่ 4" in sline or "Services & Generators" in sline:
            current_layer = "Service"
            current_category = "Business Logic & AI"
        elif "กลุ่ม 4." in sline:
            current_layer = "Service"
            current_category = sline.replace("กลุ่ม ", "").strip()
        elif "หมวดที่ 5" in sline or "Repositories" in sline:
            current_layer = "Repository"
            current_category = "Database Access Layer"
        elif "หมวดที่ 6" in sline or "Entity Models & Enums" in sline:
            current_layer = "Entity & Enum"
            current_category = "Domain Models"
        elif "หมวดที่ 7" in sline or "Schedulers, WebSocket & Exceptions" in sline:
            current_layer = "Scheduler & Exception"
            current_category = "Background Jobs & Errors"
        elif "หมวดที่ 8" in sline or "Utility Classes" in sline:
            current_layer = "Util"
            current_category = "Central Utilities"
        elif "หมวดที่ 9" in sline or "DTO Layer" in sline:
            current_layer = "DTO"
            current_category = "Data Transfer Objects"

        m = re.match(r'^(?:\d+\.|\-)\s*`([^`]+)`:\s*(.+)$', sline)
        if m:
            fname = m.group(1).strip()
            desc = m.group(2).strip()
            cname = fname.replace(".java", "")
            file_records.append({
                "fileName": fname,
                "className": cname,
                "layer": current_layer,
                "category": current_category,
                "description": desc
            })

    print(f"Extracted {len(file_records)} file records from backend summary.")
    
    out_json = os.path.join(WORKSPACE, "parsed_backend_files.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(file_records, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
