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
    Calendar
} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import momentPlugin from '@fullcalendar/moment';
import esLocale from '@fullcalendar/core/locales/es';

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

/*Modales */
const modalAuth = new Modal(document.getElementById("modalAuth"));
const tituloModalAuth = document.getElementById("tituloModalAuth");
const authForm = document.getElementById("authForm");
const modalAdd = new Modal(document.getElementById("modalAdd"));
const tituloModalAdd = document.getElementById("tituloModalAdd");
const contenidoModalAdd = document.getElementById("contenidoModalAdd");

/*Containers */
const btnContainer = document.getElementById("btnContainerMid");
const horarioContainer = document.getElementById("horarioContainer");
const calendarContainer = document.getElementById("calendarContainer");

/*Botones*/
const btnsVolver = document.querySelectorAll(".btnVolver");
const btnHorario = document.getElementById("btnHorario");
const btnCalendario = document.getElementById("btnCalendario");
const btnDiaH = document.getElementById("btndiaH");
const btnIzqDia = document.getElementById("btnIzqDia");
const btnDerDia = document.getElementById("btnDerDia");
const btnSemanaH = document.getElementById("btnsemanaH");
const logoutButton = document.getElementById('logout');

/*Tablas*/
const tablaHorarioSemana = document.getElementById("tablaHorarioSemana");
const tablaHorarioDia = document.getElementById("tablaHorarioDia");
let calendario = document.getElementById("calendar");

let userId = "";
let alumnoRef, alumData;
let arrayAsignaturas = [];
let arrayCalendario = [];

let unsubscribe;
let diaSemana = new Date().getDay();
let arrayPictosHorario = [];
let arrayPictosCalendario = [];

let idCeldaClickada, numFila, numCol;

modalAuth.show();

let pictosHorarioSnapshot, pictosCalendarioSnapshot, ajustes;

window.addEventListener('load', async () => {
    try {
        ajustes = await getDoc(doc(db, "ajustes", "generales"));
        pictosHorarioSnapshot = await getDocs(collection(db, "pictosHorario"));
        pictosCalendarioSnapshot = await getDocs(collection(db, "pictosCalendario"));
        pictosHorarioSnapshot.forEach((doc) => {
            let pictoData = doc.data();
            pictoData.id = doc.id;
            arrayPictosHorario.push(pictoData);
        });

        pictosCalendarioSnapshot.forEach((doc) => {
            let pictoData = doc.data();
            pictoData.id = doc.id;
            arrayPictosCalendario.push(pictoData);
        });
        console.log('Inicialización terminada');
    } catch (e) {
        console.log(e);
    }
})
console.log('Todavía no he terminado de cargar.');

function getNumHoras() {
    let numHorasHorario;
    if (ajustes.exists()) {
        numHorasHorario = ajustes.data().numHoras;
    } else {
        console.log("No such document!");
    }
    return numHorasHorario;
}

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
        userId = "";
        modalAuth.show();
    }
});

/*Funcion botones */

btnHorario.addEventListener("click", () => {
    horarioContainer.style.display = "block";
    btnContainer.style.display = "none";
    calendarContainer.style.display = "none";
});

btnCalendario.addEventListener("click", () => {
    horarioContainer.style.display = "none";
    btnContainer.style.display = "none";
    calendarContainer.style.display = "block";
    renderizarCal();
});

logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('user signed out');
            unsubscribe();
            imprimirLoginForm();
            modalAuth.show();
        })
        .catch(err => {
            console.log(err.message)
        })
});

btnsVolver.forEach((btn) => {
    btn.addEventListener("click", () => {
        horarioContainer.style.display = "none";
        calendarContainer.style.display = "none";
        btnContainer.style.display = "block";
    });
});

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

