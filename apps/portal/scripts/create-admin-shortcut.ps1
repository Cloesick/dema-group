$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$PSScriptRoot\RunCypressAsAdmin.lnk")
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/c cd /d $PSScriptRoot\.. && pnpm exec cypress open --e2e --browser chrome"
$Shortcut.WorkingDirectory = "$PSScriptRoot\.."
$Shortcut.Save()

# Set shortcut to run as administrator
$bytes = [System.IO.File]::ReadAllBytes("$PSScriptRoot\RunCypressAsAdmin.lnk")
$bytes[0x15] = $bytes[0x15] -bor 0x20
[System.IO.File]::WriteAllBytes("$PSScriptRoot\RunCypressAsAdmin.lnk", $bytes)
