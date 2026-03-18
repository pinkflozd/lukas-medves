// Main JavaScript

// Smooth Scrolling - Direct click handler for navigation menu
document.addEventListener('click', function(e) {
    // Check if clicked element is a navigation link
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    
    e.preventDefault();
    
    // Get the hash and extract ID
    const hash = anchor.getAttribute('href');
    const targetId = hash.substring(1); // Remove # from hash
    
    // Use getElementById for reliable targeting
    const target = document.getElementById(targetId);
    
    if (target) {
        // Scroll to element
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Close mobile menu if open
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        if (navMenu) navMenu.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    }
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.transform = 'translateY(0)';
    } else if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Gallery images array (will be populated dynamically)
let galleryImages = [];
let galleryThumbs = [];
let currentImageIndex = 0;

// Gallery Image Loader - loads images from images.json with lazy loading
async function loadGalleryImages() {
    const galleryGrid = document.getElementById('galleryGrid');
    const basePath = '/assets/images/gallery/';
    const thumbPath = '/assets/images/gallery/thumbs/';
    
    try {
        const response = await fetch('/images.json');
        const data = await response.json();
        
        if (data.images && data.images.length > 0) {
            // Build full paths and thumb paths
            galleryImages = data.images.map(filename => basePath + filename);
            galleryThumbs = data.images.map(filename => thumbPath + filename);
            
            // Create gallery items with lazy loading
            galleryThumbs.forEach((thumbSrc, index) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                
                // Use data-src for lazy loading instead of src
                const img = document.createElement('img');
                img.dataset.src = thumbSrc;
                img.dataset.fullSrc = galleryImages[index];
                img.alt = `Gallery image ${index + 1}`;
                img.loading = 'lazy';
                img.className = 'lazy-image';
                
                galleryItem.appendChild(img);
                galleryItem.addEventListener('click', () => openLightbox(index));
                galleryGrid.appendChild(galleryItem);
            });
            
            // Initialize lazy loading for gallery images
            initLazyLoading();
            
            // If no images loaded, show a message
            setTimeout(() => {
                if (galleryGrid.children.length === 0) {
                    galleryGrid.innerHTML = '<p class="no-events" style="grid-column: 1/-1;">Add images to assets/images/gallery/ folder to display them here.</p>';
                }
            }, 1000);
        } else {
            galleryGrid.innerHTML = '<p class="no-events" style="grid-column: 1/-1;">No images found in images.json.</p>';
        }
    } catch (error) {
        console.log('Error loading images.json:', error);
        galleryGrid.innerHTML = '<p class="no-events" style="grid-column: 1/-1;">Error loading images.json. Make sure the file exists.</p>';
    }
}

// Lazy loading implementation using Intersection Observer
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const thumbSrc = img.dataset.src;
                const fullSrc = img.dataset.fullSrc;
                
                // Load thumbnail first
                img.src = thumbSrc;
                img.onload = () => {
                    img.classList.add('loaded');
                };
                img.onerror = () => {
                    // Fallback to full image if thumb fails
                    img.src = fullSrc;
                };
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px' // Start loading 50px before entering viewport
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Lightbox functionality with navigation
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    currentImageIndex = index;
    lightboxImg.src = galleryImages[currentImageIndex];
    lightboxCaption.textContent = (currentImageIndex + 1) + ' / ' + galleryImages.length;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update button states
    updateLightboxButtons();
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showPreviousImage() {
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}

function showNextImage() {
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    lightboxImg.src = galleryImages[currentImageIndex];
    lightboxCaption.textContent = (currentImageIndex + 1) + ' / ' + galleryImages.length;
    updateLightboxButtons();
}

function updateLightboxButtons() {
    // Buttons always work (looping navigation)
    // Could add visual feedback for first/last if desired
}

// Event listeners for lightbox
document.addEventListener('DOMContentLoaded', () => {
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightbox = document.getElementById('lightbox');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target.id === 'lightbox') {
                closeLightbox();
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPreviousImage();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextImage();
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPreviousImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    });
});

