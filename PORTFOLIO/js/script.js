document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        this.classList.add('active');

        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

const revealOptions = {
    root: null,
    threshold: new Array(11).fill(0).map((_, i) => i / 10),
    rootMargin: '-10%'
};

const revealSection = (entries, observer) => {
    entries.forEach(entry => {
        const section = entry.target;
        const sectionContent = Array.from(section.children);

        const opacity = Math.min(entry.intersectionRatio * 1.5, 1);
        const translateY = 50 * (1 - entry.intersectionRatio);

        sectionContent.forEach((element, index) => {
            const delay = index * 100;
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = opacity;
            element.style.transform = `translateY(${translateY}px)`;
        });

        if (entry.intersectionRatio > 0.5) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('section') === section.id) {
                    link.classList.add('active');
                }
            });
        }
    });
};

const sectionObserver = new IntersectionObserver(revealSection, revealOptions);

sections.forEach(section => {
    if (!section.classList.contains('hero')) {
        Array.from(section.children).forEach(child => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(50px)';
        });
    }
    sectionObserver.observe(section);
});

let ticking = false;
let lastScrollY = window.pageYOffset;

const updateParallax = () => {
    const scrolled = window.pageYOffset;
    const scrollDirection = scrolled > lastScrollY ? 'down' : 'up';

    requestAnimationFrame(() => {
        const background = document.querySelector('.background');
        const grid = document.querySelector('.grid');

        const parallaxY = scrolled * 0.05;
        const gridY = scrolled * 0.03;

        background.style.transform = `translateZ(-10px) scale(2) translateY(${parallaxY}px)`;
        grid.style.transform = `translateZ(-5px) scale(1.5) translateY(${gridY}px)`;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const sectionCenter = rect.top + rect.height / 2;
            const viewportCenter = viewportHeight / 2;
            const distance = Math.abs(sectionCenter - viewportCenter);
            const maxDistance = viewportHeight;

            const parallaxFactor = Math.max(0, 1 - distance / maxDistance);

            const content = section.querySelector('.section-content');
            if (content && !section.classList.contains('hero')) {
                const translateY = (scrollDirection === 'down' ? 30 : -30) * (1 - parallaxFactor);
                const scale = 0.95 + (0.05 * parallaxFactor);
                const opacity = 0.3 + (0.7 * parallaxFactor);

                content.style.transform = `translateY(${translateY}px) scale(${scale})`;
                content.style.opacity = opacity;
            }
        });

        lastScrollY = scrolled;
        ticking = false;
    });
};

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateParallax();
            ticking = false;
        });
        ticking = true;
    }

    const nav = document.querySelector('nav');
    if (window.pageYOffset > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

const cardOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            const card = entry.target;
            const delay = index * 100;

            card.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
            card.style.transform = 'translateY(0) scale(1)';
            card.style.opacity = '1';
        }
    });
}, cardOptions);

document.querySelectorAll('.project-card, .skill-card').forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) scale(0.95)';
    cardObserver.observe(card);
});

const updateScrollAnimations = () => {
    requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;

            const visiblePercent = Math.max(0, Math.min(1,
                (windowHeight - sectionTop) / (windowHeight + sectionHeight)
            ));

            if (!section.classList.contains('hero')) {
                const content = section.querySelector('.section-content');
                if (content) {
                    content.style.transform = `translateY(${20 * (1 - visiblePercent)}px)`;
                    content.style.opacity = visiblePercent;
                }
            }
        });
    });
};

const style = document.createElement('style');
style.textContent = `
    .section {
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .section-content {
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .skill-card, .project-card {
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.3s ease;
    }
`;
document.head.appendChild(style);

updateScrollAnimations();
window.addEventListener('scroll', updateScrollAnimations);
window.addEventListener('resize', updateScrollAnimations);

document.getElementById('contactForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const responseModal = document.getElementById('responseModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeButton = document.querySelector('.close-button');

    function showModal(message) {
        modalMessage.textContent = message;
        responseModal.classList.add('show');
    }

    function hideModal() {
        responseModal.classList.remove('show');
    }

    closeButton.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => {
        if (event.target === responseModal) {
            hideModal();
        }
    });

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            showModal('Thank you for your message! I will get back to you soon.');
            form.reset();
        } else {
            const data = await response.json();
            if (Object.hasOwnProperty.call(data, 'errors')) {
                showModal(data["errors"].map(error => error["message"]).join(", "));
            } else {
                showModal('Oops! There was a problem submitting your form.');
            }
        }
    } catch (error) {
        showModal('Oops! There was a problem submitting your form: ' + error.message);
    }
});

const currentYear = new Date().getFullYear();

const yearSpan = document.getElementById('current-year');
if (yearSpan) {
    yearSpan.textContent = currentYear;
}