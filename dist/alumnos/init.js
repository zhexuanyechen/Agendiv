/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/inicializacion.js":
/*!*******************************!*\
  !*** ./src/inicializacion.js ***!
  \*******************************/
/***/ (() => {

eval("/*Containers */\r\nconst btnContainer = document.getElementById(\"btnContainerMid\");\r\nconst horarioContainer = document.querySelector(\".horarioContainer\");\r\nconst calendarContainer = document.querySelector(\".calendarContainer\");\r\n\r\n/*Botones*/\r\nconst btnsVolver = document.querySelectorAll(\".btnVolver\");\r\nconst btnHorario = document.getElementById(\"btnHorario\");\r\nconst btnCalendario = document.getElementById(\"btnCalendario\");\r\nconst btnSemanaH = document.getElementById(\"btnsemanaH\");\r\n\r\nbtnHorario.addEventListener(\"click\", () => {\r\n    horarioContainer.style.display = \"block\";\r\n    btnContainer.style.display = \"none\";\r\n    calendarContainer.style.display = \"none\";\r\n});\r\n\r\nbtnCalendario.addEventListener(\"click\", () => {\r\n    horarioContainer.style.display = \"none\";\r\n    btnContainer.style.display = \"none\";\r\n    calendarContainer.style.display = \"block\";\r\n});\n\n//# sourceURL=webpack://agendiv-prueba/./src/inicializacion.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/inicializacion.js"]();
/******/ 	
/******/ })()
;