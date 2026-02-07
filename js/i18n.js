const translations = {
    en: {
        "website-title": "Welcome To The Deak Teri HC Guides",
        "other-resources-title": "Other Resources",
        "other-resources-intro": "Continously updated with new resources.",
        "hc-auth-intro": "Every member needs a HC Auth account. Here you can learn the registration process and how to customize your profile.",
        "hackatime-intro": "Hackatime is the basis of almost every YSWS. In this section, you will find everything you need to know about using the extension.",
        "github-education-intro": "GitHub Education is a fantastic resource pack for young developers. Here you can learn how to claim free access as a Hack Club member."
    },
    hu: {
        "website-title": "Üdvözlünk a Deák Téri Hack Club Útmutató Oldalán",
        "other-resources-title": "Egyéb Linkek",
        "other-resources-intro": "Folyamatosan frissül új erőforrásokkal.",
        "hc-auth-intro": "Minden tagnak szükséges egy HC Auth fiók. Itt megtanulhatod a regisztráció menetét és a profil testreszabását.",
        "hackatime-intro": "A Hackatime majdnem minden YSWS alapja. Ebben a részben megtalálsz minden szükséges tudnivalót az extension használatához.",
        "github-education-intro": "A GitHub Education egy fantasztikus erőforráscsomag fiatal fejlesztők számára. Itt megtudhatod, hogyan igényelhetsz ingyenes hozzáférést a Hack Club tagjaként.",
        "other-resources-intro": "További erőforrások, amelyek segítenek az utadon a Hack Clubbal."
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

    document.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('active'));
    const activeBtn = document.getElementById(`lang-${lang}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    const langContainer = document.querySelector('.lang-toggle-container');
    if (langContainer) {
        langContainer.setAttribute('data-active-lang', lang);
    }

    if (window.equalizeTileHeights) {
        setTimeout(window.equalizeTileHeights, 0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLang);
});
