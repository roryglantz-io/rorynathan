const fs = require('node:fs')
const path = require('node:path')
const { scrapeRegistry } = require('../lib/registry')

const output = path.join(__dirname, '..', 'lib', 'registry-catalog.json')

scrapeRegistry()
  .then(catalog => {
    fs.writeFileSync(output, `${JSON.stringify(catalog, null, 2)}\n`)
    console.log(`Registry synced: ${catalog.products.length} products, version ${catalog.version}`)
  })
  .catch(error => {
    console.error(`Registry sync failed: ${error.message}`)
    process.exitCode = 1
  })
