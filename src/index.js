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
    updateDoc
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
    ref
} from "firebase/storage";

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
const storage = getStorage();
const storageRef = ref(storage, "pictosHorario");

const modalAuth = new Modal(document.getElementById("modalAuth"));
const tituloModalAuth = document.getElementById("tituloModalAuth");
const authForm = document.getElementById("authForm");
const modalAdd = new Modal(document.getElementById("modalAdd"));
const tituloModalAdd = document.getElementById("tituloModalAdd");
const contenidoModalAdd = document.getElementById("contenidoModalAdd");

let userId = "";
let alumnoRef;
let arrayAsignaturas = [];
let alumData;

const tablaHorarioSemana = document.getElementById("tablaHorarioSemana");
const tablaHorarioDia = document.getElementById("tablaHorarioDia");

let ajustes = await getDoc(doc(db, "ajustes", "generales"));
let numHorasHorario = ajustes.data().numHoras;
let unsubscribe;
let diaSemana = new Date().getDay();

onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        userId = usuario.uid;
        console.log("Logueado id: " + userId);
        alumnoRef = doc(db, "alumnos", userId);
        modalAuth.hide();
        unsubscribe = onSnapshot(alumnoRef,
            (doc) => {
                alumData = doc.data();
                getHorario(alumData);
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
            console.log('user signed out');
            unsubscribe();
        })
        .catch(err => {
            console.log(err.message)
        })
});

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
    let arrayVacío = Array(numHorasHorario).fill("+");
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
                lun: arrayVacío,
                mar: arrayVacío,
                mier: arrayVacío,
                jue: arrayVacío,
                vie: arrayVacío,
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
function getHorario(alumData) {
    arrayAsignaturas = ["", alumData.lun, alumData.mar, alumData.mier, alumData.jue, alumData.vie];
    for (let i = 1; i < 6; i++) {
        for (let j = 0; j < arrayAsignaturas[i].length; j++) {
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
                newcell.addEventListener("click", funcionCelda, false);
            } else {
                newcell.classList.add("horasAjuste");
                newcell.innerHTML = "<p>Hora1</p><p>Hora2</p>"
            }
        }
    }
}

let idCeldaClickada;
let numFila;
let numCol;

function funcionCelda() {
    idCeldaClickada = this.id;
    numFila = parseInt(idCeldaClickada[1]);
    numCol = parseInt(idCeldaClickada[4]);
    console.log(idCeldaClickada + " " + numFila + " " + numCol);
    if (this.innerHTML != "+") {
        imprimirModalIntermedio();
    } else {
        let text = `<i class="fas fa-edit"></i>Cambiar`;
        imprimirModalAdd(text);
    }
    modalAdd.show();
}

function imprimirModalIntermedio() {
    contenidoModalAdd.innerHTML = "";
    tituloModalAdd.innerText = "¿Quieres cambiar o borrar una actividad?";
    let div = document.createElement("div");
    div.id = "modalIntermedio";
    div.classList.add("row", "row-col-2", "justify-content-around", "align-items-stretch");
    let btnBorrar = document.createElement("button");
    btnBorrar.classList.add("btn", "btnRojo", "col-5");
    btnBorrar.innerHTML = `<i class="fas fa-trash-alt"></i>Borrar`;
    let btnEditar = document.createElement("button");
    btnEditar.classList.add("btn", "btnVerde", "col-5");
    btnEditar.innerHTML = `<i class="fas fa-edit"></i>Cambiar`;
    div.append(btnBorrar, btnEditar);
    contenidoModalAdd.appendChild(div);
    btnEditar.addEventListener("click", () => {
        let text = `<i class="fas fa-plus"></i>Añadir`;
        imprimirModalAdd(text);
    });
    btnBorrar.addEventListener("click", deleteAsignatura);
}

function imprimirModalAdd(text) {
    contenidoModalAdd.innerHTML = "";
    tituloModalAdd.innerText = "Qué quieres poner?";
    let btnScrollDiv = document.createElement("div");
    btnScrollDiv.classList.add("btnScroll");
    let btnScrollUp = document.createElement("button");
    btnScrollUp.classList.add("btn", "scrollBtnUp");
    btnScrollUp.innerHTML = `<i class="far fa-arrow-alt-circle-up"></i>`
    let btnScrollDown = document.createElement("button");
    btnScrollDown.classList.add("btn", "scrollBtnDown");
    btnScrollDown.innerHTML = `<i class="far fa-arrow-alt-circle-down"></i>`;
    btnScrollDiv.append(btnScrollDown, btnScrollUp);
    let btnScrollDivClone = btnScrollDiv.cloneNode(true);
    let addForm = document.createElement("form");
    addForm.id = "addForm";
    contenidoModalAdd.append(btnScrollDiv, addForm, btnScrollDivClone);
    cargarAsignaturasModal();
    let btnModalDiv = document.createElement("div");
    btnModalDiv.classList.add("modal-footer", "row", "row-col-2", "align-items-stretch", "justify-content-around");
    let btnCancelar = document.createElement("button");
    btnCancelar.classList.add("btn", "btnRojo", "col-5");
    btnCancelar.setAttribute("data-bs-dismiss", "modal");
    btnCancelar.innerHTML = `<i class="fas fa-times"></i>Cancelar</button>`;
    let btnAdd = document.createElement("button");
    btnAdd.classList.add("btn", "btnVerde", "col-5");
    btnAdd.innerHTML = `${text}`;
    btnModalDiv.append(btnCancelar, btnAdd);
    contenidoModalAdd.append(btnModalDiv);
    btnAdd.addEventListener("click", addAsignatura);

}

