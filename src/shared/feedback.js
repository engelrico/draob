// Feedback links shown in the About tab. The extension itself sends nothing: each link opens the user's
// mail program or GitHub when clicked.
export const FEEDBACK_EMAIL = 'draob@engelrico.de';
export const ISSUES_URL = 'https://github.com/engelrico/draob/issues/new/choose';
// Chrome Web Store review page; leave empty to hide the link (set it once the store id is known).
export const REVIEW_URL = '';

const UNKNOWN = 'unbekannt';

/** Browser and system for the feedback draft, from the standard user agent data. Nothing personal. */
export function describeEnvironment(nav = globalThis.navigator) {
  if (!nav) return { browser: UNKNOWN, os: UNKNOWN };
  const ua = nav.userAgent ?? '';

  const brands = nav.userAgentData?.brands ?? [];
  const brand =
    brands.find((b) => b.brand === 'Google Chrome') ??
    brands.find((b) => b.brand === 'Microsoft Edge') ??
    brands.find((b) => b.brand === 'Chromium');
  let browser = brand ? `${brand.brand.replace('Google ', '')} ${brand.version}` : UNKNOWN;
  if (browser === UNKNOWN) {
    // Edge's user agent contains "Chrome/" too, so look for Edge first.
    const edge = /Edg\/(\d+)/.exec(ua);
    const chrome = /Chrome\/(\d+)/.exec(ua);
    if (edge) browser = `Edge ${edge[1]}`;
    else if (chrome) browser = `Chrome ${chrome[1]}`;
  }

  let os = nav.userAgentData?.platform || UNKNOWN;
  if (os === UNKNOWN) {
    if (/Windows/.test(ua)) os = 'Windows';
    else if (/Mac OS X/.test(ua)) os = 'macOS';
    else if (/CrOS/.test(ua)) os = 'ChromeOS';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/Linux/.test(ua)) os = 'Linux';
  }
  return { browser, os };
}

function feedbackDraft({ version, env }) {
  const v = version || UNKNOWN;
  const lines = [
    'Hallo,',
    '',
    'Was ist passiert bzw. welche Idee hast du?',
    '',
    '',
    'Was hattest du erwartet?',
    '',
    '',
    '---',
    `Version: ${v}`,
    `Browser: ${env?.browser ?? UNKNOWN}`,
    `System: ${env?.os ?? UNKNOWN}`,
    '',
    'Bitte keine Passwörter, Board-Links oder vertraulichen Screenshots mitschicken.',
  ];
  return { subject: `draob Feedback (v${v})`, lines };
}

/** mailto: link with a prepared subject and text. The user sees and can edit the draft before sending. */
export function feedbackMailto({ version, env }) {
  const { subject, lines } = feedbackDraft({ version, env });
  const body = lines.join('\r\n');
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Same draft as a Gmail compose link, for people without a mail program registered in the browser. */
export function feedbackGmail({ version, env }) {
  const { subject, lines } = feedbackDraft({ version, env });
  const query = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: FEEDBACK_EMAIL,
    su: subject,
    body: lines.join('\n'),
  });
  return `https://mail.google.com/mail/?${query}`;
}
