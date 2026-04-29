#  Diverse Loopers — Next.js Migration



---

# 📌 Project Overview

Previously, the Diverse Loopers website was built using static HTML, CSS, and external JavaScript.
This project restructures the platform using:

* Next.js (App Router)
* Tailwind CSS
* Supabase Integration
* Lucide React Icons
* Modular Component Architecture

---

# 🧱 Tech Stack

* Next.js
* Jsx
* Tailwind CSS
* Supabase
* Lucide React


---

# 📂 Folder Structure

```
my-app/
│
├── src/
│   │
│   ├── app/
│   │   ├── (all pages)
│   │   ├── global.css
│   │   ├── layout.jsx
│   │   └── page.jsx
│   │
│   ├── lib/
│   │   ├── supabase/        → Supabase client configuration
│   │   └── pages/           → JavaScript logic for pages
│   │
│   ├── components/          → Reusable components
│   │   ├── JobApplyModal.jsx
│   │   ├── LoginModal.jsx
│   │   └── other UI components
│
├── public/                  → Images & static assets
│                             (including some static JS logic)
│
├── package.json
├── tailwind.config.js
├── next.config.js
└── .env.local
```

---

# ⚙️ Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/ORG_NAME/REPO_NAME.git
cd REPO_NAME
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Setup Environment Variables

Create:

```
.env.local
```

Add:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

⚠️ Do not push `.env.local` to GitHub.

---

# ▶️ Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---


# 🎨 Tailwind CSS Installation

If Tailwind needs to be installed or reconfigured:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

# 🗄 Supabase Setup

Install Supabase client and lucid-react if not default downloaded with npm install:

```bash
npm install @supabase/supabase-js

npm install lucide-react
```
---




# 📬 Maintained By

**Diverse Loopers Development Team**
