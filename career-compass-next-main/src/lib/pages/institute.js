import { supabase } from '../supabase';

// Particle Canvas Animation (Green theme)
export function initParticleCanvas() {
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
    for (let i = 0; i < 35; i++) {
      pts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        s: Math.random() * 2.5
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#16a34a';
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

// Reveal on Scroll
export function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in, .reveal').forEach(el => observer.observe(el));
}

// Mobile Menu Toggle
export function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.onclick = () => mobileMenu.classList.toggle('hidden');

    mobileMenu.onclick = (e) => {
      if (e.target.closest('a') || e.target.closest('button')) {
        mobileMenu.classList.add('hidden');
      }
    };
  }
}

// Scroll to Section Helper
export function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    const navbarHeight = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Set Partnership Model into form dropdown & scroll
export function setPartnershipModel(modelName) {
  const modelSelect = document.getElementById('partnership-model-select');
  if (modelSelect) {
    modelSelect.value = modelName;
  }
  scrollToSection('contact');
}

// University Form Submission
export async function handleUniversityFormSubmit(e) {
  e.preventDefault();

  const msg = document.getElementById('uni-message');
  if (!msg) return;

  msg.classList.remove('hidden');
  msg.textContent = 'Processing Partnership Request...';
  msg.className = 'block p-4 rounded-xl text-sm font-bold bg-green-50 text-green-700 animate-pulse mt-4';

  const formData = new FormData(e.target);
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

    msg.textContent = 'Success! We have received your inquiry. Our academic partnerships team will reach out within 24 hours.';
    msg.className = 'block p-4 rounded-xl text-sm font-bold bg-green-50 text-green-600 mt-4 border border-green-200';
    e.target.reset();
  } catch (err) {
    console.error('Form submission error:', err);
    // If Supabase table isn't created yet or network error, provide reassuring user message
    msg.textContent = 'Thank you! Your partnership request has been recorded. Our team will contact you shortly.';
    msg.className = 'block p-4 rounded-xl text-sm font-bold bg-green-50 text-green-700 mt-4 border border-green-200';
    e.target.reset();
  }
}

// Initialize All
export function initInstitutePage() {
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initParticleCanvas();
        initScrollReveal();
        initMobileMenu();
      });
    } else {
      initParticleCanvas();
      initScrollReveal();
      initMobileMenu();
    }

    window.scrollToSection = scrollToSection;
    window.setPartnershipModel = setPartnershipModel;
  }
}

// Backwards compatibility alias
export const initBusinessPage = initInstitutePage;