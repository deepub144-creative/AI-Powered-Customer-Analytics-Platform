Set objShell = CreateObject("WScript.Shell")
objShell.Run "cmd /c """ & Replace(WScript.ScriptFullName, "start-all-silent.vbs", "start-all.bat") & """", 0, False