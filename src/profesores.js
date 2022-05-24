import {
    initializeApp
} from 'firebase/app'

import {
    getFirestore,
    query,
    doc,
    getDoc,
    onSnapshot,
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    addDoc,
    orderBy
} from 'firebase/firestore'

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import Modal from 'bootstrap/js/dist/modal';

import {
    getStorage,
    ref,
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
const auth = getAuth(app);

/*Botones*/
const btnEstudiantes = document.getElementById("btnEstudiantes");
const btnImagenes = document.getElementById("btnImagenes");
const btnsVolver = document.querySelectorAll(".btnVolver");
const btnLogout = document.getElementById("logout");
const btnPictosHor = document.getElementById("btnPictoHorario");
const btnPictosCal = document.getElementById("btnPictoCal");
const btnUploadPictos = document.getElementById("btnUploadPictos");

/*Contenedores*/
const btnContainer = document.getElementById("btnContainer");
const pictosContainer = document.getElementById("pictosContainer");
const alumnosContainer = document.getElementById("alumnosContainer");

/*Modales*/
const modalAuth = new Modal(document.getElementById("modalAuth"));
const tituloModalAuth = document.getElementById("tituloModalAuth");
const authForm = document.getElementById("authForm");
const modalEditar = new Modal(document.getElementById("modalEditar"));
const tituloModalEditar = document.getElementById("tituloModalEditar");
const contenidoModalEditar = document.getElementById("contenidoModalEditar");

/*Img Form*/
const uploadImgForm = document.getElementById("uploadImgForm");
const inputImage = document.getElementById("inputImage");
const btnUploadCalendario = document.getElementById("uploadCalendario");
const btnUploadHorario = document.getElementById("uploadHorario");

/*Listas */
const listaPictosHor = document.getElementById("listaPictosHor");
const listaPictosCal = document.getElementById("listaPictosCal");
const listaAlumnos = document.getElementById("listaAlumnos");

let unsubscribe;

let pictosHorarioSnapshot, pictosCalendarioSnapshot, ajustes;
let arrayPictosHorario = [];
let arrayPictosCalendario = [];
let alumnosArraySnapshot = [];

function volver() {
    btnContainer.style.display = "block";
    pictosContainer.style.display = "none";
    alumnosContainer.style.display = "none";
}

btnsVolver.forEach((btn) => {
    btn.addEventListener("click", volver);
});

btnLogout.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('user signed out');
            unsubscribe();
            imprimirLoginForm();
            modalAuth.show();
            unsubscribe();
        })
        .catch(err => {
            console.log(err.message);
        });
});

btnImagenes.addEventListener("click", () => {
    pictosContainer.style.display = "block";
    btnContainer.style.display = "none";
    alumnosContainer.style.display = "none";
});

btnEstudiantes.addEventListener("click", async () => {
    imprimirAlumnos(alumnosArraySnapshot);
    pictosContainer.style.display = "none";
    btnContainer.style.display = "none";
    alumnosContainer.style.display = "block";
});

btnPictosHor.addEventListener("click", () => {
    listaPictosHor.style.display = "block";
    listaPictosCal.style.display = "none";
    uploadImgForm.style.display = "none";
});

btnPictosCal.addEventListener("click", () => {
    listaPictosHor.style.display = "none";
    listaPictosCal.style.display = "block";
    uploadImgForm.style.display = "none";
});

btnUploadPictos.addEventListener("click", () => {
    listaPictosHor.style.display = "none";
    listaPictosCal.style.display = "none";
    uploadImgForm.style.display = "block";
});

