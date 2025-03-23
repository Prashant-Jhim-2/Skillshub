// firebase.js
import { initializeApp, getApps, getApp  } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_SKILLSHUB_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_SKILLSHUB_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_SKILLSHUB_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_SKILLSHUB_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_SKILLSHUB_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_SKILLSHUB_APPID
  };
 // Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app)
// Get Firestore instance
const db = getFirestore(app);

export { db };
