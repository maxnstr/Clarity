// --- ЛОГИКА ПОИСКА ---
const searchBtn = document.getElementById('search-btn');
const closeSearchBtn = document.getElementById('close-search-btn');
const navCategories = document.getElementById('nav-categories');
const searchWrapper = document.getElementById('nav-search-wrapper');
const searchInput = document.getElementById('search-input');

searchBtn.addEventListener('click', () => {
    navCategories.style.display = 'none'; 
    searchWrapper.style.display = 'flex'; 
    searchInput.focus(); 
});

closeSearchBtn.addEventListener('click', () => {
    searchWrapper.style.display = 'none'; 
    navCategories.style.display = 'flex'; 
    searchInput.value = ''; 
});


// --- ЛОГИКА СМЕНЫ ТЕМЫ ---
const themeBtn = document.getElementById('theme-btn');
const body = document.body;
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');

if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-theme');
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    if (body.classList.contains('light-theme')) {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
        localStorage.setItem('theme', 'light');
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
        localStorage.setItem('theme', 'dark');
    }
    // Пересчитываем цвет иконок после смены темы
    updateIconContrast();
});


// --- ЛОГИКА ПОЛЗУНКА И АКТИВНОГО РАЗДЕЛА ---
const indicator = document.getElementById('nav-indicator');
const links = document.querySelectorAll('.nav-link');
// Теперь ищем и секции с контентом, и наш главный экран (#main)
const sections = document.querySelectorAll('.content-section, #main');

function moveIndicator(link) {
    if (!link) {
        links.forEach(l => l.classList.remove('active'));
        indicator.style.width = '0px';
        return;
    }
    
    links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;

    // Прокручиваем капсулу чтобы активный пункт был виден (для мобилы)
    link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 150) { 
            current = section.getAttribute('id');
        }
    });

    // Если мы на главном экране (main) или выше
    if (current === 'main' || !current) {
        moveIndicator(null);
    } else {
        const activeLink = document.querySelector(`.nav-link[href="#${current}"]`);
        if (activeLink && !activeLink.classList.contains('active')) {
            moveIndicator(activeLink);
        }
    }
});

links.forEach(link => {
    link.addEventListener('click', function() {
        moveIndicator(this);
    });
});

window.addEventListener('load', () => {
    // При загрузке страницы проверяем, где мы находимся
    window.dispatchEvent(new Event('scroll')); 
});

window.addEventListener('resize', () => {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) moveIndicator(activeLink);
});


// --- ДИНАМИЧЕСКИЙ ЦВЕТ ИКОНОК (luminance-based) ---
// Берём все элементы под центром иконки, находим первый непрозрачный
// за пределами хедера, считаем яркость фона и переключаем цвет иконки.
const iconBtns = document.querySelectorAll('.icon-btn');

function getBgLuminanceAt(x, y) {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
        if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;
        if (el.closest('header')) continue;

        const bg = getComputedStyle(el).backgroundColor;
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) continue;

        const alpha = m[4] !== undefined ? parseFloat(m[4]) : 1;
        if (alpha < 0.15) continue; // пропускаем почти прозрачные слои

        const r = +m[1], g = +m[2], b = +m[3];
        // Стандартная формула воспринимаемой яркости
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    // Фолбэк — берём фон body
    const bg = getComputedStyle(document.body).backgroundColor;
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
    return 0;
}

function updateIconContrast() {
    const isLight = document.body.classList.contains('light-theme');
    iconBtns.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const lum = getBgLuminanceAt(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        );
        // Тёмная тема: иконка белая → флип если фон светлый (lum > 0.6)
        // Светлая тема: иконка тёмная → флип если фон тёмный (lum < 0.35)
        const needsFlip = isLight ? lum < 0.35 : lum > 0.6;
        btn.classList.toggle('on-light-bg', needsFlip);
    });
}

window.addEventListener('scroll', updateIconContrast, { passive: true });
window.addEventListener('resize', updateIconContrast);
updateIconContrast();
