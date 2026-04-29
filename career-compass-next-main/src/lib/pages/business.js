import { supabase } from '../supabase';

// Particle Canvas Animation
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
      if (e.target.closest('a')) {
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

// Form Submission
export async function handleBusinessFormSubmit(e) {
  e.preventDefault();
  
  const msg = document.getElementById('form-message');
  if (!msg) return;
  
  msg.classList.remove('hidden');
  msg.textContent = "Processing Partnership Request...";
  msg.className = "block p-4 rounded-xl text-sm font-bold bg-blue-50 text-primary animate-pulse mt-4";
  
  const formData = new FormData(e.target);
  const payload = {
    company_name: formData.get('company_name'),
    inquiry_type: formData.get('inquiry_type'),
    contact_name: formData.get('name'),
    contact_email: formData.get('email')
  };
  
  try {
    const { error } = await supabase.from('business_inquiries').insert([payload]);
    
    if (error) throw error;
    
    msg.textContent = "Success! Our partnership team will contact you within 24 hours.";
    msg.className = "block p-4 rounded-xl text-sm font-bold bg-green-50 text-green-600 mt-4";
    e.target.reset();
  } catch (err) {
    console.error(err);
    msg.textContent = "Submission failed. Please check your connection and try again.";
    msg.className = "block p-4 rounded-xl text-sm font-bold bg-red-50 text-red-600 mt-4";
  }
}

// Set Inquiry Type
export function setInquiryType(type) {
  const bizType = document.getElementById('biz-type');
  if (bizType) {
    bizType.value = type;
  }
  scrollToSection('biz-name-label');
}

// Initialize All
export function initBusinessPage() {
  if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
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
    
    // Expose functions to window for inline handlers
    window.scrollToSection = scrollToSection;
    window.setInquiryType = setInquiryType;
  }
}