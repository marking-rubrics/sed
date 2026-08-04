## 🚀 Quick Start: Forking & Deploying Your Own Instance

### 1. Fork this Repository
Click the **Fork** button at the top right of this page to create a copy under your GitHub account.

---

### 2. Set Up Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication** (Email/Password or Google Sign-In) and **Cloud Firestore**.
3. In **Authentication -> Settings -> Authorized Domains**, add:
   `<your-github-username>.github.io`
4. Register a Web App in Firebase Settings to get your configuration object.

---

### 3. Add GitHub Secrets for Automated Deployment
In your forked GitHub repository:
1. Go to **Settings -> Secrets and variables -> Actions**.
2. Click **New repository secret** and add the following keys from your Firebase config:
   * `VITE_FIREBASE_API_KEY`
   * `VITE_FIREBASE_AUTH_DOMAIN`
   * `VITE_FIREBASE_PROJECT_ID`
   * `VITE_FIREBASE_STORAGE_BUCKET`
   * `VITE_FIREBASE_MESSAGING_SENDER_ID`
   * `VITE_FIREBASE_MEASUREMENT_ID`
   * `VITE_FIREBASE_APP_ID`

---

### 4. Enable GitHub Pages
1. Go to your repository's **Settings -> Actions -> General -> Workflow permissions** and select **Read and write permissions**.
2. Go to **Settings -> Pages**.
3. Set **Source** to `Deploy from a branch`, choose `gh-pages` branch and `/ (root)`, then click **Save**.
4. Push any commit to `main` (or run the workflow manually under the **Actions** tab) to deploy!