function imprimirLoginForm() {
    authForm.innerHTML = `
        <div class="mb-2 form-group">
            <label for="usuario" class="form-label"><i class="fa-solid fa-at"></i>Correo electrónico</label>
            <input type="text" class="form-control" placeholder="Correo electrónico" id="usuario" required>
        </div>
        <div class="mb-2 form-group">
            <label for="pwd" class="form-label"><i class="fa-solid fa-lock"></i>Contraseña</label>
            <input type="text" class="form-control" placeholder="Contraseña" id="pwd" required>
        </div>
        <div class="modal-footer row align-items-start">
            <p id="enlaceaSignup" class="col-md-5" tabindex="0">No tienes cuenta? Registrate aquí</p>
            <button type="button" id="login" class="botonA btnVerde col-md-5"><i class="fa-solid fa-right-to-bracket"></i>Inicio
              sesión</button>
        </div>
        <p class="errorMessage text-center"></p>`;
    tituloModalAuth.innerText = "Iniciar Sesión";
    document.getElementById("enlaceaSignup").addEventListener("click", imprimirSignupForm);
    document.getElementById("login").addEventListener("click", login);
    let inputLogin = document.querySelectorAll(".loginForm input");
    inputLogin.forEach(function (input) {
        input.addEventListener("keyup", () => {
            validacionFormulario(inputLogin.length, document.getElementById("login"), inputLogin);
        });
    });
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
            errorMessage.innerText = catchMensajeError(error.code);
        })
}

function signup() {
    let numHoras = getNumHoras();
    let usuario = document.getElementById("usuario").value;
    let pwd = document.getElementById("pwd").value;
    let errorMessage = document.querySelector(".errorMessage");
    let nombreUser = document.getElementById("nombre").value;
    let apellidosUser = document.getElementById("apellidos").value;
    let arrayVacío = Array(numHoras).fill("+");
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
            errorMessage.innerText = catchMensajeError(error.code);
        });
}

function imprimirSignupForm() {
    authForm.innerHTML = `
        <div class="mb-2 form-group row gx-3">
            <div class="col-6">
              <label for="nombre" class="form-label"><i class="fa-regular fa-id-card"></i>Nombre</label>
              <input type="text" class="form-control" placeholder="Nombre" id="nombre" required>
            </div>
            <div class="col-6">
              <label for="apellidos" class="form-label"><i class="fa-solid fa-id-card"></i>Apellidos</label>
              <input type="text" class="form-control" placeholder="Apellidos" id="apellidos" required>
            </div>
        </div>
        <div class="mb-2 form-group">
            <label for="usuario" class="form-label"><i class="fa-solid fa-at"></i>Correo electrónico</label>
            <input type="text" class="form-control" placeholder="Correo electrónico" id="usuario" required>
        </div>
        <div class="mb-2 form-group">
            <label for="pwd" class="form-label"><i class="fa-solid fa-lock"></i>Contraseña</label>
            <input type="text" class="form-control" placeholder="Contraseña" id="pwd" required>
        </div>
        <div class="modal-footer row align-items-stretch justify-content-around">
            <button type="button" id="cancelarSignup" class="botonA btnRojo col-md-5"><i class="fa-solid fa-xmark"></i>Cancelar</button>
            <button type="button" id="signup" class="botonA btnVerde col-md-5"><i class="fa-solid fa-user-plus"></i>Registrarse</button>
        </div>
        <p class="errorMessage text-center"></p>`;
    tituloModalAuth.innerText = "Registrarse";
    document.getElementById("cancelarSignup").addEventListener("click", imprimirLoginForm);
    document.getElementById("signup").addEventListener("click", signup);
    let inputSignup = document.querySelectorAll(".signupForm input");
    inputSignup.forEach(function (input) {
        input.addEventListener("keyup", () => {
            validacionFormulario(inputSignup.length, document.getElementById("signup"), inputSignup);
        });
    });
}

function catchMensajeError(error) {
    let mensaje = "";
    if (error === 'auth/invalid-email') {
        mensaje = "El formato del email no es válido."
    } else if (error === 'auth/user-not-found') {
        mensaje = "No existe este usuario."
    } else if (error === 'auth/wrong-password') {
        mensaje = "La contraseña no son correctos."
    } else if (error === 'auth/weak-password') {
        mensaje = "La contraseña debe tener mínimo 6 caracteres."
    } else if (error === 'auth/email-already-exists') {
        mensaje = "Ya existe una cuenta con este correo."
    } else {
        mensaje = "Error inesperado."
    }
    return mensaje;
}

function validacionFormulario(length, btn, arrayInput) {
    let completado = 0;
    arrayInput.forEach(function (input) {
        if (input.value.trim() === "") {
            btn.disabled = true;
        } else {
            completado++;
        }
    });
    if (completado === length) {
        btn.disabled = false;
    }
}

