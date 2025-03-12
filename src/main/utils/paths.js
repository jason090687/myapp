import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { app } from 'electron'

// ESM path setup
const moduleURL = import.meta.url
const currentFilePath = fileURLToPath(moduleURL)
const moduleDir = dirname(currentFilePath)
const rootDir = dirname(dirname(dirname(moduleDir)))

export const paths = {
  root: rootDir,
  src: join(rootDir, 'src'),
  main: join(rootDir, 'src', 'main'),
  preload: join(rootDir, 'src', 'preload'),
  renderer: join(rootDir, 'src', 'renderer'),
  build: join(rootDir, 'build'),
  getUserData: () => app.getPath('userData')
}
