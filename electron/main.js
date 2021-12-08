require('update-electron-app')()
const { app, BrowserWindow, autoUpdater, dialog } = require('electron');
const createWindow = ()=>{
    const win = new BrowserWindow({
        width: 400,
        height: 650,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#2f3241',
            symbolColor: '#74b1be'
        },
        resizable: false,
    })
    win.loadFile('index.html')
    win.removeMenu()
    win.once('focus', () => win.flashFrame(false))
    win.flashFrame(true)
}
app.whenReady().then(()=>{
    createWindow()
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit()
    })
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.setUserTasks([
    {
      program: process.execPath,
      arguments: '--new-window',
      iconPath: process.execPath,
      iconIndex: 0,
      title: 'New Calculator Window',
      description: ''
    }
])
const url = `https://update.electronjs.org/maverick-dev-55/ToxikDevsCalc/${process.platform}-${process.arch}/${app.getVersion()}`

autoUpdater.setFeedURL({ url })
setInterval(() => {
    autoUpdater.checkForUpdates()
}, 60000)
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }
  
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
})
autoUpdater.on('error', message => {
    console.error('There was a problem updating the application')
    console.error(message)
})