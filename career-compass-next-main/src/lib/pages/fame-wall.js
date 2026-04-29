// lib/pages/fame-wall.js

import { supabase } from '../supabase';
import {Linkedin}  from 'lucide-react'

export function setupMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.onclick = () => mobileMenu.classList.toggle('hidden');
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

    // Initial observe for static elements
    document.querySelectorAll('.reveal, .fade-in').forEach(el => observer.observe(el));
    
    return observer;
}

// Helper: Get Start of Week Date String
export function getWeekLabel(dateString) {
    const date = new Date(dateString);
    // Adjust to get the Sunday of that week
    const day = date.getDay();
    const diff = date.getDate() - day;
    const startOfWeek = new Date(date.setDate(diff));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    const year = startOfWeek.getFullYear();
    
    return `Week of ${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}, ${year}`;
}

// Main Logic: Load Wall
export async function loadFullWall() {
    const container = document.getElementById('wall-container');
    if (!container) return;
    
    try {
        // Fetch all records sorted by newest first
        const { data: records, error } = await supabase
            .from('wall_of_fame')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!records || records.length === 0) {
            container.innerHTML = `<div class="text-center py-20 text-slate-500">The wall is currently empty. Greatness takes time!</div>`;
            return;
        }

        // Group by Week
        const grouped = {};
        records.forEach(item => {
            const weekLabel = getWeekLabel(item.created_at);
            if (!grouped[weekLabel]) grouped[weekLabel] = [];
            grouped[weekLabel].push(item);
        });

        // Clear loading state
        container.innerHTML = '';

        // Render Sections
        Object.keys(grouped).forEach((week, index) => {
            const candidates = grouped[week];
            
            // Create Section Wrapper
            const section = document.createElement('div');
            section.className = 'reveal';
            
            // Header for the Week
            section.innerHTML = `
                <div class="week-line ">
                    <h2 class="text-2xl md:text-3xl font-heading font-bold text-black flex items-center gap-3">
                        <span class="bg-primary/20 text-primary w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black border border-primary/30">#${Object.keys(grouped).length - index}</span>
                        ${week}
                    </h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    ${candidates.map(c => `
                        <div class="achiever-card group">
                            <img src="${c.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80'}" class="achiever-img" alt="${c.name}">
                            <div class="achiever-overlay">
                                <h4 class="text-xl font-heading font-bold text-white">${c.name}</h4>
                                <p class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">${c.role_track}</p>
                                
                                <div class="achiever-details">
                                    <p class="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">${c.project_description || 'Outstanding contribution to the community.'}</p>
                                    <div class="flex items-center gap-2">
                                        ${c.project_link ? `<a href="${c.project_link}" target="_blank" rel="noopener noreferrer" class="flex-1 items-center py-2 bg-white text-slate-900 text-center rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition">Project</a>` : ''}
                                        ${c.linkedin_url ? `<a href="${c.linkedin_url}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 flex items-center justify-center bg-white/10 text-white rounded-lg hover:bg-[#0077b5] transition"><Linkedin class="w-4 h-4"/></a>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(section);
        });

        // Re-init Icons and Observer for new elements
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
        
        const observer = setupAnimations();
        document.querySelectorAll('#wall-container .reveal').forEach(el => observer.observe(el));

    } catch (err) {
        console.error("Error loading wall:", err);
        container.innerHTML = `<div class="text-center text-red-400">Failed to load the wall. Please try again later.</div>`;
    }
}

// Hiring Form Submission
export async function handleHiringFormSubmit(event) {
    event.preventDefault();
    
    const formMsg = document.getElementById('form-msg');
    if (!formMsg) return;

    formMsg.classList.remove('hidden');
    formMsg.textContent = "Processing talent request...";
    formMsg.className = "block p-4 rounded-xl text-sm font-bold bg-indigo-900/50 text-indigo-300 animate-pulse mt-4 border border-indigo-800";
    
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData);

    try {
        const { error } = await supabase.from('hiring_inquiries').insert([payload]);
        if (error) throw error;
        
        formMsg.textContent = "Success! Our talent team will contact you shortly.";
        formMsg.className = "block p-4 rounded-xl text-sm font-bold bg-green-900/50 text-green-400 mt-4 animate-none border border-green-800";
        event.target.reset();
    } catch (err) {
        console.error('Form submission error:', err);
        formMsg.textContent = "Submission failed. Please check connection.";
        formMsg.className = "block p-4 rounded-xl text-sm font-bold bg-red-900/50 text-red-400 mt-4 animate-none border border-red-800";
    }
}

export function initFameWallPage() {
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

    // Load wall content
    loadFullWall();

    // Setup hiring form
    const hiringForm = document.getElementById('talent-request-form');
    if (hiringForm) {
        hiringForm.addEventListener('submit', handleHiringFormSubmit);
    }
}