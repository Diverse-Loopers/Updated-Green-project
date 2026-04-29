'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function JobApplicationModal({ job, user, onClose }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: user?.email || '',
    applicant_phone: '',
    portfolio: '',
    reason: '',
    resume_url: '',
    github_url: '',
    linkedin_url: '',
    experience_years: '',
    education: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.applicant_name.trim()) {
      newErrors.applicant_name = 'Full name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.applicant_email) {
      newErrors.applicant_email = 'Email is required';
    } else if (!emailRegex.test(formData.applicant_email)) {
      newErrors.applicant_email = 'Please enter a valid email';
    }

    // Phone validation
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!formData.applicant_phone) {
      newErrors.applicant_phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.applicant_phone) || formData.applicant_phone.length < 10) {
      newErrors.applicant_phone = 'Please enter a valid phone number';
    }

    // Resume URL validation
    // if (!formData.resume_url.trim()) {
    //   newErrors.resume_url = 'Resume URL is required';
    // } else if (!formData.resume_url.startsWith('http')) {
    //   newErrors.resume_url = 'Please enter a valid URL starting with http:// or https://';
    // }
    if (!resumeFile) {
  newErrors.resume_url = 'Resume file is required';
} else if (resumeFile.type !== 'application/pdf') {
  newErrors.resume_url = 'Only PDF allowed';
}

    // LinkedIn validation
    if (!formData.linkedin_url.trim()) {
      newErrors.linkedin_url = 'LinkedIn profile is required';
    } else if (!formData.linkedin_url.includes('linkedin.com/')) {
      newErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }

    // GitHub validation (optional but must be valid if provided)
    if (formData.github_url && !formData.github_url.includes('github.com/')) {
      newErrors.github_url = 'Please enter a valid GitHub URL';
    }

    // Portfolio validation (optional but must be valid if provided)
    if (formData.portfolio && !formData.portfolio.startsWith('http')) {
      newErrors.portfolio = 'Please enter a valid URL starting with http:// or https://';
    }

    // Experience validation
    if (!formData.experience_years.trim()) {
      newErrors.experience_years = 'Years of experience is required';
    }

    // Education validation
    if (!formData.education.trim()) {
      newErrors.education = 'Education details are required';
    }

    // Reason validation
    if (!formData.reason.trim()) {
      newErrors.reason = 'Please tell us why you want to join';
    } else if (formData.reason.trim().length < 20) {
      newErrors.reason = 'Please provide at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert application data into Supabase 'applications' table
// Upload resume to Supabase
const fileExt = resumeFile.name.split('.').pop();
const fileName = `${Date.now()}.${fileExt}`;

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('resumes') // bucket name
  .upload(fileName, resumeFile, {
  cacheControl: '3600',
  upsert: false,
});

if (uploadError) {
  console.error(uploadError);
  throw new Error('Resume upload failed');
}

// Get public URL
const { data: publicUrlData } = supabase
  .storage
  .from('resumes')
  .getPublicUrl(uploadData.path);

const resumeUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase
        .from('applications')
        .insert([
          {
            job_id: job.id,
            job_title: job.title,
            applicant_name: formData.applicant_name.trim(),
            applicant_email: formData.applicant_email.trim(),
            applicant_phone: formData.applicant_phone.trim(),
            portfolio: formData.portfolio.trim() || null,
            reason: formData.reason.trim(),
            // resume_url: formData.resume_url.trim(),
            resume_url: resumeUrl,
            github_url: formData.github_url.trim() || null,
            linkedin_url: formData.linkedin_url.trim(),
            experience_years: formData.experience_years.trim(),
            education: formData.education.trim(),
            submitted_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error('Failed to save application. Please contact support.');
      }

      setSubmitSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: error.message || 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
          <p className="text-gray-600">Thank you for applying. We'll review your application and get back to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div
  onClick={onClose}
  className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-6 mt-18 mb-6 overflow-y-auto"
>

    <div
  onClick={(e) => e.stopPropagation()}
  className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
>


        {/* Header */}
        <div className="flex items-start justify-between  mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Apply for {job.title}</h2>
            <p className="text-gray-600">Fill out the form below to submit your application</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="applicant_name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="applicant_name"
              value={formData.applicant_name}
              onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${
                errors.applicant_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
            />
            {errors.applicant_name && <p className="text-red-500 text-sm mt-1">{errors.applicant_name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="applicant_email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="applicant_email"
              value={formData.applicant_email}
              onChange={(e) => setFormData({ ...formData, applicant_email: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${
                errors.applicant_email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
            />
            {errors.applicant_email && <p className="text-red-500 text-sm mt-1">{errors.applicant_email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="applicant_phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="applicant_phone"
              value={formData.applicant_phone}
              onChange={(e) => setFormData({ ...formData, applicant_phone: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${
                errors.applicant_phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 000-0000"
            />
            {errors.applicant_phone && <p className="text-red-500 text-sm mt-1">{errors.applicant_phone}</p>}
          </div>

          {/* Resume URL */}
          {/* <div>
            <label htmlFor="resume_url" className="block text-sm font-medium text-gray-700 mb-1.5">
              Resume URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="resume_url"
              value={formData.resume_url}
              onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${
                errors.resume_url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://drive.google.com/your-resume"
            />
            {errors.resume_url && <p className="text-red-500 text-sm mt-1">{errors.resume_url}</p>}
            <p className="text-xs text-gray-500 mt-1">Upload your resume to Google Drive, Dropbox, or any cloud storage and paste the public link here</p>
          </div> */}
          {/* Resume Upload */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    Upload Resume (PDF) <span className="text-red-500">*</span>
  </label>

  <input
    type="file"
    accept=".pdf"
    onChange={(e) => setResumeFile(e.target.files[0])}
    className={`w-full px-4 py-2.5 border rounded-lg ${
      errors.resume_url ? 'border-red-500' : 'border-gray-300'
    }`}
  />

  {errors.resume_url && (
    <p className="text-red-500 text-sm mt-1">{errors.resume_url}</p>
  )}
</div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1.5">
              LinkedIn profile <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="linkedin_url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${
                errors.linkedin_url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://linkedin.com/in/username"
            />
            {errors.linkedin_url && <p className="text-red-500 text-sm mt-1">{errors.linkedin_url}</p>}
          </div>

          {/* GitHub */}
          <div>
            <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-1.5">
              GitHub profile <span className="text-gray-400 text-sm">(optional)</span>
            </label>
            <input
              type="url"
              id="github_url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${
                errors.github_url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://github.com/username"
            />
            {errors.github_url && <p className="text-red-500 text-sm mt-1">{errors.github_url}</p>}
          </div>

          {/* Portfolio */}
          <div>
            <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1.5">
              Portfolio URL <span className="text-gray-400 text-sm">(optional)</span>
            </label>
            <input
              type="url"
              id="portfolio"
              value={formData.portfolio}
              onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${
                errors.portfolio ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://yourportfolio.com"
            />
            {errors.portfolio && <p className="text-red-500 text-sm mt-1">{errors.portfolio}</p>}
          </div>

          {/* Experience Years */}
          <div>
            <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1.5">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="experience_years"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${
                errors.experience_years ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 3 years or Fresher"
            />
            {errors.experience_years && <p className="text-red-500 text-sm mt-1">{errors.experience_years}</p>}
          </div>

          {/* Education */}
          <div>
            <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1.5">
              Education <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="education"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${
                errors.education ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Bachelor's in Computer Science"
            />
            {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1.5">
              Why do you want to join us? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
            />
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
            <p className="text-xs text-gray-500 mt-1">Minimum 20 characters ({formData.reason.length}/20)</p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}