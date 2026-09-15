# cPanel Deployment Guide for IronAsh (Next.js 15)

This guide explains how to deploy this Next.js app to cPanel (LiteSpeed `lsnode.js` or CloudLinux / Phusion Passenger) and fix the **Error 503**, **Error: Cannot find module 'next'**, and **cPanel npm install errors**.

---

## ⚠️ Why These Errors Occur on Shared cPanel Hosting

1. **`Error: Cannot find module 'next'` in `stderr.log` (`lsnode.js`)**:
   When LiteSpeed Web Server runs `/home/ironash/app/server.js`, it looks for `next` inside `/home/ironash/app/node_modules/next`. If `npm install` was never completed on cPanel, or if the cPanel web UI timed out after 60 seconds, `next` is missing and the app crashes immediately.
2. **cPanel UI "Run NPM Install" Button Timeout**:
   cPanel's web interface runs `npm install` through a web request that times out after 60 seconds. Because standard `package.json` files contain heavy build/dev dependencies, npm takes too long on shared hosting and the browser request times out, leaving an incomplete installation.
3. **Memory Limits during `next build` on cPanel**:
   Next.js 15 requires ~1.5 GB to 2 GB of RAM to compile pages and bundles. Shared cPanel accounts usually have 512 MB to 1 GB RAM, causing `next build` to be killed. **Always run `next build` locally on your computer, never on shared cPanel!**

---

## 🏆 Method 1: The Standalone Build (Recommended — 0 `npm install` on cPanel!)

Next.js has a built-in feature called **Standalone Mode**. When you build locally, Next.js generates `.next/standalone`, which **already contains its own minimal, self-contained `node_modules` with `next`, `react`, and all production runtime code!**

### Step 1: Build & Bundle on Your Computer
In Command Prompt / Terminal in your project folder:
```bash
npm install --include=dev
npm run build
node scripts/prepare-cpanel.js
```
*(This builds the project and automatically copies `public`, `.next/static`, and `data` into `.next/standalone`.)*

### Step 2: Prepare the ZIP File
1. Open the folder: `.next/standalone` on your computer.
2. Select **all files and folders inside** `.next/standalone`:
   - `.next` (ensure hidden files are visible)
   - `data`
   - `node_modules` (already contains `next`, `react`, etc.)
   - `package.json`
   - `public`
   - `server.js`
3. Compress them into a ZIP file named `cpanel_deploy.zip`.

### Step 3: Upload and Extract in cPanel
1. In cPanel **File Manager**, navigate to your application root (e.g. `/home/ironash/app`).
2. Delete everything currently inside that folder (including any broken `node_modules`).
3. Upload `cpanel_deploy.zip` and click **Extract**.

### Step 4: Configure "Setup Node.js App"
1. In cPanel, open **Setup Node.js App**.
2. Set:
   - **Node.js version**: 20.x (or 18.20+)
   - **Application startup file**: `server.js`
3. Click **Start App** (or **Restart**).
4. **Done!** You do **NOT** need to click "Run NPM Install" on cPanel because all dependencies are already bundled inside the uploaded folder.

---

## 🛠️ Method 2: Installing Dependencies on cPanel via UI

If you prefer uploading source files and running `npm install` on cPanel:

### 1. Delete Any Existing Broken `node_modules`
In cPanel **File Manager**, right-click the existing `node_modules` folder and click **Delete** (check "Skip trash"). If you leave a corrupted or Windows-uploaded `node_modules` folder, npm cannot resolve dependencies.

### 2. Replace `package.json` with the Lightweight Version
1. In cPanel File Manager, edit `package.json` in your app folder.
2. Replace its entire contents with the provided `cpanel.package.json` (which only contains the 12 runtime dependencies and zero dev tools).
3. Save changes.

### 3. Run NPM Install
In cPanel **Setup Node.js App**, click **Run NPM Install**. Because it only installs 12 small packages, it finishes in **15–20 seconds without timing out**!

### 4. Restart the Application
Set application startup file to `server.js` and click **Restart App**.

---

