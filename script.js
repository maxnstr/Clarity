// =============================================
// УТИЛИТА: переключение состояний капсулы
// =============================================
const navCategories   = document.getElementById('nav-categories');
const searchWrapper   = document.getElementById('nav-search-wrapper');
const filterWrapper   = document.getElementById('nav-filter-wrapper');
const mobileLabel     = document.getElementById('nav-mobile-label');

function setCapsuleState(state) {
    // nav-categories скрыт на мобиле через CSS; на десктопе управляется здесь
    const isMobile = window.innerWidth <= 768;
    navCategories.style.display = (!isMobile && state === 'nav') ? 'flex' : (isMobile ? 'none' : 'none');
    searchWrapper.style.display = state === 'search' ? 'flex' : 'none';
    filterWrapper.style.display = state === 'filter' ? 'flex' : 'none';
    if (mobileLabel) mobileLabel.style.display = (isMobile && state === 'nav') ? 'flex' : 'none';
}

// Инициализация при загрузке
function initCapsule() {
    const isMobile = window.innerWidth <= 768;
    navCategories.style.display = isMobile ? 'none' : 'flex';
    if (mobileLabel) mobileLabel.style.display = isMobile ? 'flex' : 'none';
    searchWrapper.style.display = 'none';
    filterWrapper.style.display = 'none';
}

window.addEventListener('resize', initCapsule);
initCapsule();


// =============================================
// ПОИСК
// =============================================
const searchBtn       = document.getElementById('search-btn');
const closeSearchBtn  = document.getElementById('close-search-btn');
const searchInput     = document.getElementById('search-input');
const allCards        = document.querySelectorAll('.software-card');

searchBtn.addEventListener('click', () => {
    setCapsuleState('search');
    searchInput.focus();
});

closeSearchBtn.addEventListener('click', () => {
    initCapsule();
    searchInput.value = '';
    applySearch('');
});

searchInput.addEventListener('input', () => applySearch(searchInput.value));

function applySearch(query) {
    const q = query.trim().toLowerCase();
    allCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc  = card.querySelector('p')?.textContent.toLowerCase()  || '';
        const match = !q || title.includes(q) || desc.includes(q);
        card.classList.toggle('hidden-by-search', !match);
    });
}


// =============================================
// ФИЛЬТРЫ
// =============================================
const filterBtn      = document.getElementById('filter-btn');
const closeFilterBtn = document.getElementById('close-filter-btn');
const filterTags     = document.querySelectorAll('.filter-tag');
let activeTags = new Set();

filterBtn.addEventListener('click', () => setCapsuleState('filter'));
closeFilterBtn.addEventListener('click', () => initCapsule());

filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
        const t = tag.dataset.tag;
        if (activeTags.has(t)) { activeTags.delete(t); tag.classList.remove('active'); }
        else                   { activeTags.add(t);    tag.classList.add('active');    }
        filterBtn.classList.toggle('has-active-filters', activeTags.size > 0);
        applyFilters();
    });
});

function applyFilters() {
    allCards.forEach(card => {
        if (activeTags.size === 0) { card.classList.remove('hidden-by-filter'); return; }
        const cardTags = (card.dataset.tags || '').split(',').map(t => t.trim());
        const match = [...activeTags].some(t => cardTags.includes(t));
        card.classList.toggle('hidden-by-filter', !match);
    });
}


// =============================================
// СМЕНА ТЕМЫ
// =============================================
const themeBtn = document.getElementById('theme-btn');
const body     = document.body;
const moonIcon = document.getElementById('moon-icon');
const sunIcon  = document.getElementById('sun-icon');

if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-theme');
    moonIcon.style.display = 'none';
    sunIcon.style.display  = 'block';
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    moonIcon.style.display = isLight ? 'none'  : 'block';
    sunIcon.style.display  = isLight ? 'block' : 'none';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    requestAnimationFrame(() => requestAnimationFrame(updateIconContrast));
});


