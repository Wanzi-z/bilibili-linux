"use strict"
require('./fix-build-loongarch')
const path = require('path')
process.env.USE_SYSTEM_APP_BUILDER = 'true'
process.env['PATH'] = `${path.resolve(__dirname, '../node_modules/app-builder-bin/linux/x64')}:${process.env['PATH']}`

const builder = require("electron-builder")
const { execSync, exec } = require('child_process')
const { homedir } = require('os')
const { fstat, existsSync, mkdirSync } = require('fs')
const Platform = builder.Platform

const home = homedir()
const file = path.resolve(home, './.cache/electron-builder/appimage/appimage-13.0.0/runtime-loong64')
if (!existsSync(file)) {
  const p = path.resolve(home, './.cache/electron-builder/appimage/appimage-13.0.0')
  mkdirSync(p, { recursive: true })
  execSync('wget https://github.com/electron-userland/electron-builder-binaries/releases/download/appimage-13.0.0/appimage-13.0.0.7z -O ~/.cache/electron-builder/appimage/appimage-13.0.0/appimage-13.0.0.7z', {
    stdio: 'inherit'
  })
  execSync('7z x appimage-13.0.0.7z -o. -aoa', {
    stdio: 'inherit',
    cwd: p
  })
  // https://github.com/electron-userland/electron-builder-binaries/releases/download/appimage-13.0.0/appimage-13.0.0.7z
  execSync('wget https://github.com/msojocs/type2-runtime-loongarch/releases/download/continuous/runtime-loong64 -O ~/.cache/electron-builder/appimage/appimage-13.0.0/runtime-loong64', {
    stdio: 'inherit'
  })
}

// Let's get that intellisense working
/**
* @type {import('electron-builder').Configuration}
* @see https://www.electron.build/configuration/configuration
*/
const options = {
  buildVersion: "1",
  directories: {
    "output": "tmp/build",
    "app": "app/app"
  },
  "asar": true,
  "files": [
    "**/*",
    {
      "from": "node_modules",
      "to": "node_modules"
    }
  ],
  "extraResources": [
    "extensions",
    "app/app-update.yml"
  ],
  "electronVersion": "22.3.27",
  "appId": "com.bilibili.app",
  "mac": {
    "target": [
      "dmg",
      "zip"
    ],
    "icon": "res/icons/bilibili.icns"
  },
  "win": {
    "target": [
      "nsis"
    ],
    "icon": "res/icons/bilibili.ico"
  },
  "nsis": {
    "oneClick": false,
    "installerIcon": "res/icons/bilibili.ico",
    "uninstallerIcon": "res/icons/bilibili.ico",
    "installerHeaderIcon": "res/icons/bilibili.ico",
    "allowToChangeInstallationDirectory": true
  },
  "linux": {
    target: [
      {
        "target": "AppImage",
        "arch": [
          "loong64",
        ]
      },
      {
        "target": "rpm",
        "arch": [
          "loong64",
          "loongarch64",
        ]
      },
      {
        "target": "deb",
        "arch": [
          "loong64",
          "loongarch64",
        ]
      },
    ],
    "maintainer": "msojocs <jiyecafe@gmail.com> (https://www.jysafe.cn)",
    "icon": "res/icons",
    "synopsis": "BiliBili client for Linux.",
    "description": "BiliBili client for Linux with roaming.",
    "category": "AudioVideo"
  },
  "electronDownload": {
    "mirror": "https://github.com/msojocs/electron-loongarch/releases/download/",
    "customDir": "v22.3.27"
  }
};

// Promise is returned
(async () => {
  
  await builder.build({
    targets: Platform.LINUX.createTarget(),
    config: options
  })
  .then((result) => {
    console.log(JSON.stringify(result))
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  
})()