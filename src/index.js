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
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";

import {
    getStorage,
    ref,
    getDownloadURL,
    uploadBytesResumable
} from "firebase/storage";

import Modal from 'bootstrap/js/dist/modal';
import {
    Dropdown
} from 'bootstrap';

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
const storage = getStorage(app);

/*Modales */
const modalAuth = new Modal(document.getElementById("modalAuth"));
const tituloModalAuth = document.getElementById("tituloModalAuth");
const authForm = document.getElementById("authForm");
const modalAdd = new Modal(document.getElementById("modalAdd"));
const tituloModalAdd = document.getElementById("tituloModalAdd");
const contenidoModalAdd = document.getElementById("contenidoModalAdd");
const dropDown = new Dropdown(document.getElementById("dropdownFoto"))

/*Containers */
const btnContainer = document.getElementById("btnContainerMid");
const horarioContainer = document.getElementById("horarioContainer");
const calendarContainer = document.getElementById("calendarContainer");

/*Botones*/
const btnsVolver = document.querySelectorAll(".btnVolver");
const btnsClose = document.querySelectorAll(".close");
const btnHorario = document.getElementById("btnHorario");
const btnCalendario = document.getElementById("btnCalendario");
const btnDiaH = document.getElementById("btndiaH");
const btnIzqDia = document.getElementById("btnIzqDia");
const btnDerDia = document.getElementById("btnDerDia");
const btnSemanaH = document.getElementById("btnsemanaH");
const logoutButton = document.getElementById('logout');
const btnAjustes = document.getElementById('ajustes');
const btnCambiarFoto = document.getElementById('cambiarFoto');

/*Tablas*/
const tablaHorarioSemana = document.getElementById("tablaHorarioSemana");
const tablaHorarioDia = document.getElementById("tablaHorarioDia");
let calendario = document.getElementById("calendar");

let userId = "";
let alumnoRef, alumData;
let arrayAsignaturas = [];
let arrayCalendario = [];
let iconsRendered = false;

let unsubscribe;
let diaSemana = new Date().getDay();
let arrayPictosHorario = [];
let arrayPictosCalendario = [];
let idCeldaClickada, numFila, numCol;
let pictosHorarioSnapshot, pictosCalendarioSnapshot, ajustes;

document.body.style.visibility = 'hidden';

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
} catch (e) {
    console.log(e);
};

function getAjustesNumHoras() {
    let numHorasHorario;
    if (ajustes.exists()) {
        numHorasHorario = ajustes.data().numHoras;
    } else {
        console.log("No such document!");
    }
    return numHorasHorario;
}

function getAjustesArrayHoras() {
    let arrayHoras;
    if (ajustes !== null) {
        arrayHoras = ajustes.data().horario;
    } else {
        console.log("No such document!");
    }
    return arrayHoras;
}

onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        document.body.style.visibility = 'visible';
        userId = usuario.uid;
        alumnoRef = doc(db, "alumnos", userId);
        modalAuth.hide();
        unsubscribe = onSnapshot(alumnoRef,
            (doc) => {
                alumData = doc.data();
                arrayCalendario = getArrayCalendario(alumData.calendario);
                getHorario(alumData);
                showHideHoras();
                showHidePictos();
                document.getElementById("userFoto").src = alumData.foto;
            }, (error) => {
                console.log(error.message);
            });
    } else {
        imprimirLoginForm();
        userId = "";
        modalAuth.show();
        document.body.style.visibility = 'visible';
    }
});

/*Funcion botones */
btnsVolver.forEach((btn) => {
    btn.addEventListener("click", () => {
        horarioContainer.style.display = "none";
        calendarContainer.style.display = "none";
        btnContainer.style.display = "block";
        btnsVolver.forEach((btn) => {
            btn.style.display = "none";
        });
        btnsClose.forEach((btn) => {
            btn.style.display = "block";
        });
    });
    btn.style.display = "none";
});

btnsClose.forEach((btn) => {
    btn.addEventListener("click", () => {
        window.close();
    });
});