function cargarAsignaturasModal() {
    let html = "";
    for (let i = 0; i < arrayPictosHorario.length; i++) {
        html += `<div class="col-4">
                  <div class="dibujoInput"><input type="radio" name="opcionHorario" id="${arrayPictosHorario[i].id}" value="${arrayPictosHorario[i].nombre}">
                    <label for="${arrayPictosHorario[i].id}" class="imgLabel"><img src="${arrayPictosHorario[i].foto}"class="rounded dibujo-cc"></label>
                  </div>
                </div>`
    }
    console.log(arrayPictosHorario);
    document.getElementById("addForm").innerHTML = html;
}

async function addAsignatura() {
    let diaSemana = getdiaHorario(numCol);
    let seleccionado = document.querySelector("input[name='opcionHorario']:checked");
    let arrayAux = alumData[diaSemana];
    if (seleccionado) {
        let asiganadir = arrayPictosHorario.find(asig => asig.nombre == seleccionado.value);
        arrayAux[numFila] = asiganadir.nombre;
        document.getElementById(idCeldaClickada).innerHTML = "<img src='" + asiganadir.foto + "' class='rounded dibujoHorario'>";
        addForm.reset();
        await updateDoc(alumnoRef, {
            [diaSemana]: arrayAux
        });
        modalAdd.hide();
    }
}

async function deleteAsignatura() {
    let diaSemana = getdiaHorario(numCol);
    let arrayAux = alumData[diaSemana];
    arrayAux[numFila] = "+";
    console.log(arrayAux);
    await updateDoc(alumnoRef, {
        [diaSemana]: arrayAux
    });
    modalAdd.hide();
}

crearTablaVacia(numHorasHorario);

/*Tabla de horario diario*/
function elegirColor(colgroup) {
    tablaHorarioDia.innerHTML = "";
    if (colgroup === 1) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colLunes"></colgroup>`;
    } else if (colgroup === 2) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colMartes"></colgroup>`;
    } else if (colgroup === 3) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colMier"></colgroup>`;
    } else if (colgroup === 4) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colJueves"></colgroup>`;
    } else if (colgroup === 5) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colViernes"></colgroup>`;
    }
}

function imprimirTablaDiaH() {
    if (diaSemana <= 1 || diaSemana >= 6) {
        diaSemana = 1;
        btnIzqDia.disabled = true;
    } else if (diaSemana === 5) {
        btnDerDia.disabled = true;
    } else {
        btnIzqDia.disabled = false;
        btnDerDia.disabled = false;
    }
    elegirColor(diaSemana);
    let numHorasDia = arrayAsignaturas[diaSemana].length;
    for (let i = 0; i <= numHorasDia; i++) {
        let fila = tablaHorarioDia.insertRow();
        let newcell = fila.insertCell();
        newcell.id = tablaHorarioSemana.rows[i].cells[diaSemana].id + "dia";
        newcell.classList.add("celdaH");
        newcell.innerHTML = tablaHorarioSemana.rows[i].cells[diaSemana].innerHTML;
        newcell.addEventListener("click", funcionCelda);
    }
    tablaHorarioDia.style.display = "table";
}

const btnDiaH = document.getElementById("btndiaH");
const btnIzqDia = document.getElementById("btnIzqDia");
const btnDerDia = document.getElementById("btnDerDia");
const btnSemanaH = document.getElementById("btnsemanaH");

btnDiaH.addEventListener("click", () => {
    tablaHorarioSemana.style.display = "none";
    btnDiaH.style.display = "none";
    btnIzqDia.style.display = "block";
    btnDerDia.style.display = "block";
    btnSemanaH.style.display = "block";
    diaSemana = new Date().getDay()
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

let arrayPictosHorario = [];
const pictosHorarioSnapshot = await getDocs(collection(db, "pictosHorario"));
pictosHorarioSnapshot.forEach((doc) => {
    arrayPictosHorario.push(doc.data());
});
console.log(arrayPictosHorario);
//localStorage.setItem("pictosHorario", JSON.stringify(arrayPictosHorario));
//let asignaturas = JSON.parse(localStorage.getItem("pictosHorario"));

function getdiaHorario(colnum) {
    let diaAux;
    switch (colnum) {
        case 1:
            diaAux = "lun";
            break;
        case 2:
            diaAux = "mar";
            break;
        case 3:
            diaAux = "mier";
            break;
        case 4:
            diaAux = "jue";
            break;
        case 5:
            diaAux = "vie";
            break;
    }
    return diaAux;
}