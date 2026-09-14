import { Resend } from 'resend'
import config from './config'

let _resend = null
function client() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function baseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')
}

export async function sendEmail({ to, subject, html }) {
  return client().emails.send({
    from: `${config.coupleNames} <${process.env.FROM_EMAIL || 'noreply@example.com'}>`,
    to,
    subject,
    html,
  })
}

// A single shared shell so both emails look like they came from the same site.
function shell({ eyebrow, heading, bodyHtml, ctaLabel, ctaHref }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f6f2ec;font-family:Georgia,'Times New Roman',serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2ec;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdfa;border:1px solid #e2d9cc">
        <tr><td style="padding:44px 44px 12px;text-align:center">
          <p style="margin:0 0 14px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#7d6852;font-family:Helvetica,Arial,sans-serif">${escHtml(eyebrow)}</p>
          <h1 style="margin:0;font-size:32px;font-weight:400;color:#3c332a;line-height:1.25">${escHtml(heading)}</h1>
          <p style="margin:18px auto 0;width:48px;border-top:1px solid #d8cbb8"></p>
        </td></tr>
        <tr><td style="padding:22px 44px 34px;color:#453c32;font-size:16px;line-height:1.7">
          ${bodyHtml}
          ${ctaHref ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0 8px"><tr><td align="center">
            <a href="${ctaHref}" style="display:inline-block;background:#3c332a;color:#fffdfa;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:.14em;text-transform:uppercase;padding:15px 34px;text-decoration:none">${escHtml(ctaLabel)}</a>
          </td></tr></table>
          <p style="margin:14px 0 0;text-align:center;font-size:13px;color:#7d6852;font-family:Helvetica,Arial,sans-serif">Or open <a href="${ctaHref}" style="color:#7a6144;word-break:break-all">${ctaHref}</a></p>` : ''}
        </td></tr>
        <tr><td style="background:#f2ece3;border-top:1px solid #e2d9cc;padding:18px 44px;text-align:center">
          <p style="margin:0;color:#7d6852;font-size:12px;font-family:Helvetica,Arial,sans-serif;letter-spacing:.06em">${escHtml(config.coupleNames)} &middot; ${escHtml(config.weddingDateLabel)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function saveTheDateEmail({ partyName, inviteCode }) {
  const url = inviteCode ? `${baseUrl()}/rsvp?code=${encodeURIComponent(inviteCode)}` : `${baseUrl()}/rsvp`
  return {
    subject: `Save the date — ${config.coupleNames}, ${config.weddingDateLabel}`,
    html: shell({
      eyebrow: 'Save the date',
      heading: config.coupleNames,
      bodyHtml: `
        <p style="margin:0 0 16px">Dear ${escHtml(partyName || 'friends')},</p>
        <p style="margin:0 0 16px">We're getting married on <strong>${escHtml(config.weddingDateLabel)}</strong> in ${escHtml(config.location)}, and we would love for you to be there.</p>
        <p style="margin:0 0 16px">Everything you need — the schedule, where to stay, and how to get there — is on our website. You can RSVP there whenever you're ready; we'll need to hear from you by <strong>${escHtml(config.rsvpDeadlineLabel)}</strong>.</p>
      `,
      ctaLabel: 'Visit our website',
      ctaHref: url,
    }),
  }
}

export function rsvpReminderEmail({ partyName, inviteCode, daysLeft }) {
  const url = inviteCode ? `${baseUrl()}/rsvp?code=${encodeURIComponent(inviteCode)}` : `${baseUrl()}/rsvp`
  return {
    subject: `A gentle nudge — RSVP by ${config.rsvpDeadlineLabel}`,
    html: shell({
      eyebrow: `${daysLeft} days left to reply`,
      heading: 'Will we see you there?',
      bodyHtml: `
        <p style="margin:0 0 16px">Dear ${escHtml(partyName || 'friends')},</p>
        <p style="margin:0 0 16px">We haven't heard back from you yet about ${escHtml(config.weddingDateLabel)} — and we'd really love to know either way.</p>
        <p style="margin:0 0 16px">It takes about a minute. We need final numbers for the caterer by <strong>${escHtml(config.rsvpDeadlineLabel)}</strong>.</p>
        <p style="margin:0 0 16px">If you already know you can't make it, saying so is genuinely helpful — no hard feelings at all.</p>
      `,
      ctaLabel: 'RSVP now',
      ctaHref: url,
    }),
  }
}
