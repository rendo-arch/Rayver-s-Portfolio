/* ---------- REAL VISITOR WALL (Firebase Auth + Firestore) ---------- */
// One doc per Google account, keyed by their UID — revisiting/refreshing
// updates the SAME doc instead of creating a new one, so the count is
// always "unique real accounts," never inflated by reloads.
//
// SETUP REQUIRED — see VISITOR_SETUP.md for the full walkthrough:
//   1. Create a free project at https://console.firebase.google.com
//   2. Authentication → Sign-in method → enable "Google"
//   3. Authentication → Settings → Authorized domains → add your Vercel domain
//   4. Build a Firestore Database (production mode) + paste in the security
//      rules from VISITOR_SETUP.md
//   5. Project settings → General → Your apps → add a Web app → copy the
//      config object into FIREBASE_CONFIG below

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, serverTimestamp,
  collection, query, orderBy, limit, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ---- PASTE YOUR FIREBASE CONFIG HERE ----
const firebaseConfig = {
  apiKey: "AIzaSyApWVi6EYyI8if1M_PkGRbb-tB6j8edfPc",
  authDomain: "rayver-portfolio.firebaseapp.com",
  projectId: "rayver-portfolio",
  storageBucket: "rayver-portfolio.firebasestorage.app",
  messagingSenderId: "695520569465",
  appId: "1:695520569465:web:4d00fd5b5a9fb079f30ca8",
  measurementId: "G-6JE0DJP8R4"
};

const MAX_AVATARS_SHOWN = 6;

const wall = document.getElementById('visitorWall');
const signInBtn = document.getElementById('visitorSignIn');
const avatarsEl = document.getElementById('visitorAvatars');
const countEl = document.getElementById('visitorCount');

if (wall && signInBtn && avatarsEl && countEl && !FIREBASE_CONFIG.apiKey.startsWith('YOUR_')) {
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();

  function renderWall(visitors){
    avatarsEl.innerHTML = '';
    visitors.slice(0, MAX_AVATARS_SHOWN).forEach((v) => {
      const img = document.createElement('img');
      img.src = v.photoURL || '';
      img.alt = v.name || 'Visitor';
      img.title = v.name || 'Visitor';
      img.referrerPolicy = 'no-referrer'; // Google photo URLs need this to load reliably
      img.loading = 'lazy';
      avatarsEl.appendChild(img);
    });
    if (visitors.length > MAX_AVATARS_SHOWN) {
      const more = document.createElement('span');
      more.className = 'visitor-more';
      more.textContent = '+' + (visitors.length - MAX_AVATARS_SHOWN);
      avatarsEl.appendChild(more);
    }
    countEl.textContent = visitors.length
      ? (visitors.length + (visitors.length === 1 ? ' visitor' : ' visitors'))
      : 'Be the first visitor';
  }

  // Live, public read of the visitor wall — anyone can see who's signed in,
  // no login required just to view it.
  const visitorsQuery = query(collection(db, 'visitors'), orderBy('lastVisit', 'desc'), limit(50));
  onSnapshot(
    visitorsQuery,
    (snap) => renderWall(snap.docs.map((d) => d.data())),
    () => { countEl.textContent = 'Welcome!'; }
  );

  // Sign-in state: hide the button once signed in, and upsert this
  // visitor's own doc (their doc, their write — see Firestore rules).
  onAuthStateChanged(auth, (user) => {
    if (user) {
      signInBtn.style.display = 'none';
      setDoc(doc(db, 'visitors', user.uid), {
        name: user.displayName || 'Visitor',
        photoURL: user.photoURL || '',
        lastVisit: serverTimestamp()
      }, { merge: true }).catch(() => {});
    } else {
      signInBtn.style.display = '';
    }
  });

  signInBtn.addEventListener('click', () => {
    signInBtn.disabled = true;
    signInWithPopup(auth, provider)
      .catch(() => {})
      .finally(() => { signInBtn.disabled = false; });
  });
} else if (countEl) {
  // Config not filled in yet — fail quietly instead of breaking the page.
  countEl.textContent = 'Welcome!';
  if (signInBtn) signInBtn.style.display = 'none';
}
