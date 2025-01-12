import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
    // Firebase Config
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_apiKey,
        authDomain:  process.env.NEXT_PUBLIC_authDomain,
        projectId:  process.env.NEXT_PUBLIC_projectId,
        storageBucket:  process.env.NEXT_PUBLIC_storageBucket,
        messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
        appId:  process.env.NEXT_PUBLIC_appId,
      };
      const app = initializeApp(firebaseConfig);
      const storage = getStorage(app);
      const db = getFirestore(app);

export default db