export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

export function test(name: string, fn: () => void | Promise<void>) {
  const wrappedFn = async () => {
    try {
      await fn()
      results.push({ name, passed: true })
    } catch (error) {
      results.push({ name, passed: false, error: String(error) })
    }
  }
  return wrappedFn()
}

export async function summarize() {
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const total = results.length

  console.log('\n' + '='.repeat(50))
  console.log(`Test Results: ${passed}/${total} passed`)
  console.log('='.repeat(50))

  if (failed > 0) {
    console.log('\nFailed tests:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ✗ ${r.name}`)
        console.log(`    ${r.error}`)
      })
    process.exit(1)
  } else {
    console.log('\n✓ All tests passed!')
  }
}
