// ─────────────────────────────────────────────────────────────
//  EDIT ME — contact details & links
//  Leave a link as '' (empty) until the page exists; the website
//  will show it as "coming soon" instead of a broken link.
// ─────────────────────────────────────────────────────────────
export const site = {
  name: 'ALAB',
  fullName: 'ALAB Eco Briquettes',
  tagline: 'Waste to Warmth',
  address: 'UC 4-A1, Brgy. Citrus, City of San Jose del Monte, Bulacan',
  addressShort: 'UC 4-A1, Brgy. Citrus, CSJDM, Bulacan',
  mapQuery: 'Citrus, San Jose del Monte, Bulacan',

  // Hours from the business plan: open 8:00 AM – 5:00 PM, closed every Friday.
  hours: [
    { days: 'Saturday – Thursday', time: '8:00 AM – 5:00 PM' },
    { days: 'Friday', time: 'Closed (rest day)' },
  ],

  email: '', // e.g. 'alabcharcoal@gmail.com'
  phone: '', // e.g. '0912 345 6789'

  // Where customers can order
  channels: [
    { name: 'TikTok', url: 'https://www.tiktok.com/@alab_charcoal?_r=1&_t=ZS-9B7BnmYd4YU', note: 'Order at @alab_charcoal' },
    { name: 'Facebook', url: 'https://www.facebook.com/share/1CfPM3gnGi/', note: 'Order & message us' },
  ],
};

export const CUSTOMER_TYPES = [
  'Household',
  'BBQ / ihaw-ihaw stall',
  'Lechon manok',
  'Restaurant / samgyupsalan',
  'Sari-sari store',
  'Other',
];
export const PACK_SIZES = ['1 kg', '3 kg', '5 kg'];
