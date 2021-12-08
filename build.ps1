Copy-Item -Path ".\public\*" -Destination "./electron" -Recurse -Force
cd electron 
npx electron-packager .
Compress-Archive -Path "./ToxikCalc-win32-x64\*" -Destination "./ToxikCalc-win32-x64.zip"
cd ..
git add .
git commit -am %1
git push
gh realease create %2 -n %1 ./electron/ToxikCalc-win32-x64.zip