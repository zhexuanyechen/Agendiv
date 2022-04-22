import {
    initializeApp
} from 'firebase/app'

import {
    getFirestore,
    setDoc,
    doc,
    getDoc,
    onSnapshot
} from 'firebase/firestore'

import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import Modal from 'bootstrap/js/dist/modal';

/*Inicializacion */
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
const db = getFirestore(app);

const modalAuth = new Modal(document.getElementById("modalAuth"), {
    backdrop: "static",
    keyboard: false,
    focus: true
});
const tituloModalAuth = document.getElementById("tituloModalAuth");

const authForm = document.getElementById("authForm");
let userId = "";
let alumnoRef;
let alumData;
let arrayAsignaturas = [];
const tablaHorarioSemana = document.getElementById("tablaHorarioSemana");
const tablaHorarioDia = document.getElementById("tablaHorarioDia");

let ajustes = await getDoc(doc(db, "ajustes", "generales"));
console.log(ajustes.data());

onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        userId = usuario.uid;
        console.log("Logueado id: " + userId);
        alumnoRef = doc(db, "alumnos", userId);
        onSnapshot(alumnoRef,
            (doc) => {
                alumData = doc.data();
                getHorario();
                console.log(alumData);
            }, (error) => {
                console.log(error.message);
            });
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
            userId = cred.user.uid;
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
            userId = cred.user.uid;
            console.log('user created:', userId);
            authForm.reset();
            modalAuth.hide();
            setDoc(doc(db, 'alumnos', userId), {
                nombre: nombreUser,
                apellidos: apellidosUser,
                foto: "",
                lun: [],
                mar: [],
                mier: [],
                jue: [],
                vie: [],
                calendario: []
            }).then(() => {

            });
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

/*Horario */
function getHorario() {
    arrayAsignaturas = ["", alumData.lun, alumData.mar, alumData.mier, alumData.jue, alumData.vie];
    for (let i = 1; i < 6; i++) {
        for (let j = 0; j < arrayAsignaturas[i].length; j++) {
            console.log(arrayAsignaturas[i][j]);
            let cellId = "r" + j + "-c" + i;
            document.getElementById(cellId).innerHTML = arrayAsignaturas[i][j];
        }
    }
}

function anadirColumnas() {
    tablaHorarioSemana.innerHTML = `
        <colgroup>
          <col class="colHorario">
          <col class="colLunes">
          <col class="colMartes">
          <col class="colMier">
          <col class="colJueves">
          <col class="colViernes">
        </colgroup>
        <tbody>
            <tr class="cabeceraH">
            <th scope="col" class="horasAjuste">H<span>orario</span></th>
            <th scope="col">L<span>unes</span></th>
            <th scope="col">Ma<span>rtes</span></th>
            <th scope="col">Mi<span>ércoles</span></th>
            <th scope="col">J<span>ueves</span></th>
            <th scope="col">V<span>iernes</span></th>
            </tr>`;
}

/*Tabla de horario semanal*/
function crearTablaVacia(numFilas) {
    anadirColumnas();
    for (let i = 0; i < numFilas; i++) {
        let fila = tablaHorarioSemana.insertRow();
        for (let j = 0; j < 6; j++) {
            let newcell = fila.insertCell();
            newcell.id = "r" + i + "-c" + j;
            newcell.classList.add("celdaH");
            if (j !== 0) {
                newcell.innerHTML = "+";
                newcell.addEventListener("click", funcionCelda);
            } else {
                newcell.classList.add("horasAjuste");
                newcell.innerHTML = "<p>Hora1</p><p>Hora2</p>"
            }
        }
    }
    tablaHorarioSemana.innerHTML += `</tbody>`
}

function funcionCelda() {
    if (this.parentNode.parentNode.parentNode.id === "tablaHorarioSemana") {
        let idCelda = this.id;
        let numFila = this.parentNode.rowIndex;
        let numCol = this.cellIndex;
        console.log(idCelda + " " + numFila + " " + numCol);
    } else {
        let idCelda = this.id;
        let numFila = this.parentNode.rowIndex;
        let numCol = 1;
        console.log(idCelda + " " + numFila + " " + numCol);
    }
    if (this.innerHTML != "+") {

    } else {

    }
}

crearTablaVacia(ajustes.data().numHoras);

/*Tabla de horario diario*/
function elegirColor(colgroup) {
    tablaHorarioDia.innerHTML = "";
    if (colgroup === 1) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colLunes"></colgroup><tbody>`;
    } else if (colgroup === 2) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colMartes"></colgroup><tbody>`;
    } else if (colgroup === 3) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colMier"></colgroup><tbody>`;
    } else if (colgroup === 4) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colJueves"></colgroup><tbody>`;
    } else if (colgroup === 5) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colViernes"></colgroup><tbody>`;
    }
}

function imprimirTablaDiaH(dia) {
    if (dia <= 1 || dia >= 6) {
        dia = 1;
        btnIzqDia.disabled = true;
    } else if (dia === 5) {
        btnDerDia.disabled = true;
    } else {
        btnIzqDia.disabled = false;
        btnDerDia.disabled = false;
    }
    elegirColor(dia);
    let numHorasDia = arrayAsignaturas[dia].length;
    for (let i = 0; i <= numHorasDia; i++) {
        let fila = tablaHorarioDia.insertRow();
        let newcell = fila.insertCell();
        newcell.id = tablaHorarioSemana.rows[i].cells[dia].id + "dia";
        newcell.classList.add("celdaH");
        newcell.innerHTML = tablaHorarioSemana.rows[i].cells[dia].innerHTML;
        newcell.addEventListener("click", funcionCelda);
    }
    tablaHorarioDia.innerHTML += `</tbody>`
    tablaHorarioDia.style.display = "table";
}

const btnDiaH = document.getElementById("btndiaH");
const btnIzqDia = document.getElementById("btnIzqDia");
const btnDerDia = document.getElementById("btnDerDia");

btnDiaH.addEventListener("click", () => {
    tablaHorarioSemana.style.display = "none";
    btnDiaH.style.display = "none";
    btnIzqDia.style.display = "block";
    btnDerDia.style.display = "block";
    btnSemanaH.style.display = "block";
    let diaSemana = new Date().getDay()
    imprimirTablaDiaH(diaSemana);
});

btnSemanaH.addEventListener("click", () => {
    tablaHorarioDia.style.display = "none";
    tablaHorarioSemana.style.display = "table";
    btnSemanaH.style.display = "none";
    btnIzqDia.style.display = "none";
    btnDerDia.style.display = "none";
    btnDiaH.style.display = "block";
});

btnIzqDia.addEventListener("click", () => {
    diaSemana--;
    imprimirTablaDiaH(diaSemana);
});

btnDerDia.addEventListener("click", () => {
    diaSemana++;
    imprimirTablaDiaH(diaSemana);
});