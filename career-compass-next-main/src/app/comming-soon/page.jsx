"use client";

import { useState, useEffect } from "react";
import "./comming-soon.css";


function FontLoader() {
  useEffect(() => {
    const hrefs = [
      "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap",
    ];
    hrefs.forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);
  return null;
}


function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (e.target.closest('.navbar__menu-btn')) return;
      setMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  return (
    <>
    <nav className="navbar">
      <div className="navbar__inner">
        {/* <div className="navbar__logo">Diverse Loopers</div> */}
<div className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="Company Logo"
              className="h-12 object-contain"
            />
          </div>
        <div className="navbar__links">
          <a className="navbar__link" href="/">
            Home
          </a>
          <a className="navbar__link" href="/products">
            Products
          </a>
          {/* <a className="navbar__link" href="#">
            Partners
          </a> */}
          <a className="navbar__link" href="/about">
            About
          </a>
          <a className="navbar__link" href="/login">
            Login
          </a>
          <a className="navbar__btn-register" href="/login">
            Register
          </a>
        </div>

        <button
          className="navbar__menu-btn"
         onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
        >
          <span className="material-symbols-outlined">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>
      
    </nav>

    {menuOpen && (
        <div className="navbar__mobile">
          <a className="navbar__mobile-link" href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a className="navbar__mobile-link" href="#" onClick={() => setMenuOpen(false)}>Products</a>
          <a className="navbar__mobile-link" href="/about" onClick={() => setMenuOpen(false)}>About</a>
          <a className="navbar__mobile-link" href="/login" onClick={() => setMenuOpen(false)}>Login</a>
          <a className="navbar__mobile-cta" href="/login" onClick={() => setMenuOpen(false)}>Register</a>
        </div>
      )}
    </>
  );
}

export default function ComingSoon() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks! We'll notify you: ${email}`);
    setEmail("");
  };

  return (
    <>
      <br />
      <FontLoader/>

      <Navbar />

      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">

        {/* Background Glow */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>

        {/* Card */}
        <div className="relative z-10 max-w-xl w-full bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 text-center">

          {/* Badge */}
          <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full">
            Launching Soon
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Something Amazing is Coming
          </h1>

          {/* Description */}
          <p className="text-slate-500 mb-6">
            We're building something powerful. Be the first to know when we go live.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">

            {/* Input */}
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            {/* Button */}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 hover:scale-105 transition-all duration-300"
            >
              Remind Me
            </button>

          </form>
        </div>
      </section>
    </>
  );
}
