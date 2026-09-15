// ---------------------------------------------------------------------------
// EDIT THIS FILE.
//
// Everything a guest reads on the site comes from here. You should be able to
// stand up the whole website by changing values in this one file — no other
// file needs touching.
// ---------------------------------------------------------------------------

const config = {
  // --- The couple -----------------------------------------------------------
  couple: {
    partnerOne: 'Rory',
    partnerTwo: 'Nathan',
    // Optional. Shown in the footer. Set to '' to hide it.
    hashtag: '',
  },

  // --- The day --------------------------------------------------------------
  // Date and venue aren't settled yet. While `dateTbd` is true the site says
  // so plainly and hides the countdown; set it to false and fill in the two
  // fields below and the countdown appears on its own.
  dateTbd: true,
  locationTbd: true,

  // Used only once dateTbd is false. ISO 8601 with a timezone offset — get the
  // offset right for wherever you end up, the countdown reads it directly.
  weddingDate: '2027-06-12T16:00:00-04:00',
  weddingDateLabel: 'Date to be announced',
  weddingTimeLabel: '',
  location: 'Location to be announced',

  // Set to null while the date is open. Once you have a date, put the reply
  // deadline here and the RSVP form starts enforcing it.
  rsvpDeadline: null,
  rsvpDeadlineLabel: '',

  // --- Photos ---------------------------------------------------------------
  // The scrolling strip on the homepage. Upload files to wedding/public/photos/
  // and list them here; leave the array empty and the strip hides itself.
  // `alt` describes the picture for screen readers and for anyone whose images
  // fail to load — say what's happening, not "photo of us".
  photos: [
    // { src: '/photos/engagement.jpg', alt: 'Rory and Nathan on the day they got engaged' },
  ],

  // --- Schedule of the day --------------------------------------------------
  // Shown on /details. Empty the array to hide that section entirely.
  schedule: [
    { time: 'Afternoon', title: 'Ceremony', detail: 'Time to be confirmed.' },
    { time: 'After', title: 'Drinks', detail: '' },
    { time: 'Evening', title: 'Dinner', detail: '' },
    { time: 'Later', title: 'Dancing', detail: 'Until they turn the lights on.' },
  ],

  // --- Venues ---------------------------------------------------------------
  // `mapQuery` is handed to Google Maps; a full address works best. Leave
  // `address` empty and no map link is shown.
  venues: [
    {
      name: 'Ceremony & Reception',
      venue: 'To be confirmed',
      address: '',
      mapQuery: '',
      note: "We're still deciding. We'll update this page as soon as it's settled.",
    },
  ],

  dressCode: {
    label: 'To be confirmed',
    detail: '',
  },

  // --- Travel & lodging -----------------------------------------------------
  // Any empty section is hidden automatically, so this can stay sparse until
  // you know more.
  travel: {
    intro: "Once we've settled on a place we'll put travel and hotel details here.",
    airports: [],
    hotels: [],
    shuttle: '',
  },

  // --- Registry -------------------------------------------------------------
  // With no links, /registry shows the intro on its own.
  registry: {
    intro:
      'Your being there is genuinely the point. If you would like to give something anyway, we will put the details here closer to the time.',
    links: [],
  },

  // --- FAQ ------------------------------------------------------------------
  faq: [
    {
      q: 'When is it?',
      a: "We haven't set a date yet. This page is where you'll hear first.",
    },
    {
      q: 'Where is it?',
      a: "Also being worked out. As soon as we know, it'll be here.",
    },
    {
      q: 'Can I bring a plus one?',
      a: 'Your invitation will say how many seats we have saved for you, and the RSVP form will let you fill in exactly that many names.',
    },
    {
      q: 'What if I have a dietary restriction?',
      a: "There's a box for it on the RSVP form. Tell us anything — we'd rather know early.",
    },
  ],

  // --- Contact --------------------------------------------------------------
  contactEmail: 'hello@example.com',
}

// Derived values used across the site. Don't edit below this line.
config.coupleNames = `${config.couple.partnerOne} & ${config.couple.partnerTwo}`
config.weddingDateObj = config.dateTbd ? null : new Date(config.weddingDate)
config.rsvpDeadlineObj = config.rsvpDeadline ? new Date(config.rsvpDeadline) : null

module.exports = config