/*Autenticación*/
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        modalAuth.hide();
        let col = collection(db, 'alumnos');
        let consulta = query(col, orderBy('apellidos'));
        unsubscribe = onSnapshot(consulta, (qSnapshot) => {
            alumnosArraySnapshot = [];
            qSnapshot.forEach((doc) => {
                let alumnoAux = doc.data();
                alumnoAux.id = doc.id;
                alumnosArraySnapshot.push(alumnoAux);
            });
            console.log(alumnosArraySnapshot);
        });
        imprimirAlumnos(alumnosArraySnapshot);
    } else {
        imprimirLoginForm();
        modalAuth.show();
        console.log("no logueado");
    }
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
            errorMessage.innerText = catchMensajeError(error.code);
        })
}

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
        <div class="modal-footer">
            <button type="button" id="login" class="botonA btnVerde"><i class="fa-solid fa-right-to-bracket"></i>Inicio sesión</button>
        </div>
        <p class="errorMessage text-center"></p>`;
    tituloModalAuth.innerText = "Iniciar Sesión";
    document.getElementById("login").addEventListener("click", login);
    let inputLogin = document.querySelectorAll("#loginForm input");
    inputLogin.forEach(function (input) {
        input.addEventListener("keyup", () => {
            validacionFormulario(document.getElementById("login"), inputLogin);
        });
    });
}

function catchMensajeError(error) {
    let mensaje = "";
    if (error === 'auth/invalid-email') {
        mensaje = "El formato del email no es válido.";
    } else if (error === 'auth/user-not-found') {
        mensaje = "No existe este usuario.";
    } else if (error === 'auth/wrong-password') {
        mensaje = "La contraseña no son correctos.";
    } else if (error === 'auth/weak-password') {
        mensaje = "La contraseña debe tener mínimo 6 caracteres.";
    } else if (error === 'auth/email-already-exists') {
        mensaje = "Ya existe una cuenta con este correo.";
    } else {
        mensaje = "Error inesperado.";
    }
    return mensaje;
}

function validacionFormulario(btn, arrayInput) {
    let completado = 0;
    arrayInput.forEach(function (input) {
        if (input.value.trim() === "") {
            btn.disabled = true;
        } else {
            completado++;
        }
    });
    if (completado === 2) {
        btn.disabled = false;
    }
}

function checkInputImage() {
    let files = this.files;
    let fileName = files[0].name;
    let extFile = fileName.split(".").pop();
    if (extFile === "jpg" || extFile === "jpeg" || extFile === "png") {
        console.log("Extensión correcta.");
        btnUploadHorario.disabled = false;
        btnUploadCalendario.disabled = false;
    } else {
        alert("solo pueden subirse imágenes en formato .jpg, .jpeg, .png.");
        btnUploadHorario.disabled = true;
        btnUploadCalendario.disabled = true;
    }
}

inputImage.addEventListener("change", checkInputImage, false);

/*Upload Pictogramas */
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
                confirmarUpdatePicto()
            }).catch((error => {
                console.log(error);
            }));
        })
    }
}

async function uploadInputImageCalendario() {
    if (inputImage.files.length !== 0) {
        let image = inputImage.files[0];
        let imageName = image.name.split(".", 1)[0];
        const pictosCalRef = ref(storage, '/pictosCalendario/' + imageName);
        uploadImage(pictosCalRef).then((imgUrl) => {
            addDoc(collection(db, 'pictosCalendario'), {
                nombre: imageName,
                foto: imgUrl
            }).then(() => {
                confirmarUpdatePicto()
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
            try {
                const imgURL = await getDownloadURL(uploadImage.snapshot.ref);
                console.log(imgURL);
                resolve(imgURL);
            } catch (e) {
                console.log(e);
            }
        });
    });
}

btnUploadHorario.addEventListener("click", uploadInputImageHorario, false);
btnUploadCalendario.addEventListener("click", uploadInputImageCalendario, false);

/*Show pictogramas*/
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
        imprimirListaPictosHor();
        imprimirListaPictosCal();
        console.log('Inicialización terminada');
    } catch (e) {
        console.log(e);
    }
});

function readEventos(arrayPictos) {
    let html = "";
    arrayPictos.forEach((picto) => {
        html += `<div id="${picto.id}" class="actividad mb-3 row">
                <div class="col-sm-6 col-md-7 col-lg-8">
                    <p class="nombre"><strong>Nombre: </strong>${picto.nombre}</p>
                    <div class="pictoList"><img src="${picto.foto}"></div>
                </div>
                <div class="col-sm-6 col-md-5 col-lg-4 d-flex flex-column justify-content-around">
                    <button type="button" class="btn btnRojo btnBorrarAct"><i class="fas fa-trash-alt"></i>Eliminar</button>
                </div>
            </div>`;
    });
    return html;
}

function imprimirListaPictos(title, array, lista) {
    let listTitle = document.createElement("h3");
    listTitle.classList.add('text-center');
    listTitle.innerText = title;
    let div = document.createElement('div');
    div.innerHTML = readEventos(array);
    lista.append(listTitle);
    lista.append(div);
    let btnsEliminarAct = document.querySelectorAll(".btnBorrarAct");
    btnsEliminarAct.forEach((btn) => {
        btn.addEventListener("click", function () {
            let tipo = this.parentNode.parentNode.parentNode.parentNode.id;
            let actividadId = this.parentNode.parentNode.id;
            let title = 'Eliminar Pictograma';
            let text = 'Eliminar un pictograma es una acción permanente. Puedes estar eliminando un pictograma usado por los alumnos y generar conflictos. ¿Estás seguro de querer proseguir?'
            showConfirmarEliminar(title, text, () => {
                borrarActividad(actividadId, tipo)
            });
            modalEditar.show();
        });
    });
}

function imprimirListaPictosCal() {
    let title = "Pictogramas de Calendario";
    imprimirListaPictos(title, arrayPictosCalendario, listaPictosCal);
}

function imprimirListaPictosHor() {
    let title = "Pictogramas de Horario";
    imprimirListaPictos(title, arrayPictosHorario, listaPictosHor);
}

async function borrarActividad(actividadId, tipo) {
    let deleteIndex = arrayPictosHorario.findIndex(picto => picto.id == actividadId);
    try {
        if (tipo === "listaPictosHor") {
            await deleteDoc(doc(db, 'pictosHorario', actividadId));
            arrayPictosHorario.splice(deleteIndex, 1);
        } else if (tipo === "listaPictosCal") {
            await deleteDoc(doc(db, 'pictosCalendario', actividadId));
            arrayPictosHorario.splice(deleteIndex, 1);
        }
        document.getElementById(actividadId).style.display = 'none';
        let title = 'Eliminar Pictograma';
        let text = "Se ha borrado al pictograma con id" + actividadId;
        showConfirmacion(title, text);
    } catch (e) {
        console.log(e);
    }
}

/**Alumnos */
function imprimirAlumnos(alumnosArray) {
    let html = "";
    alumnosArray.forEach((alumno) => {
        html += `<div id="${alumno.id}" class="alumno mb-3 row">
                <div class="col-sm-6 col-md-7">
                    <p class="nombre listaDatos"><strong>Nombre:</strong><br><span>${alumno.nombre}</span></p>
                    <p class="apellidos listaDatos"><strong>Apellidos:</strong><br><span>${alumno.apellidos}</span></p>
                </div>
                <div class="col-sm-6 col-md-5 d-flex flex-column justify-content-around">
                    <button type="button" class="btn botonA btnVerde btnEditarDatos"><i class="fas fa-user-edit"></i>Editar datos</button>
                    <button type="button" class="btn botonA btnVerde btnEditarListaHorario"><i class="fas fa-table"></i>Editar Horario</button>
                    <button type="button" class="btn botonA btnRojo btnBorrarAlum"><i class="fas fa-user-slash"></i>Eliminar</button>
                </div>
            </div>`;
    });
    listaAlumnos.innerHTML = html;
    let btnsEditarDatos = document.querySelectorAll(".btnEditarDatos");
    btnsEditarDatos.forEach((btn) => {
        btn.addEventListener("click", showEditarDatos);
    });
    let btnsEditarHorario = document.querySelectorAll(".btnEditarListaHorario");
    btnsEditarHorario.forEach((btn) => {
        btn.addEventListener("click", showEditarHorario);
    });
    let btnsEliminarAlum = document.querySelectorAll(".btnBorrarAlum");
    btnsEliminarAlum.forEach((btn) => {
        btn.addEventListener("click", function () {
            let idAlumno = this.parentNode.parentNode.id;
            console.log(idAlumno);
            let title = 'Eliminar alumno';
            let text = 'Eliminar a un alumno es una acción permanente. ¿Estás seguro de querer proseguir?'
            showConfirmarEliminar(title, text, () => {
                borrarAlumno(idAlumno);
            });
            modalEditar.show();
        });
    });
}

async function borrarAlumno(idAlumno) {
    try {
        await deleteDoc(doc(db, "alumnos", idAlumno));
        let title = 'Eliminar alumno';
        let text = "Se ha borrado al alumno con id" + idAlumno;
        showConfirmacion(title, text);
    } catch (e) {
        console.log(e);
    }
}

function showEditarDatos() {
    let idAlumno = this.parentNode.parentNode.id;
    console.log(idAlumno);
    let alumno = alumnosArraySnapshot.find(alumno => alumno.id === idAlumno);
    let html = `<form>
        <div class="mb-2 form-group">
            <label for="nombreEditar" class="form-label"><i class="far fa-address-card"></i>Nombre</label>
            <input type="text" class="form-control" placeholder="Nombre" id="nombreEditar" value="${alumno.nombre}" required>
        </div>
        <div class="mb-2 form-group">
            <label for="apellidosEditar" class="form-label"><i class="far fa-address-card"></i>Apellidos</label>
            <input type="text" class="form-control" placeholder="Apellidos" id="apellidosEditar" value="${alumno.apellidos}"required>
        </div>
        <div class="modal-footer row align-items-stretch justify-content-around">
            <button type="button" id="cerrarModal" class="btnRojo col-5" data-bs-dismiss="modal"><i class="fa-solid fa-xmark"></i>Cancelar</button>
            <button type="button" id="GuardarCambiosDatos" class="btnVerde col-5"><i class="fas fa-save"></i>Guardar cambios</button>
        </div></form>`;
    tituloModalEditar.innerText = "Editar Datos de Alumno";
    contenidoModalEditar.innerHTML = html;
    modalEditar.show();

    document.getElementById("GuardarCambiosDatos").addEventListener("click", () => {
        editarDatosAlumno(idAlumno);
    });

    document.getElementById("cerrarModal").addEventListener("click", () => {
        document.querySelector("#modalEditar form").reset();
    });
}

async function editarDatosAlumno(idAlumno) {
    let nombreNuevo = document.getElementById("nombreEditar").value;
    let apellidosNuevos = document.getElementById("apellidosEditar").value;
    let docRef = doc(db, 'alumnos', idAlumno);
    try {
        await updateDoc(docRef, {
            nombre: nombreNuevo,
            apellidos: apellidosNuevos
        });
        let title = "Editar Datos de Alumno";
        let texto = "Datos del alumno actualizado correctamente";
        showConfirmacion(title, texto);
        document.getElementById(idAlumno).querySelector(".nombre span").innerText = nombreNuevo;
        document.getElementById(idAlumno).querySelector(".apellidos span").innerText = apellidosNuevos;
    } catch (e) {
        let title = "Editar Datos de Alumno";
        let texto = "Se ha producido un error: " + e;
        showConfirmacion(title, texto);
        console.log(e);
    }
}

function showEditarHorario() {
    let idAlumno = this.parentNode.parentNode.id;
    tituloModalEditar.innerText = 'Editar Horario de Alumno';
    imprimirHorarioUser(idAlumno);
}

function imprimirHorarioUser(idAlumno) {
    contenidoModalEditar.innerHTML = "";
    let table = document.createElement('table');
    table.id = 'editHorAlumnoModal';
    table.innerHTML = `
        <colgroup>
            <col class="colLunes">
            <col class="colMartes">
            <col class="colMier">
            <col class="colJueves">
            <col class="colViernes">
        </colgroup>
        <thead>
        <tr class="cabeceraH">
            <th scope="col">L</th>
            <th scope="col">Ma</th>
            <th scope="col">Mi</th>
            <th scope="col">J</th>
            <th scope="col">V</th>
        </tr>
        </thead>`;
    contenidoModalEditar.append(table);
    let footer = document.createElement('div');
    footer.classList.add("modal-footer", "row", "align-items-stretch", "justify-content-around");
    let buttonX = document.createElement('button');
    buttonX.setAttribute('type', 'button');
    buttonX.setAttribute('data-bs-dismiss', 'modal');
    buttonX.classList.add('btnRojo', 'col-5');
    buttonX.innerHTML = `<i class="fa-solid fa-xmark"></i>Cancelar`;
    footer.append(buttonX);
    let buttonSave = document.createElement('button');
    buttonSave.id = 'saveCambiosHora';
    buttonSave.setAttribute('type', 'button');
    buttonSave.classList.add('btnVerde', 'col-5');
    buttonSave.innerHTML = `<i class="fa-solid fa-floppy-disk"></i>Guardar cambios`;
    buttonSave.addEventListener('click', () => {
        guardarCambiosHorario(idAlumno);
    });
    footer.append(buttonSave);
    contenidoModalEditar.append(footer);
    imprimirHorarioAlumno(idAlumno);
    modalEditar.show();
}

async function guardarCambiosHorario(idAlumno) {
    let arrayActualizado = [];
    let tablaHorario = document.getElementById('editHorAlumnoModal');
    let numRows = tablaHorario.rows.length;
    let docRef = doc(db, 'alumnos', idAlumno);
    for (let i = 0; i < 5; i++) {
        let arrayDia = [];
        for (let j = 1; j < numRows; j++) {
            let celdaId = tablaHorario.rows[j].cells[i].id;
            let asignatura = document.querySelector('#' + celdaId + ' select').value;
            arrayDia.push(asignatura);
        }
        arrayActualizado.push(arrayDia);
        console.log(arrayActualizado);
    }
    try {
        await updateDoc(docRef, {
            lun: arrayActualizado[0],
            mar: arrayActualizado[1],
            mier: arrayActualizado[2],
            jue: arrayActualizado[3],
            vie: arrayActualizado[4]
        });
        let title = "Editar Horario de Alumno";
        let texto = "Horario del alumno actualizado correctamente";
        showConfirmacion(title, texto);
    } catch (e) {
        console.log(e);
        let title = "Editar Datos de Alumno";
        let texto = "Se ha producido un error: " + e;
        showConfirmacion(title, texto);
    }
}

function asignaturasToOpciones() {
    let html = "";
    arrayPictosHorario.forEach((asignatura) => {
        html += `<option value="${asignatura.nombre}">${asignatura.nombre}</option>`;
    });
    return html;
}

function imprimirHorarioAlumno(idAlumno) {
    let alumno = alumnosArraySnapshot.find(alumno => alumno.id === idAlumno);
    let tablaHorario = document.getElementById('editHorAlumnoModal');
    let opciones = asignaturasToOpciones();
    let hora = getAjustesHoras();
    let arrayAsignaturas = [alumno.lun, alumno.mar, alumno.mier, alumno.jue, alumno.vie]
    console.log(arrayAsignaturas);
    for (let i = 0; i < hora; i++) {
        let fila = tablaHorario.insertRow();
        for (let j = 0; j < 5; j++) {
            let newCell = fila.insertCell();
            newCell.id = "r" + i + "-c" + j;
            newCell.classList.add("celdaEditar");
            newCell.innerHTML = `<select name="horario">${opciones}</select>`;
            if (arrayAsignaturas[j][i] != "+") {
                document.querySelector("#" + newCell.id + " select").value = arrayAsignaturas[j][i];
            } else {
                document.querySelector("#" + newCell.id + " select").value = '+';
            }
        }
    }
}

/*Confirmacion*/
function showConfirmacion(title, text) {
    contenidoModalEditar.innerHTML = "";
    tituloModalEditar.innerText = title;
    let p = document.createElement('p');
    p.innerText = text;
    contenidoModalEditar.append(p);
    let button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-dismiss', 'modal');
    button.classList.add('btnVerde', 'btnConfirmar');
    button.innerHTML = `<i class="fas fa-check"></i>De acuerdo`;
    contenidoModalEditar.append(button);
}

function showConfirmarEliminar(title, text, deleteFun) {
    contenidoModalEditar.innerHTML = "";
    tituloModalEditar.innerText = title;
    let p = document.createElement('p');
    p.classList.add('aviso')
    p.innerText = text;
    contenidoModalEditar.append(p);
    let footer = document.createElement('div');
    footer.classList.add("modal-footer", "row", "align-items-stretch", "justify-content-around");
    let buttonX = document.createElement('button');
    buttonX.setAttribute('type', 'button');
    buttonX.setAttribute('data-bs-dismiss', 'modal');
    buttonX.classList.add('btnVerde', 'col-5');
    buttonX.innerHTML = `<i class="fa-solid fa-xmark"></i>Cancelar`;
    footer.append(buttonX);
    let buttonSave = document.createElement('button');
    buttonSave.id = 'saveCambiosHora';
    buttonSave.setAttribute('type', 'button');
    buttonSave.classList.add('btnRojo', 'col-5');
    buttonSave.innerHTML = `<i class="fa-solid fa-trash-can"></i>Eliminar`;
    buttonSave.addEventListener('click', deleteFun);
    footer.append(buttonSave);
    contenidoModalEditar.append(footer);
}

function confirmarUpdatePicto() {
    let title = 'Añadir Pictograma';
    let text = 'Se ha subido el pictograma ' + imageName + ' a la base de datos.';
    showConfirmacion(title, text);
    modalEditar.show();
}

/*Horas alumnos*/
function getAjustesHoras() {
    let numHorasHorario;
    if (ajustes.exists()) {
        numHorasHorario = ajustes.data().numHoras;
    } else {
        console.log("No such document!");
    }
    return numHorasHorario;
}