## ⏰ Method 3: Running `npm install` via cPanel Cron Jobs (No Terminal Needed)

If your hosting provider has strict timeouts and the UI button still fails:
1. In cPanel, open **Cron Jobs**.
2. Under "Add New Cron Job", set the time to Once Every Minute (`* * * * *`).
3. In the **Command** field, enter (replace `ironash` and `app` with your actual cPanel username and app folder):
   ```bash
   source /home/ironash/nodevenv/app/20/bin/activate && cd /home/ironash/app && npm install --omit=dev > npm_result.log 2>&1
   ```
4. Click **Add New Cron Job**.
5. Wait 2 minutes, then check `npm_result.log` in File Manager to confirm successful installation.
6. **Delete the cron job**, then restart the Node.js application.

---

### Step 3: Configure "Setup Node.js App" in cPanel
1. Log in to your **cPanel**.
2. Under the **Software** section, click **Setup Node.js App**.
3. Click **Create Application**:
   - **Node.js version**: Select **Node.js 20.x** (or at minimum 18.20+).
   - **Application mode**: `Production`.
   - **Application root**: e.g., `ironash` or your desired folder name.
   - **Application URL**: Select your domain or subdomain.
   - **Application startup file**: `server.js`
4. Click **Create**.
5. Once created, click **Stop App** while we upload the files.

---

### Step 4: Upload and Extract Files in cPanel File Manager
1. Open cPanel **File Manager**.
2. In the top right corner, click **Settings** and ensure **"Show Hidden Files (dotfiles)"** is checked, then click **Save**.
3. Navigate to your application root directory (e.g., `/home/username/ironash`).
4. Click **Upload** and upload your `.zip` file from Step 2.
5. Right-click the `.zip` file and click **Extract**.
6. **Verify**: Ensure the `.next` directory is present in the folder along with `server.js` and `package.json`.

---

### Step 5: Install Dependencies Directly from cPanel UI (No Terminal Needed!)

> ⚠️ **First, delete the broken `node_modules` folder!**
> In cPanel File Manager, right-click and **Delete** the existing `node_modules` folder (check "Skip trash"). If you leave a corrupted or Windows/Mac `node_modules` folder there, the cPanel button will fail.

Now choose **any ONE** of these 3 easy ways to tell cPanel to install only production dependencies:

#### Option A: Use the Production `package.json` (Recommended & Easiest)
1. In cPanel File Manager, find `package.json` in your app folder.
2. Right-click `package.json` and click **Edit**.
3. Delete the entire `"devDependencies": { ... }` block so only `"dependencies"` remain (or replace its content with the provided `cpanel.package.json`).
4. Click **Save Changes**.
5. In cPanel **Setup Node.js App**, click the **Run NPM Install** button.
6. It will finish in under 30 seconds with no errors!

#### Option B: Use the `.npmrc` File
1. Ensure the included `.npmrc` file (which has `omit=dev` and `production=true`) is uploaded into your application folder on cPanel.
2. In cPanel **Setup Node.js App**, click **Run NPM Install**.
3. npm automatically reads `.npmrc` and skips all devDependencies.

#### Option C: Add Environment Variable in cPanel UI
1. In cPanel **Setup Node.js App**, scroll down to **Environment variables**.
2. Click **Add Variable**:
   - Name: `NPM_CONFIG_OMIT`
   - Value: `dev`
3. Click **Add Variable** again:
   - Name: `NODE_ENV`
   - Value: `production`
4. Click **Save**, then click the **Run NPM Install** button.

---

### Step 6: Start Your Application
1. In cPanel **Setup Node.js App**, click **Start App** (or **Restart**).
2. Click **Open URL** or visit your domain in your browser.
3. Your IronAsh store is now live without Error 503!

---

## 🔍 How to View Error Logs if an Issue Persists
If you still see 503:
1. In File Manager, check your application folder for:
   - `stderr.log`
   - `passenger.log`
2. Open the file to see the exact line causing the crash. Usually it is:
   - "Cannot find module 'next'" -> run `npm install --omit=dev`.
   - "Could not find a production build in the '.next' directory" -> re-upload `.next`.