btnHorario.addEventListener("click", () => {
    horarioContainer.style.display = "block";
    btnContainer.style.display = "none";
    calendarContainer.style.display = "none";
    btnsClose.forEach((btn) => {
        btn.style.display = "none";
    });
    btnsVolver.forEach((btn) => {
        btn.style.display = "block";
    });
});

btnCalendario.addEventListener("click", () => {
    horarioContainer.style.display = "none";
    btnContainer.style.display = "none";
    calendarContainer.style.display = "block";
    renderizarCal();
    btnsClose.forEach((btn) => {
        btn.style.display = "none";
    });
    btnsVolver.forEach((btn) => {
        btn.style.display = "block";
    })
});

btnAjustes.addEventListener('click', () => {
    showAjustes();
});

logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            unsubscribe();
            imprimirLoginForm();
            modalAuth.show();
        })
        .catch(err => {
            console.log(err.message)
        })
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

btnCambiarFoto.addEventListener('click', () => {
    showCamera();
})

function imprimirLoginForm() {
    authForm.innerHTML = `
        <div class="mb-2 form-group">
            <label for="usuario" class="form-label"><img src="./pictogramas/nino.png">Usuario</label>
            <input type="text" class="form-control" placeholder="Usuario" id="usuario" required>
        </div>
        <div class="mb-2 form-group">
            <label for="pwd" class="form-label"><img src="./pictogramas/contrasena.png">Contraseña</label>
            <input type="text" class="form-control" placeholder="Contrasena" id="pwd" autocapitalize="none" required>
        </div>
        <div class="modal-footer row align-items-start justify-content-around">
            <p id="enlaceaSignup" class="col-10 col-md-6" tabindex="0">¿No tienes cuenta?<br>Registrate aquí</p>
            <button type="submit" id="login" class="botonA btnVerde col-10 col-md-6" disabled><img src="./pictogramas/entrar.png">Entrar</button>
        </div>
        <p class="errorMessage text-center"></p>`;
    tituloModalAuth.innerHTML = `<img src="./pictogramas/autentificacion.png">Iniciar sesión`;
    document.getElementById("enlaceaSignup").addEventListener("click", imprimirSignupForm);
    document.getElementById("login").addEventListener("click", (e) => {
        e.preventDefault();
        login();
    });
    let inputLogin = document.querySelectorAll("#authForm input");
    inputLogin.forEach(function (input) {
        input.addEventListener("keyup", () => {
            validacionFormulario(inputLogin.length, document.getElementById("login"), inputLogin);
        });
    });
}

async function login() {
    let usuario = document.getElementById("usuario").value + '@gmail.com';
    let pwd = document.getElementById("pwd").value;
    let errorMessage = document.querySelector(".errorMessage");
    try {
        await setPersistence(auth, browserLocalPersistence);
    } catch (e) {
        console.log(e);
    }
    signInWithEmailAndPassword(auth, usuario, pwd)
        .then(cred => {
            userId = cred.user.uid;
            authForm.reset();
            modalAuth.hide();
        }).catch(err => {
            console.log(err.message);
            errorMessage.innerText = catchMensajeError(err.code);
            authForm.reset();

        })
}

async function signup() {
    let numHoras = getAjustesNumHoras();
    let usuario = document.getElementById("usuario").value + '@gmail.com';
    let pwd = document.getElementById("pwd").value;
    let errorMessage = document.querySelector(".errorMessage");
    let nombreUser = document.getElementById("nombre").value;
    let apellidosUser = document.getElementById("apellidos").value;
    let arrayVacío = [];
    for (let i = 0; i < numHoras; i++)
        arrayVacío.push("+");
    try {
        await setPersistence(auth, browserLocalPersistence);
    } catch (e) {
        console.log(e);
    }
    createUserWithEmailAndPassword(auth, usuario, pwd)
        .then(cred => {
            userId = cred.user.uid;
            authForm.reset();
            modalAuth.hide();
            setDoc(doc(db, 'alumnos', userId), {
                nombre: nombreUser,
                apellidos: apellidosUser,
                foto: "./pictogramas/profile_photo.png",
                lun: arrayVacío,
                mar: arrayVacío,
                mier: arrayVacío,
                jue: arrayVacío,
                vie: arrayVacío,
                calendario: []
            }).then(() => {
                console.log('user created:', userId);
            });
        }).catch(err => {
            console.log(err.message);
            errorMessage.innerText = catchMensajeError(err.code);
        });
}

