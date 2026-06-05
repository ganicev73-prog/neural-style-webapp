const tg = window.Telegram?.WebApp;
const botUsername = 'NeuralStyleTransferBot';
const campaignLinks = document.getElementById('campaignLinks');
const openTelegramBtn = document.getElementById('openTelegramBtn');

if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#10131f');
  tg.setBackgroundColor('#10131f');
}

const sources = [
  ['webapp', 'Web App'],
  ['tiktok', 'TikTok'],
  ['reels', 'Reels'],
  ['telegram', 'Telegram'],
  ['ads', 'Ads'],
];

for (const [source, label] of sources) {
  const link = document.createElement('a');
  link.href = `https://t.me/${botUsername}?start=src_${source}`;
  link.textContent = `${label}: src_${source}`;
  link.target = '_blank';
  link.rel = 'noreferrer';
  campaignLinks?.appendChild(link);
}

openTelegramBtn?.addEventListener('click', () => {
  window.location.href = `https://t.me/${botUsername}?start=src_webapp`;
});
