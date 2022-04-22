import {
    initializeApp
} from 'firebase/app';

import {
    getStorage
} from "firebase/storage";

import {
    getFirestore,
    setDoc,
    doc,
    getDoc,
    onSnapshot
} from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyAeFEDqLmHUdmHUXSbfpGfWwWtnGsBHuN4",
    authDomain: "agendiv-atenpace-e8772.firebaseapp.com",
    projectId: "agendiv-atenpace-e8772",
    storageBucket: "agendiv-atenpace-e8772.appspot.com",
    messagingSenderId: "977931153855",
    appId: "1:977931153855:web:7773aab366f14dda2f310a",
    measurementId: "G-RVZR9GHSX9"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/*Pictogramas */