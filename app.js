const tg = window.Telegram?.WebApp;
const botUsername = 'NeuralStyleTransferBot';
const campaignLinks = document.getElementById('campaignLinks');
const openBotBtn = document.getElementById('openBotBtn');
const focusMiniAppBtn = document.getElementById('focusMiniAppBtn');
const dashboardSendPhotoBtn = document.getElementById('dashboardSendPhotoBtn');
const userChip = document.getElementById('userChip');
const topTitle = document.getElementById('topTitle');
const freeCount = document.getElementById('freeCount');
const paidCount = document.getElementById('paidCount');
const totalCount = document.getElementById('totalCount');
const profileStatus = document.getElementById('profileStatus');
const imageInput = document.getElementById('imageInput');
const modeSelect = document.getElementById('modeSelect');
const styleSelect = document.getElementById('styleSelect');
const miniappGenerateBtn = document.getElementById('miniappGenerateBtn');
const miniappResult = document.getElementById('miniappResult');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewCard = document.getElementById('imagePreviewCard');
const miniappProgress = document.getElementById('miniappProgress');
const miniappProgressText = document.getElementById('miniappProgressText');
const apiBase = document.querySelector('meta[name="api-base"]')?.content || window.location.origin;

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

function focusMiniAppFlow() {
  activateTab('dashboard');
  imageInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  imageInput?.click();
}

openBotBtn?.addEventListener('click', () => openBotCommand('start'));
focusMiniAppBtn?.addEventListener('click', focusMiniAppFlow);
dashboardSendPhotoBtn?.addEventListener('click', focusMiniAppFlow);

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

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function generateInsideMiniApp() {
  if (!user?.id) {
    miniappResult.innerHTML = '<div class="miniapp-result-card">Нет Telegram user</div>';
    return;
  }
  const file = imageInput?.files?.[0];
  if (!file) {
    miniappResult.innerHTML = '<div class="miniapp-result-card">Сначала выбери фото.</div>';
    return;
  }

  miniappGenerateBtn.disabled = true;
  miniappGenerateBtn.textContent = 'Обработка...';
  miniappResult.innerHTML = '';
  miniappProgress.classList.remove('hidden');
  miniappProgressText.textContent = 'Запускаю стилизацию...';

  try {
    const imageBase64 = await fileToBase64(file);
    miniappProgressText.textContent = 'Отправляю фото и параметры в API...';
    const res = await fetch(`${apiBase}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        image_base64: imageBase64,
        mode: Number(modeSelect.value),
        style_id: Number(styleSelect.value),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.job_id) throw new Error(data.error || `HTTP ${res.status}`);

    miniappProgressText.textContent = 'Получаю готовый результат...';
    const resultRes = await fetch(`${apiBase}/api/result?job_id=${data.job_id}`);
    const resultData = await resultRes.json();
    if (!resultRes.ok) throw new Error(resultData.error || `HTTP ${resultRes.status}`);

    miniappResult.innerHTML = `
      <div class="miniapp-result-card">
        <img src="data:image/jpeg;base64,${resultData.image_base64}" alt="Result">
        <p>${resultData.caption}</p>
      </div>
    `;
    loadProfile();
  } catch (err) {
    console.error('mini app generation failed', err);
    miniappResult.innerHTML = `<div class="miniapp-result-card error">Ошибка: ${err.message}</div>`;
  } finally {
    miniappProgress.classList.add('hidden');
    miniappGenerateBtn.disabled = false;
    miniappGenerateBtn.textContent = 'Стилизовать в Mini App';
  }
}

miniappGenerateBtn?.addEventListener('click', generateInsideMiniApp);

imageInput?.addEventListener('change', () => {
  const file = imageInput.files?.[0];
  if (!file) {
    imagePreviewCard.classList.add('hidden');
    return;
  }
  const url = URL.createObjectURL(file);
  imagePreview.src = url;
  imagePreviewCard.classList.remove('hidden');
});
