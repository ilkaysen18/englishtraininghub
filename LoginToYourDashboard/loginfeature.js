/*  ============================================
    LOGIN FEATURE — Firebase Google Auth + Approval
    Add to any page with:
      1. The Firebase CDN scripts
      2. <script src="loginfeature.js"></script>
      3. Call: LoginFeature.init({ firebaseConfig: {...} })
    ============================================ */

const LoginFeature = (() => {

  const STYLES = `
    #lf-overlay {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      background: #fff; transition: opacity 0.3s;
    }
    html.dark #lf-overlay { background: #181818; color: #f3f3f3; }
    #lf-overlay.lf-hidden { opacity: 0; pointer-events: none; }

    #lf-box {
      text-align: center; padding: 2.5rem; max-width: 400px; width: 90%;
      border-radius: 12px;
      background: #fffdf5; box-shadow: 0 8px 30px rgba(0,0,0,0.1);
      border: 2px solid #eee;
    }
    html.dark #lf-box { background: #2d2d2d; border-color: #444; }

    #lf-box h2 { margin: 0 0 0.5rem; font-size: 1.5rem; }
    #lf-box p  { margin: 0 0 1.5rem; color: #666; font-size: 0.95rem; }
    html.dark #lf-box p { color: #aaa; }

    .lf-google-btn {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 12px 24px; border-radius: 8px; border: 2px solid #ddd;
      background: #fff; color: #333; font-size: 1rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .lf-google-btn:hover { border-color: #4285F4; box-shadow: 0 2px 8px rgba(66,133,244,0.3); }
    html.dark .lf-google-btn { background: #3a3a3a; color: #eee; border-color: #555; }
    .lf-google-btn img { width: 20px; height: 20px; }

    #lf-status-icon { font-size: 3.5rem; margin-bottom: 1rem; }

    .lf-signout-btn {
      margin-top: 1rem; padding: 8px 20px; border-radius: 6px;
      background: #e74c3c; color: #fff; border: none; cursor: pointer;
      font-size: 0.9rem; font-weight: 600;
    }
    .lf-signout-btn:hover { background: #c0392b; }

    #lf-user-bar {
      position: fixed; top: 0; right: 0; z-index: 9998;
      display: none; align-items: center; gap: 8px;
      padding: 8px 16px; font-size: 0.85rem;
    }
    #lf-user-bar img {
      width: 28px; height: 28px; border-radius: 50%;
      border: 2px solid #F9D423;
    }
    #lf-user-bar button {
      padding: 4px 12px; border-radius: 4px; border: 1px solid #ccc;
      background: transparent; cursor: pointer; font-size: 0.8rem; color: inherit;
    }
    #lf-user-bar button:hover { background: rgba(0,0,0,0.05); }
    html.dark #lf-user-bar button { border-color: #555; }
    html.dark #lf-user-bar button:hover { background: rgba(255,255,255,0.1); }
  `;

  let auth, db;

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "lf-overlay";
    overlay.innerHTML = `
      <div id="lf-box">
        <div id="lf-status-icon">🔐</div>
        <h2 id="lf-title">Sign In Required</h2>
        <p id="lf-message">Please sign in with Google to continue.</p>
        <div id="lf-actions"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const bar = document.createElement("div");
    bar.id = "lf-user-bar";
    bar.innerHTML = `
      <img id="lf-avatar" src="" alt="">
      <span id="lf-username"></span>
      <button id="lf-bar-signout">Sign Out</button>
    `;
    document.body.appendChild(bar);

    document.getElementById("lf-bar-signout").addEventListener("click", handleSignOut);

    renderLoginButton();
  }

  function renderLoginButton() {
    const actions = document.getElementById("lf-actions");
    actions.innerHTML = "";
    const btn = document.createElement("button");
    btn.className = "lf-google-btn";
    btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G"> Sign in with Google';
    btn.addEventListener("click", handleSignIn);
    actions.appendChild(btn);
  }

  function renderSignOutButton() {
    const actions = document.getElementById("lf-actions");
    actions.innerHTML = "";
    const btn = document.createElement("button");
    btn.className = "lf-signout-btn";
    btn.textContent = "Sign Out";
    btn.addEventListener("click", handleSignOut);
    actions.appendChild(btn);
  }

  function showLogin() {
    const overlay = document.getElementById("lf-overlay");
    overlay.classList.remove("lf-hidden");
    document.getElementById("lf-status-icon").textContent = "🔐";
    document.getElementById("lf-title").textContent = "Sign In Required";
    document.getElementById("lf-message").textContent = "Please sign in with Google to continue.";
    renderLoginButton();
    document.getElementById("lf-user-bar").style.display = "none";
  }

  function showPending() {
    const overlay = document.getElementById("lf-overlay");
    overlay.classList.remove("lf-hidden");
    document.getElementById("lf-status-icon").textContent = "⏳";
    document.getElementById("lf-title").textContent = "Awaiting Approval";
    document.getElementById("lf-message").textContent = "Your account is pending admin approval. Please check back later.";
    renderSignOutButton();
  }

  function showRejected() {
    const overlay = document.getElementById("lf-overlay");
    overlay.classList.remove("lf-hidden");
    document.getElementById("lf-status-icon").textContent = "❌";
    document.getElementById("lf-title").textContent = "Access Denied";
    document.getElementById("lf-message").textContent = "Your registration was not approved. Please contact the administrator.";
    renderSignOutButton();
  }

  function showApproved(user) {
    document.getElementById("lf-overlay").classList.add("lf-hidden");
    const bar = document.getElementById("lf-user-bar");
    bar.style.display = "flex";
    document.getElementById("lf-avatar").src = user.photoURL || "";
    document.getElementById("lf-username").textContent = user.displayName || "User";
  }

  async function handleSignIn() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        document.getElementById("lf-message").textContent = "Sign-in failed: " + error.message;
      }
    }
  }

  function handleSignOut() {
    auth.signOut();
  }

  async function checkUserStatus(user) {
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      await db.collection("users").doc(user.uid).set({
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        status: "pending",
        requestedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showPending();
    } else {
      const status = userDoc.data().status;
      if (status === "approved") {
        showApproved(user);
      } else if (status === "rejected") {
        showRejected();
      } else {
        showPending();
      }
    }
  }

  function init(config) {
    if (!config || !config.firebaseConfig) {
      console.error("LoginFeature: firebaseConfig is required.");
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(config.firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.firestore();

    injectStyles();
    createOverlay();

    auth.onAuthStateChanged(async (user) => {
      if (user) {
        await checkUserStatus(user);
      } else {
        showLogin();
      }
    });
  }

  return { init };
})();
