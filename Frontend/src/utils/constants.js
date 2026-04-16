export const CATEGORIES = [
  { value: 'meditation', label: 'Meditation' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'astrology', label: 'Astrology' },
  { value: 'healing', label: 'Healing' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
];

export const SESSION_STATUSES = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const BOOKING_STATUSES = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

export const ROLES = {
  USER: 'user',
  CREATOR: 'creator',
};

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth/google/callback`;
const GITHUB_REDIRECT_URI = `${window.location.origin}/auth/github/callback`;

export const GOOGLE_AUTH_URL =
  `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent('openid email profile')}` +
  `&access_type=offline` +
  `&prompt=consent`;

export const GITHUB_AUTH_URL =
  `https://github.com/login/oauth/authorize?` +
  `client_id=${GITHUB_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}` +
  `&scope=${encodeURIComponent('read:user user:email')}`;

export const CATEGORY_COLORS = {
  meditation: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  yoga: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  astrology: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  healing: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30' },
  counseling: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  workshop: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  other: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
};