function imprimirSignupForm() {
    authForm.innerHTML = `
        <div class="mb-2 form-group row gx-3">
            <div class="col-6">
              <label for="nombre" class="form-label"><img src="./pictogramas/name.png">Nombre</label>
              <input type="text" class="form-control" placeholder="Nombre" id="nombre" required>
            </div>
            <div class="col-6">
              <label for="apellidos" class="form-label"><img src="./pictogramas/last_name.png">Apellidos</label>
              <input type="text" class="form-control" placeholder="Apellidos" id="apellidos" autocapitalize="none" required>
            </div>
        </div>
        <div class="mb-2 form-group">
            <label for="usuario" class="form-label"><img src="./pictogramas/nino.png">Usuario</label>
            <div class='input-group'>
            <input type="text" class="form-control" placeholder="Usuario" id="usuario" required>
            <span class="input-group-text">@gmail.com</span>
            </div>
        </div>
        <div class="mb-2 form-group">
            <label for="pwd" class="form-label"><img src="./pictogramas/contrasena.png">Contraseña</label>
            <input type="text" class="form-control" placeholder="Contraseña" id="pwd" required>
        </div>
        <div class="modal-footer row align-items-stretch justify-content-around">
            <button type="button" id="cancelarSignup" class="botonA btnRojo col-md-5"><i class="fa-solid fa-xmark"></i>Cancelar</button>
            <button type="submit" id="signup" class="botonA btnVerde col-md-5" disabled><i class="fa-solid fa-right-to-bracket"></i>Registrarse</button>
        </div>
        <p class="errorMessage text-center"></p>`;
    tituloModalAuth.innerHTML = `<img src="./pictogramas/autentificacion.png">Registrarse`;
    document.getElementById("cancelarSignup").addEventListener("click", (e) => {
        e.preventDefault();
        imprimirLoginForm();
    });
    document.getElementById("signup").addEventListener("click", (e) => {
        e.preventDefault();
        signup();
    });
    let inputSignup = document.querySelectorAll("#authForm input");
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
    } else if (error === 'auth/email-already-in-use') {
        mensaje = "Ya existe este usuario, por favor elige otro nombre."
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
            completado--;
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
                document.getElementById(cellId).innerHTML = `<img src="${asiganadir.foto}"class="rounded dibujoHorario"><p class="textPicto">${arrayAsignaturas[i][j]}</p>`;
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
    let numFilas = getAjustesNumHoras();
    let arrayHorario = getAjustesArrayHoras();
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
                newcell.innerHTML = "<p>" + arrayHorario[i].inicio + "</p><p>" + arrayHorario[i].fin + "</p>";
            }
        }
    }
    showHideHoras();
    showHidePictos();
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
        let text = `<i class="fas fa-plus"></i>Añadir`;
        imprimirModalAddHorario(text);
    }
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
    modalAdd.show();
}

function imprimirModalInterHorario() {
    let title = "¿Quieres cambiar o borrar una actividad?";
    imprimirModalIntermedio(title, imprimirModalAddHorario, deleteAsignatura);
}

function imprimirModalInterCalendario(eventInfo) {
    let title = "¿Quieres cambiar o borrar un evento?";
    let eventId = eventInfo.event.id;
    let deleteBtnFun = () => {
        deleteEventoCal(eventId);
    }
    let cambiarFun = () => {
        changeEventoCal(eventId);
    }
    let cambiarBtnFun = () => {
        let text = `<i class="fas fa-edit"></i>Cambiar`;
        imprimirModalAdd(text, cambiarFun, cargarEventosModal);
    }
    imprimirModalIntermedio(title, cambiarBtnFun, deleteBtnFun);
}

