'use client';

import { useState, useEffect, useCallback } from 'react';
import './settings.css';
import { supabase } from '@/lib/supabase';
import {
    setCurrentUser,
    loadProfile,
    updateProfile,
    uploadAvatar,
    loadTargetRole,
    updateCareerTargets,
    loadSkills,
    addSkill,
    removeSkill as removeSkillFromDB,
    loadNotificationPrefs,
    updateNotificationPrefs,
    loadLatestCareerAnalysis,
    loadLatestPathAnalysis,
    requestPasswordReset,
} from '@/lib/pages/settings';

import {
    ChevronLeft, Sun, Moon,
    User, Camera, Save, Phone, MapPin, FileText,
    GraduationCap, BookOpen, Hash, Calendar,
    Shield, Lock, Eye, EyeOff,
    Bell, Mail, MessageSquare, AlarmClock, Megaphone,
    Target, Award, Github, ExternalLink, X, Plus,
    CheckCircle, AlertCircle, TrendingUp, Route,
} from 'lucide-react';

const TABS = [
    { key: 'profile',       label: 'Profile',               icon: User },
    { key: 'academic',      label: 'Academic',              icon: GraduationCap },
    { key: 'security',      label: 'Security',              icon: Shield },
    { key: 'notifications', label: 'Notifications',         icon: Bell },
    { key: 'career',        label: 'Career & Skills',       icon: Target },
];

const CAREER_NAMES = {
    backend: 'Backend Developer',
    fullstack: 'Full Stack Developer',
    data: 'Data Analyst',
    cybersecurity: 'Cybersecurity Analyst',
    qa: 'QA Automation Engineer',
};

