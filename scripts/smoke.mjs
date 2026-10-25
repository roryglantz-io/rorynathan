import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const port = process.env.SMOKE_PORT || '3107'
const baseUrl = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', port], {
  cwd: root,
  env: { ...process.env, SITE_PASSWORD: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let logs = ''
server.stdout.on('data', chunk => { logs += chunk })
server.stderr.on('data', chunk => { logs += chunk })

try {
  // Wait for this process, not an unrelated server already using the port.
  for (let attempt = 0; !logs.includes('Ready in'); attempt++) {
    assert(server.exitCode === null && attempt < 80, `Server did not start:\n${logs}`)
    await delay(250)
  }

  for (const path of ['/', '/details', '/registry', '/rsvp', '/unlock', '/admin']) {
    const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(10000) })
    assert.equal(response.status, 200, path)
    const html = await response.text()

    if (['/', '/details', '/registry', '/rsvp'].includes(path)) {
      assert(html.includes('<h1'), `${path}: missing main heading`)
      assert(html.includes('id="main-content"'), `${path}: missing skip target`)
      assert(!html.includes('hello@example.com'), `${path}: placeholder contact exposed`)
    }
    if (path === '/details') {
      const { default: config } = await import('../lib/config.js')
      if (config.faq.length) assert(html.includes('<details class="faq__item"'), 'FAQ disclosure missing')
    }
    console.log(`PASS ${path}: HTTP 200 and page assertions`)
  }
} finally {
  server.kill('SIGTERM')
}
