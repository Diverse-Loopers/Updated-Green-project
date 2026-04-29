// lib/pages/business.js

import { supabase } from '../supabase';

export function setupMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

export function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

export function setupHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero-section');
    let pts = [];

    function resize() {
        if (!heroSection) return;
        canvas.width = window.innerWidth;
        canvas.height = heroSection.offsetHeight;
    }

    function create() {
        pts = [];
        for (let i = 0; i < 40; i++) {
            pts.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                s: Math.random() * 2
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3b82f6';
        pts.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        resize();
        create();
    });

    resize();
    create();
    draw();
}

export async function handleUniversityFormSubmit(event) {
    event.preventDefault();

    const messageEl = document.getElementById('uni-message');
    if (!messageEl) return;

    messageEl.classList.remove('hidden');
    messageEl.textContent = "Processing Inquiry...";
    messageEl.className = "block p-4 rounded-xl text-sm font-bold bg-blue-50 text-primary animate-pulse mt-4";

    const formData = new FormData(event.target);
    const data = {
        university_name: formData.get('university_name'),
        contact_person_name: formData.get('contact_person'),
        designation: formData.get('designation'),
        email_id: formData.get('email'),
        contact_number: formData.get('phone'),
        message: formData.get('message'),
    };

    try {
        const { error } = await supabase.from('university_contacts').insert([data]);
        if (error) throw error;

        messageEl.textContent = "Success! We have received your inquiry.";
        messageEl.className = "block p-4 rounded-xl text-sm font-bold bg-green-50 text-green-600 mt-4";
        event.target.reset();
    } catch (err) {
        console.error('Form submission error:', err);
        messageEl.textContent = "Submission failed. Please try again.";
        messageEl.className = "block p-4 rounded-xl text-sm font-bold bg-red-50 text-red-600 mt-4";
    }
}

export function initBusinessPage() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageCore);
    } else {
        initPageCore();
    }
}

function initPageCore() {
    // Initialize Lucide icons
    if (typeof window !== 'undefined' && window.lucide) {
        window.lucide.createIcons();
    }

    // Setup mobile menu
    setupMobileMenu();

    // Setup animations
    setupAnimations();

    // Setup hero canvas
    setupHeroCanvas();

    // Setup form submission
    const uniForm = document.getElementById('uni-contact-form');
    if (uniForm) {
        uniForm.addEventListener('submit', handleUniversityFormSubmit);
    }
}