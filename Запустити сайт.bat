@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >/dev/null 2>/dev/null || (echo Потрібен Node.js 20+ — встановіть з https://nodejs.org і запустіть цей файл ще раз. & pause & exit /b 1)
if not exist dist\index.html (echo Немає папки dist. Виконайте: npm install, потім npm run build & pause & exit /b 1)
echo Сайт: http://localhost:4321  (щоб зупинити — закрийте це вікно)
start "" cmd /c "timeout /t 1 >/dev/null & start http://localhost:4321"
node scripts\serve.mjs 4321
pause
