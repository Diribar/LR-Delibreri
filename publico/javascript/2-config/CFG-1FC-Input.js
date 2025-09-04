"use strict";

window.addEventListener("load", async () => {
	// Variables
	const DOM = {
		// Campos del form
		form: document.querySelector("form#fechasClave"),
		inputs: document.querySelectorAll("form#fechasClave .input"),
		fechaInicio: document.querySelector("form#fechasClave input[type='date']"),
		plazo: document.querySelector("form#fechasClave select"),
		fechaFin: document.querySelector("form#fechasClave p span"),
		submit: document.querySelector("form#fechasClave button"),

		// Errores
		iconoOK: document.querySelector("form#fechasClave .fa-circle-check"),
		iconoError: document.querySelector("form#fechasClave .fa-circle-xmark"),
		mensajeError: document.querySelector("form#fechasClave .mensajeError"),
	};
	const v = await fetch(rutas.datosIniciales).then((res) => res.json());
	let error;

	// Funciones
	const FN = {
		obtieneLosErrores: async () => {
			// Obtiene la información
			let datos = "";
			DOM.inputs.forEach((input, i) => (datos += (i ? "&" : "/?") + input.name + "=" + input.value));

			// Obtiene los errores
			error = await fetch(rutas.valida + datos).then((n) => n.json());

			// Fin
			return;
		},
		muestraElError: () => {
			// Muestra el error
			if (error) {
				DOM.iconoOK.classList.add("ocultar");
				DOM.iconoError.classList.remove("ocultar");
				DOM.mensajeError.innerHTML = error;
				DOM.submit.classList.add("inactivo");
			} else {
				DOM.iconoOK.classList.remove("ocultar");
				DOM.iconoError.classList.add("ocultar");
				DOM.mensajeError.innerHTML = "";
				DOM.submit.classList.remove("inactivo");
			}

			// Fin
			return;
		},
		obtieneFechaFin: () => {
			// Variables
			const [anoInicial, mesInicial, diaInicial] = DOM.fechaInicio.value.split("-").map((n) => Number(n));
			const plazo = v.auxPlazos.find((n) => n.codigo == DOM.plazo.value).meses;

			// Obtiene el mes final
			let diaFinal = diaInicial - 1;
			let mesFinal = mesInicial + plazo;
			let anoFinal = anoInicial;

			// Adecuaciones del mes y año
			if (diaFinal == 0) mesFinal--;
			if (mesFinal == 0) mesFinal = 12; // diciembre
			if (mesFinal > 12) {
				mesFinal -= 12;
				anoFinal++; // año siguiente
			}
			const mesAbrev = v.mesesAbrev[mesFinal - 1];

			// Adecuaciones del día
			if (diaFinal == 0) diaFinal = v.diasFinales[mesFinal];

			// Obtiene la fecha fin
			const fechaFin = diaFinal + "/" + mesAbrev + "/" + anoFinal;

			// Fin
			return fechaFin;
		},
	};

	// Eventos
	DOM.form.addEventListener("change", async () => {
		// Obtiene el error y lo muestra
		await FN.obtieneLosErrores();
		FN.muestraElError();

		// Si no hay errores, actualiza la fecha fin
		if (!error) DOM.fechaFin.innerHTML = FN.obtieneFechaFin();

		// Fin
		return;
	});

	// Si el botón está inactivo, previene el submit
	DOM.submit.addEventListener("click", async (e) => DOM.submit.className.includes("inactivo") && e.preventDefault());

	// Start-up
	DOM.fechaFin.innerHTML = FN.obtieneFechaFin();

	// Fin
	return;
});

// Variables
const rutas = {
	datosIniciales: "/configuracion/api/fc-datos-inciales",
	valida: "/configuracion/api/fc-valida",
};
