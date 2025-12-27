const translations = {
    en: {
        "other-resources-title": "Other Resources",
        "other-resources-intro": "Here you can find additional links to help you on your journey with Hack Club."
    },
    hu: {
        "other-resources-title": "Egyéb Források",
        "other-resources-intro": "Itt további linkeket találsz, amelyek segítenek az utadon a Hack Clubbal."
    }
};

function setLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    const currentLangSpan = document.getElementById('current-lang');
    if (currentLangSpan) {
        currentLangSpan.textContent = lang.toUpperCase();
    }
}

function toggleLanguage() {
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    const newLang = currentLang === 'en' ? 'hu' : 'en';
    setLanguage(newLang);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLang);

    const toggleBtn = document.getElementById('lang-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleLanguage);
    }
});
