# Script to clean Java Language Server (JDT.LS / Red Hat Java) cache in VS Code / Antigravity IDE
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Cleaning Java Language Server Workspace Cache ===" -ForegroundColor Cyan

# 1. Stop Java Language Server processes
$procs = Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -like "*jdt.ls*" -or $_.CommandLine -like "*eclipse.jdt.ls*"
}

if ($procs) {
    foreach ($p in $procs) {
        Write-Host "Stopping Java LS process (PID: $($p.ProcessId))..." -ForegroundColor Yellow
        Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "No active Java LS processes found." -ForegroundColor DarkGray
}

# 2. Locate redhat.java cache folders in VS Code and Antigravity IDE
$cachePaths = @(
    "$env:APPDATA\Code\User\workspaceStorage"
)
Get-ChildItem -Path "$env:APPDATA" -Directory -Filter "*Antigravity*" -ErrorAction SilentlyContinue | ForEach-Object {
    $ws = Join-Path $_.FullName "User\workspaceStorage"
    if (Test-Path $ws) { $cachePaths += $ws }
}

$foundAny = $false

foreach ($basePath in $cachePaths) {
    if (Test-Path $basePath) {
        $redhatDirs = Get-ChildItem -Path $basePath -Recurse -Depth 2 -Filter "redhat.java" -ErrorAction SilentlyContinue
        foreach ($dir in $redhatDirs) {
            $foundAny = $true
            Write-Host "Cleaning: $($dir.FullName)" -ForegroundColor Cyan
            
            # Remove JDT workspace index (primary cache)
            $jdtWs = Join-Path $dir.FullName "jdt_ws"
            if (Test-Path $jdtWs) {
                Remove-Item -Path $jdtWs -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  - Removed jdt_ws" -ForegroundColor Green
            }

            # Remove Spring Tools workspace cache
            $ssWs = Join-Path $dir.FullName "ss_ws"
            if (Test-Path $ssWs) {
                Remove-Item -Path $ssWs -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  - Removed ss_ws" -ForegroundColor Green
            }

            # Remove crash heap dumps if any
            Get-ChildItem -Path $dir.FullName -Filter "*.hprof" -ErrorAction SilentlyContinue | ForEach-Object {
                Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
                Write-Host "  - Removed heap dump: $($_.Name)" -ForegroundColor Green
            }
        }
    }
}

if (-not $foundAny) {
    Write-Host "No redhat.java cache directories found to clean." -ForegroundColor DarkYellow
} else {
    Write-Host "`nDone! Java Language Server cache has been cleaned." -ForegroundColor Green
    Write-Host "The IDE will re-index your Java projects fresh upon next activity." -ForegroundColor Gray
}
