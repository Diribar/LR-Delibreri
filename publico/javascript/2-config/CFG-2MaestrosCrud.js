"use strict";

window.addEventListener("load", async () => {
	// Variables
	const tabla = document.querySelector("table.tabla");
	const DOM = {
		// Campos de la tabla
		filasLectura: tabla.querySelectorAll("tbody tr.lectura"),
		ids: tabla.querySelectorAll("tbody tr.lectura td#id"),
		iconosEdicion: tabla.querySelectorAll("tbody tr.lectura td.iconos i.edicion"),
		iconosEliminar: tabla.querySelectorAll("tbody tr.lectura td.iconos i.eliminar"),
		filasEdicion: tabla.querySelectorAll("tbody tr.edicion"),
		iconosActualizar: tabla.querySelectorAll("tbody tr.edicion td.iconos i.actualizar"),
		iconosSalir: tabla.querySelectorAll("tbody tr.edicion td.iconos i.salir"),

		// Errores
		iconoError: tabla.querySelector("form#maestroMovs .fa-circle-xmark"),
		mensajeError: tabla.querySelector("form#maestroMovs .mensajeError"),
	};

	// Eventos - Muestra edición
	DOM.iconosEdicion.forEach((icono, i) => {
		icono.addEventListener("click", () => {
			DOM.filasLectura[i].classList.add("ocultar");
			DOM.filasEdicion[i].classList.remove("ocultar");
		});
	});

	// Eventos - Oculta Edición
	DOM.iconosSalir.forEach((icono, i) => {
		icono.addEventListener("click", () => {
			DOM.filasEdicion[i].classList.add("ocultar");
			DOM.filasLectura[i].classList.remove("ocultar");
		});
	});

	// Eventos - Elimina
	DOM.iconosEliminar.forEach((icono, i) => {
		icono.addEventListener("click", () => {
			console.log("Eliminar", DOM.ids[i].innerText);
		});
	});

	// Eventos - Actualiza
	DOM.iconosActualizar.forEach((icono, i) => {
		icono.addEventListener("click", () => {
			// Variables
			const inputs = DOM.filasEdicion[i].querySelectorAll("input, select");
			const nombres = Array.from(inputs).map((n) => n.name);
			const valores = Array.from(inputs).map((n) => n.value);
			console.log("Actualizar", nombres,valores);
		});
	});

	// Fin
	return;
});