// =============================================
// ПОЛЗУНОК, АКТИВНЫЙ РАЗДЕЛ, МОБИЛЬНЫЙ ЛЕЙБЛ
// =============================================
const indicator   = document.getElementById('nav-indicator');
const links       = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('.content-section, #main');
const bottomBtns  = document.querySelectorAll('.bottom-nav-btn');

// Маппинг id раздела → название для мобильного лейбла
const sectionNames = {
    'main':  'Кларити',
    'os':    'Soft',
    'proxy': 'Proxy & VPN',
    'ai':    'AI',
    'video': 'Web tools',
    'audio': 'Games'
};

function setMobileLabel(sectionId) {
    if (!mobileLabel) return;
    const name = sectionNames[sectionId] || 'Кларити';
    if (mobileLabel.textContent === name) return;
    mobileLabel.style.opacity = '0';
    setTimeout(() => {
        mobileLabel.textContent = name;
        mobileLabel.style.opacity = '1';
    }, 150);
}

function setBottomNavActive(sectionId) {
    bottomBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });
}

function moveIndicator(link) {
    if (!link) {
        links.forEach(l => l.classList.remove('active'));
        if (indicator) indicator.style.width = '0px';
        return;
    }
    links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    if (indicator) {
        indicator.style.width     = link.offsetWidth + 'px';
        indicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    }
    link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}

let lastSection = '';

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (pageYOffset >= section.offsetTop - 200) current = section.getAttribute('id');
    });
    if (!current) current = 'main';

    if (current !== lastSection) {
        lastSection = current;
        setMobileLabel(current);
        setBottomNavActive(current);

        if (current === 'main') {
            moveIndicator(null);
        } else {
            const activeLink = document.querySelector('.nav-link[href="#' + current + '"]');
            if (activeLink && !activeLink.classList.contains('active')) moveIndicator(activeLink);
        }
    }
});

links.forEach(link => link.addEventListener('click', function() { moveIndicator(this); }));

window.addEventListener('load', () => {
    window.dispatchEvent(new Event('scroll'));
});

window.addEventListener('resize', () => {
    const a = document.querySelector('.nav-link.active');
    if (a) moveIndicator(a);
    initCapsule();
});


// =============================================
// ДИНАМИЧЕСКИЙ ЦВЕТ ИКОНОК (luminance-based)
// =============================================
const homeBtnEl   = document.getElementById('home-btn');
const allIconBtns = document.querySelectorAll('.icon-btn, .filter-btn');

function getBgLuminanceAt(x, y) {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
        if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;
        if (el.closest('header')) continue;
        const bg = getComputedStyle(el).backgroundColor;
        const m  = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) continue;
        const alpha = m[4] !== undefined ? parseFloat(m[4]) : 1;
        if (alpha < 0.15) continue;
        return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
    }
    const bg = getComputedStyle(document.body).backgroundColor;
    const m  = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
    return 0;
}

function updateIconContrast() {
    const isLight = document.body.classList.contains('light-theme');

    // Все icon-btn и filter-btn
    allIconBtns.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        // Пропускаем элементы вне viewport
        if (cy < 0 || cy > window.innerHeight) return;
        const lum = getBgLuminanceAt(cx, cy);
        const flip = isLight ? lum < 0.35 : lum > 0.6;
        btn.classList.toggle('on-light-bg', flip);
    });

    // home-btn
    if (homeBtnEl) {
        const rect = homeBtnEl.getBoundingClientRect();
        const lum = getBgLuminanceAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
        const flip = isLight ? lum < 0.35 : lum > 0.6;
        homeBtnEl.classList.toggle('on-light-bg', flip);
    }
}

window.addEventListener('scroll', updateIconContrast, { passive: true });
window.addEventListener('resize', updateIconContrast);
window.addEventListener('load',   updateIconContrast);
