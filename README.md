# MANMEET SINGH — Full Stack Developer Portfolio

An ultra-performant, high-fashion portfolio website engineered with **Swiss Graphic Design principles**, **Architectural Brutalism**, and modern **optimistic web performance architecture**.

---

## ⚡ Performance & Key Innovations

### 1. Instant Page Caching & Prefetching Engine (`sw.js` + `instant-nav.js`)
* **Service Worker Caching**: Utilizes a custom **Stale-While-Revalidate** caching policy (`sw.js`) that precaches static HTML pages, CDN assets, fonts, and scripts to achieve **< 20ms page load speeds**.
* **Hover & Touch Link Prefetching**: Listens for user hover (`mouseenter`) or touch (`touchstart`) events on navigation links, prefetching target HTML documents into memory *before* the user clicks, resulting in **zero-latency instant page transitions**.

### 2. Optimistic Contact Message Queue (`portfolio/js/api.js`)
* **Instant Client Response (< 10ms)**: Synchronously validates input fields (`name`, `email` regex, `message`) in under 5ms. Valid submissions immediately return success to the UI and clear the form without waiting for server responses.
* **Persistent `localStorage` Queue**: Enqueues outgoing messages into browser storage (`portfolio_contact_queue`) with exponential backoff retries.
* **Asynchronous Background Processing**: A background worker handles POST requests to the Brevo email API server (`server/server.js`) and database insertions to **Supabase** in the background, ensuring zero data loss even during network instability or server cold starts.

---

## 🌟 Features & Functionality

* **Swiss & Brutalist Visual Language**: High-contrast typography scale, strict 12-column grid alignment, and sharp 0px border-radius aesthetics.
* **Interactive Projects Showcase**: Modern project cards featuring Aceternity UI-inspired following pointer cards, side-by-side vertical project previews, and interactive project details.
* **Resume Integration**: Dual options for viewing the resume directly in-browser or downloading the PDF document.
* **Full Mobile Responsiveness**: Touch-optimized sliding drawer menu and responsive grid layouts.
* **Dual Backend Integration**: Dual delivery pipeline using Brevo transactional email services and Supabase DB backup storage.

---

## 📁 Repository Structure

```
stitch_portfolio_home/
├── portfolio/
│   ├── index.html              # Main Landing / Monolithic Showcase
│   ├── about.html              # Profile & Selected Tenure Timeline
│   ├── projects.html           # Interactive Selected Works (2022–2026)
│   ├── studio.html             # Studio Services & Methodology
│   ├── strategy.html           # Creative Strategy & Systems
│   ├── archives.html           # Extended Project Archives
│   ├── contact.html            # Contact & Inquiry Form
│   ├── case-study.html         # Project Deep Dives
│   ├── sw.js                   # Service Worker Caching Layer
│   └── js/
│       ├── api.js              # Optimistic Contact Queue Manager
│       ├── instant-nav.js      # Link Prefetching & SW Registration
│       └── supabase-config.js  # Supabase Database Client
└── server/
    ├── server.js               # Node.js / Express Email Backend (Brevo API)
    ├── package.json            # Server dependencies
    └── .env.example            # Environment variables template
```

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS
* **Performance**: Service Workers (`sw.js`), Resource Prefetching API, LocalStorage Queue
* **Backend**: Node.js, Express.js
* **Services & APIs**: Brevo Transactional Email API, Supabase Database
* **Typography & Icons**: Google Fonts (Inter, Space Mono), Material Symbols Outlined

---

## ⚙️ Quick Start

### Frontend (Static Files)
No build step is required for the static pages:
1. Clone the repository:
   ```bash
   git clone https://github.com/manmeet8549/Portfolio-Manmeet.git
   ```
2. Open `portfolio/index.html` in any modern browser.

### Backend Server (Optional Local Mailer)
To run the local Brevo email backend server:
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` based on `.env.example`:
   ```env
   PORT=3001
   BREVO_API_KEY=your_brevo_api_key
   SENDER_NAME="Manmeet Singh"
   SENDER_EMAIL="your_email@domain.com"
   RECEIVER_EMAIL="your_email@domain.com"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📬 Contact & Socials

* **Website**: [manmeetsingh.me](https://manmeetsingh.me)
* **LinkedIn**: [linkedin.com/in/manmeet-singh-0b91262b6](https://www.linkedin.com/in/manmeet-singh-0b91262b6)
* **GitHub**: [github.com/manmeet8549](https://github.com/manmeet8549)
* **Instagram**: [@manmeet_singh_virdi_](https://www.instagram.com/manmeet_singh_virdi_/)

---

© 2026 Manmeet Singh. All rights reserved.
