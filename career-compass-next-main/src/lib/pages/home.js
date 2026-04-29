import { supabase } from '../supabase';

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
export function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    
    mobileMenu.addEventListener('click', (e) => {
      const target = e.target.closest('a') || e.target.closest('button');
      if (target) {
        mobileMenu.classList.add('hidden');
      }
    });
  }
}

// ==========================================
// AUTH STATE MANAGEMENT
// ==========================================
export async function updateUIForAuth(session) {
  const user = session?.user;
  const loginBtns = [document.getElementById('login-btn'), document.getElementById('mobile-login-btn')];
  const profileBtns = [document.getElementById('profile-btn'), document.getElementById('mobile-profile-btn')];
  const footerAuth = document.getElementById('footer-auth');
  const footerName = document.getElementById('footer-user-name');

  if (user) {
    loginBtns.forEach(btn => btn?.classList.add('hidden'));
    profileBtns.forEach(btn => btn?.classList.remove('hidden'));
    if (footerAuth) footerAuth.classList.remove('hidden');
    if (footerName) footerName.textContent = user.user_metadata?.full_name || 'Welcome Back';
  } else {
    loginBtns.forEach(btn => btn?.classList.remove('hidden'));
    profileBtns.forEach(btn => btn?.classList.add('hidden'));
    if (footerAuth) footerAuth.classList.add('hidden');
  }
}

export function initAuthListeners() {
  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.reload();
  });

  // Auth state change listener
  supabase.auth.onAuthStateChange((_event, session) => updateUIForAuth(session));
  
  // Initial auth check
  supabase.auth.getSession().then(({ data }) => updateUIForAuth(data.session));
}

// ==========================================
// HYBRID HUSTLER FORM HANDLER
// ==========================================
export function initHustlerForm() {
  const hustlerForm = document.getElementById('hustler-form');
  const hustlerMessage = document.getElementById('hustler-message');

  if (!hustlerForm) return;

  hustlerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    hustlerMessage.classList.add('hidden');

    if (!e.target.checkValidity()) {
      hustlerMessage.textContent = 'Please fill out all required fields correctly.';
      hustlerMessage.style.color = '#ef4444';
      hustlerMessage.classList.remove('hidden');
      return;
    }

    const formData = new FormData(hustlerForm);
    const data = {
      full_name: formData.get('name'),
      college_name: formData.get('college'),
      email_id: formData.get('email'),
      contact_number: formData.get('contact'),
      core_technology: formData.get('tech'),
      course_year: formData.get('year'),
      semester: parseInt(formData.get('semester'), 10),
      roll_no: formData.get('roll'),
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      data.user_id = user.id;
    }

    try {
      hustlerMessage.textContent = 'Registering...';
      hustlerMessage.style.color = '#2563eb';
      hustlerMessage.classList.remove('hidden');

      const { error } = await supabase
        .from('hybrid_hustler_registrations')
        .insert([data]);

      if (error) {
        console.error('Supabase Insert Error:', error);
        if (error.code === '23505' && error.details?.includes('email_id')) {
          hustlerMessage.textContent = 'Registration failed: This email address is already registered.';
        } else {
          hustlerMessage.textContent = `Registration failed: An error occurred.`;
        }
        hustlerMessage.style.color = '#ef4444';
      } else {
        const firstName = data.full_name.split(' ')[0];
        hustlerMessage.textContent = `Success! Thank you, ${firstName}! Your registration has been saved.`;
        hustlerMessage.style.color = '#2563eb';
        hustlerForm.reset();
      }
    } catch (e) {
      console.error('Unexpected Registration Error:', e);
      hustlerMessage.textContent = 'An unexpected network error occurred.';
      hustlerMessage.style.color = '#ef4444';
    }
  });
}

// ==========================================
// CONTACT FORM HANDLER
// ==========================================
export function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('contact-status');
    const data = {
      full_name: document.getElementById('name').value,
      email_id: document.getElementById('email').value,
      message_content: document.getElementById('message').value
    };

    status.textContent = "Sending...";
    status.className = "text-center text-sm font-medium text-primary block";

    const { error } = await supabase.from('contact_inquiries').insert([data]);

    if (error) {
      status.textContent = "Failed to send message.";
      status.classList.add('text-red-500');
    } else {
      status.textContent = "Message sent successfully!";
      status.classList.replace('text-primary', 'text-green-500');
      e.target.reset();
    }
  });
}

// ==========================================
// EVENTS CAROUSEL
// ==========================================
export async function loadEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error || !events.length) {
    grid.innerHTML = `<p class="text-slate-400 p-8 w-full text-center">No upcoming events found.</p>`;
    return;
  }

  grid.innerHTML = events.map(event => `
    <div class="w-[350px] bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden group flex-shrink-0">
      <div class="h-48 bg-slate-200 relative overflow-hidden">
        <img src="${event.main_media_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80'}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
        <div class="absolute top-4 left-4 py-1 px-3 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-primary uppercase tracking-tighter">
          ${new Date(event.date) < new Date() ? 'Past' : 'Upcoming'}
        </div>
      </div>
      <div class="p-6">
        <div class="text-xs font-bold text-primary mb-2">${new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <h4 class="text-lg font-bold text-slate-900 mb-3 line-clamp-1">${event.title}</h4>
        <p class="text-xs text-slate-500 mb-6 line-clamp-2">${event.description}</p>
        <a href="/events?id=${event.id}" class="block w-full py-3 text-center bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-primary hover:text-white hover:border-primary transition">View Details</a>
      </div>
    </div>
  `).join('');
}

export function initEventsCarousel() {
  const container = document.getElementById('events-grid-container');
  const scrollRightBtn = document.getElementById('scroll-right-btn');
  const scrollLeftBtn = document.getElementById('scroll-left-btn');

  if (scrollRightBtn) {
    scrollRightBtn.onclick = () => container?.scrollBy({ left: 380, behavior: 'smooth' });
  }
  if (scrollLeftBtn) {
    scrollLeftBtn.onclick = () => container?.scrollBy({ left: -380, behavior: 'smooth' });
  }
}

// ==========================================
// ANIMATIONS
// ==========================================
export function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ==========================================
// HERO CANVAS PARTICLES
// ==========================================
export function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let pts = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = 800;
  }

  function create() {
    pts = []; // Reset particles
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

  window.addEventListener('resize', resize);
  resize();
  create();
  draw();
}

// ==========================================
// MAIN INITIALIZATION FUNCTION
// ==========================================
export function initHomePage() {
  initMobileMenu();
  // Auth nav is now handled by the NavAuthButtons React component (no DOM manipulation needed)
  initHustlerForm();
  initContactForm();
  loadEvents();
  initEventsCarousel();
  initAnimations();
  initHeroCanvas();
}