// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add mobile menu toggle
const mobileMenuButton = document.createElement('button');
mobileMenuButton.classList.add('mobile-menu-button');
mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';

mobileMenuButton.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

document.querySelector('.main-nav').prepend(mobileMenuButton);

// Scroll reveal for diagram
document.addEventListener('DOMContentLoaded', function() {
    const diagram = document.querySelector('.hero-diagram');
    
    function revealOnScroll() {
        const diagramTop = diagram.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (diagramTop < windowHeight * 0.75) {
            diagram.classList.add('visible');
            window.removeEventListener('scroll', revealOnScroll);
        }
    }
    
    window.addEventListener('scroll', revealOnScroll);
    // Check initial position
    revealOnScroll();
});

// Get all demo buttons
const demoButtons = document.querySelectorAll('a[href="#demo"]');
const modal = document.getElementById('demoModal');

// Add click event to all demo buttons
demoButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
});

// Open modal function
function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close modal function
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Handle form submission
function handleDemoSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        phone: document.getElementById('phone').value
    };

    // Here you would typically send this data to your backend
    console.log('Demo requested:', formData);
    
    // Show success message
    const form = document.getElementById('demoForm');
    form.innerHTML = `
        <div class="success-message">
            <h3>Thank you for your interest!</h3>
            <p>We'll be in touch with you shortly to schedule your demo.</p>
        </div>
    `;
    
    // Close modal after 3 seconds
    setTimeout(closeModal, 3000);
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Add these functions to your existing script.js
function playFullVideo() {
    const videoModal = document.getElementById('videoModal');
    const fullVideo = document.getElementById('fullVideo');
    
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    fullVideo.play();
}

function closeVideoModal() {
    const videoModal = document.getElementById('videoModal');
    const fullVideo = document.getElementById('fullVideo');
    
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    fullVideo.pause();
    fullVideo.currentTime = 0;
}

// Close video modal when clicking outside
document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target.classList.contains('video-modal')) {
        closeVideoModal();
    }
});

// Close video modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('videoModal').classList.contains('active')) {
        closeVideoModal();
    }
});

// Optional: Pause background video when it's out of view
const heroVideo = document.getElementById('heroVideo');
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroVideo.play();
            } else {
                heroVideo.pause();
            }
        });
    },
    { threshold: 0.2 }
);
observer.observe(heroVideo);