/*Horario */
function getHorario(alumAsignaturas) {
    arrayAsignaturas = ["", alumAsignaturas.lun, alumAsignaturas.mar, alumAsignaturas.mier, alumAsignaturas.jue, alumAsignaturas.vie];
    for (let i = 1; i < 6; i++) {
        for (let j = 0; j < arrayAsignaturas[i].length; j++) {
            let cellId = "r" + j + "-c" + i;
            if (arrayAsignaturas[i][j] !== "+") {
                let asiganadir = arrayPictosHorario.find(asig => asig.nombre === arrayAsignaturas[i][j]);
                document.getElementById(cellId).innerHTML = `<img src="${asiganadir.foto}"class="rounded dibujoHorario"><p>${arrayAsignaturas[i][j]}</p>`;
            } else {
                document.getElementById(cellId).innerHTML = `<img src="pictogramas/+.png" class="rounded addHorario"><p>+</p>`;
            }
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
            <th scope="col" class='miercoles'>Mi<span>ércoles</span></th>
            <th scope="col">J<span>ueves</span></th>
            <th scope="col">V<span>iernes</span></th>
        </tr>`;
}

/*Tabla de horario semanal*/
function crearTablaVacia() {
    let numFilas = getNumHoras();
    anadirColumnas();
    for (let i = 0; i < numFilas; i++) {
        let fila = tablaHorarioSemana.insertRow();
        for (let j = 0; j < 6; j++) {
            let newcell = fila.insertCell();
            newcell.id = "r" + i + "-c" + j;
            newcell.classList.add("celdaH");
            if (j !== 0) {
                newcell.innerHTML = `<img src="pictogramas/+.png" class="rounded addHorario"><p>+</p>`;
                newcell.addEventListener("click", funcionCelda, false);
            } else {
                newcell.classList.add("horasAjuste");
                newcell.innerHTML = "<p>Hora1</p><p>Hora2</p>"
            }
        }
    }
}

function funcionCelda() {
    idCeldaClickada = this.id;
    numFila = parseInt(idCeldaClickada[1]);
    numCol = parseInt(idCeldaClickada[4]);
    let celda = document.getElementById(idCeldaClickada);
    let lastChild = celda.lastChild;
    if (lastChild.innerText != "+") {
        imprimirModalInterHorario();
    } else {
        imprimirModalAddHorario();
    }
    modalAdd.show();
}

/*Imprimir modal */
function imprimirModalIntermedio(title, editBtnFun, deleteBtnFun) {
    contenidoModalAdd.innerHTML = "";
    tituloModalAdd.innerText = title;
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
        let text = `<i class="fas fa-edit"></i>Cambiar`;
        editBtnFun(text);
    });
    btnBorrar.addEventListener("click", deleteBtnFun);
}

function imprimirModalInterHorario() {
    let title = "¿Quieres cambiar o borrar una actividad?";
    imprimirModalIntermedio(title, imprimirModalAddHorario, deleteAsignatura);
}

function imprimirModalInterCalendario(eventId) {
    let title = "¿Quieres cambiar o borrar un evento?";
    let deleteBtnFun = () => {
        deleteEventoCal(eventId);
    }
    imprimirModalIntermedio(title, imprimirModalAddCalendario, deleteBtnFun);
}

function imprimirModalAdd(text, addBtnFun, carga) {
    contenidoModalAdd.innerHTML = "";
    tituloModalAdd.innerText = "Qué quieres poner?";
    let btnScrollDiv = document.createElement("div");
    btnScrollDiv.classList.add("btnScroll", "d-flex", "flex-row", "justify-content-around");
    let btnScrollUp = document.createElement("button");
    btnScrollUp.classList.add("btn", "scrollBtnUp");
    btnScrollUp.innerHTML = `<i class="far fa-arrow-alt-circle-up"></i>Subir`
    let btnScrollDown = document.createElement("button");
    btnScrollDown.classList.add("btn", "scrollBtnDown");
    btnScrollDown.innerHTML = `<i class="far fa-arrow-alt-circle-down"></i>Bajar`;
    btnScrollDiv.append(btnScrollDown, btnScrollUp);
    let btnScrollDivClone = btnScrollDiv.cloneNode(true);
    let addForm = document.createElement("form");
    addForm.id = "addForm";
    addForm.classList.add("row", "row-cols-2", "justify-content-around", "gy-1")
    contenidoModalAdd.append(btnScrollDiv, addForm, btnScrollDivClone);
    carga();
    let btnModalDiv = document.createElement("div");
    btnModalDiv.classList.add("modal-footer", "row", "row-col-2", "align-items-stretch", "justify-content-around");
    let btnCancelar = document.createElement("button");
    btnCancelar.classList.add("btn", "btnRojo", "col-5");
    btnCancelar.setAttribute("data-bs-dismiss", "modal");
    btnCancelar.innerHTML = `<i class="fa-solid fa-xmark"></i>Cancelar</button>`;
    let btnAdd = document.createElement("button");
    btnAdd.classList.add("btn", "btnVerde", "col-5");
    btnAdd.innerHTML = `${text}`;
    btnModalDiv.append(btnCancelar, btnAdd);
    contenidoModalAdd.append(btnModalDiv);
    btnAdd.addEventListener("click", addBtnFun);
}

function imprimirModalAddHorario() {
    let text = `<i class="fas fa-plus"></i>Añadir`;
    imprimirModalAdd(text, addAsignatura, cargarAsignaturasModal);
}

function imprimirModalAddCalendario(fechaCalClickada, contador) {
    let text = `<i class="fas fa-plus"></i>Añadir`;
    let addEventFun = () => {
        addEventoCal(fechaCalClickada, contador);
    }
    imprimirModalAdd(text, addEventFun, cargarEventosModal);
}

function cargarAsignaturasModal() {
    let html = "";
    for (let i = 0; i < arrayPictosHorario.length; i++) {
        html += `<div class="col-5">
                  <div class="dibujoInput"><input type="radio" name="opcionHorario" id="${arrayPictosHorario[i].id}" value="${arrayPictosHorario[i].nombre}">
                    <label for="${arrayPictosHorario[i].id}" class="imgLabel"><img src="${arrayPictosHorario[i].foto}"class="rounded dibujo-cc"></label>
                  </div>
                </div>`
    }
    document.getElementById("addForm").innerHTML = html;
}

function cargarEventosModal() {
    let html = "";
    for (let i = 0; i < arrayPictosCalendario.length; i++) {
        html += `<div class="col-5">
                  <div class="dibujoInput"><input type="radio" name="opcionCalendario" id="${arrayPictosCalendario[i].id}" value="${arrayPictosCalendario[i].nombre}">
                    <label for="${arrayPictosCalendario[i].id}" class="imgLabel"><img src="${arrayPictosCalendario[i].foto}"class="rounded dibujo-cc"></label>
                  </div>
                </div>`
    }
    document.getElementById("addForm").innerHTML = html;
}

async function addAsignatura() {
    let diaSemana = getDiaHorario(numCol);
    let seleccionado = document.querySelector("input[name='opcionHorario']:checked");
    let arrayAux = alumData[diaSemana];
    if (seleccionado) {
        let asiganadir = arrayPictosHorario.find(asig => asig.nombre == seleccionado.value);
        arrayAux[numFila] = asiganadir.nombre;
        document.getElementById(idCeldaClickada).innerHTML = "<img src='" + asiganadir.foto + "' class='rounded dibujoHorario'>";
        addForm.reset();
        try {
            await updateDoc(alumnoRef, {
                [diaSemana]: arrayAux
            });
        } catch (e) {
            console.log(error);
        }
        modalAdd.hide();
    }
}

async function deleteAsignatura() {
    let diaSemana = getDiaHorario(numCol);
    let arrayAux = alumData[diaSemana];
    arrayAux[numFila] = "+";
    try {
        await updateDoc(alumnoRef, {
            [diaSemana]: arrayAux
        });
    } catch (e) {
        console.log(error);
    }
    modalAdd.hide();
}

function getArrayCalendario(array) {
    let arrayCal = array;
    arrayCal.forEach((calEvent) => {
        let eventoAux = arrayPictosCalendario.find(event => event.nombre == calEvent.title);
        calEvent.image_url = eventoAux.foto.toString();
        calEvent.start = calEvent.start.toDate();
    });
    console.log(arrayCal);
    return arrayCal;
}

async function addEventoCal(fechaclikada, contador) {
    let seleccionado = document.querySelector("input[name='opcionCalendario']:checked");
    let hora = 2 * contador;
    if (seleccionado) {
        let eventoAux = arrayPictosCalendario.find(event => event.nombre == seleccionado.value);
        let eventoAdd = {
            id: generarUID(),
            title: eventoAux.nombre,
            image_url: eventoAux.foto,
            allDay: false,
            start: new Date(fechaclikada.getFullYear(), fechaclikada.getMonth(), fechaclikada.getDate(), hora, 0),
        };
        arrayCalendario.push(eventoAdd);
        try {
            await updateDoc(alumnoRef, {
                calendario: arrayCalendario
            });
        } catch (e) {
            console.log(error);
        }
        calendar.addEvent(eventoAdd);
        modalAdd.hide();
    }
}

async function deleteEventoCal(eventId) {
    console.log(eventId);
    let indexDel = arrayCalendario.findIndex(evento => evento.id === eventId);
    if (indexDel != -1) {
        arrayCalendario.splice(indexDel, 1);
        calendar.getEventById(eventId).remove();
        try {
            await updateDoc(alumnoRef, {
                calendario: arrayCalendario
            });
        } catch (e) {
            console.log(error);
        }
        modalAdd.hide();
    }
}

crearTablaVacia();

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

function getDiaHorario(colnum) {
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

/*Calendario*/

let calendar = new Calendar(calendario, {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, momentPlugin],
    headerToolbar: {
        start: 'prev',
        center: 'title dayGridMonth,timeGridWeek,listMonth',
        end: 'next'
    },
    buttonText: {
        month: 'Mes',
        week: 'Semana',
        list: 'Agenda'
    },
    initialView: 'dayGridMonth',
    handleWindowResize: true,
    windowResizeDelay: 5,
    showNonCurrentDates: false,
    fixedWeekCount: false,
    editable: false,
    contentHeight: "auto",
    navLinks: true,
    eventDurationEditable: false,
    dayMaxEventRows: true,
    views: {
        dayGridMonth: {
            dayMaxEventRows: 2,
            stickyHeaderDates: false,
            titleFormat: function () {
                let date = new Date();
                var options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                };
                return date.toLocaleDateString("es-ES", options);
            }
        },
        listMonth: {
            stickyHeaderDates: false,
            listDaySideFormat: false,
            listDayFormat: {
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            },
            titleFormat: function () {
                let date = new Date();
                var options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                };
                return date.toLocaleDateString("es-ES", options);
            }
        }
    },
    slotDuration: "01:00:00",
    height: "auto",
    slotEventOverlap: false,
    allDaySlot: false,
    slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
    },
    moreLinkContent: function (arg) {
        arg.text = "+" + arg.num;
    },
    eventContent: function (arg) {
        let innerhtml = "";
        if (arg.event.extendedProps.image_url) {
            innerhtml += "<img src='" + arg.event.extendedProps.image_url + "' class='fc-event-img'>"
        }
        return {
            html: innerhtml
        };
    },
    eventClassNames: 'eventoCal',
    eventClick: function (eventInfo) {
        imprimirModalInterCalendario(eventInfo.event.id);
        modalAdd.show();
    },
    dateClick: function (date) {
        let fechaCalClickada = date.date;
        let arrayEventos = calendar.getEvents();
        let contadorEventos = 0;
        arrayEventos.forEach((evento) => {
            if (evento.start.getDate() == fechaCalClickada.getDate()) {
                contadorEventos++;
            }
        });
        imprimirModalAddCalendario(fechaCalClickada, contadorEventos);
        modalAdd.show();
    },
    defaultTimedEventDuration: '2:00',
    dayHeaderFormat: {
        weekday: 'short'
    },
    locale: esLocale
});;

function renderizarCal() {
    calendar.addEventSource(arrayCalendario);
    calendar.render();
}

function generarUID() {
    return Math.floor(Date.now() * Math.random() * 100).toString() + ((Math.random() + 1).toString(36).substring(3))
}