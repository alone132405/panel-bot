@echo off
echo Disconnecting from RDP but keeping session active...
for /f "skip=1 tokens=3" %%s in ('query user %USERNAME%') do (
  %windir%\System32\tscon.exe %%s /dest:console
)
pause
