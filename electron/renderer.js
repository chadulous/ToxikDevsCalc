const { remote } = require('electron')
setInterval(() => {
    console.log('size:', remote.getCurrentWindow().getSize());
}, 1000)