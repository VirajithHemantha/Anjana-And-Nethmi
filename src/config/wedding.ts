// Single source of truth for the invitation details.
export const WEDDING = {
  groom: {
    name: 'Anjana',
    surname: 'Wickramasinghe',
    father: 'Mr. Saman Lalantha Wickramasinghe',
    mother: 'Mrs. Nanda Malani Wickramasinghe',
  },
  bride: {
    name: 'Nethmi',
    father: 'Mr. Palliyage Susantha Baresthu',
    mother: 'Mrs. A. A. Sameena',
  },
  date: new Date('2026-12-06T09:00:00+05:30'),
  dateLong: 'Sunday, December 6',
  dateYearWords: 'The Year Two Thousand Twenty Six',
  dateShort: '06 . 12 . 2026',
  dateDisplay: 'December 6, 2026',
  time: '09:00 AM – 04:00 PM',
  venue: {
    name: 'Hotel River Park',
    city: 'Hikkaduwa',
    mapUrl:
      'https://maps.google.com/maps/place//data=!4m2!3m1!1s0x3ae1778afb2222ed:0x9e7a4e1c63d7908a?entry=s&sa=X&ved=2ahUKEwi-4My61NqXAxU84zgGHddsNTYQ4kB6BAgcEAA&hl=en',
  },
} as const;

export const COUPLE_NAMES = `${WEDDING.groom.name} & ${WEDDING.bride.name}`;

export const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined;
