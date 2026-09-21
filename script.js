// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for reveal animations
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

// Observe content blocks for staggered reveals
document.querySelectorAll(
    '.platform-slab, .platform-step, .service-card, .cert-badge, .highlight, .sovereignty-feature-group, .section-header, .sovereignty-header, .about-text, .contact-info'
).forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});


// Platform layer active-state scrollytelling
const platformSystem = document.querySelector('.platform-system');
if (platformSystem) {
    platformSystem.classList.add('has-js');
}

const platformSteps = document.querySelectorAll('.platform-step');
const platformSlabs = document.querySelectorAll('.platform-slab');

if (platformSteps.length && platformSlabs.length) {
    const setActiveLayer = (targetStep) => {
        const layer = targetStep.dataset.layer;
        platformSteps.forEach(step => step.classList.toggle('is-active', step === targetStep));
        platformSlabs.forEach(slab => slab.classList.toggle('is-active', slab.dataset.layer === layer));
    };

    const activeObserver = new IntersectionObserver((entries) => {
        const intersecting = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
        if (intersecting.length === 0) return;

        const viewportCenter = window.innerHeight / 2;
        let closestStep = intersecting[0];
        let closestDistance = Infinity;

        intersecting.forEach(step => {
            const rect = step.getBoundingClientRect();
            const stepCenter = rect.top + rect.height / 2;
            const distance = Math.abs(stepCenter - viewportCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestStep = step;
            }
        });

        setActiveLayer(closestStep);
    }, {
        threshold: 0,
        rootMargin: '-42% 0px -42% 0px'
    });

    platformSteps.forEach(step => activeObserver.observe(step));
}

// Mobile hamburger menu toggle
const hamburger = document.getElementById('navHamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close menu when any link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });
}
