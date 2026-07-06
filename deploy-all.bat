@echo off
cd /d "D:\New folder\New folder"
git add .
git commit -m "update"
git push

cd client
vercel --prod --yes

cd ../itzone/client
vercel --prod --yes

pause
