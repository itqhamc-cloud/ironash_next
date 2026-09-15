# IronAsh - Pure Himalayan Shilajit & Herbal Wellness Store

A modern, high-performance e-commerce website built with **Next.js 15 (App Router)**, **React 19**, and **Tailwind CSS**.

---

## 🌟 Key Features

- **Storefront**: High-converting herbal wellness store highlighting Himalayan Shilajit resin, organic herbs, purity certifications, and verified customer testimonials.
- **Product Details & Gallery**: Multi-image zoom gallery, authentic grams/package selectors, COD buy-now flow, and WhatsApp consultation buttons.
- **Interactive Cart & Checkout**: Slide-out cart with Cash on Delivery (COD) across Pakistan, instant validation, local storage persistence, and optional Google Sheets sync.
- **Admin Dashboard (`/admin`)**: Real-time product inventory management, stock controls, custom branding/logo customization, and direct contact details manager.
- **Dark/Light Mode**: Smooth, accessible theme toggle with zero hydration flicker.
- **Responsive & Fast**: Fully optimized for mobile, tablet, and desktop screens with dynamic layout-first rendering.

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
- **Node.js**: v18.18.0 or newer (Node.js 20 LTS recommended)
- **npm** (comes with Node.js) or **yarn** / **pnpm**

### 2. Installation
```bash
# Clone or extract repository
cd ironash-store

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 How to Publish this Website to GitHub

### Method 1: Export Directly from Google AI Studio (Easiest)
1. In the top right corner of the Google AI Studio interface, click on the **Export** or **Settings** menu.
2. Select **Export to GitHub** (or **Download ZIP**).
3. Authorize your GitHub account, choose a repository name (e.g. `ironash-store`), and click **Create Repository**.
4. Your complete project is now live on GitHub!

### Method 2: Push Using Git Terminal Commands
If you downloaded the code as a ZIP file:
```bash
# 1. Unzip and navigate to the project directory
cd ironash-store

# 2. Initialize a new Git repository
git init

# 3. Add all project files
git add .

# 4. Commit the files
git commit -m "Initial commit: IronAsh Herbal Store website"

# 5. Link to your newly created GitHub repository
# Replace YOUR_USERNAME and YOUR_REPO with your GitHub details:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 6. Push code to main branch
git branch -M main
git push -u origin main
```

---

## 🌐 Deploying Your GitHub Website Online

Once your project is on GitHub, you can publish it live to the web using any of the following methods:

### Option A: 1-Click Deploy to Vercel (Recommended for Next.js)
Because this is a full-stack Next.js web application with dynamic routes, `/admin`, and API endpoints:
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** and select your `ironash-store` GitHub repository.
3. Vercel automatically detects Next.js. Click **Deploy**.
4. Within 60 seconds, your site is live with a free SSL certificate, free `your-store.vercel.app` domain, and full support for your custom domain!
5. Every time you push changes to GitHub, Vercel will automatically redeploy your site.

### Option B: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign in with GitHub.
2. Click **Add new site** > **Import an existing project**.
3. Select your GitHub repository.
4. Set Build command to `npm run build` and publish directory to `.next`.
5. Click **Deploy**.

### Option C: Deploy to cPanel (Custom Domain / Shared Hosting)

For cPanel hosting (LiteSpeed `lsnode.js` or Phusion Passenger), choose either of the two production-ready solutions below:

#### 🏆 Method 1: Standalone Deployment (Recommended — No `npm install` on cPanel!)
Next.js compiles a self-contained, standalone production build with its own minimal `node_modules` already included. You **never** need to run `npm install` on cPanel or deal with shared hosting memory timeouts!

1. **Build and bundle locally on your computer**:
   ```bash
   npm run build
   node scripts/prepare-cpanel.js
   ```
2. **Compress the standalone folder**:
   - Open `.next/standalone` on your computer.
   - Select all files and folders inside (`.next`, `data`, `node_modules`, `package.json`, `public`, `server.js`).
   - Compress them into a `.zip` file (e.g., `deploy.zip`).
3. **Upload to cPanel**:
   - In cPanel **File Manager**, delete any existing files in your app folder (e.g. `/home/username/app`).
   - Upload `deploy.zip` and click **Extract**.
4. **Configure in cPanel "Setup Node.js App"**:
   - **Node.js version**: 20.x (or 18.20+)
   - **Application startup file**: `server.js`
   - Click **Start App** (or **Restart**).
   - *Done! You do not need to click "Run NPM Install" on cPanel.*

---

#### 🛠️ Method 2: Standard Deployment with Lightweight `package.json`
If you prefer running `server.js` with cPanel's "Run NPM Install" button:

1. **Delete any broken `node_modules`**: In cPanel File Manager, right-click and delete any existing `node_modules` folder (check "Skip trash").
2. **Use production dependencies**: In File Manager, replace your `package.json` content with `cpanel.package.json` (which only contains the 12 runtime dependencies and zero dev tools).
3. **Run NPM Install in cPanel**: In **Setup Node.js App**, click **Run NPM Install**. Because it only installs 12 small runtime packages, it completes in ~15 seconds without hitting cPanel's 60-second browser timeout!
4. **Restart App**: Set startup file to `server.js` and click **Restart App**.

---

#### 🔍 Common Deployment Troubleshooting

- **`Error: Cannot find module 'next'` in `stderr.log` (`lsnode.js` / LiteSpeed)**:
  This means `node_modules/next` does not exist on cPanel because a previous UI `npm install` timed out or failed. Use Method 1 (Standalone) which has `node_modules/next` already bundled, or delete `node_modules`, copy `cpanel.package.json` into `package.json`, and click **Run NPM Install**.
- **`Error: Cannot find module 'typescript'` on Windows during local build**:
  Run `npm install --include=dev` on your Windows PC to ensure build-time tools like TypeScript are installed.
- **Running `npm install` with zero terminal access via Cron Jobs**:
  If the cPanel UI button still times out on slow shared hosting, add a 1-minute temporary cron job in cPanel > **Cron Jobs**:
  ```bash
  source /home/USERNAME/nodevenv/APP_FOLDER/20/bin/activate && cd /home/USERNAME/APP_FOLDER && npm install --omit=dev > npm_result.log 2>&1
  ```
  Once the log confirms completion, delete the cron job and restart the app.

---

## 🛠️ Project Structure

```
├── app/
│   ├── admin/             # Secure Store Management Portal
│   ├── api/               # API routes (products, branding, settings)
│   ├── layout.tsx         # Root layout with SEO meta tags & fonts
│   └── page.tsx           # Home page assembling all store sections
├── components/            # Reusable UI & Storefront components
│   ├── Navbar.tsx         # Sticky navigation with theme toggle & cart trigger
│   ├── Hero.tsx           # Hero banner with trust badges & CTAs
│   ├── ProductGrid.tsx    # Responsive product showcase
│   ├── CartSidebar.tsx    # Slide-out cart & COD checkout drawer
│   └── AdminDashboard.tsx # Comprehensive admin inventory & order panel
├── data/                  # Persisted data storage (products, branding)
├── lib/                   # Utility helpers and default store configurations
├── public/                # Static assets, logos, and images
└── server.js              # Production Node.js server entry for cPanel / custom hosts
```

---

## 📄 License
This project is open-source and ready for commercial use.
