import { app, BrowserWindow, screen } from 'electron';
import path from "path";
import { isDev } from './utils.js'

app.on("ready", ()=>{
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const windowSize = Math.min(1250, screenWidth, screenHeight);
    const iconPath = isDev()
        ? path.join(app.getAppPath(), "public", "favicon.svg")
        : path.join(app.getAppPath(), "dist-react", "favicon.svg");

    const mainWindow = new BrowserWindow({
        width: windowSize,
        height: windowSize,
        minWidth: windowSize,
        minHeight: windowSize,
        maxWidth: windowSize,
        maxHeight: windowSize,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        autoHideMenuBar: true,
        icon: iconPath,
    });
    mainWindow.setMenuBarVisibility(false);

    if ( isDev() ) {
        mainWindow.loadURL('http://localhost:5123');
    }
    else {
        mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
    }
})