$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Heisen Gallery.lnk")
$Shortcut.TargetPath = "D:\PS2\heisen-gallery\heisen-gallery-launcher.vbs"
$Shortcut.IconLocation = "D:\PS2\heisen-gallery\src\favicon.ico"
$Shortcut.WorkingDirectory = "D:\PS2\heisen-gallery\"
$Shortcut.Description = "Heisen Gallery"
$Shortcut.Save()

Write-Host "Final shortcut created on your desktop. This shortcut will launch the application without showing any command windows."
Write-Host "You can now pin it to your taskbar by right-clicking on it and selecting 'Pin to taskbar'."
