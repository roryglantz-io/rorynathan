// Shared by lib/db.js (the app) and the CommonJS scripts, so both connect the
// same way. See lib/db.js for why each option is set.
function connectionOptions(url) {
  const local = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)
  return {
    ssl: local ? false : 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  }
}
module.exports = { connectionOptions }
