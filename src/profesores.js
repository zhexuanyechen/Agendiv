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

/**Modales */
const modalAuth = new Modal(document.getElementById("modalAuth"));
const tituloModalAuth = document.getElementById("tituloModalAuth");
const authForm = document.getElementById("authForm");
const modalAdd = new Modal(document.getElementById("modalAdd"));
const tituloModalAdd = document.getElementById("tituloModalAdd");
const contenidoModalAdd = document.getElementById("contenidoModalAdd");

const uploadImgForm = document.getElementById("uploadImgForm");
const inputImage = document.getElementById("inputImage");
const btnUploadCalendario = document.getElementById("uploadCalendario");
const btnUploadHorario = document.getElementById("uploadHorario");
const pictosHorCollectionRef = collection(db, 'pictosHorario');

const pictosHorarioSnapshot = await getDocs(collection(db, "pictosHorario"));
const pictosCalendarioSnapshot = await getDocs(collection(db, "pictosCalendario"));

inputImage.addEventListener("change", checkInputImage, false);

let unsubscribe;

onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        userId = usuario.uid;
        alumnoRef = doc(db, "alumnos", userId);
        modalAuth.hide();
        unsubscribe = onSnapshot(alumnoRef,
            (doc) => {
                alumData = doc.data();
                arrayCalendario = getArrayCalendario(alumData.calendario);
                getHorario(alumData);
            }, (error) => {
                console.log(error.message);
            });
    } else {
        imprimirLoginForm();
        modalAuth.show();
    }
});

logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('user signed out');
            imprimirLoginForm();
            modalAuth.show();
        })
        .catch(err => {
            console.log(err.message)
        })
});

function login() {
    let usuario = document.getElementById("usuario").value;
    let pwd = document.getElementById("pwd").value;
    let errorMessage = document.querySelector(".errorMessage");

    signInWithEmailAndPassword(auth, usuario, pwd)
        .then(cred => {
            userId = cred.user.uid;
            authForm.reset();
            modalAuth.hide();
        }).catch(err => {
            console.log(err.message);
            errorMessage.innerText = err.message;
        })
}

function imprimirLoginForm() {
    authForm.innerHTML = `
        <div class="mb-2 form-group">
            <label for="usuario" class="form-label">Correo electrónico</label>
            <input type="text" class="form-control" placeholder="Correo electrónico" id="usuario" required>
        </div>
        <div class="mb-2 form-group">
            <label for="pwd" class="form-label">Contraseña</label>
            <input type="text" class="form-control" placeholder="Contraseña" id="pwd" required>
        </div>
        <div class="modal-footer row align-items-start">
            <p id="enlaceaSignup" class="col-md-5" tabindex="0">No tienes cuenta? Registrate aqui.</p>
            <button type="button" id="login" class="botonA btnVerde col-md-5">Inicio
              sesión</button>
        </div>
        <p class="errorMessage text-center"></p>`;
    tituloModalAuth.innerText = "Iniciar Sesión";
    document.getElementById("enlaceaSignup").addEventListener("click", imprimirSignupForm);
    document.getElementById("login").addEventListener("click", login);
}

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
        let imageName = image.name;
        const pictosHorarioRef = ref(storage, '/pictosHorario/' + imageName);
        uploadImage(pictosHorarioRef).then((imgUrl) => {
            addDoc(collection(db, 'pictosHorario'), {
                nombre: imageName.split(".", 1)[0],
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

async function uploadInputImageCalendario() {
    if (inputImage.files.length !== 0) {
        let image = inputImage.files[0];
        let imageName = image.name;
        const pictosCalRef = ref(storage, '/pictosCalendario/' + imageName);
        uploadImage(pictosCalRef).then((imgUrl) => {
            addDoc(collection(db, 'pictosCalendario'), {
                nombre: imageName.split(".", 1)[0],
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

btnUploadCalendario.addEventListener("click", uploadInputImageCalendario, false);