function imprimirModalCalendarioAviso() {
    contenidoModalAdd.innerHTML = "";
    tituloModalAdd.innerText = 'Máximo 5 eventos por día.';
    let div = document.createElement("div");
    div.id = "modalIntermedio";
    div.classList.add("row", "justify-content-end", "align-items-stretch", "me-3");
    let btnOk = document.createElement("button");
    btnOk.classList.add("btn", "btnVerde", "col-4");
    btnOk.innerHTML = `<i class="fa-solid fa-check"></i>De acuerdo`;
    btnOk.setAttribute("data-bs-dismiss", "modal");
    div.append(btnOk);
    contenidoModalAdd.appendChild(div);
    modalAdd.show();
}

function imprimirModalAdd(btnText, addBtnFun, carga) {
    contenidoModalAdd.innerHTML = "";
    tituloModalAdd.innerText = "¿Qué quieres añadir?";
    let btnScrollUp = document.createElement("button");
    let btnScrollDown = document.createElement("button");
    let addForm = document.createElement("form");

    btnScrollUp.classList.add("btn", "scrollBtnUp");
    btnScrollUp.innerHTML = `<i class="far fa-arrow-alt-circle-up"></i>Subir`
    btnScrollUp.addEventListener('click', () => {
        addForm.scrollTop -= 100;
    });
    btnScrollDown.classList.add("btn", "scrollBtnDown");
    btnScrollDown.innerHTML = `<i class="far fa-arrow-alt-circle-down"></i>Bajar`;
    btnScrollDown.addEventListener('click', () => {
        addForm.scrollTop += 100;
    });
    addForm.id = "addForm";
    addForm.classList.add("row", "row-cols-2", "justify-content-around");
    contenidoModalAdd.append(btnScrollUp, addForm, btnScrollDown);
    carga();
    let btnModalDiv = document.createElement("div");
    btnModalDiv.classList.add("modal-footer", "row", "row-col-2", "align-items-stretch", "justify-content-around");
    let btnCancelar = document.createElement("button");
    btnCancelar.classList.add("btn", "btnRojo", "col-5");
    btnCancelar.setAttribute("data-bs-dismiss", "modal");
    btnCancelar.innerHTML = `<i class="fa-solid fa-xmark"></i>Cancelar</button>`;
    let btnAdd = document.createElement("button");
    btnAdd.classList.add("btn", "btnVerde", "col-5");
    btnAdd.disabled = true;
    btnAdd.innerHTML = `${btnText}`;
    btnModalDiv.append(btnCancelar, btnAdd);
    contenidoModalAdd.append(btnModalDiv);
    btnAdd.addEventListener("click", addBtnFun);
    let prev = null;
    addForm.addEventListener('change', function (e) {
        if (e.target.name === 'opcionCalendario' || e.target.name === 'opcionHorario') {
            e.target.parentElement.style.borderColor = "red";
            e.target.parentElement.style.borderWidth = "3.5px";
            e.target.parentElement.style.backgroundColor = "#ffe8e8";
            if (prev === null) {
                prev = e.target.parentElement;
            } else if (prev !== e.target) {
                prev.style.borderColor = '#2c2c2c';
                prev.style.borderWidth = "2px";
                prev.style.backgroundColor = "white";
                prev = e.target.parentElement;
            }
            btnAdd.disabled = false;
        }
    });
    modalAdd.show();
    addForm.scrollTop = 0;
    btnScrollUp.disabled = true;
    scroll(addForm, btnScrollUp, btnScrollDown);
    isOverflown(addForm);
}

function scroll(form, btnUp, btnDown) {
    form.addEventListener('scroll', function () {
        if (Math.floor(addForm.scrollTop) === 0)
            btnUp.disabled = true;
        else
            btnUp.disabled = false;
        if (Math.abs(form.scrollHeight - form.clientHeight - form.scrollTop) <= 1) {
            btnDown.disabled = true;
        } else {
            btnDown.disabled = false;
        }
    });
}

