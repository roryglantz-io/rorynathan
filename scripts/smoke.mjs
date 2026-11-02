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

const publicRoutes = ['/', '/details', '/registry']
const registryUrl = 'https://www.bloomingdales.com/registry/Rory-Glantz-Nathan-Pedowitz/1918053'

function textContent(html) {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x27;|&#39;|&apos;|’/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function pageLinks(html) {
  return Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi), ([, attributes, content]) => ({
    href: attributes.match(/\bhref=(["'])(.*?)\1/i)?.[2],
    attributes,
    text: textContent(content),
  })).filter(link => link.href)
}
try {
  // Wait for this process, not an unrelated server already using the port.
  for (let attempt = 0; !logs.includes('Ready in'); attempt++) {
    assert(server.exitCode === null && attempt < 80, `Server did not start:\n${logs}`)
    await delay(250)
  }

  for (const path of ['/', '/details', '/registry', '/rsvp', '/unlock', '/admin']) {
    const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(10000) })
    assert.equal(response.status, 200, path)
    assert(response.headers.get('x-robots-tag')?.split(/,\s*/).includes('noindex'), `${path}: indexing header missing`)
    const html = await response.text()
    assert(/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html), `${path}: noindex metadata missing`)

    if ([...publicRoutes, '/rsvp'].includes(path)) {
      assert(/<h1\b/i.test(html), `${path}: missing main heading`)
      assert(/<main\b/i.test(html), `${path}: missing main content landmark`)
    }
    if (publicRoutes.includes(path)) {
      const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1]
      assert(body, `${path}: missing page body`)
      const text = textContent(body)
      assert(text.includes('June 6, 2027'), `${path}: confirmed date missing`)
      assert(text.includes('Penn Valley, PA'), `${path}: confirmed location missing`)
      assert(!/\b(?:to be announced|to be confirmed|TBD)\b/i.test(text), `${path}: placeholder details exposed`)
      assert(!/\b(?:schedule|ceremony|reception|dress code|shuttle|hotels|airports)\b/i.test(text), `${path}: unconfirmed event or travel details exposed`)
      assert(!pageLinks(body).some(link => new URL(link.href, baseUrl).pathname.replace(/\/$/, '') === '/rsvp'), `${path}: public RSVP link exposed`)
    }
    if (path === '/registry') {
      const link = pageLinks(html).find(item => item.href === registryUrl)
      assert(link, 'Registry: confirmed Bloomingdale’s link missing')
      assert(/Bloomingdale/i.test(link.text), 'Registry: link needs a descriptive accessible name')
      if (/\btarget=["']_blank["']/i.test(link.attributes)) {
        const rel = link.attributes.match(/\brel=(["'])(.*?)\1/i)?.[2].split(/\s+/) || []
        assert(rel.includes('noopener') && rel.includes('noreferrer'), 'Registry: new-tab link needs safe rel attributes')
      }
      assert(!/<iframe\b/i.test(html), 'Registry: unsupported embedded registry exposed')
    }
    console.log(`PASS ${path}: HTTP 200 and page assertions`)
  }
  const imageResponse = await fetch(`${baseUrl}/photos/engagement-4538.webp`)
  assert.equal(imageResponse.status, 200, 'Engagement photo missing')
  assert(imageResponse.headers.get('x-robots-tag')?.includes('noimageindex'), 'Photo indexing directive missing')
  const missingResponse = await fetch(`${baseUrl}/not-a-wedding-page`)
  assert.equal(missingResponse.status, 404)
  assert(missingResponse.headers.get('x-robots-tag')?.includes('noindex'), '404 indexing directive missing')
} finally {
  server.kill('SIGTERM')
}