export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [isDark, setIsDark] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);

    // ── Profile ──────────────────────────────────────────────────────────────
    const [fullName,   setFullName]   = useState('');
    const [email,      setEmail]      = useState('');
    const [phone,      setPhone]      = useState('');
    const [address,    setAddress]    = useState('');
    const [bio,        setBio]        = useState('');
    const [avatarUrl,  setAvatarUrl]  = useState('');

    // ── Academic ─────────────────────────────────────────────────────────────
    const [course,      setCourse]      = useState('');
    const [branch,      setBranch]      = useState('');
    const [college,     setCollege]     = useState('');
    const [university,  setUniversity]  = useState('');
    const [rollNumber,  setRollNumber]  = useState('');
    const [semester,    setSemester]    = useState('');
    const [subjects,    setSubjects]    = useState('');

    // ── Security ─────────────────────────────────────────────────────────────
    const [privacyPublic, setPrivacyPublic] = useState(false);

    // ── Notifications ────────────────────────────────────────────────────────
    const [notifPrefs, setNotifPrefs] = useState({
        email_notifications: true,
        sms_notifications: false,
        assignment_reminders: true,
        exam_reminders: true,
        announcements: true,
    });

    // ── Career ───────────────────────────────────────────────────────────────
    const [targetRole,      setTargetRole]      = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [githubUrl,       setGithubUrl]       = useState('');
    const [skills,          setSkills]          = useState([]);
    const [newSkillInput,   setNewSkillInput]   = useState('');
    const [careerResult,    setCareerResult]    = useState(null);
    const [pathResult,      setPathResult]      = useState(null);

    // ── Toast ─────────────────────────────────────────────────────────────────
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const showToast = useCallback((message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
    }, []);

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) { window.location.href = '/login'; return; }
            setUser(authUser);
            setCurrentUser(authUser);
            setEmail(authUser.email);

            // Profile
            const profile = await loadProfile();
            if (profile) {
                setFullName(profile.full_name || '');
                setBio(profile.bio || '');
                setPhone(profile.phone || '');
                setAddress(profile.address || '');
                setAvatarUrl(profile.avatar_url || '');
                setCourse(profile.course || '');
                setBranch(profile.branch || '');
                setCollege(profile.college || '');
                setUniversity(profile.university || '');
                setRollNumber(profile.roll_number || '');
                setSemester(profile.semester || '');
                setSubjects(profile.subjects || '');
                setGithubUrl(profile.github_url || '');
                setPrivacyPublic(profile.is_public || false);
            }

            // Target role
            const role = await loadTargetRole();
            if (role) {
                setTargetRole(role.role_name || '');
                setRoleDescription(role.description || '');
            }

            // Skills
            const skillsData = await loadSkills();
            setSkills(skillsData);

            // Notifications
            const prefs = await loadNotificationPrefs();
            if (prefs) setNotifPrefs({
                email_notifications: prefs.email_notifications ?? true,
                sms_notifications: prefs.sms_notifications ?? false,
                assignment_reminders: prefs.assignment_reminders ?? true,
                exam_reminders: prefs.exam_reminders ?? true,
                announcements: prefs.announcements ?? true,
            });

            // Career analyzer results
            const career = await loadLatestCareerAnalysis();
            setCareerResult(career);
            const path = await loadLatestPathAnalysis();
            setPathResult(path);
        };

        init();

        if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
    };

    const refreshSkills = async () => {
        const s = await loadSkills(); setSkills(s);
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSaveProfile = async (e) => {
        e.preventDefault(); setSaving(true);
        const { error } = await updateProfile({ full_name: fullName, bio, phone, address });
        setSaving(false);
        error ? showToast('Failed to save profile.', 'error') : showToast('Profile saved!');
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        showToast('Uploading photo…');
        const result = await uploadAvatar(file);
        if (result.error) { showToast('Upload failed.', 'error'); return; }
        setAvatarUrl(result.avatar_url);
        showToast('Photo updated!');
    };

    const handleSaveAcademic = async (e) => {
        e.preventDefault(); setSaving(true);
        const { error } = await updateProfile({ course, branch, college, university, roll_number: rollNumber, semester, subjects });
        setSaving(false);
        error ? showToast('Failed to save academic info.', 'error') : showToast('Academic info saved!');
    };

    const handleResetPassword = async () => {
        if (!user) return;
        const { error } = await requestPasswordReset(user.email);
        error ? showToast('Failed to send reset link.', 'error') : showToast('Reset link sent to your email!');
    };

    const handleSavePrivacy = async () => {
        setSaving(true);
        const { error } = await updateProfile({ is_public: privacyPublic });
        setSaving(false);
        error ? showToast('Failed to save privacy settings.', 'error') : showToast('Privacy settings updated!');
    };

    const handleSaveNotifications = async () => {
        setSaving(true);
        const { error } = await updateNotificationPrefs(notifPrefs);
        setSaving(false);
        error ? showToast('Failed to save preferences.', 'error') : showToast('Notification preferences saved!');
    };

    const handleSaveCareer = async (e) => {
        e.preventDefault(); setSaving(true);
        const [r1, r2] = await Promise.all([
            updateCareerTargets(targetRole, roleDescription),
            updateProfile({ github_url: githubUrl }),
        ]);
        setSaving(false);
        (r1.error || r2.error) ? showToast('Failed to save career info.', 'error') : showToast('Career info saved!');
    };

    const handleAddSkill = async () => {
        const name = newSkillInput.trim(); if (!name) return;
        const { error } = await addSkill(name);
        if (!error) { setNewSkillInput(''); await refreshSkills(); }
        else showToast('Skill already exists or failed to add.', 'error');
    };

    const handleRemoveSkill = async (id) => {
        const { error } = await removeSkillFromDB(id);
        if (!error) await refreshSkills();
    };

    const toggleNotif = (key) => setNotifPrefs(p => ({ ...p, [key]: !p[key] }));

    // ── Reusable Toggle Row ───────────────────────────────────────────────────
    const ToggleRow = ({ icon: Icon, label, desc, value, onChange }) => (
        <div className="toggle-wrapper">
            <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="toggle-title">{label}</p>
                    {desc && <p className="toggle-desc">{desc}</p>}
                </div>
            </div>
            <label className="toggle ml-4">
                <input type="checkbox" checked={value} onChange={onChange} />
                <span className="toggle-slider" />
            </label>
        </div>
    );

    // ── Save Button ───────────────────────────────────────────────────────────
    const SaveBtn = ({ label = 'Save Changes', onClick, type = 'submit' }) => (
        <button type={type} onClick={onClick}
            disabled={saving}
            className="btn-save-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : label}
        </button>
    );

    // ── Section Label ─────────────────────────────────────────────────────────
    const SectionLabel = ({ children }) => (
        <label className="section-label">{children}</label>
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="settings-container min-h-screen py-10 md:py-16" suppressHydrationWarning>
            {/* Toast */}
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl transform transition-all duration-500 flex items-center gap-3 font-bold text-sm
                ${toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0'}
                ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{toast.message}</span>
            </div>

            <main className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <a href="/profile" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </a>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight section-title">Settings</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Manage your account &amp; preferences</p>
                        </div>
                    </div>
                    <button onClick={toggleTheme} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition" title="Toggle theme">
                        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                    </button>
                </div>

                {/* Card */}
                <div className="glass-card rounded-[2.5rem] overflow-hidden">
                    {/* Tabs */}
                    <div className="tabs-scroll">
                        <div className="flex px-4 md:px-8 min-w-max">
                            {TABS.map(t => (
                                <button key={t.key} onClick={() => setActiveTab(t.key)}
                                    className={`tab-btn px-4 md:px-6 py-5 text-xs md:text-sm ${activeTab === t.key ? 'active' : ''}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ───── TAB: Profile ───── */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile} className="p-6 md:p-12 space-y-10">
                            {/* Avatar */}
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-green-500/20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        {avatarUrl
                                            ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            : <User className="w-10 h-10 text-slate-400" />}
                                    </div>
                                    <label htmlFor="avatar-input" className="absolute bottom-0 right-0 w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition shadow-lg" title="Upload photo">
                                        <Camera className="w-4 h-4" />
                                        <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="section-title text-base md:text-lg">Profile Photo</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG, PNG or WEBP. Max 800 KB.</p>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-5">
                                <h3 className="section-title flex items-center gap-2">
                                    <User className="w-4 h-4 text-green-600" /> Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <SectionLabel><User className="w-3.5 h-3.5 text-green-600" /> Full Name</SectionLabel>
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <SectionLabel><Mail className="w-3.5 h-3.5 text-green-600" /> Email</SectionLabel>
                                        <input type="email" value={email} className="input-field" disabled />
                                    </div>
                                    <div className="space-y-1.5">
                                        <SectionLabel><Phone className="w-3.5 h-3.5 text-green-600" /> Phone</SectionLabel>
                                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="+91 98765 43210" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <SectionLabel><MapPin className="w-3.5 h-3.5 text-green-600" /> Address / City</SectionLabel>
                                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="input-field" placeholder="e.g. Bengaluru, Karnataka" />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <SectionLabel><FileText className="w-3.5 h-3.5 text-green-600" /> Bio / Headline</SectionLabel>
                                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="input-field resize-none" placeholder="A short introduction about yourself…" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <SaveBtn />
                            </div>
                        </form>
                    )}

                    {/* ───── TAB: Academic ───── */}
                    {activeTab === 'academic' && (
                        <form onSubmit={handleSaveAcademic} className="p-6 md:p-12 space-y-10">
                            <div className="space-y-5">
                                <h3 className="section-title flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-green-600" /> Education Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <SectionLabel><BookOpen className="w-3.5 h-3.5 text-green-600" /> Course</SectionLabel>
                                        <input type="text" value={course} onChange={e => setCourse(e.target.value)} className="input-field" placeholder="e.g. B.Tech, BCA, MBA" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <SectionLabel><BookOpen className="w-3.5 h-3.5 text-green-600" /> Branch / Specialisation</SectionLabel>
                                        <input type="text" value={branch} onChange={e => setBranch(e.target.value)} className="input-field" placeholder="e.g. Computer Science" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <SectionLabel><GraduationCap className="w-3.5 h-3.5 text-green-600" /> College</SectionLabel>
                                        <input type="text" value={college} onChange={e => setCollege(e.target.value)} className="input-field" placeholder="e.g. RV College of Engineering" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <SectionLabel><GraduationCap className="w-3.5 h-3.5 text-green-600" /> University</SectionLabel>
                                        <input type="text" value={university} onChange={e => setUniversity(e.target.value)} className="input-field" placeholder="e.g. VTU" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <SectionLabel><Hash className="w-3.5 h-3.5 text-green-600" /> Roll Number</SectionLabel>
                                        <input type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)} className="input-field" placeholder="e.g. 1RV20CS001" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <SectionLabel><Calendar className="w-3.5 h-3.5 text-green-600" /> Semester</SectionLabel>
                                        <select value={semester} onChange={e => setSemester(e.target.value)} className="input-field">
                                            <option value="">Select Semester</option>
                                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <SectionLabel><BookOpen className="w-3.5 h-3.5 text-green-600" /> Current Subjects</SectionLabel>
                                        <textarea value={subjects} onChange={e => setSubjects(e.target.value)} rows={3} className="input-field resize-none" placeholder="e.g. DBMS, OS, CN, DSA…" />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <SaveBtn label="Save Academic Info" />
                            </div>
                        </form>
                    )}

                    {/* ───── TAB: Security ───── */}
                    {activeTab === 'security' && (
                        <div className="p-6 md:p-12 space-y-8">
                            {/* Password */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-green-600" />
                                    <h3 className="section-title">Password</h3>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        A password reset link will be sent to <strong className="text-slate-900 dark:text-white font-bold">{email}</strong>. Click the link in the email to set a new password.
                                    </p>
                                    <button onClick={handleResetPassword}
                                        className="btn-save-primary text-xs">
                                        <Mail className="w-4 h-4" /> Send Password Reset Email
                                    </button>
                                </div>
                            </section>

                            {/* 2FA Info */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <h3 className="section-title">Two-Factor Authentication</h3>
                                </div>
                                <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 space-y-3">
                                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">Two-factor authentication adds an extra layer of security to your account.</p>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Email verification active
                                    </span>
                                </div>
                            </section>

                            {/* Privacy */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-pink-500" />
                                    <h3 className="section-title">Privacy</h3>
                                </div>
                                <div className="toggle-wrapper">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center flex-shrink-0">
                                            {privacyPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="toggle-title">Public Profile</p>
                                            <p className="toggle-desc">Allow recruiters and peers to view your public profile &amp; verified achievements</p>
                                        </div>
                                    </div>
                                    <label className="toggle ml-4">
                                        <input type="checkbox" checked={privacyPublic} onChange={() => setPrivacyPublic(p => !p)} />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                                <button onClick={handleSavePrivacy} disabled={saving}
                                    className="btn-save-primary text-xs">
                                    <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Privacy Settings'}
                                </button>
                            </section>

                            {/* Danger Zone */}
                            <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 space-y-4">
                                    <h3 className="font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
                                    <p className="text-xs text-red-600 dark:text-red-300">Deleting your account is permanent. All submissions, analysis, and certificates will be removed.</p>
                                    <button onClick={() => confirm('Are you absolutely sure? This cannot be undone.') && alert('Please contact contact@diverseloopers.com to process your account deletion.')}
                                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition">
                                        Request Account Deletion
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ───── TAB: Notifications ───── */}
                    {activeTab === 'notifications' && (
                        <div className="p-6 md:p-12 space-y-10">
                            <section className="space-y-3">
                                <SectionLabel>Communication Channels</SectionLabel>
                                <ToggleRow icon={Mail} label="Email Notifications" desc="Receive project updates &amp; academic alerts via email" value={notifPrefs.email_notifications} onChange={() => toggleNotif('email_notifications')} />
                                <ToggleRow icon={MessageSquare} label="SMS Notifications" desc="Receive time-sensitive sprint alerts via SMS" value={notifPrefs.sms_notifications} onChange={() => toggleNotif('sms_notifications')} />
                            </section>

                            <section className="space-y-3">
                                <SectionLabel>Academic Alerts</SectionLabel>
                                <ToggleRow icon={AlarmClock} label="Assignment Reminders" desc="Get notified before project milestones &amp; assignment deadlines" value={notifPrefs.assignment_reminders} onChange={() => toggleNotif('assignment_reminders')} />
                                <ToggleRow icon={AlarmClock} label="Exam Reminders" desc="Get review alerts before semester evaluations" value={notifPrefs.exam_reminders} onChange={() => toggleNotif('exam_reminders')} />
                            </section>

                            <section className="space-y-3">
                                <SectionLabel>General</SectionLabel>
                                <ToggleRow icon={Megaphone} label="Updates &amp; Announcements" desc="Platform news, new bootcamp features &amp; partner hiring drives" value={notifPrefs.announcements} onChange={() => toggleNotif('announcements')} />
                            </section>

                            <div className="pt-2">
                                <button onClick={handleSaveNotifications} disabled={saving}
                                    className="btn-save-primary">
                                    <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ───── TAB: Career & Skills ───── */}
                    {activeTab === 'career' && (
                        <form onSubmit={handleSaveCareer} className="p-6 md:p-12 space-y-12">
                            {/* Target Role */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-green-600" />
                                    <h3 className="section-title">Career Goal</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <SectionLabel>Target Role</SectionLabel>
                                        <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} className="input-field" placeholder="e.g. Full Stack Developer" />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <SectionLabel>Role Description (AI Context)</SectionLabel>
                                        <textarea value={roleDescription} onChange={e => setRoleDescription(e.target.value)} rows={3} className="input-field resize-none" placeholder="What specific technologies and outcomes do you want to master?" />
                                    </div>
                                </div>
                            </section>

                            {/* Skills */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-pink-500" />
                                    <h3 className="section-title">My Skills</h3>
                                </div>
                                <div className="flex flex-wrap gap-2.5 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 min-h-[64px]">
                                    {skills.length === 0
                                        ? <p className="text-xs text-slate-400 italic self-center">No skills added yet. Add your programming languages, tools, or frameworks below.</p>
                                        : skills.map(s => (
                                            <span key={s.id} className="skill-chip">
                                                {s.skill_name}
                                                <button type="button" onClick={() => handleRemoveSkill(s.id)} className="text-slate-400 hover:text-red-500 transition" title="Remove skill">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))
                                    }
                                </div>
                                <div className="flex gap-3">
                                    <input type="text" value={newSkillInput} onChange={e => setNewSkillInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                                        className="input-field flex-1" placeholder="Add a skill (e.g. React, Node.js, Python, AWS)" />
                                    <button type="button" onClick={handleAddSkill}
                                        className="px-6 py-3 bg-slate-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition flex items-center gap-2 cursor-pointer">
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                </div>
                            </section>

                            {/* GitHub */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                    <h3 className="section-title">Portfolio &amp; GitHub</h3>
                                </div>
                                <div className="space-y-1.5">
                                    <SectionLabel>GitHub Profile URL</SectionLabel>
                                    <div className="relative flex items-center">
                                        <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                                        <input
                                            type="url"
                                            value={githubUrl}
                                            onChange={e => setGithubUrl(e.target.value)}
                                            className="input-field input-with-icon"
                                            placeholder="https://github.com/your-username"
                                        />
                                    </div>
                                    {githubUrl && (
                                        <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold hover:underline mt-1">
                                            <ExternalLink className="w-3 h-3" /> View Profile
                                        </a>
                                    )}
                                </div>
                            </section>

                            {/* Career Analyzer Results */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <h3 className="section-title">Career Analyzer Results</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Career Quiz Result */}
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Career Quiz</p>
                                        {careerResult && careerResult.scores ? (() => {
                                            const top = Object.entries(careerResult.scores).sort(([,a],[,b]) => b - a)[0];
                                            return (
                                                <div className="space-y-2">
                                                    <span className="result-badge">{CAREER_NAMES[top[0]] || top[0]}</span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                        Score: <strong>{top[1]}</strong> points &bull; Analysed on {new Date(careerResult.created_at).toLocaleDateString()}
                                                    </p>
                                                    <a href="/career-analyzer" className="inline-flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 font-bold hover:underline">
                                                        <ExternalLink className="w-3 h-3" /> Retake Quiz
                                                    </a>
                                                </div>
                                            );
                                        })() : (
                                            <div className="space-y-2">
                                                <p className="text-xs text-slate-400 italic">No career quiz results yet.</p>
                                                <a href="/career-analyzer" className="inline-flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 font-bold hover:underline">
                                                    Take the quiz →
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Path Analysis Result */}
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Path Analysis</p>
                                        {pathResult ? (
                                            <div className="space-y-2">
                                                <span className="result-badge"><Route className="w-3.5 h-3.5" /> {pathResult.match_percentage}% Match</span>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                    Last run on {new Date(pathResult.created_at).toLocaleDateString()}
                                                </p>
                                                <a href="/analyzer" className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-bold hover:underline">
                                                    <ExternalLink className="w-3 h-3" /> Run New Analysis
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-xs text-slate-400 italic">No skill-gap analysis yet.</p>
                                                <a href="/analyzer" className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-bold hover:underline">
                                                    Run an analysis →
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <div className="pt-2">
                                <SaveBtn label="Save Career Info" />
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}

