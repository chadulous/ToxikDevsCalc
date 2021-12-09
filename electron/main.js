const { app, BrowserWindow } = require('electron');
const DiscordRPC = require('discord-rpc')
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
const clientId = '918287648680992791';
DiscordRPC.register(clientId);
const mainWindow = BrowserWindow.getAllWindows()[0]
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();
async function setActivity() {
    if(!rpc || !mainWindow) return;
    rpc.setActivity({
        details: 'doin some math or sum idk',
        states: 'smort calcumalations',
        startTimestamp,
        instance: false,
    })
}
rpc.on('ready', () => {
    setActivity()
    setInterval(()=>{
        setActivity()
    }, 15e3)
})