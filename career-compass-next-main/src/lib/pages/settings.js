import { supabase } from '../supabase';

export let currentUser = null;

export function setCurrentUser(user) {
    currentUser = user;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function loadProfile() {
    if (!currentUser) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Profile load error:', error);
        return null;
    }
    return profile;
}

export async function updateProfile(fields) {
    if (!currentUser) return { error: 'No user' };

    const { error } = await supabase.from('profiles').upsert({
        id: currentUser.id,
        ...fields,
        updated_at: new Date().toISOString()
    });

    return { error };
}

export async function uploadAvatar(file) {
    if (!currentUser) return { error: 'No user' };

    const fExt = file.name.split('.').pop();
    const fPath = `${currentUser.id}/${Date.now()}.${fExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fPath, file);

    if (uploadError) return { error: uploadError };

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fPath);
    const avatar_url = urlData.publicUrl;

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('id', currentUser.id);

    if (updateError) return { error: updateError };
    return { avatar_url };
}

// ─── Target Role ─────────────────────────────────────────────────────────────

export async function loadTargetRole() {
    if (!currentUser) return null;

    const { data: role, error } = await supabase
        .from('target_roles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

    if (error && error.code !== 'PGRST116') return null;
    return role;
}

export async function updateCareerTargets(roleName, description) {
    if (!currentUser) return { error: 'No user' };

    const { error } = await supabase.from('target_roles').upsert({
        user_id: currentUser.id,
        role_name: roleName,
        description
    }, { onConflict: 'user_id' });

    return { error };
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export async function loadSkills() {
    if (!currentUser) return [];

    const { data: skills, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', currentUser.id);

    if (error) return [];
    return skills || [];
}

export async function addSkill(skillName) {
    if (!currentUser) return { error: 'No user' };

    const { error } = await supabase.from('user_skills').insert({
        user_id: currentUser.id,
        skill_name: skillName
    });

    return { error };
}

export async function removeSkill(skillId) {
    const { error } = await supabase.from('user_skills').delete().eq('id', skillId);
    return { error };
}

// ─── Notification Preferences ─────────────────────────────────────────────────

export async function loadNotificationPrefs() {
    if (!currentUser) return null;

    const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

    if (error && error.code !== 'PGRST116') return null;
    return data;
}

export async function updateNotificationPrefs(prefs) {
    if (!currentUser) return { error: 'No user' };

    const { error } = await supabase.from('notification_preferences').upsert({
        user_id: currentUser.id,
        ...prefs,
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    return { error };
}

// ─── Career Analysis Results ───────────────────────────────────────────────────

export async function loadLatestCareerAnalysis() {
    if (!currentUser) return null;

    const { data } = await supabase
        .from('career_analysis')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return data || null;
}

export async function loadLatestPathAnalysis() {
    if (!currentUser) return null;

    const { data: latest } = await supabase
        .from('analyses')
        .select('id, match_percentage, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return latest || null;
}

// ─── Security ─────────────────────────────────────────────────────────────────

export async function requestPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password',
    });
    return { error };
}