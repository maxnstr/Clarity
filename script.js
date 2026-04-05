// =============================================
// УТИЛИТА: переключение состояний капсулы
// =============================================
const navCategories   = document.getElementById('nav-categories');
const searchWrapper   = document.getElementById('nav-search-wrapper');
const filterWrapper   = document.getElementById('nav-filter-wrapper');

function setCapsuleState(state) {
    navCategories.style.display = state === 'nav'    ? 'flex' : 'none';
    searchWrapper.style.display = state === 'search' ? 'flex' : 'none';
    filterWrapper.style.display = state === 'filter' ? 'flex' : 'none';
}
setCapsuleState('nav');


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
    setCapsuleState('nav');
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
closeFilterBtn.addEventListener('click', () => setCapsuleState('nav'));

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
    // rAF гарантирует что браузер применил новый класс перед замером яркости
    requestAnimationFrame(updateIconContrast);
});


// =============================================
// ПОЛЗУНОК И АКТИВНЫЙ РАЗДЕЛ
// =============================================
const indicator = document.getElementById('nav-indicator');
const links     = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('.content-section, #main');

function moveIndicator(link) {
    if (!link) {
        links.forEach(l => l.classList.remove('active'));
        indicator.style.width = '0px';
        return;
    }
    links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    indicator.style.width     = link.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (pageYOffset >= section.offsetTop - 150) current = section.getAttribute('id');
    });
    if (current === 'main' || !current) {
        moveIndicator(null);
    } else {
        const activeLink = document.querySelector('.nav-link[href="#' + current + '"]');
        if (activeLink && !activeLink.classList.contains('active')) moveIndicator(activeLink);
    }
});

links.forEach(link => link.addEventListener('click', function() { moveIndicator(this); }));
window.addEventListener('load',   () => window.dispatchEvent(new Event('scroll')));
window.addEventListener('resize', () => {
    const a = document.querySelector('.nav-link.active');
    if (a) moveIndicator(a);
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
    allIconBtns.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const lum  = getBgLuminanceAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
        btn.classList.toggle('on-light-bg', isLight ? lum < 0.35 : lum > 0.6);
    });
    if (homeBtnEl) {
        const rect = homeBtnEl.getBoundingClientRect();
        const lum  = getBgLuminanceAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
        homeBtnEl.classList.toggle('on-light-bg', isLight ? lum < 0.35 : lum > 0.6);
    }
}

window.addEventListener('scroll', updateIconContrast, { passive: true });
window.addEventListener('resize', updateIconContrast);
updateIconContrast();
