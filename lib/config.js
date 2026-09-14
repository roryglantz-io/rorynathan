// ---------------------------------------------------------------------------
// EDIT THIS FILE.
//
// Everything a guest reads on the site comes from here. You should be able to
// stand up the whole website by changing values in this one file — no other
// file needs touching to get your names, dates, venues and links right.
// ---------------------------------------------------------------------------

const config = {
  // --- The couple -----------------------------------------------------------
  couple: {
    partnerOne: 'Alex',
    partnerTwo: 'Sam',
    // Shown in the browser tab and in emails.
    hashtag: '#AlexAndSam2027',
  },

  // --- The day --------------------------------------------------------------
  // ISO 8601 with a timezone offset. The countdown and the RSVP deadline logic
  // both read this, so get the offset right for your venue's timezone.
  weddingDate: '2027-06-12T16:00:00-04:00',
  // Human-readable versions, because "June 12, 2027" reads better than a parse.
  weddingDateLabel: 'Saturday, June 12th, 2027',
  weddingTimeLabel: '4:00 in the afternoon',
  location: 'Hudson Valley, New York',

  // Guests can no longer submit or change an RSVP after this moment.
  rsvpDeadline: '2027-05-01T23:59:00-04:00',
  rsvpDeadlineLabel: 'May 1st, 2027',

  // --- Our story ------------------------------------------------------------
  story: [
    {
      year: '2019',
      title: 'How we met',
      body: 'Replace this with the real version. A paragraph is plenty — guests are skimming on their phones between other things.',
    },
    {
      year: '2023',
      title: 'The proposal',
      body: 'Where it happened, who cried first, and whether the dog was involved.',
    },
    {
      year: '2027',
      title: 'The wedding',
      body: 'And now the part where you come celebrate with us.',
    },
  ],

  // --- Schedule of the day --------------------------------------------------
  schedule: [
    { time: '3:30 pm', title: 'Guests arrive', detail: 'Drinks on the lawn. Come early, say hello.' },
    { time: '4:00 pm', title: 'Ceremony', detail: 'In the garden, weather permitting. Bring sunglasses.' },
    { time: '4:45 pm', title: 'Cocktail hour', detail: 'Terrace. Photos happening nearby — feel free to wander.' },
    { time: '6:00 pm', title: 'Dinner', detail: 'Seated dinner in the barn.' },
    { time: '8:00 pm', title: 'Dancing', detail: 'Until they turn the lights on.' },
    { time: '11:00 pm', title: 'Last call', detail: 'Shuttles leave on the half hour.' },
  ],

  // --- Venues ---------------------------------------------------------------
  // `mapQuery` is what gets handed to Google Maps. A full address works best.
  venues: [
    {
      name: 'Ceremony & Reception',
      venue: 'The Old Stone Barn',
      address: '123 Orchard Lane, Rhinebeck, NY 12572',
      mapQuery: '123 Orchard Lane, Rhinebeck, NY 12572',
      note: 'Parking is on site and free. The lawn is grass — heels will sink.',
    },
  ],

  dressCode: {
    label: 'Garden formal',
    detail:
      'Suits and cocktail dresses. The ceremony is outdoors on grass, so consider block heels or flats. It cools off after sunset — bring a layer.',
  },

  // --- Travel & lodging -----------------------------------------------------
  travel: {
    intro:
      'Most guests fly into Albany (ALB, about an hour) or take the train up from Penn Station to Rhinecliff, which is a ten minute cab from the venue.',
    airports: [
      { name: 'Albany International (ALB)', detail: '~1 hour drive' },
      { name: 'Stewart International (SWF)', detail: '~1 hour drive' },
      { name: 'JFK / LaGuardia', detail: '~2 hours drive' },
    ],
    hotels: [
      {
        name: 'The Rhinebeck Inn',
        detail: 'Room block under "Alex & Sam" — rate held until May 1st.',
        url: 'https://example.com',
        distance: '10 min from the venue',
      },
      {
        name: 'Hudson Valley Lodge',
        detail: 'A bit cheaper, no block, but plenty of rooms.',
        url: 'https://example.com',
        distance: '20 min from the venue',
      },
    ],
    shuttle:
      'A shuttle runs from The Rhinebeck Inn to the venue at 3:00 pm, and back at 11:00 and 11:30 pm. No sign-up needed.',
  },

  // --- Registry -------------------------------------------------------------
  registry: {
    intro:
      'Your being there is genuinely the point. If you would like to give something anyway, here is where we are registered.',
    links: [
      { name: 'Zola', detail: 'Household things, mostly.', url: 'https://example.com' },
      { name: 'Honeymoon fund', detail: 'Toward two weeks in Japan.', url: 'https://example.com' },
    ],
  },

  // --- FAQ ------------------------------------------------------------------
  faq: [
    {
      q: 'Can I bring a plus one?',
      a: 'Your invitation says how many seats we have saved for you, and the RSVP form will let you fill in exactly that many names.',
    },
    {
      q: 'Are kids invited?',
      a: 'We love your kids. This one is adults only, so take the night off.',
    },
    {
      q: 'What if I have a dietary restriction?',
      a: 'There is a box for it on the RSVP form. Tell us anything — the kitchen is accommodating and we would rather know early.',
    },
    {
      q: 'Is there parking?',
      a: 'Yes, free and on site. You are welcome to leave a car overnight and collect it the next morning.',
    },
    {
      q: 'When should I RSVP by?',
      a: 'May 1st, 2027. The caterer needs final numbers and we are not in a position to argue with them.',
    },
  ],

  // --- Contact --------------------------------------------------------------
  contactEmail: 'hello@yourwedding.com',
}

// Derived values used across the site. Don't edit below this line.
config.coupleNames = `${config.couple.partnerOne} & ${config.couple.partnerTwo}`
config.weddingDateObj = new Date(config.weddingDate)
config.rsvpDeadlineObj = new Date(config.rsvpDeadline)

module.exports = config
