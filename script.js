// --- ЛОГИКА ПОИСКА ---
const searchBtn = document.getElementById('search-btn');
const closeSearchBtn = document.getElementById('close-search-btn');
const navCategories = document.getElementById('nav-categories');
const searchWrapper = document.getElementById('nav-search-wrapper');
const searchInput = document.getElementById('search-input');

// Клик по лупе
searchBtn.addEventListener('click', () => {
    navCategories.style.display = 'none'; // Прячем ссылки
    searchWrapper.style.display = 'flex'; // Показываем инпут
    searchInput.focus(); // Сразу ставим курсор в поле
});

// Клик по крестику (закрыть поиск)
closeSearchBtn.addEventListener('click', () => {
    searchWrapper.style.display = 'none'; // Прячем инпут
    navCategories.style.display = 'flex'; // Возвращаем ссылки
    searchInput.value = ''; // Очищаем введенный текст
});


// --- ЛОГИКА СМЕНЫ ТЕМЫ ---
const themeBtn = document.getElementById('theme-btn');
const body = document.body;
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');

// Проверяем, сохранял ли пользователь тему ранее
if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-theme');
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
}

themeBtn.addEventListener('click', () => {
    // Переключаем класс
    body.classList.toggle('light-theme');
    
    // Меняем иконку и сохраняем выбор в память браузера
    if (body.classList.contains('light-theme')) {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
        localStorage.setItem('theme', 'light');
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
        localStorage.setItem('theme', 'dark');
    }
});