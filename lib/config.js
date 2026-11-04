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
  place: { city: 'Philadelphia', state: 'Pennsylvania', abbreviation: 'PA' },

  // Leave null until the reply deadline is confirmed.
  rsvpDeadline: null,
  rsvpDeadlineLabel: '',

  photos: {
    proposal: { src: '/photos/invitation-proposal.webp', alt: 'Nathan proposing to Rory on the seaside deck at sunset' },
    portrait: { src: '/photos/editorial-portrait-4850.webp', alt: 'Rory smiling up at Nathan in the sunset light' },
    together: { src: '/photos/editorial-together.webp', alt: 'Rory and Nathan standing together on the seaside deck' },
    sunset: { src: '/photos/editorial-sunset.webp', alt: 'Rory and Nathan facing each other as the sun sets over the sea' },
  },

  // --- Registry -------------------------------------------------------------
  registry: {
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
