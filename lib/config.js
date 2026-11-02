// Shared names, dates, location, registry, and homepage photographs.

const config = {
  // --- The couple -----------------------------------------------------------
  couple: {
    partnerOne: 'Rory',
    partnerTwo: 'Nathan',
    // Optional. Shown in the footer. Set to '' to hide it.
    hashtag: '',
  },

  // --- The day --------------------------------------------------------------
  // The date is confirmed; the ceremony time is still unset. Local midnight
  // represents the calendar date, not a ceremony start time.
  dateTbd: false,
  locationTbd: false,

  weddingDate: '2027-06-06T00:00:00-04:00',
  weddingDateLabel: 'June 6, 2027',
  place: { city: 'Penn Valley', state: 'Pennsylvania', abbreviation: 'PA' },

  // Leave null until the reply deadline is confirmed.
  rsvpDeadline: null,
  rsvpDeadlineLabel: '',

  photos: {
    proposal: { src: '/photos/engagement-4538.webp', alt: 'Nathan proposing to Rory on the deck overlooking the sea' },
    portrait: { src: '/photos/engagement-4667.webp', alt: 'Rory and Nathan smiling together after their engagement' },
    together: { src: '/photos/engagement-4620.webp', alt: 'Rory and Nathan together at sunset' },
    wide: { src: '/photos/engagement-4485.webp', alt: 'Rory and Nathan on the seaside deck beneath a sunset sky' },
    laughing: { src: '/photos/engagement-4695.webp', alt: 'Rory and Nathan laughing together by the ocean' },
  },

  // --- Registry -------------------------------------------------------------
  registry: {
    intro:
      'Celebrating with you is the best gift. If you would like to give a gift, our registry is below.',
    links: [
      {
        name: 'Bloomingdale’s',
        url: 'https://www.bloomingdales.com/registry/Rory-Glantz-Nathan-Pedowitz/1918053',
      },
    ],
  },

  // --- Contact --------------------------------------------------------------
  contactEmail: 'hello@example.com',
}

// Derived values used across the site. Don't edit below this line.
config.coupleNames = `${config.couple.partnerOne} & ${config.couple.partnerTwo}`
config.location = `${config.place.city}, ${config.place.abbreviation}`
config.weddingDateObj = config.dateTbd ? null : new Date(config.weddingDate)
config.rsvpDeadlineObj = config.rsvpDeadline ? new Date(config.rsvpDeadline) : null

module.exports = config
