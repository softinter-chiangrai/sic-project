$folders = @('node_modules', 'sic-app/node_modules', 'sic-app/dist', 'sic-app/.angular', 'sic-spring', 'report-service/target', 'report-service/.mvn', 'scratch', '.git', '.pw-profile', 'slide-capture/node_modules', 'slide-capture/.pw-profile', 'slide-capture/slide-screenshots-balanced')

$results = @()
foreach ($folder in $folders) {
    $path = Join-Path 'C:\Users\lovew\Student\Project-Main\Java-intern\sic-project' $folder
    if (Test-Path $path) {
        $size = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($size / 1MB, 2)
        $results += [PSCustomObject]@{ Folder = $folder; SizeMB = $sizeMB }
    }
}
$results | Sort-Object SizeMB -Descending | Format-Table -AutoSize