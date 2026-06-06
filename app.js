const tg = window.Telegram?.WebApp;
const botUsername = 'NeuralStyleTransferBot';
const campaignLinks = document.getElementById('campaignLinks');
const openBotBtn = document.getElementById('openBotBtn');
const sendPhotoBtn = document.getElementById('sendPhotoBtn');
const dashboardSendPhotoBtn = document.getElementById('dashboardSendPhotoBtn');
const userChip = document.getElementById('userChip');
const topTitle = document.getElementById('topTitle');
const freeCount = document.getElementById('freeCount');
const paidCount = document.getElementById('paidCount');
const totalCount = document.getElementById('totalCount');
const profileStatus = document.getElementById('profileStatus');
const apiBase = 'http://127.0.0.1:8787';

const tabTitles = {
  dashboard: 'Главная',
  styles: 'Стили',
  pricing: 'Пакеты',
  campaigns: 'Ссылки',
  reviews: 'Отзывы',
};

if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0d1018');
  tg.setBackgroundColor('#0d1018');
}

const user = tg?.initDataUnsafe?.user;
if (user) {
  const label = user.username ? `@${user.username}` : (user.first_name || 'Пользователь');
  userChip.textContent = label;
}

async function loadProfile() {
  if (!user?.id) {
    profileStatus.textContent = 'Нет Telegram user';
    profileStatus.classList.add('error');
    return;
  }
  try {
    const res = await fetch(`${apiBase}/api/profile?user_id=${user.id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.user) return;
    freeCount.textContent = String(data.user.free_uses ?? 0);
    paidCount.textContent = String(data.user.paid_uses ?? 0);
    totalCount.textContent = String(data.user.total_uses ?? 0);
    profileStatus.textContent = 'Профиль подключен';
    profileStatus.classList.remove('error');
    profileStatus.classList.add('ok');
  } catch (err) {
    console.error('profile load failed', err);
    profileStatus.textContent = 'API недоступен';
    profileStatus.classList.remove('ok');
    profileStatus.classList.add('error');
  }
}

loadProfile();

const tabs = document.querySelectorAll('[data-tab]');
const mobileTabs = document.querySelectorAll('.mobile-nav-item[data-tab]');
const panes = document.querySelectorAll('.tab');

function activateTab(name) {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === name));
  mobileTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === name));
  panes.forEach((pane) => pane.classList.toggle('active', pane.id === `tab-${name}`));
  topTitle.textContent = tabTitles[name] || name;
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

mobileTabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

document.querySelectorAll('[data-open-tab]').forEach((button) => {
  button.addEventListener('click', () => activateTab(button.dataset.openTab));
});

function openBotCommand(command) {
  const url = `https://t.me/${botUsername}?start=src_webapp`;
  if (tg) {
    tg.openTelegramLink(url);
  } else {
    window.location.href = url;
  }
}

function promptSendPhoto() {
  const text = 'Открой чат с ботом и отправь фото. Сразу после этого выбери режим.';
  if (tg?.showPopup) {
    tg.showPopup({
      title: 'Отправь фото',
      message: text,
      buttons: [
        { type: 'default', text: 'Открыть бота', id: 'open-bot' },
        { type: 'close' }
      ]
    }, (id) => {
      if (id === 'open-bot') openBotCommand('start');
    });
  } else {
    alert(text);
  }
}

openBotBtn?.addEventListener('click', () => openBotCommand('start'));
sendPhotoBtn?.addEventListener('click', promptSendPhoto);
dashboardSendPhotoBtn?.addEventListener('click', promptSendPhoto);

document.querySelectorAll('[data-open-bot-command]').forEach((button) => {
  button.addEventListener('click', () => openBotCommand(button.dataset.openBotCommand));
});

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
  link.innerHTML = `<strong>${label}</strong><span>src_${source}</span>`;
  link.target = '_blank';
  link.rel = 'noreferrer';
  campaignLinks?.appendChild(link);
}
