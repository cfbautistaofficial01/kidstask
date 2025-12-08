import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNkox8VQncU5NZdexTJynw-LWs8ThkBWE",
    authDomain: "kidsapp-c2618.firebaseapp.com",
    projectId: "kidsapp-c2618",
    storageBucket: "kidsapp-c2618.firebasestorage.app",
    messagingSenderId: "1087087588640",
    appId: "1:1087087588640:web:cba4d5523625179c78d345"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);