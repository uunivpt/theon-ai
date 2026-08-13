import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyDssB0N7p1zFFgnNng-MtF7smG0NUWAs_U",
  authDomain: "theon-ai.firebaseapp.com",
  projectId: "theon-ai",
  storageBucket: "theon-ai.firebasestorage.app",
  messagingSenderId: "409136405663",
  appId: "1:409136405663:web:3bb33c4097d8b3ef1016aa",
  measurementId: "G-GWNEM7WENC",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

let appCheck: AppCheck | null = null;
const appCheckSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;

if (typeof window !== "undefined" && appCheckSiteKey) {
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.error("Firebase App Check initialization failed", error);
  }
}

export { appCheck };
