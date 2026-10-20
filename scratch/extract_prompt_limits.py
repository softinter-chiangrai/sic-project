import os
import re

files = [
    'ProjectGeneratorService.java',
    'RequirementGeneratorService.java',
    'SpecificationGeneratorService.java',
    'TestCaseGeneratorService.java',
    'TestScenarioGeneratorService.java',
    'DeliveryGeneratorService.java',
    'UserManualGeneratorService.java',
    'InvoiceGeneratorService.java',
    'MaTicketGeneratorService.java',
    'AiProjectPipelineJobService.java',
    'AiNavigatorServiceImpl.java',
    'AiSqlGeneratorServiceImpl.java',
    'ImpactAnalysisServiceImpl.java',
    'AiBatchGeneratorServiceImpl.java'
]

dir_path = r'c:\Users\lovew\Student\Project-Main\Java-intern\sic-project\sic-spring\sic\src\main\java\com\softinter\sicapi\service\impl'

for fname in files:
    fpath = os.path.join(dir_path, fname)
    if not os.path.exists(fpath):
        continue
    content = open(fpath, encoding='utf-8').read()
    
    # Extract triple quote strings
    triple_quotes = re.findall(r'"""([\s\S]*?)"""', content)
    print(f"=== {fname} ({len(triple_quotes)} prompt blocks) ===")
    for idx, tq in enumerate(triple_quotes):
        constraint_lines = []
        for line in tq.strip().split('\n'):
            line_str = line.strip()
            if any(k in line_str.lower() for k in [
                'rule', 'limit', 'max', 'strictly', 'only', 'must', 
                'schema', 'dropdown', 'format', 'character', 'ห้าม', 'กติกา', 'ห้ามมี'
            ]):
                constraint_lines.append(line_str)
        if constraint_lines:
            print(f"  [Block {idx+1}]")
            for cl in constraint_lines[:8]:
                print(f"    - {cl}")
