@echo off
rem --- run-frontend.bat -------------------------------------------------
rem Ensure Node is on the PATH (adjust if your Node folder differs)
set "PATH=%PATH%;C:\Program Files\nodejs"

rem Run the Next.js dev script
npm run dev