function isOverflown(form) {
    if (form.scrollHeight <= form.clientHeight) {
        document.querySelector('.scrollBtnDown').style.display = 'none';
        document.querySelector('.scrollBtnUp').style.display = 'none';
    } else {
        document.querySelector('.scrollBtnDown').style.display = 'block';
        document.querySelector('.scrollBtnUp').style.display = 'block';
    }
}

function imprimirModalAddHorario(text) {
    imprimirModalAdd(text, addAsignatura, cargarAsignaturasModal);
}

function imprimirModalAddCalendario(fechaCalClickada, text, arrayHoras) {
    let addEventFun = () => {
        addEventoCal(fechaCalClickada, arrayHoras);
    }
    imprimirModalAdd(text, addEventFun, cargarEventosModal);
}

function cargarAsignaturasModal() {
    let html = "";
    for (let i = 0; i < arrayPictosHorario.length; i++) {
        if (arrayPictosHorario[i].id !== 'kYDPxKOtuPep514BsL8x')
            html += `<div class="col-6 mb-2">
                  <div class="dibujoInput"><input type="radio" name="opcionHorario" id="${arrayPictosHorario[i].id}" value="${arrayPictosHorario[i].nombre}">
                    <label for="${arrayPictosHorario[i].id}" class="imgLabel"><img src="${arrayPictosHorario[i].foto}"class="rounded dibujo-cc"></label>
                  </div>
                </div>`;
    }
    document.getElementById("addForm").innerHTML = html;
}

function cargarEventosModal() {
    let html = "";
    for (let i = 0; i < arrayPictosCalendario.length; i++) {
        html += `<div class="col-6 mb-2">
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
        let auxLength = arrayAux.length;
        while (numFila > auxLength) {
            arrayAux.push("+");
            auxLength++;
        }
        arrayAux[numFila] = asiganadir.nombre;
        document.getElementById(idCeldaClickada).innerHTML = "<img src='" + asiganadir.foto + "' class='rounded dibujoHorario'>";
        addForm.reset();
        try {
            await updateDoc(alumnoRef, {
                [diaSemana]: arrayAux
            });
            modalAdd.hide();
        } catch (e) {
            console.log(e);
        }
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
        console.log(e);
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
    return arrayCal;
}

async function addEventoCal(fechaclikada, arrayHorasNoDisponibles) {
    let seleccionado = document.querySelector("input[name='opcionCalendario']:checked");
    let hora = 4;
    let i = 0;
    while (arrayHorasNoDisponibles.includes(hora) && i < 5) {
        hora = hora + 4;
        i++;
    }

    if (seleccionado) {
        let eventoAux = arrayPictosCalendario.find(event => event.nombre == seleccionado.value);
        let eventoAdd = {
            id: generarUID(),
            title: eventoAux.nombre,
            image_url: eventoAux.foto,
            allDay: false,
            start: new Date(fechaclikada.getFullYear(), fechaclikada.getMonth(), fechaclikada.getDate(), hora, 0)
        };
        arrayCalendario.push(eventoAdd);
        try {
            await updateDoc(alumnoRef, {
                calendario: arrayCalendario
            });
        } catch (e) {
            console.log(e);
        }
        calendar.addEvent(eventoAdd);
        modalAdd.hide();
    }
}

async function changeEventoCal(eventId) {
    let seleccionado = document.querySelector("input[name='opcionCalendario']:checked");
    if (seleccionado) {
        let eventoAux = arrayPictosCalendario.find(event => event.nombre === seleccionado.value);
        let indexAnterior = arrayCalendario.findIndex(evento => evento.id === eventId);
        arrayCalendario[indexAnterior].title = eventoAux.nombre;
        arrayCalendario[indexAnterior].image_url = eventoAux.foto;
        console.log(calendar.getEvents());
        try {
            await updateDoc(alumnoRef, {
                calendario: arrayCalendario
            });
        } catch (e) {
            console.log(e);
        }
        let eventoAnterior = calendar.getEventById(eventId);
        eventoAnterior.setProp("title", eventoAux.nombre);
        eventoAnterior.setExtendedProp("image_url", eventoAux.foto);
        modalAdd.hide();
    };
}

async function deleteEventoCal(eventId) {
    let indexDel = arrayCalendario.findIndex(evento => evento.id === eventId);
    if (indexDel != -1) {
        arrayCalendario.splice(indexDel, 1);
        calendar.getEventById(eventId).remove();
        try {
            await updateDoc(alumnoRef, {
                calendario: arrayCalendario
            });
        } catch (e) {
            console.log(e);
        }
        modalAdd.hide();
    }
}

crearTablaVacia();

/*Tabla de horario diario*/
function elegirColor(colgroup) {
    tablaHorarioDia.innerHTML = "";
    if (colgroup === 1) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colHorario"><col class="colLunes"></colgroup>`;
    } else if (colgroup === 2) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colHorario"><col class="colMartes"></colgroup>`;
    } else if (colgroup === 3) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colHorario"><col class="colMier"></colgroup>`;
    } else if (colgroup === 4) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colHorario"><col class="colJueves"></colgroup>`;
    } else if (colgroup === 5) {
        tablaHorarioDia.innerHTML = `<colgroup><col class="colHorario"><col class="colViernes"></colgroup>`;
    }
}

