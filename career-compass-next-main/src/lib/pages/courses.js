// lib/pages/courses.js

import { supabase } from '../supabase';

export async function init() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    try {
        const { data: courses, error } = await supabase.from('courses').select('*').order('category', { ascending: true });

        if (error || !courses || !courses.length) {
            grid.innerHTML = `<div class="col-span-full py-20 text-center text-slate-400 font-bold">New learning paths are currently being co-created. Stay tuned!</div>`;
            return;
        }

        renderCourses(courses);
        renderFilters(courses);
        setupAnimations();
        setupAuthUI();
    } catch (err) {
        console.error(err);
        grid.innerHTML = `<div class="col-span-full py-20 text-center text-red-400 font-bold">Failed to load courses. Please try again later.</div>`;
    }
}

async function setupAuthUI() {
    const { data: { session } } = await supabase.auth.getSession();
    updateAllAuthUI(session);

    supabase.auth.onAuthStateChange((_event, session) => {
        updateAllAuthUI(session);
    });
}

function updateAllAuthUI(session) {
    const navLoginBtn = document.getElementById('nav-login-btn');
    const navProfileBtn = document.getElementById('nav-profile-btn');
    const mobileLoginLink = document.getElementById('mobile-login-link');
    const mobileProfileLink = document.getElementById('mobile-profile-link');
    const footerAuth = document.getElementById('footer-auth');
    const userName = document.getElementById('footer-user-name');
    const userEmail = document.getElementById('footer-user-email');

    if (session?.user) {
        if (navLoginBtn) navLoginBtn.classList.add('hidden');
        if (navProfileBtn) navProfileBtn.classList.remove('hidden');
        if (mobileLoginLink) mobileLoginLink.classList.add('hidden');
        if (mobileProfileLink) mobileProfileLink.classList.remove('hidden');
        if (footerAuth) footerAuth.classList.remove('hidden');
        if (userName) userName.textContent = session.user.user_metadata?.full_name || 'Welcome Back';
        if (userEmail) userEmail.textContent = session.user.email;
    } else {
        if (navLoginBtn) navLoginBtn.classList.remove('hidden');
        if (navProfileBtn) navProfileBtn.classList.add('hidden');
        if (mobileLoginLink) mobileLoginLink.classList.remove('hidden');
        if (mobileProfileLink) mobileProfileLink.classList.add('hidden');
        if (footerAuth) footerAuth.classList.add('hidden');
    }
}

export function handleLogoutFooter() {
    supabase.auth.signOut().then(() => {
        window.location.reload();
    });
}

function renderCourses(courses) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    grid.innerHTML = courses.map(course => {
        const bg = course.image_visual || course.color || 'linear-gradient(135deg, #e8f5e9, #a5d6a7)';
        const imgHtml = course.image_url
            ? `<img src="${course.image_url}" style="width:100%;height:100%;object-fit:cover;" alt="${course.title}">`
            : `<span style="font-size:48px;">${course.image_text || '📚'}</span>`;

        const detailUrl = `/courses/${course.id}`;
        const syllabusUrl = course.syllabus_pdf || detailUrl;
        const syllabusTarget = course.syllabus_pdf ? ' target="_blank" rel="noopener noreferrer"' : '';

        const actionsHtml = course.is_live
            ? `<a href="${syllabusUrl}" class="co-card__syllabus"${syllabusTarget} onclick="event.stopPropagation()">Syllabus</a>
               <a href="${detailUrl}" class="co-card__know" onclick="event.stopPropagation()">Know More</a>`
            : `<span class="co-card__syllabus" style="cursor:not-allowed;opacity:0.5;">Syllabus</span>
               <span class="co-card__know" style="cursor:not-allowed;background:#aaa;border-color:#aaa;">Coming Soon</span>`;

        return `
        <div class="co-card" data-category="${course.category}" style="cursor:pointer;" onclick="window.location.href='${detailUrl}'">
            <div class="co-card__img" style="background:${bg};">
                ${imgHtml}
            </div>
            <div class="co-card__body">
                <div class="co-card__meta">
                    <span class="co-card__badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        ${course.language || 'English & Hindi'}
                    </span>
                </div>
                <h3>${course.title}</h3>
                <div class="co-card__actions">
                    ${actionsHtml}
                </div>
            </div>
        </div>`;
    }).join('');
}

function renderFilters(courses) {
    const categories = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];
    const filterContainer = document.getElementById('category-filters');
    if (!filterContainer) return;

    filterContainer.innerHTML = categories.map(cat => `
        <button onclick="window.filterCourses && window.filterCourses('${cat}')"
                class="cat-filter-btn${cat === 'All' ? ' active' : ''}">
            ${cat}
        </button>
    `).join('');
}

export function filterCourses(category) {
    // Update active button
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim() === category);
    });
    // Show/hide cards
    document.querySelectorAll('.co-card').forEach(card => {
        if (category === 'All' || card.dataset.category === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

export function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const menuOverlay = document.getElementById('mobile-menu');
    if (toggleBtn && menuOverlay) {
        toggleBtn.onclick = () => menuOverlay.classList.toggle('hidden');
    }
}

export function initCourses() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupMobileMenu();
            init();
        });
    } else {
        setupMobileMenu();
        init();
    }

    const logoutBtn = document.getElementById('logout-btn-footer');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogoutFooter);
    }

    if (typeof window !== 'undefined') {
        window.filterCourses = filterCourses;
    }
}