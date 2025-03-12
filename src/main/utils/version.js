import fs from 'fs'
import path from 'path'

export const getAppVersion = () => {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    )
    return packageJson.version || '1.0.0'
  } catch (error) {
    console.error('Failed to read package.json version:', error)
    return '1.0.0'
  }
}

export const getGitCommit = () => {
  try {
    const execSync = require('child_process').execSync
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  } catch (error) {
    console.error('Failed to get git commit:', error)
    return null
  }
}
