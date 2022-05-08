import {
    initializeApp
} from 'firebase/app'

import {
    getFirestore,
    setDoc,
    doc,
    getDoc,
    onSnapshot,
    collection,
    getDocs,
    updateDoc,
    addDoc
} from 'firebase/firestore'

import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import Modal from 'bootstrap/js/dist/modal';

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    uploadBytesResumable
} from "firebase/storage";

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
const db = getFirestore(app);

const uploadImgForm = document.getElementById("uploadImgForm");
const inputImage = document.getElementById("inputImage");
const btnUploadCalendario = document.getElementById("uploadCalendario");
const btnUploadHorario = document.getElementById("uploadHorario");
const pictosHorCollectionRef = collection(db, 'pictosHorario');

inputImage.addEventListener("change", checkInputImage, false);

function checkInputImage() {
    let files = this.files;
    let fileName = files[0].name;
    let extFile = fileName.split(".").pop();
    if (extFile === "jpg" || extFile === "jpeg" || extFile === "png") {
        console.log("Extensión correcta.");
    } else {
        alert("solo pueden subirse imágenes en formato .jpg, .jpeg, .png.");
    }
}
/*Pictogramas */

async function uploadInputImageHorario() {
    if (inputImage.files.length !== 0) {
        let image = inputImage.files[0];
        let imageName = image.name.split(".", 1)[0];
        const pictosHorarioRef = ref(storage, '/pictosHorario/' + imageName);
        uploadImage(pictosHorarioRef).then((imgUrl) => {
            addDoc(collection(db, 'pictosHorario'), {
                nombre: imageName,
                foto: imgUrl,
                audio: "prueba"
            }).then(() => {
                console.log('Se ha subido el pictograma ' + imageName + ' a la base de datos.');
            }).catch((error => {
                console.log(error);
            }));
        })
    }
}

function uploadImage(pathRef) {
    const pictosHorarioRef = ref(storage, pathRef);
    const uploadImage = uploadBytesResumable(pictosHorarioRef, inputImage.files[0]);

    return new Promise((resolve, reject) => {
        uploadImage.on('state_changed', (snapshot) => {
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        }, (error) => {
            console.log(error);
            reject(error);
        }, async () => {
            const imgURL = await getDownloadURL(uploadImage.snapshot.ref);
            console.log(imgURL);
            resolve(imgURL); //Devuelve la url como un thenable
        });
    });
}

btnUploadHorario.addEventListener("click", uploadInputImageHorario, false);

async function uploadInputImageCalendario() {

}
btnUploadCalendario.addEventListener("click", uploadInputImageCalendario, false);