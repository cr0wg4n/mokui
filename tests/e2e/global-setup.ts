import { execSync } from 'node:child_process'
import { join } from 'node:path'

/** Build the package and both example apps once, before any e2e file runs. */
export default function setup() {
  const root = process.cwd()
  execSync('nub run build', { cwd: root, stdio: 'ignore' })
  for (const app of ['vue', 'react']) execSync('nub run build', { cwd: join(root, 'examples', app), stdio: 'ignore' })
}
