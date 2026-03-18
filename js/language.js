// Language Translations (loaded from language.json)
let translations = {};

// Load translations from JSON file
async function loadTranslations() {
    try {
        // Use absolute path from root to work with Firebase hosting
        const response = await fetch('/language.json');
        translations = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading translations:', error);
        return false;
    }
}

// Language Management
class LanguageManager {
    constructor() {
        this.currentLang = this.getLanguageFromURL() || localStorage.getItem('language') || 'en';
        this.init();
    }

    async init() {
        // Load translations first
        await loadTranslations();
        this.updateLanguage(this.currentLang);
        this.setupEventListeners();
        this.updateCanonicalURL();
    }

    /**
     * Update canonical URL and hreflang tags for SEO based on current language
     */
    updateCanonicalURL() {
        const canonicalEl = document.getElementById('canonicalUrl');
        if (canonicalEl) {
            const url = new URL(window.location.href);
            // Use path-based URL structure for Firebase hosting
            const basePath = url.origin;
            canonicalEl.href = `${basePath}/${this.currentLang}/`;
        }

        // Update all hreflang tags
        this.updateHreflangTags();
    }

    /**
     * Update hreflang tags based on current language
     */
    updateHreflangTags() {
        const url = new URL(window.location.href);
        const basePath = url.origin;

        // Update each hreflang tag
        const hreflangEn = document.getElementById('hreflang-en');
        if (hreflangEn) hreflangEn.href = `${basePath}/en/`;

        const hreflangSi = document.getElementById('hreflang-si');
        if (hreflangSi) hreflangSi.href = `${basePath}/si/`;

        const hreflangIt = document.getElementById('hreflang-it');
        if (hreflangIt) hreflangIt.href = `${basePath}/it/`;

        const hreflangYu = document.getElementById('hreflang-yu');
        if (hreflangYu) hreflangYu.href = `${basePath}/yu/`;

        const hreflangDefault = document.getElementById('hreflang-default');
        if (hreflangDefault) hreflangDefault.href = `${basePath}/en/`;
    }

    /**
     * Get language from URL path (e.g., /en/, /si/, /it/, /yu/)
     * This makes URLs SEO-friendly and shareable
     */
    getLanguageFromURL() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(p => p);
        if (pathParts.length > 0) {
            const firstPart = pathParts[0];
            if (['en', 'si', 'it', 'yu'].includes(firstPart)) {
                return firstPart;
            }
        }
        return null;
    }

    /**
     * Update URL with language path for SEO-friendly URLs
     * Uses history.pushState to update URL without page reload
     * Creates URLs like: /en/, /si/, /it/, /yu/
     */
    updateURL(lang) {
        const url = new URL(window.location.href);
        // Create path-based URL: /lang/
        const newPath = `/${lang}/`;
        window.history.pushState({ lang }, '', url.origin + newPath);
    }

    setupEventListeners() {
        const langBtn = document.getElementById('langBtn');
        const langDropdown = document.getElementById('langDropdown');
        const langLinks = document.querySelectorAll('.lang-dropdown a');

        // Toggle dropdown
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            langDropdown.classList.remove('active');
        });

        // Language selection
        langLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.getAttribute('data-lang');
                this.updateLanguage(lang);
                this.updateURL(lang); // Update URL with language path
                langDropdown.classList.remove('active');
            });
        });
    }

    updateLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);

        // Update button text
        const langBtn = document.getElementById('langBtn');
        const langMap = { en: 'EN', si: 'SI', it: 'IT', yu: 'YU' };
        langBtn.textContent = langMap[lang];

        // Update HTML lang attribute for SEO
        document.documentElement.lang = lang;

        // Update canonical URL
        this.updateCanonicalURL();

        // Update meta tags based on language
        this.updateMetaTags(lang);

        // Update structured data based on language
        this.updateStructuredData(lang);

        // Update all translatable elements
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                const text = translations[lang][key];
                
                // Handle multi-line text (about section, valovanja section, and contact intro)
                if (key === 'about_text' || key === 'valovanja_text' || key === 'contact_intro') {
                    element.innerHTML = text.split('\n\n').map(p => `<p>${p}</p>`).join('');
                } else {
                    element.textContent = text;
                }
            }
        });
    }

    /**
     * Update meta tags (title, description, OG, Twitter) based on current language
     * Uses translations from language.json
     */
    updateMetaTags(lang) {
        const t = translations[lang] || translations['en'];
        
        // Update meta description from language.json
        const metaDesc = document.getElementById('metaDescription');
        if (metaDesc) {
            metaDesc.content = t.meta_description || translations['en'].meta_description;
        }
        
        // Update meta keywords from language.json
        const metaKeywords = document.getElementById('metaKeywords');
        if (metaKeywords) {
            metaKeywords.content = t.meta_keywords || translations['en'].meta_keywords;
        }
        
        // Update title from language.json
        const title = document.getElementById('pageTitle');
        if (title) {
            title.textContent = t.meta_title || translations['en'].meta_title;
        }
        
        // Update Open Graph tags from language.json
        const ogTitle = document.getElementById('ogTitle');
        if (ogTitle) {
            ogTitle.content = t.meta_title || translations['en'].meta_title;
        }
        
        const ogDesc = document.getElementById('ogDescription');
        if (ogDesc) {
            ogDesc.content = t.meta_description || translations['en'].meta_description;
        }
        
        const ogLocale = document.getElementById('ogLocale');
        if (ogLocale) {
            ogLocale.content = t.og_locale || translations['en'].og_locale;
        }
        
        // Update Twitter Card tags from language.json
        const twitterTitle = document.getElementById('twitterTitle');
        if (twitterTitle) {
            twitterTitle.content = t.meta_title || translations['en'].meta_title;
        }
        
        const twitterDesc = document.getElementById('twitterDescription');
        if (twitterDesc) {
            twitterDesc.content = t.meta_description || translations['en'].meta_description;
        }
    }

    /**
     * Update structured data (JSON-LD) based on current language
     * Uses translations from language.json
     */
    updateStructuredData(lang) {
        const t = translations[lang] || translations['en'];
        
        const personSchema = document.getElementById('personSchema');
        if (personSchema) {
            try {
                const parsed = JSON.parse(personSchema.textContent);
                parsed.description = t.about_text || '';
                parsed.jobTitle = t.job_title || translations['en'].job_title;
                personSchema.textContent = JSON.stringify(parsed);
            } catch (e) {
                // If JSON parsing fails, skip update
            }
        }
        
        const webSiteSchema = document.getElementById('webSiteSchema');
        if (webSiteSchema) {
            try {
                const parsed = JSON.parse(webSiteSchema.textContent);
                parsed.description = t.site_description || translations['en'].site_description;
                parsed.inLanguage = [lang, 'sl', 'it', 'sh'];
                webSiteSchema.textContent = JSON.stringify(parsed);
            } catch (e) {
                // If JSON parsing fails, skip update
            }
        }
    }


    /**
     * Handle browser back/forward navigation
     */
    handlePopState(event) {
        if (event.state && event.state.lang) {
            this.updateLanguage(event.state.lang);
        } else {
            const lang = this.getLanguageFromURL();
            if (lang) {
                this.updateLanguage(lang);
            }
        }
    }

    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Initialize language manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
    
    // Handle browser history navigation
    window.addEventListener('popstate', (e) => {
        window.languageManager.handlePopState(e);
    });
});