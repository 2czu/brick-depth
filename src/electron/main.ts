import { app, BrowserWindow, dialog, screen } from 'electron';
import path from "path";
import fs from "fs";
import { isDev } from './utils.js'
import { ChildProcess, execSync, spawn } from 'child_process';


let pyProcess: ChildProcess | null = null

export function getRootPath() {
    return path.join(
        app.getAppPath(),
        isDev() ? '.' : '..',
        '/'
    )
}

function resolveDepthServerDir(): string {
  if (isDev()) {
    return path.join(getRootPath(), 'depth-server')
  }

  const envPath = process.env.BRICKDEPTH_DEPTH_SERVER_PATH
  if (!envPath) {
    throw new Error(
      "BRICKDEPTH_DEPTH_SERVER_PATH needs to point toward the depth-server folder"
    )
  }
  return envPath
}

function killStaleDepthServer() {
  try {
    execSync('pkill -f "depth-server/venv/bin/uvicorn"')
  } catch {
    // cas de base
  }
}

export function startDepthServer() {
  killStaleDepthServer()

  let depthServerDir: string
  try {
    depthServerDir = resolveDepthServerDir()
  } catch (err) {
    reportFatalStartupError((err as Error).message)
    return
  }

  const uvicornPath = path.join(depthServerDir, 'venv', 'bin', 'uvicorn')
  if (!fs.existsSync(uvicornPath)) {
    reportFatalStartupError(
      `Aucun venv trouvé à ${uvicornPath}. Vérifie BRICKDEPTH_DEPTH_SERVER_PATH et que 'pip install -r requirements.txt' a bien été fait dedans.`
    )
    return
  }

  pyProcess = spawn(uvicornPath, ['server:app', '--port', '8000'], { cwd: depthServerDir })

  pyProcess.stdout?.on('data', (data) => console.log(`[depth-server] ${data}`))
  pyProcess.stderr?.on('data', (data) => console.error(`[depth-server] ${data}`))
  pyProcess.on('error', (err) => reportFatalStartupError(`Échec du lancement du serveur Python : ${err.message}`))
  pyProcess.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`[depth-server] exited unexpectedly with code ${code} (signal: ${signal})`)
    }
  })
}

function reportFatalStartupError(message: string) {
  console.error(`[depth-server] ${message}`)
  dialog.showErrorBox('BrickDepth - serveur de depth indisponible', message)
}

export async function waitForServer(): Promise<void> {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://localhost:8000/health')
      if (res.ok) {
        return
      }
    } catch {
      // filler
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('depth server did not start in time')
}


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

app.whenReady().then(async () => {
  startDepthServer()
  await waitForServer()
})

app.on('before-quit', () => {
  pyProcess?.kill()
})
