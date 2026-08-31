import { glob } from 'glob'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runTests() {
  const testFiles = await glob('**/src/test/*.test.ts', {
    ignore: 'node_modules/**',
  })

  if (testFiles.length === 0) {
    console.log('No test files found')
    return
  }

  console.log(`Found ${testFiles.length} test file(s)`)

  for (const file of testFiles) {
    console.log(`\nRunning ${file}...`)
    await new Promise((resolve, reject) => {
      const proc = spawn('node', ['--loader', 'ts-node/esm', file], {
        stdio: 'inherit',
        cwd: __dirname,
      })
      proc.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Test failed: ${file}`))
        else resolve(undefined)
      })
    })
  }
}

runTests().catch((err) => {
  console.error(err)
  process.exit(1)
})
