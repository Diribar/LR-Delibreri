"use strict";

window.addEventListener("load", () => {
	// Variables
	const contrasena = document.querySelector("input[name='contrasena']");
	const ojito = document.getElementById("eye");

	// Funciones
	const muestra = () => {
		contrasena.type = "text";
		ojito.classList.remove("fa-eye-slash");
		ojito.classList.add("fa-eye");
		return;
	};
	const oculta = () => {
		contrasena.type = "password";
		ojito.classList.remove("fa-eye");
		ojito.classList.add("fa-eye-slash");
		return;
	};

	// Muestra
	ojito.addEventListener("mousedown", () => muestra());
	ojito.addEventListener("touchstart", () => muestra());

	// Oculta
	ojito.addEventListener("mouseup", () => oculta());
	ojito.addEventListener("touchend", () => oculta());
});
