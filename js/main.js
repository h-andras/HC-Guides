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
                    menuToggle.classList.add('open');
                } else {
                    icon.className = 'fa-solid fa-bars';
                    menuToggle.classList.remove('open');
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

    setupSearchUI();
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
    if (path.endsWith('/')) path = path.slice(0, -1);
    
    if (path === '' || path === 'index.html') {
        fileToFetch = 'index.html';
    } else {
        fileToFetch = `${path}/index.html`;
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
        updateSearchShortcut();
        if (typeof setLanguage === 'function') {
            setLanguage(localStorage.getItem('preferredLanguage') || 'hu');
        }
        window.scrollTo(0, 0);

    } catch (e) {
        console.error('Nav failed', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    if (location.pathname !== '/' && location.pathname.endsWith('/')) {
        const cleanPath = location.pathname.replace(/\/$/, '');
        history.replaceState({}, '', cleanPath);
    }
    
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                e.preventDefault();
                let targetUrl = href === '/' ? '/' : href.replace(/\/$/, '');
                history.pushState({}, '', targetUrl);
                
                const path = href === '/' ? '' : href;
                handleRoute(path);
            }
        }
    });
});

window.addEventListener('popstate', () => {
    let path = location.pathname;
    if (path !== '/' && path.endsWith('/')) {
        const cleanPath = path.replace(/\/$/, '');
        history.replaceState({}, '', cleanPath);
        path = cleanPath;
    }
    handleRoute(path);
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

document.addEventListener('languageChanged', async (e) => {
    if (typeof isSearchIndexed !== 'undefined') isSearchIndexed = false;
    const contentDiv = document.getElementById('markdown-content');
    if (!contentDiv) return;

    const lang = e.detail.lang.toUpperCase();
    
    let path = window.location.pathname;
    if (path.endsWith('index.html')) {
        path = path.slice(0, -10);
    }
    const pathParts = path.split('/').filter(Boolean);
    const pageName = pathParts[pathParts.length - 1];

    if (!pageName) return;

    const mdFile = `/assets/guides_md/${lang}/${pageName}.md`;
    
    try {
        const response = await fetch(mdFile);
        if (response.ok) {
            const mdText = await response.text();
            contentDiv.innerHTML = marked.parse(mdText);
            contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
                if (!h.id) {
                    h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                }
            });
        } else {
            console.error('Failed to load markdown file:', response.statusText);
            contentDiv.innerHTML = '<p>Error loading content.</p>';
        }
    } catch (error) {
        console.error('Error fetching markdown:', error);
        contentDiv.innerHTML = '<p>Error loading content.</p>';
    }
});

function updateSearchShortcut() {
    const shortcutKeys = document.querySelectorAll('.search-shortcut');
    if (shortcutKeys.length > 0) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.includes('Mac');
        const shortcutText = isMac ? '⌘ K' : 'Ctrl K';
        shortcutKeys.forEach(key => {
            key.textContent = shortcutText;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateSearchShortcut();
});

let searchGlobalListenerAdded = false;
if (!searchGlobalListenerAdded) {
    document.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.includes('Mac');
        if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        }
    });
    searchGlobalListenerAdded = true;
}
let searchIndex = [];
let isSearchIndexed = false;

const pagesToIndex = [
    { id: 'hc-auth', titleId: 'hc-auth-title', defaultTitle: 'HC Auth' },
    { id: 'hackatime', titleId: 'hackatime-title', defaultTitle: 'Hackatime' },
    { id: 'github-education', titleId: 'github-education-title', defaultTitle: 'GitHub Education' },
    { id: 'other-resources', titleId: 'other-resources-title', defaultTitle: 'Other Resources' }
];

async function buildSearchIndex(lang) {
    searchIndex = [];
    isSearchIndexed = false;
    
    for (const page of pagesToIndex) {
        try {
            const res = await fetch(`/assets/guides_md/${lang.toUpperCase()}/${page.id}.md`);
            if (res.ok) {
                const text = await res.text();
                const lines = text.split('\n');
                let currentHeading = page.defaultTitle;
                let currentContent = [];
                let currentAnchor = '';
                
                const pushSection = () => {
                    if (currentContent.length > 0 || currentHeading !== page.defaultTitle) {
                        searchIndex.push({
                            pageId: page.id,
                            pageTitle: page.defaultTitle,
                            heading: currentHeading,
                            content: currentContent.join(' ').trim(),
                            anchor: currentAnchor
                        });
                    }
                };

                for (const line of lines) {
                    if (line.match(/^#{1,6}\s+(.*)/)) {
                        pushSection();
                        const match = line.match(/^#{1,6}\s+(.*)/);
                        currentHeading = match[1].replace(/<[^>]+>/g, '').trim();
                        currentAnchor = currentHeading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        currentContent = [];
                    } else if (line.trim().length > 0) {
                        currentContent.push(line.replace(/<[^>]+>/g, '').trim());
                    }
                }
                pushSection();
            }
        } catch (e) {
            console.error('Failed to index:', page.id);
        }
    }
    isSearchIndexed = true;
}

function processSearch(query) {
    if (!query) return [];
    query = query.toLowerCase();
    const results = [];
    
    for (const item of searchIndex) {
        const titleMatch = item.heading.toLowerCase().includes(query);
        const contentMatch = item.content.toLowerCase().includes(query);
        
        if (titleMatch || contentMatch) {
            results.push({
                ...item,
                snippet: contentMatch ? getSnippet(item.content, query) : item.content.substring(0, 100) + '...'
            });
        }
    }
    return results;
}

function getSnippet(text, query) {
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(query);
    if (index === -1) return text.substring(0, 100) + '...';
    
    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + query.length + 40);
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    return snippet;
}

function setupSearchUI() {
    const searchInput = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');
    
    if (!searchInput || !dropdown) return;
    
    searchInput.addEventListener('focus', () => {
        if (!isSearchIndexed) {
            const lang = localStorage.getItem('preferredLanguage') || 'hu';
            buildSearchIndex(lang);
        }
        if (searchInput.value.trim().length > 0) {
            dropdown.classList.add('active');
        }
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length === 0) {
            dropdown.classList.remove('active');
            return;
        }
        
        const results = processSearch(query);
        renderSearchResults(results, dropdown);
        dropdown.classList.add('active');
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar-container')) {
            dropdown.classList.remove('active');
        }
    });
}

function renderSearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="search-result-item"><div class="search-result-text">No results found.</div></div>';
        return;
    }
    
    container.innerHTML = results.map(res => `
        <a href="/${res.pageId}/#${res.anchor}" class="search-result-item" onclick="handleSearchNav(event, '/${res.pageId}/', '${res.anchor}')">
            <div class="search-result-page">${res.pageTitle}</div>
            <div class="search-result-title">${res.heading}</div>
            <div class="search-result-text">${res.snippet}</div>
        </a>
    `).join('');
}

window.handleSearchNav = function(e, path, anchor) {
    if (e) e.preventDefault();
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) dropdown.classList.remove('active');
    
    let targetUrl = path;
    history.pushState({}, '', targetUrl);
    
    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.value = '';
    
    handleRoute(path.replace(/\/$/, '')).then(() => {
        if (anchor) {
            let tries = 0;
            const tryScroll = () => {
                const el = document.getElementById(anchor);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                } else if (tries < 10) {
                    tries++;
                    setTimeout(tryScroll, 100);
                }
            };
            tryScroll();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupSearchUI();
});
