import { supabase } from '../supabase';

export function getIconForEvent(title) {
    const t = title.toLowerCase();
    if(t.includes('game')) return 'gamepad-2';
    if(t.includes('ai') || t.includes('ml')) return 'brain-circuit';
    if(t.includes('web') || t.includes('code')) return 'code';
    if(t.includes('ar') || t.includes('vr')) return 'box';
    if(t.includes('career') || t.includes('webinar')) return 'compass';
    return 'calendar';
}

export async function loadAchievers() {
    try {
        const { data: achievers, error } = await supabase
            .from('wall_of_fame')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error loading achievers:', error);
            return { success: false, error };
        }

        if (!achievers || achievers.length === 0) {
            return { success: true, achievers: [] };
        }

        return { success: true, achievers };

    } catch (err) {
        console.error('Exception loading achievers:', err);
        return { success: false, error: err };
    }
}

export async function loadEvents() {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            console.error('Error loading events:', error);
            return { success: false, error };
        }

        if (!events || events.length === 0) {
            return { success: true, events: [] };
        }

        return { success: true, events };

    } catch (err) {
        console.error('Exception loading events:', err);
        return { success: false, error: err };
    }
}

export async function submitHiringInquiry(formData) {
    try {
        const { error } = await supabase
            .from('hiring_inquiries')
            .insert([formData]);

        if (error) {
            console.error('Error submitting inquiry:', error);
            return { success: false, error };
        }

        return { success: true };

    } catch (err) {
        console.error('Exception submitting inquiry:', err);
        return { success: false, error: err };
    }
}

export function initializeIntersectionObserver() {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); 
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in, .reveal').forEach(el => observer.observe(el));
    
    return observer;
}