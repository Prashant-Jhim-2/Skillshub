import { initializeApp, getApps, getApp  } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Part Of Uploading Image 
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_apiKey,
    authDomain:  process.env.NEXT_PUBLIC_authDomain,
    projectId:  process.env.NEXT_PUBLIC_projectId,
    storageBucket:  process.env.NEXT_PUBLIC_storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
    appId:  process.env.NEXT_PUBLIC_appId,
  };
  const app = getApps().find(app => app.name === "app2") || initializeApp(firebaseConfig, "app2");
  const storage = getStorage(app);
  const db = getFirestore(app);

export  {storage,db}

