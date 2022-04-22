/*Containers */
const btnContainer = document.getElementById(".btnContainerMid");
const horarioContainer = document.querySelector(".horarioContainer");
const calendarContainer = document.querySelector(".calendarContainer");

/*Botones*/
const btnsVolver = document.querySelectorAll(".btnVolver");
const btnHorario = document.getElementById("btnHorario");
const btnCalendario = document.getElementById("btnCalendario");
const btnSemanaH = document.getElementById("btnsemanaH");

btnSemanaH.addEventListener("click", () => {
    tablaHorarioDia.style.display = "none";
    tablaHorarioSemana.style.display = "table";
    btnSemanaH.style.display = "none";
    btnIzqDia.style.display = "none";
    btnDerDia.style.display = "none";
    btnDiaH.style.display = "block";
});

btnHorario.addEventListener("click", () => {
    horarioContainer.style.display = "block";
    btnContainer.style.display = "none";
    calendarContainer.style.display = "none";
});

btnCalendario.addEventListener("click", () => {
    horarioContainer.style.display = "none";
    btnContainer.style.display = "none";
    calendarContainer.style.display = "block";
});