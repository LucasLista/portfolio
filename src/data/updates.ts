// Updates shown as a small timeline on the home page.
//
// HOW TO ADD AN UPDATE:
//   Copy one { ... } block below and fill in the two fields.
//   - date: any readable date, e.g. "Aug 8 2025". Used for display and ordering.
//   - body: the text of the update. To add a link, wrap the clickable words
//           in an <a> tag, like this:
//             'Some text <a href="https://example.com">clickable words</a> more text.'
//   Order does not matter: the newest date is always shown first automatically.
//
// Note (writing style): no em-dashes. Use commas, colons, or periods instead.

export type Update = {
  date: string
  body: string
}

export const UPDATES: Update[] = [
  {
    date: "Mar 27 2026",
    body: 'Just attended the Incommodities Case Crunch 2026, where I experimented with the foundation time-series model Chronos-2 on a simulated market for forecasting electricity prices. This led to a catastrophic failure one round, <a href="https://www.linkedin.com/posts/lucasrgpedersen_machinelearning-timeseries-energymarkets-ugcPost-7450525538059915264-7dgw/" target="_blank" rel="noopener">see the LinkedIn post for more!</a>',
  },
  {
    date: "Oct 15 2025",
    body: 'I\'m going to Japan on exchange and stepping down as R&amp;D Lead at Manifold, <a href="https://www.linkedin.com/posts/lucasrgpedersen_this-month-im-officially-stepping-down-share-7384521930286125059-sRnM/" target="_blank" rel="noopener">exciting things ahead</a>!',
  },
  {
    date: "Aug 8 2025",
    body: "I just won DMiAI 2025 with Benjamin Banks, Oscar Svendsen, Elias Lunøe, Jonathan Tybirk and Viktor Larsen! A lot of fun, will be attending next year.",
  },
]
