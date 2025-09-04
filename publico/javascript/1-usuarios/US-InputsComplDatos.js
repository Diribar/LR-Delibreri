"use strict";
window.addEventListener("load", () => {
	// Variables
	const form = document.querySelector("#form");
	const DOM = {
		// OK/Errores
		iconosOK: form.querySelectorAll(".inputError .fa-circle-check"),
		iconosError: form.querySelectorAll(".inputError .fa-circle-xmark"),
		mensajesError: form.querySelectorAll(".inputError .mensajeError"),

		// Varios del form
		inputs: form.querySelectorAll(".inputError .input"),
		submit: form.querySelector("button[type='submit']"),
	};
	const testigo = {};
	const errores = {};

	// Funciones
	const FN = {
		obtieneErroresPorCampo: async (input) => {
			// Variables
			const campo = input.name;
			const valor = encodeURIComponent(input.value);
			const ruta = "/usuarios/api/us-valida-" + campo + "/?" + campo + "=" + valor;

			// Averigua los errores
			const ahora = Date.now();
			testigo[campo] = ahora; // 'testigo' es una variable global
			const obtieneErrores = await fetch(ruta).then((n) => n.json());

			// Si fue el último fetch, actualiza los errores del campo
			if (testigo[campo] == ahora) errores[campo] = obtieneErrores;

			// Fin
			return;
		},
		muestraErroresPorCampo: (indice) => {
			// Variables
			const campo = DOM.inputs[indice].name;
			const mensaje = errores[campo];

			// Reemplaza el mensaje, con particularidad para 'avatar'
			DOM.mensajesError[indice].innerHTML = mensaje;

			// Acciones en función de si hay o no mensajes de error
			mensaje ? DOM.iconosError[indice].classList.remove("ocultar") : DOM.iconosError[indice].classList.add("ocultar");
			mensaje ? DOM.iconosOK[indice].classList.add("ocultar") : DOM.iconosOK[indice].classList.remove("ocultar");

			// Fin
			return;
		},
		actualizaBotonSubmit: () => {
			// Variables
			const errores = Array.from(DOM.iconosError)
				.map((n) => n.className)
				.every((n) => n.includes("ocultar"));

			// Actualiza el botón 'login'
			errores ? DOM.submit.classList.remove("inactivo") : DOM.submit.classList.add("inactivo");

			// Fin
			return;
		},
	};

	// Eventos - Input
	DOM.inputs.forEach((input, i) => {
		input.addEventListener("input", async () => {
			// Mail en minúsculas
			if (input.name == "email") {
				const posicCursor = input.selectionStart;
				input.value = input.value.toLowerCase();
				input.selectionEnd = posicCursor;
				DOM.olvidoContr.classList.remove("inactivo");
			}

			// Oculta los errores del input
			DOM.iconosError[i].classList.add("ocultar");
			DOM.iconosOK[i].classList.add("ocultar");

			// Tareas varias
			await FN.obtieneErroresPorCampo(input); // Detecta si hay errores
			FN.muestraErroresPorCampo(i); // Muestra los aciertos/errores
			FN.actualizaBotonSubmit(); // Activa/Desactiva el botón 'Guardar'

			// Fin
			return;
		});
	});
	// Eventos - Submit
	form.addEventListener("submit", async (e) => DOM.submit.className.includes("inactivo") && e.preventDefault());

	// Fin
	return;
});
