import {
    initializeApp
} from 'firebase/app'

import {
    getFirestore,
    collection,
    getDocs
} from 'firebase/firestore'

import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

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

const auth = getAuth(app);
const modalAuth = new bootstrap.Modal(document.getElementById("modalAuth"), {
    backdrop: "static",
    keyboard: false,
    focus: true
});
const tituloModalAuth = document.getElementById("tituloModalAuth");
const authForm = document.getElementById("authForm");
let user;

const db = getFirestore(app);
const alumnosRef = collection(db, 'alumnos');

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        console.log("Logueado id: " + userId);
    } else {
        imprimirLoginForm();
        modalAuth.show();
    }
});

const logoutButton = document.getElementById('logout')
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('user signed out')
        })
        .catch(err => {
            console.log(err.message)
        })
})

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
            <div class="col-md-5">
              <p class="enlaceaSignup" tabindex="0">No tienes cuenta? Registrate aqui.</p>
            </div>
            <button type="button" id="login" class="botonA btnVerde col-md-5">Inicio
              sesión</button>
        </div>
        <p class="errorMessage text-center"></p>`;
    tituloModalAuth.innerText = "Iniciar Sesión";
    document.querySelector(".enlaceaSignup").addEventListener("click", imprimirSignupForm);
    document.getElementById("login").addEventListener("click", login);
}

function login() {
    let usuario = document.getElementById("usuario").value;
    let pwd = document.getElementById("pwd").value;
    let errorMessage = document.querySelector(".errorMessage");

    signInWithEmailAndPassword(auth, usuario, pwd)
        .then(cred => {
            user = cred.user;
            console.log('user logged in:', user.uid);
            authForm.reset();
            modalAuth.hide();
        }).catch(err => {
            console.log(err.message);
            errorMessage.innerText = err.message;
        })
}

function signup() {
    let usuario = document.getElementById("usuario").value;
    let pwd = document.getElementById("pwd").value;
    let errorMessage = document.querySelector(".errorMessage");
    let nombreUser = document.getElementById("nombre").value;
    let apellidosUser = document.getElementById("apellidos").value;

    createUserWithEmailAndPassword(auth, usuario, pwd)
        .then(cred => {
            user = cred.user;
            console.log('user created:', user.uid);
            authForm.reset();
            modalAuth.hide();
        }).catch(err => {
            console.log(err.message);
            errorMessage.innerText = err.message;
        });
}

function imprimirSignupForm() {
    contenidoModalAuth.innerHTML = `
        <div class="mb-2 form-group row gx-3">
            <div class="col-6">
              <label for="nombre" class="form-label">Nombre</label>
              <input type="text" class="form-control" placeholder="Nombre" id="nombre" required>
            </div>
            <div class="col-6">
              <label for="apellidos" class="form-label">Apellidos</label>
              <input type="text" class="form-control" placeholder="Apellidos" id="apellidos" required>
            </div>
        </div>
        <div class="mb-2 form-group">
            <label for="usuario" class="form-label">Correo electrónico</label>
            <input type="text" class="form-control" placeholder="Correo electrónico" id="usuario" required>
        </div>
        <div class="mb-2 form-group">
            <label for="pwd" class="form-label">Contraseña</label>
            <input type="text" class="form-control" placeholder="Contraseña" id="pwd" required>
        </div>
        <div class="modal-footer row align-items-stretch justify-content-around">
            <button type="button" id="cancelarSignup" class="botonA btnRojo col-md-5">Cancelar</button>
            <button type="button" id="signup" class="botonA btnVerde col-md-5">Registrarse</button>
        </div>
        <p class="errorMessage text-center"></p>`;
    tituloModalAuth.innerText = "Registrarse";
    document.getElementById("cancelarSignup").addEventListener("click", imprimirLoginForm);
    document.getElementById("signup").addEventListener("click", signup);
}

let alumnos = [];
getDocs(alumnosRef).then((snapshot) => {
    snapshot.docs.forEach((doc) => {
        alumnos.push({
            ...doc.data(),
            id: doc.id
        });
    });
    console.log(alumnos);
}).catch(err => {
    console.log(err.message)
})