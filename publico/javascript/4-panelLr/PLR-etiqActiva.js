"use strict";

window.addEventListener("load", async () => {
	// Variables
	const DOM = {
		etiquetas: document.querySelectorAll("nav#etiquetas .etiqueta"),
		zonasPanel: document.querySelectorAll("#marcoChico .zonaPanel"),
	};

	// Eventos
	DOM.etiquetas.forEach((etiqueta, i) => {
		etiqueta.addEventListener("click", () => {
			// Activa la nueva etiqueta
			DOM.etiquetas.forEach((etiqueta) => etiqueta.classList.remove("activo"));
			etiqueta.classList.add("activo");

			// Muestra la nueva zona
			DOM.zonasPanel.forEach((zona, j) => (i == j ? zona.classList.remove("tapado") : zona.classList.add("tapado")));

			// Guarda en cookie
			document.cookie = "etiqActiva=" + etiqueta.id + ";max-age=86400"; // un día

			// Fin
			return;
		});
	});

	// Fin
	return;
});
