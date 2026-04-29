

// 'use client';

// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
// import JobApplicationModal from '@/components/JobApplicationModal';
// import LoginModal from '@/components/LoginModal';

// const CATEGORIES = [
//   'View all',
//   'Development',
//   'Design',
//   'Marketing',
//   'Customer Service',
//   'Operations',
//   'Finance',
//   'Management'
// ];

// export default function CareersPage() {
//   const [selectedCategory, setSelectedCategory] = useState('View all');
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [toolsOpen, setToolsOpen] = useState(false);
//   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedJobId, setExpandedJobId] = useState(null);

//   useEffect(() => {
//     // Check if user is logged in
//     const checkUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       setUser(user);
//     };
//     checkUser();

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   useEffect(() => {
//     // Fetch jobs from Supabase
//     const fetchJobs = async () => {
//       setLoading(true);
//       try {
//         const { data, error } = await supabase
//           .from('jobs')
//           .select('*')
//           // .eq('status')
//           .order('created_at', { ascending: false });

//         if (error) throw error;
//         setJobs(data || []);
//       } catch (error) {
//         console.error('Error fetching jobs:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobs();
//   }, []);

//   const filteredJobs = selectedCategory === 'View all'
//     ? jobs
//     : jobs.filter(job => job.department === selectedCategory);

//   const handleApply = (job) => {
//     if (!user) {
//       setIsLoginModalOpen(true);
//       return;
//     }
//     setSelectedJob(job);
//     setIsModalOpen(true);
//   };

//   const toggleJobDetails = (jobId) => {
//     setExpandedJobId(expandedJobId === jobId ? null : jobId);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="border-b border-gray-200 bg-white">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
              
//                <a href="/" className="flex-shrink-0 flex items-center gap-2">
//               <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" className="h-12 w-auto" />
//             </a>
//             </div>

//             <nav className="hidden md:flex items-center gap-8">
//               <a href="/" className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors">Home</a>
//               <a href="/about" className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors">About</a>
//           {/* Tools Dropdown */}
// <div className="relative group">
//   <button className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer">
//     Exclusive Tools
//     <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
//     </svg>
//   </button>

//   {/* Dropdown */}
//   <div className="absolute left-0 top-full mt-3 w-72 bg-white shadow-xl border border-gray-200 rounded-xl z-50
//   opacity-0 invisible group-hover:opacity-100 group-hover:visible
//   transition-all duration-200 delay-200">

//     <div className="pt-4 pb-2 px-4">
      

//       <div className="grid grid-cols-1 gap-2">

//         <a href="/career-analyzer" className="flex items-center gap-3 p-3 bg-blue-50 text-primary rounded-xl font-bold text-sm hover:scale-[1.02] transition">
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <circle cx="12" cy="12" r="10" />
//             <circle cx="12" cy="12" r="6" />
//             <circle cx="12" cy="12" r="2" />
//           </svg>
//           Career Analyzer
//         </a>

//         <a href="/analyzer" className="flex items-center gap-3 p-3 bg-pink-50 text-secondary rounded-xl font-bold text-sm hover:scale-[1.02] transition">
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//           </svg>
//           Path Analyzer
//         </a>

//       </div>
//     </div>

//   </div>
// </div>
              
//             </nav>

//             <div className="flex items-center gap-3">
//               {user ? (
//                 <button
//                   onClick={async () => {
//                     await supabase.auth.signOut();
//                     window.location.href = '/login';
//                   }}
//                   className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors"
//                 >
//                   Sign out
//                 </button>
//               ) : (
//                 <>
//                   <a href="/login" className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors">
//                     Log in
//                   </a>
//                   <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
//                     Sign up
//                   </a>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto px-6 py-16">
//         {/* Badge */}
//         <div className="mb-6">
//           <span className="inline-block px-3 py-1 bg-white border border-blue-300 rounded-full text-sm font-medium text-blue-700">
//             We're hiring!
//           </span>
//         </div>

//         {/* Hero Section */}
// <div className="mb-16 grid md:grid-cols-2 gap-10 items-center">

//   {/* Text */}
//   <div>
//     <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
//       Be part of our mission
//     </h1>

//     <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
//       We're looking for passionate people to join us on our mission. 
//       We value flat hierarchies, clear communication, and full ownership 
//       and responsibility.
//     </p>
//   </div>

//   {/* Team Image */}
//   <div className="flex justify-center md:justify-end">
//     <img
//       src="/team.jpg"
//       alt="Our Team"
//       className="rounded-xl shadow-lg w-full max-w-md"
//     />
//   </div>

// </div>

//         {/* Category Filters */}
//         <div className="mb-12">
//           <div className="flex flex-wrap gap-2">
//             {CATEGORIES.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => setSelectedCategory(category)}
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                   selectedCategory === category
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
//                 }`}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Job Listings */}
//         {loading ? (
//           <div className="text-center py-12">
//             <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-gray-600 mt-4">Loading jobs...</p>
//           </div>
//         ) : filteredJobs.length === 0 ? (
//           <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
//             <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//             </svg>
//             <p className="text-gray-600">No jobs available in this category</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredJobs.map((job) => (
//               <JobCard
//                 key={job.id}
//                 job={job}
//                 isExpanded={expandedJobId === job.id}
//                 onToggle={() => toggleJobDetails(job.id)}
//                 onApply={() => handleApply(job)}
//               />
//             ))}
//           </div>
//         )}
//       </main>

//       {/* Application Modal */}
//       {isModalOpen && user && (
//         <JobApplicationModal
//           job={selectedJob}
//           user={user}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}

//       {/* Login Modal */}
//       {isLoginModalOpen && (
//         <LoginModal onClose={() => setIsLoginModalOpen(false)} />
//       )}


// {/* Footer */}
//       <footer className="bg-slate-900 text-white mt-5 pt-20 pb-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
//             <div className="col-span-1 lg:col-span-1">
//               <img src="/Diverse Loopers Black BG (2).png" alt="Diverse Loopers" className="h-12 w-auto mb-6" />
//               <p className="text-slate-400 text-sm leading-relaxed mb-6">
//                 Empowering talents for tomorrow through structured, future-ready career pathways and real industry exposure.
//               </p>
//               <div className="flex gap-4">
//                 <a href="https://www.linkedin.com/company/105277450" className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition">
//                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
//                 </a>
//                 <a href="https://www.instagram.com/diverseloopers/" className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition">
//                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
//                 </a>
//                 <a href="https://chat.whatsapp.com/B6XJSoLC2Hg7Wgg5lHRfSf" className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
//                     <path d="M16.7 13.4c-.3-.2-1.7-.8-2-1-.3-.2-.5-.2-.7.2s-.8 1-1 1.2c-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.2-1.3-1-1-1.3-1.9-1.4-2.2-.1-.3 0-.5.2-.7.2-.2.6-.7.8-1 .2-.3.1-.5 0-.7-.1-.2-.7-1.7-.9-2.1-.2-.4-.4-.3-.7-.3-.3 0-.6 0-.9.3-.3.3-1.1 1.1-1.1 2.6 0 1.5.9 3 1.1 3.2.1.2 2.1 3.2 5.1 4.4 1.9.8 2.6.9 3.5.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4z" />
//                     <path d="M21 12a9 9 0 1 0-16.5 5.2L3 21l3.8-1.5A9 9 0 0 0 21 12z" />
//                   </svg>
//                 </a>
//               </div>
//             </div>

//             <div>
//               <h4 className="font-bold mb-6">Quick Navigation</h4>
//               <ul className="space-y-4 text-slate-400 text-sm">
//                 <li><a href="/aboutus-std" className="hover:text-white transition">About Us</a></li>
//                 <li><a href="mailto:contact@diverseloopers.com" className="hover:text-white transition">Contact Us</a></li>
//                 <li><a href="#programs" className="hover:text-white transition">Programs</a></li>
//                 <li><a href="#hybrid-hustle" className="hover:text-white transition">Hybrid Hustle</a></li>
//                 <li><a href="/skillsynth" className="hover:text-white transition">SkillSynth</a></li>
//                 <li><a href="/analyzer" className="hover:text-white transition">Path Analyzer</a></li>
//                 <li><a href="/career-analyzer" className="hover:text-white transition">Career Analyzer</a></li>
//               </ul>
//             </div>

//             <div>
//               <h4 className="font-bold mb-6">Specializations</h4>
//               <ul className="space-y-4 text-slate-400 text-sm">
//                 <li><a href="/" className="hover:text-white transition">For Students</a></li>
//                 <li><a href="/institute" className="hover:text-white transition">For Universities</a></li>
//                 <li><a href="/business" className="hover:text-white transition">For Businesses</a></li>
//                 <li><a href="#" className="hover:text-white transition">Placement Support</a></li>
//               </ul>
//             </div>

//             <div>
//               <h4 className="font-bold mb-6">Contact Us</h4>
//               <ul className="space-y-4 text-slate-400 text-sm">
//                 <li className="flex gap-3">
//                   <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                   contact@diverseloopers.com
//                 </li>
//                 <li className="flex gap-3">
//                   <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                   </svg>
//                   +91 98393 50961
//                 </li>
//               </ul>

//               {/* Auth Section in Footer */}
//               <div id="footer-auth" className="mt-8 pt-6 border-t border-white/10 hidden">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div id="footer-user-avatar" className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold uppercase">
//                     U
//                   </div>
//                   <div>
//                     <p id="footer-user-name" className="text-xs font-bold text-white"></p>
//                     <p id="footer-user-email" className="text-[10px] text-slate-500"></p>
//                   </div>
//                 </div>
//                 <button id="logout-btn" className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest">Sign Out</button>
//               </div>
//             </div>
//           </div>

//           <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
//             <p>&copy; 2024 Diverse Loopers. All Rights Reserved.</p>
//             <div className="flex gap-8">
//               <a href="#" className="hover:text-white transition">Privacy Policy</a>
//               <a href="#" className="hover:text-white transition">Terms & Conditions</a>
//             </div>
//             <p>Hybrid Hustle&reg; is a registered program concept.</p>
//           </div>
//         </div>
//       </footer>

//     </div>
//   );
// }

// function JobCard({ job, isExpanded, onToggle, onApply }) {
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">
//             {job.title}
//           </h3>
//           <p className="text-gray-600 mb-4 line-clamp-2">
//             {job.responsibility || 'Join our team and make an impact'}
//           </p>
          
//           {/* Basic Info Tags */}
//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//               </svg>
//               {job.location}
//             </span>
//             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               {job.type}
//             </span>
//             {job.department && (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                 </svg>
//                 {job.department}
//               </span>
//             )}
//           </div>

//           {/* Expanded Details */}
//           {isExpanded && (
//             <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
//               {job.salary && (
//                 <div>
//                   <h4 className="text-sm font-semibold text-gray-900 mb-1">Salary</h4>
//                   <p className="text-sm text-gray-600">{job.salary}</p>
//                 </div>
//               )}
              
//               {job.eligibility && (
//                 <div>
//                   <h4 className="text-sm font-semibold text-gray-900 mb-1">Eligibility</h4>
//                   <p className="text-sm text-gray-600">{job.eligibility}</p>
//                 </div>
//               )}
              
//               {job.responsibility && (
//                 <div>
//                   <h4 className="text-sm font-semibold text-gray-900 mb-1">Responsibilities</h4>
//                   <p className="text-sm text-gray-600 whitespace-pre-line">{job.responsibility}</p>
//                 </div>
//               )}
              
//               {job.required_skills && (
//                 <div>
//                   <h4 className="text-sm font-semibold text-gray-900 mb-1">Required Skills</h4>
//                   <p className="text-sm text-gray-600">{job.required_skills}</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col gap-2 ml-6">
//           <button
//             onClick={onApply}
//             className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
//           >
//             Apply
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//             </svg>
//           </button>
          
//           <button
//             onClick={onToggle}
//             className="flex items-center gap-2 text-blue-600 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors whitespace-nowrap border border-blue-600"
//           >
//             {isExpanded ? 'Show Less' : 'Show More'}
//             <svg 
//               className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
//               fill="none" 
//               stroke="currentColor" 
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import './career.css'
import Navigation from '@/components/career/Navigation'
import HeroSection from '@/components/career/HeroSection'
import WhatWeDoSection from '@/components/career/WhatWeDoSection'
import WhyJoinSection from '@/components/career/WhyJoinSection'
import LifeAtCompanySection from '@/components/career/LifeAtCompanySection'
import MissionVisionSection from '@/components/career/MissionVisionSection'
import GrowthTimelineSection from '@/components/career/GrowthTimelineSection'
import TestimonialsSection from '@/components/career/TestimonialsSection'
import OpenRolesSection from '@/components/career/OpenRolesSection'
import FinalCTASection from '@/components/career/FinalCTASection'
import Footer from '@/components/career/Footer'

export default function CareersPage() {
  return (
    <>
    <div className="career-page ">
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-background to-slate-50 dark:to-slate-950 pt-13">
        <HeroSection />
        <MissionVisionSection />
        <div id="what-we-do">
          <WhatWeDoSection />
        </div>
        {/* <div id="why-join">
          <WhyJoinSection />
        </div> */}
        <LifeAtCompanySection />
        
        <GrowthTimelineSection />
        <TestimonialsSection />
        <div id="open-roles" className='bg-white py-17  '>
          <OpenRolesSection />
        </div>
        <FinalCTASection />
        <Footer />
      </main>
      </div>
    </>
  )
}