function imprimirTablaDiaH() {
    let arrayHorario = getAjustesArrayHoras();
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
    let showHoras = localStorage.getItem("verHoras");
    for (let i = 0; i <= numHorasDia; i++) {
        let fila = tablaHorarioDia.insertRow();
        let newHourCell = fila.insertCell();
        newHourCell.classList.add("horasAjuste");
        newHourCell.innerHTML = tablaHorarioSemana.rows[i].cells[0].innerHTML;
        let newcell = fila.insertCell();
        newcell.id = tablaHorarioSemana.rows[i].cells[diaSemana].id + "dia";
        newcell.classList.add("celdaH");
        newcell.innerHTML = tablaHorarioSemana.rows[i].cells[diaSemana].innerHTML;
        newcell.addEventListener("click", funcionCelda);
    }
    tablaHorarioDia.style.display = "table";
    showHideHoras();
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
    slotMinTime: "03:00:00",
    views: {
        dayGridMonth: {
            dayMaxEventRows: 2,
            stickyHeaderDates: false,
            titleFormat: {
                year: 'numeric',
                month: 'long'
            },
            dayHeaderFormat: {
                weekday: 'long'
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
    moreLinkClick: 'day',
    eventContent: function (arg) {
        let innerhtml = "";
        if (arg.event.extendedProps.image_url) {
            innerhtml += "<img src='" + arg.event.extendedProps.image_url + "' class='fc-event-img'>"
        }
        return {
            html: innerhtml
        };
    },
    eventSources: [{
        events: arrayCalendario
    }],
    eventClassNames: 'eventoCal',
    eventClick: function (eventInfo) {
        eventInfo.jsEvent.preventDefault();
        imprimirModalInterCalendario(eventInfo);
        modalAdd.show();
    },
    dateClick: function (date) {
        let fechaCalClickada = date.date;
        let arrayEventos = calendar.getEvents();
        let contadorEventos = 0;
        let arrayHoras = [];
        arrayEventos.forEach((evento) => {
            if (evento.start.getDate() == fechaCalClickada.getDate()) {
                contadorEventos++;
                arrayHoras.push(evento.start.getHours());
            }
        });
        if (contadorEventos < 5) {
            let fecha = new Date(fechaCalClickada.getFullYear(), fechaCalClickada.getMonth(), fechaCalClickada.getDate(), 0, 0)
            let text = `<i class="fas fa-plus"></i>Añadir`;
            imprimirModalAddCalendario(fecha, text, arrayHoras);
        } else {
            imprimirModalCalendarioAviso();
        }
    },
    defaultTimedEventDuration: '3:00',
    dayHeaderFormat: {
        weekday: 'short'
    },
    locale: esLocale
});;

function renderizarCal() {
    calendar.render();
    if (iconsRendered === false) {
        calendar.addEventSource(arrayCalendario);
        let imageM = document.createElement("img");
        imageM.src = "./pictogramas/month.png";
        document.querySelector(".fc-dayGridMonth-button").prepend(imageM);
        let imageA = document.createElement("img");
        imageA.src = "./pictogramas/agenda.png";
        document.querySelector(".fc-listMonth-button").prepend(imageA);
        let imageW = document.createElement("img");
        imageW.src = "./pictogramas/week.png";
        document.querySelector(".fc-timeGridWeek-button").prepend(imageW);
        iconsRendered = true;
    }
}

function generarUID() {
    return Math.floor(Date.now() * Math.random() * 100).toString() + ((Math.random() + 1).toString(36).substring(3))
}

/*Ajustes*/
function showAjustes() {
    contenidoModalAdd.innerHTML = '';
    tituloModalAdd.innerHTML = '<img src="./pictogramas/gear.png">Ajustes';
    let form = document.createElement('form');
    let html = `
    <h3 class="ajustesTitle">Ver horas</h3>
    <div class="mb-2">
        <img class="imgAjustes" src="./pictogramas/reloj.png">
        <div class="form-check form-check-inline me-5">
        <input class="form-check-input" type="radio" id="horasHorarioSi" name="verHoras" value="horasSi">
        <label class="form-check-label" for="horasHorarioSi">SI</label>
        </div>
        <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" id="horasHorarioNo" name="verHoras" value="horasNo">
        <label class="form-check-label" for="horasHorarioNo">NO</label>
        </div>
    </div>
    <h3 class="ajustesTitle">Ver pictogramas o texto</h3>
    <div class="mb-2">
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="pictogramasSi" name="verPictogramas" value="pictosSi">
            <label class="form-check-label" for="pictogramasSi"><img class="imgAjustes" src="./pictogramas/pictograms.png"></label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="pictogramasNo" name="verPictogramas" value="pictosNo">
            <label class="form-check-label" for="pictogramasNo"><img class="imgAjustes" src="./pictogramas/A.png"></label>
        </div>
    </div>`;
    form.innerHTML = html;
    contenidoModalAdd.append(form);
    let footerModal = document.createElement("div");
    footerModal.classList.add("modal-footer", "row", "row-col-2", "align-items-stretch", "justify-content-around");
    let btnCancelar = document.createElement("button");
    btnCancelar.classList.add("btn", "btnRojo", "col-5");
    btnCancelar.setAttribute("data-bs-dismiss", "modal");
    btnCancelar.innerHTML = `<i class="fa-solid fa-xmark"></i>Cancelar</button>`;
    let btnGuardar = document.createElement("button");
    btnGuardar.classList.add("btn", "btnVerde", "col-5");
    btnGuardar.innerHTML = `<i class="fa-solid fa-floppy-disk"></i>Guardar`;
    btnGuardar.addEventListener("click", ajustesLocal);
    footerModal.append(btnCancelar, btnGuardar);
    contenidoModalAdd.append(footerModal);
    modalAdd.show();
    getLocalSettings();
}

function ajustesLocal() {
    let verHora = document.querySelector("input[name=verHoras]:checked").value;
    let verPictos = document.querySelector("input[name=verPictogramas]:checked").value;
    localStorage.setItem("verHoras", verHora);
    localStorage.setItem("verPictos", verPictos);
    showHideHoras();
    showHidePictos();
    modalAdd.hide();
}

function getLocalSettings() {
    let verHora = localStorage.getItem("verHoras");
    let verPictos = localStorage.getItem("verPictos");
    if (verHora !== null && verPictos !== null) {
        if (verPictos === "pictosSi") {
            document.getElementById("pictogramasSi").checked = true;
            document.getElementById("pictogramasNo").checked = false;
        } else if (verPictos === "pictosNo") {
            document.getElementById("pictogramasNo").checked = true;
            document.getElementById("pictogramasSi").checked = false;
        }
        if (verHora === "horasSi") {
            document.getElementById("horasHorarioSi").checked = true;
            document.getElementById("horasHorarioNo").checked = false;
        } else if (verHora === "horasNo") {
            document.getElementById("horasHorarioNo").checked = true;
            document.getElementById("horasHorarioSi").checked = false;
        }
    }
}

function showHideHoras() {
    let verHoras = localStorage.getItem("verHoras");
    if (verHoras === null || verHoras === "horasNo") {
        verHoras = "horasNo";
        document.querySelectorAll(".horasAjuste").forEach(celda => {
            celda.style.display = "none";
        });
        document.querySelectorAll(".colHorario").forEach(col => {
            col.style.display = "none";
        });
    } else {
        verHoras = localStorage.getItem("verHoras");
        document.querySelectorAll(".horasAjuste").forEach(celda => {
            celda.style.display = null;
        });
        document.querySelectorAll(".colHorario").forEach(col => {
            col.style.display = null;
        });
    }
}

function showHidePictos() {
    let verPictos = localStorage.getItem("verPictos");
    if (verPictos === null || verPictos === "pictosNo") {
        verPictos = "pictosNo";
        document.querySelectorAll(".dibujoHorario").forEach(celda => {
            celda.style.display = "none";
        });
        document.querySelectorAll(".textPicto").forEach(celda => {
            celda.style.display = "block";
        });
    } else {
        document.querySelectorAll(".dibujoHorario").forEach(celda => {
            celda.style.display = "block";
        });
        document.querySelectorAll(".textPicto").forEach(celda => {
            celda.style.display = "none";
        });
    }
}

/**Camara */
function showCamera() {
    contenidoModalAdd.innerHTML = '';
    tituloModalAdd.innerHTML = '<img src="./pictogramas/foto.png">Cambiar foto';
    let div = document.createElement('div');
    div.classList.add("row", "row-cols-2", "mb-2", "justify-content-around");
    div.innerHTML = `
        <button type='button' id="elegirFotoBtn" class="btn btnFotoCamera col-5"><img src="./pictogramas/pictograms.png">Elegir Foto</button>
        <input type="file" id="elegirFoto" accept="image/*" class="" style="display: none;">
        <button type='button' id="hacerFotoBtn" class="btn btnFotoCamera col-5"><img src="./pictogramas/camera.png">Hacer Foto</button>
        <input type="file" id="hacerFoto" accept="image/*" capture="user" class="" style="display: none;">
        <div class="modal-footer d-flex flex-row justify-content-start footerCamara">
            <button type="button" class="btnRojo" data-bs-dismiss="modal"><i class="fa-solid fa-xmark"></i>Cancelar</button>
        </div>`;
    contenidoModalAdd.append(div);
    document.getElementById("elegirFotoBtn").addEventListener("click", elegirFoto);
    document.getElementById("elegirFoto").addEventListener("change", subirFoto, false);
    document.getElementById("hacerFotoBtn").addEventListener("click", hacerFoto);
    document.getElementById("hacerFoto").addEventListener("change", subirFoto, false);
    modalAdd.show();
}

function showCarga() {
    contenidoModalAdd.innerHTML = '';
    let div = document.createElement('div');
    div.classList.add("spinner");
    contenidoModalAdd.append(div)
}

function elegirFoto() {
    let inputFoto = document.getElementById("elegirFoto")
    inputFoto.click();
}

function hacerFoto() {
    let inputFoto = document.getElementById("hacerFoto");
    inputFoto.click();
}

async function subirFoto() {
    let foto = this.files[0];
    let fotoName = foto.name;
    const fotoRef = ref(storage, '/fotosAlumnos/' + fotoName);
    showCarga();
    uploadImage(fotoRef, foto).then((imgUrl) => {
        updateDoc(alumnoRef, {
            foto: imgUrl
        }).then(() => {
            document.getElementById("userFoto").src = imgUrl;
            modalAdd.hide();
        }).catch((error) => {
            console.log(error);
        })
    })
}

function uploadImage(pathRef, foto) {
    const fotosAlumnosRef = ref(storage, pathRef);
    const uploadImage = uploadBytesResumable(fotosAlumnosRef, foto);

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
            try {
                const imgURL = await getDownloadURL(uploadImage.snapshot.ref);
                resolve(imgURL);
            } catch (e) {
                console.log(e);
            }
        });
    });
}