// Google Calendar Configuration
const GOOGLE_CALENDAR_ID = 'e6bcde77727a047b61ef7359adacac25e265b9dcbf63b39785488ae90e668620@group.calendar.google.com';
const GOOGLE_API_KEY = 'AIzaSyClssUwsBKTyB84up8FZ4xLxVYKdkZM4UE';

// Extract first URL from a description string
function extractLinkFromDescription(description) {
    if (!description) return '';
    const urlRegex = /(https?:\/\/[^\s\n\r]+)/i;
    const match = description.match(urlRegex);
    return match ? match[1] : '';
}

// Events Loader - fetches from Google Calendar API
async function loadEvents() {
    const eventsList = document.getElementById('eventsList');

    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('Google Calendar API key is not set. Please set GOOGLE_API_KEY in main.js.');
        showNoEvents();
        return;
    }

    try {
        const now = new Date().toISOString();
        const calendarId = encodeURIComponent(GOOGLE_CALENDAR_ID);
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${GOOGLE_API_KEY}&timeMin=${now}&orderBy=startTime&singleEvents=true&maxResults=50`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            eventsList.innerHTML = data.items.map(event => {
                // Support all-day events (date) and timed events (dateTime)
                const dateStr = event.start.date || event.start.dateTime;
                const title = event.summary || '';
                const location = event.location || '';
                const link = extractLinkFromDescription(event.description);

                return `
                    <div class="event-item">
                        <div class="event-date">${formatDate(dateStr)}</div>
                        <h3 class="event-title">${title}</h3>
                        ${location ? `<p class="event-location">${location}</p>` : ''}
                        ${link ? `<a href="${link}" class="event-link" target="_blank" rel="noopener noreferrer">Info</a>` : ''}
                    </div>
                `;
            }).join('');
        } else {
            showNoEvents();
        }
    } catch (error) {
        console.log('Error loading events from Google Calendar:', error);
        showNoEvents();
    }
}

function showNoEvents() {
    const eventsList = document.getElementById('eventsList');
    const lang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'en';
    const message = translations[lang].no_events_message;
    eventsList.innerHTML = `<p class="no-events">${message}</p>`;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

// Enhanced Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            // Keep observing for repeating animations if needed
            // scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', () => {
    // Animate section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.classList.add('animate-on-scroll');
        scrollObserver.observe(title);
    });

    // Animate section subtitles
    const sectionSubtitles = document.querySelectorAll('.section-subtitle');
    sectionSubtitles.forEach(subtitle => {
        subtitle.classList.add('animate-on-scroll', 'stagger-delay-1');
        scrollObserver.observe(subtitle);
    });

    // Animate about content
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        aboutText.classList.add('animate-fade-in', 'stagger-delay-2');
        scrollObserver.observe(aboutText);
    }

    // Animate valovanja content
    const valovanjaText = document.querySelector('.valovanja-text');
    if (valovanjaText) {
        valovanjaText.classList.add('animate-fade-in', 'stagger-delay-2');
        scrollObserver.observe(valovanjaText);
    }

    // Animate contact intro
    const contactIntro = document.querySelector('.contact-intro');
    if (contactIntro) {
        contactIntro.classList.add('animate-fade-in', 'stagger-delay-1');
        scrollObserver.observe(contactIntro);
    }

    // Animate audio items with stagger
    const audioItems = document.querySelectorAll('.audio-item');
    audioItems.forEach((item, index) => {
        item.classList.add('animate-scale', `stagger-delay-${Math.min(index + 1, 5)}`);
        scrollObserver.observe(item);
    });

    // Animate video items with stagger
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach((item, index) => {
        item.classList.add('animate-scale', `stagger-delay-${Math.min(index + 1, 5)}`);
        scrollObserver.observe(item);
    });

    // Animate gallery items with stagger
    const galleryObserver = new MutationObserver(() => {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            if (!item.classList.contains('animate-scale')) {
                item.classList.add('animate-scale', `stagger-delay-${(index % 5) + 1}`);
                scrollObserver.observe(item);
            }
        });
    });

    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        galleryObserver.observe(galleryGrid, { childList: true });
    }

    // Animate event items
    const eventObserver = new MutationObserver(() => {
        const eventItems = document.querySelectorAll('.event-item');
        eventItems.forEach((item, index) => {
            if (!item.classList.contains('animate-slide-left')) {
                item.classList.add('animate-slide-left', `stagger-delay-${Math.min(index + 1, 5)}`);
                scrollObserver.observe(item);
            }
        });
    });

    const eventsList = document.getElementById('eventsList');
    if (eventsList) {
        eventObserver.observe(eventsList, { childList: true });
    }

    // Animate contact items
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
        item.classList.add('animate-on-scroll', `stagger-delay-${index + 2}`);
        scrollObserver.observe(item);
    });

});

// Set current year in footer
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

// Initialize gallery and events
document.addEventListener('DOMContentLoaded', () => {
    loadGalleryImages();
    loadEvents();
});

// Social Bar Loader - loads links from social.json
async function loadSocialBar() {
    const socialBar = document.getElementById('socialBar');
    if (!socialBar) return;

    try {
        const response = await fetch('/social.json');
        const data = await response.json();

        if (data.links && data.links.length > 0) {
            // Render social bar icons
            socialBar.innerHTML = data.links.map(link => {
                const isEmail = link.url.startsWith('mailto:');
                const attrs = isEmail
                    ? `href="${link.url}"`
                    : `href="${link.url}" target="_blank" rel="noopener noreferrer"`;
                return `<a ${attrs} aria-label="${link.label}"><i class="${link.icon}"></i></a>`;
            }).join('');

            // Populate contact section email link from social.json
            const contactEmail = document.getElementById('contactEmail');
            if (contactEmail) {
                const emailLink = data.links.find(link => link.url.startsWith('mailto:'));
                if (emailLink) {
                    const address = emailLink.url.replace('mailto:', '');
                    contactEmail.href = emailLink.url;
                    contactEmail.textContent = address;
                }
            }
        }
    } catch (error) {
        console.log('Error loading social.json:', error);
    }
}

// Initialize social bar
document.addEventListener('DOMContentLoaded', () => {
    loadSocialBar();
});

// Video Carousel - Dynamic from youtube.json
async function loadVideoCarousel() {
    const carousel = document.getElementById('videoCarousel');
    if (!carousel) return;

    try {
        const response = await fetch('/youtube.json');
        const data = await response.json();

        if (!data.videos || data.videos.length === 0) {
            carousel.innerHTML = '<p class="no-events">No videos available.</p>';
            return;
        }

        const videos = data.videos;

        // Build carousel HTML
        const slidesHTML = videos.map((video, index) => `
            <div class="carousel-slide">
                <div class="video-item">
                    <div class="video-wrapper">
                        <iframe data-src="https://www.youtube.com/embed/${video.id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" title="${video.title || 'Video ' + (index + 1)}" class="lazy-iframe"></iframe>
                    </div>
                </div>
            </div>
        `).join('');

        const dotsHTML = videos.map((_, index) => `
            <button class="carousel-dot${index === 0 ? ' active' : ''}" data-index="${index}" aria-label="Go to video ${index + 1}"></button>
        `).join('');

        carousel.innerHTML = `
            <button class="carousel-btn carousel-btn-prev" aria-label="Previous video">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="carousel-viewport">
                <div class="carousel-track">
                    ${slidesHTML}
                </div>
            </div>
            <button class="carousel-btn carousel-btn-next" aria-label="Next video">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div class="carousel-dots">
                ${dotsHTML}
            </div>
        `;

        // Initialize carousel functionality
        initCarousel(carousel, videos.length);
        
        // Initialize lazy loading for YouTube iframes
        initLazyIframes();

    } catch (error) {
        console.log('Error loading videos:', error);
        carousel.innerHTML = '<p class="no-events">No videos available.</p>';
    }
}

function initCarousel(carousel, totalSlides) {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-btn-prev');
    const nextBtn = carousel.querySelector('.carousel-btn-next');
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentIndex = index;
        const offset = -currentIndex * 100;
        track.style.transform = `translateX(${offset}%)`;
        currentTranslate = offset;
        prevTranslate = offset;

        // Update dots
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
        
        // Load current and adjacent slides' iframes
        const slides = track.querySelectorAll('.carousel-slide');
        [currentIndex - 1, currentIndex, currentIndex + 1].forEach(idx => {
            if (idx >= 0 && idx < totalSlides) {
                const iframe = slides[idx]?.querySelector('.lazy-iframe');
                if (iframe && iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                    iframe.classList.remove('lazy-iframe');
                }
            }
        });
    }

    // Button navigation
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            goToSlide(index);
        });
    });

    // Keyboard navigation
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
        if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });

    // Touch/swipe support
    const viewport = carousel.querySelector('.carousel-viewport');

    viewport.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        track.style.transition = 'none';
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        const viewportWidth = viewport.offsetWidth;
        const percentDiff = (diff / viewportWidth) * 100;
        currentTranslate = prevTranslate + percentDiff;
        track.style.transform = `translateX(${currentTranslate}%)`;
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        const diff = currentTranslate - prevTranslate;
        if (diff < -10) {
            goToSlide(currentIndex + 1);
        } else if (diff > 10) {
            goToSlide(currentIndex - 1);
        } else {
            goToSlide(currentIndex);
        }
    });
    
    // Load first video immediately
    const firstIframe = track.querySelector('.carousel-slide:first-child .lazy-iframe');
    if (firstIframe && firstIframe.dataset.src) {
        firstIframe.src = firstIframe.dataset.src;
        firstIframe.classList.remove('lazy-iframe');
    }
}

// Lazy load YouTube iframes when carousel slides become visible
function initLazyIframes() {
    const lazyIframes = document.querySelectorAll('.lazy-iframe');
    
    const iframeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                    iframe.classList.remove('lazy-iframe');
                }
                iframeObserver.unobserve(iframe);
            }
        });
    }, {
        rootMargin: '100px' // Start loading 100px before entering viewport
    });
    
    lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
}

// Initialize video carousel
document.addEventListener('DOMContentLoaded', () => {
    loadVideoCarousel();
});

// Section Video Background Configuration with Lazy Loading
function initSectionVideoBackgrounds() {
    const sections = document.querySelectorAll('section[data-video-bg]');
    
    sections.forEach(section => {
        const videoSrc = section.getAttribute('data-video-bg');
        const overlayOpacity = section.getAttribute('data-overlay-opacity') || '0.5';
        const video = section.querySelector('.section-video');
        const overlay = section.querySelector('.section-video-overlay');
        
        // Set overlay opacity
        if (overlay && overlayOpacity) {
            overlay.style.background = `rgba(0, 0, 0, ${overlayOpacity})`;
        }
        
        // Video error fallback - use solid background
        if (video) {
            video.addEventListener('error', () => {
                // If video fails to load, hide it and keep the section background
                video.style.display = 'none';
                if (overlay) {
                    overlay.style.background = 'transparent';
                }
            });
        }
    });
    
    // Lazy load section videos when they come into view
    const lazyVideos = document.querySelectorAll('video[data-lazy-video]');
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                if (video.readyState === 0) { // Not loaded yet
                    video.load();
                    video.addEventListener('loadeddata', () => {
                        video.play().catch(e => console.log('Video autoplay prevented:', e));
                    }, { once: true });
                }
                videoObserver.unobserve(video);
            }
        });
    }, {
        rootMargin: '200px' // Start loading 200px before entering viewport
    });
    
    lazyVideos.forEach(video => videoObserver.observe(video));
}

// Initialize section video backgrounds
document.addEventListener('DOMContentLoaded', () => {
    initSectionVideoBackgrounds();
});

// Video background fallback
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.hero-video');
    video.addEventListener('error', () => {
        // If video fails to load, add a fallback background
        const hero = document.querySelector('.hero');
        hero.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)';
    });
});

// Scroll Spy - Highlight active nav link based on visible section
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    const scrollPos = window.scrollY + window.innerHeight / 3;

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);
document.addEventListener('DOMContentLoaded', updateActiveNavLink);
