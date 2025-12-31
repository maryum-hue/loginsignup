import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcaoVIzjoQIwAJ_9m_zxBcjPcWBjuSmBk",
  authDomain: "sign-up-login-page-af63e.firebaseapp.com",
  projectId: "sign-up-login-page-af63e",
  storageBucket: "sign-up-login-page-af63e.appspot.com",
  messagingSenderId: "287209245759",
  appId: "1:287209245759:web:ba48cba9d9586679277c8a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
