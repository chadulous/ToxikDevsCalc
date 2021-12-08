param(
    [Parameter(Mandatory=$true)]
    [string]$message,
    [Parameter(Mandatory=$true)]
    [string]$chlog
)
Copy-Item -Path ".\public\*" -Destination "./electron" -Recurse -Force
cd electron 
npx electron-packager .
Compress-Archive -Path "./ToxikCalc-win32-x64\*" -Destination "./ToxikCalc-win32-x64.zip" -Update
cd ..
git add .
git commit -am $message
git push
gh release create $chlog -n $message ./electron/ToxikCalc-win32-x64.zip