import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword,
         signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function register(email, password, role, extra) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid  = cred.user.uid;
  await setDoc(doc(db,"users",uid), { uid, email, role, createdAt: new Date(), ...extra });
  if (role === "prof")
    await setDoc(doc(db,"professors",uid), {
      uid, name: extra.name||"", subjects:[], levels:[],
      wilaya: extra.wilaya||"", price:0, bio:"", rating:0, reviews:0, available:true
    });
  return cred.user;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db,"users",cred.user.uid));
  const data = snap.data();
  location.href = data.role === "prof" ? "dashboard-prof.html" : "dashboard-eleve.html";
}

export async function logout() {
  await signOut(auth);
  location.href = "index.html";
}

export function watchAuth(cb) {
  onAuthStateChanged(auth, async user => {
    if (user) {
      const snap = await getDoc(doc(db,"users",user.uid));
      cb(user, snap.data());
    } else { cb(null, null); }
  });
}
