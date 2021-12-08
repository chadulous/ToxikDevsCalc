const electron = require('electron')
const { getCurrentWindow } = (electron.remote || electron)
setInterval(() => {
    console.log('size:', getCurrentWindow().getSize());
}, 1000)