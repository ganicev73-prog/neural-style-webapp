const tg = window.Telegram?.WebApp;
const botUsername = 'NeuralStyleTransferBot';
const campaignLinks = document.getElementById('campaignLinks');
const showMiniAppInfoBtn = document.getElementById('showMiniAppInfoBtn');
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
const customStyleInput = document.getElementById('customStyleInput');
const customStyleBox = document.getElementById('customStyleBox');
const miniappGenerateBtn = document.getElementById('miniappGenerateBtn');
const miniappResult = document.getElementById('miniappResult');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewCard = document.getElementById('imagePreviewCard');
const customStylePreview = document.getElementById('customStylePreview');
const customStylePreviewCard = document.getElementById('customStylePreviewCard');
const miniappProgress = document.getElementById('miniappProgress');
const miniappProgressText = document.getElementById('miniappProgressText');
const showCustomStyleInfoBtn = document.getElementById('showCustomStyleInfoBtn');
const selectedPackageBadge = document.getElementById('selectedPackageBadge');
const selectedPackageText = document.getElementById('selectedPackageText');
const useSelectedPackageBtn = document.getElementById('useSelectedPackageBtn');
const clearSelectedPackageBtn = document.getElementById('clearSelectedPackageBtn');
const apiBase = document.querySelector('meta[name="api-base"]')?.content || window.location.origin;

let selectedPackage = null;

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

function focusMiniAppFlow() {
  activateTab('dashboard');
  imageInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  imageInput?.click();
}

focusMiniAppBtn?.addEventListener('click', focusMiniAppFlow);
dashboardSendPhotoBtn?.addEventListener('click', focusMiniAppFlow);

showMiniAppInfoBtn?.addEventListener('click', () => {
  miniappResult.innerHTML = '<div class="miniapp-result-card">Сейчас внутри Mini App уже работает генерация по фото. Следом можно будет добавить custom style и встроенную покупку пакетов, не выходя в чат.</div>';
  activateTab('dashboard');
});

showCustomStyleInfoBtn?.addEventListener('click', () => {
  miniappResult.innerHTML = '<div class="miniapp-result-card">Custom style будет следующим шагом для Mini App: отдельная style-картинка, персональная обработка и результат внутри приложения.</div>';
  activateTab('dashboard');
});

document.querySelectorAll('[data-package]').forEach((button) => {
  button.addEventListener('click', () => {
    const count = button.dataset.package;
    selectedPackage = count;
    document.querySelectorAll('[data-package-card]').forEach((card) => {
      card.classList.toggle('selected', card.dataset.packageCard === count);
    });
    selectedPackageBadge.textContent = `${count} стилизаций`;
    selectedPackageText.textContent = `Пакет на ${count} стилизаций выбран как основной сценарий внутри Mini App. Пока покупка ещё не встроена, но можно продолжать генерацию на текущем балансе.`;
    miniappResult.innerHTML = `<div class="miniapp-result-card">Пакет на ${count} стилизаций выбран. Сейчас Mini App использует текущий баланс и готов к генерации без выхода в чат.</div>`;
    activateTab('pricing');
  });
});

useSelectedPackageBtn?.addEventListener('click', () => {
  activateTab('dashboard');
  imageInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

clearSelectedPackageBtn?.addEventListener('click', () => {
  selectedPackage = null;
  document.querySelectorAll('[data-package-card]').forEach((card) => card.classList.remove('selected'));
  selectedPackageBadge.textContent = 'Не выбран';
  selectedPackageText.textContent = 'Выбери пакет, чтобы зафиксировать подходящий сценарий использования внутри Mini App.';
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
  const isCustomStyle = styleSelect.value === 'custom';
  const customStyleFile = customStyleInput?.files?.[0];
  if (isCustomStyle && !customStyleFile) {
    miniappResult.innerHTML = '<div class="miniapp-result-card">Для режима "Свой стиль" сначала выбери style-картинку.</div>';
    return;
  }

  miniappGenerateBtn.disabled = true;
  miniappGenerateBtn.textContent = 'Обработка...';
  miniappResult.innerHTML = '';
  miniappProgress.classList.remove('hidden');
  miniappProgressText.textContent = 'Запускаю стилизацию...';

  try {
    const imageBase64 = await fileToBase64(file);
    const customStyleBase64 = isCustomStyle ? await fileToBase64(customStyleFile) : null;
    miniappProgressText.textContent = 'Отправляю фото и параметры в API...';
    const res = await fetch(`${apiBase}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        image_base64: imageBase64,
        mode: Number(modeSelect.value),
        style_id: isCustomStyle ? 0 : Number(styleSelect.value),
        custom_style_base64: customStyleBase64,
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

styleSelect?.addEventListener('change', () => {
  const isCustom = styleSelect.value === 'custom';
  customStyleBox.classList.toggle('hidden', !isCustom);
});

customStyleInput?.addEventListener('change', () => {
  const file = customStyleInput.files?.[0];
  if (!file) {
    customStylePreviewCard.classList.add('hidden');
    return;
  }
  const url = URL.createObjectURL(file);
  customStylePreview.src = url;
  customStylePreviewCard.classList.remove('hidden');
});
