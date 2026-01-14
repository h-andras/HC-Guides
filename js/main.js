function initApp() {
    
    const sidebar = document.getElementById('sidebar');
    let menuToggle = document.getElementById('menu-toggle');

    
    if (sidebar && !menuToggle) {
        menuToggle = document.createElement('button');
        menuToggle.id = 'menu-toggle';
        menuToggle.setAttribute('aria-label', 'Toggle Menu');
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        document.body.appendChild(menuToggle);
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            
           
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('open')) {
                    icon.className = 'fa-solid fa-xmark';
                } else {
                    icon.className = 'fa-solid fa-bars';
                }
            }
        });
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const cleanupDelay = () => {
                   entry.target.style.transitionDelay = '0s';
                };
                entry.target.addEventListener('transitionend', cleanupDelay, { once: true });

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.tile').forEach(tile => {
        observer.observe(tile);
    });

    const scrollArrow = document.getElementById('scroll-arrow');
    const heroSection = document.querySelector('.hero');

    if (scrollArrow && heroSection) {
        const scrollToHero = () => {
            heroSection.scrollIntoView({ behavior: 'smooth' });
        };

        scrollArrow.addEventListener('click', scrollToHero);
        
        scrollArrow.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                scrollToHero();
            }
        });
    }

    if (window.equalizeTileHeights) {
        window.equalizeTileHeights();
    }
}


document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    
    if (sidebar && menuToggle && 
        window.innerWidth <= 768 && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

async function handleRoute(path) {
    let fileToFetch;
    
    if (path.startsWith('/')) path = path.substring(1);
    
    if (path === '' || path === 'index.html') {
        fileToFetch = 'index.html';
    } else {
        fileToFetch = `guides/${path}.html`;
    }

    try {
        const response = await fetch(fileToFetch);
        if (!response.ok) throw new Error('Page not found');
        const text = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        
        doc.querySelectorAll('a[href]').forEach(a => {
            let href = a.getAttribute('href');
            if (href) {
                
                if (href.endsWith('.html') && !href.startsWith('http')) {
                    a.setAttribute('href', href.replace('.html', ''));
                }
                
                if (href === '../') {
                    a.setAttribute('href', '/');
                }
            }
        });
        
       
        if (fileToFetch.startsWith('guides/')) {
            doc.querySelectorAll('[src], [href]').forEach(el => {
                const src = el.getAttribute('src');
                const href = el.getAttribute('href');
                
                if (src && src.startsWith('../')) el.setAttribute('src', src.substring(3));
                if (href && href.startsWith('../')) el.setAttribute('href', href.substring(3));
            });
        }
        
        
        const newLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        const currentLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        
        
        currentLinks.forEach(currLink => {
            const currHref = currLink.getAttribute('href');
        
            const existsInNew = newLinks.some(link => link.getAttribute('href') === currHref);
            if (!existsInNew) {
                currLink.remove();
            }
        });

        newLinks.forEach(link => {
            const href = link.getAttribute('href');
            const existsInCurrent = currentLinks.some(currLink => currLink.getAttribute('href') === href);
            if (!existsInCurrent) {
                document.head.appendChild(link.cloneNode(true));
            }
        });

        
        doc.querySelectorAll('script').forEach(s => s.remove());
        document.body.innerHTML = doc.body.innerHTML; 
        document.title = doc.title;

        
        initApp();
        if (typeof setLanguage === 'function') {
            setLanguage(localStorage.getItem('preferredLanguage') || 'en');
        }
        window.scrollTo(0, 0);

    } catch (e) {
        console.error('Nav failed', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    
    
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                e.preventDefault();
                const targetUrl = href === '/' ? '/' : href;
                history.pushState({}, '', targetUrl);
                
                const path = href === '/' ? '' : href;
                handleRoute(path);
            }
        }
    });
});

window.addEventListener('popstate', () => {
    handleRoute(location.pathname);
});

window.equalizeTileHeights = function() {
    const tiles = document.querySelectorAll('.tile');
    if (tiles.length === 0) return;

    tiles.forEach(tile => tile.style.height = 'auto');

    let maxHeight = 0;
    tiles.forEach(tile => {
        if (tile.offsetHeight > maxHeight) {
            maxHeight = tile.offsetHeight;
        }
    });

    tiles.forEach(tile => tile.style.height = `${maxHeight}px`);
};

window.addEventListener('load', window.equalizeTileHeights);
window.addEventListener('resize', () => {
    window.equalizeTileHeights();
});
