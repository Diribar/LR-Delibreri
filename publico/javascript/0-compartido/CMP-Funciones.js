"use strict";
const mesesAbrev = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Colores
(() => {
	// Variables
	for (const sheet of document.styleSheets) {
		let rules
		try {
			rules = sheet.cssRules;
		} catch {
			continue;
		} // Evita error si es hoja externa

		for (const rule of rules)
			if (rule.selectorText === ":root")
				for (const name of rule.style)
					if (name.startsWith("--")) window[name.slice(2)] = rule.style.getPropertyValue(name).trim();
	}
})();

// Funciones
const pierdeTiempo = (ms) => new Promise((n) => setTimeout(n, ms));
const barraProgreso = async (APIs) => {
	// Variables
	const DOM = {
		cartelProgreso: document.querySelector("#cartelProgreso"),
		tituloCartel: document.querySelector("#cartelProgreso #titulo"),
		progreso: document.querySelector("#cartelProgreso #progreso"),
	};
	const pausa = 100; // milisegundos
	const pausaBreve = pausa / 10;
	const duracTotal = APIs.reduce((acum, b) => acum + b.duracion, 0);
	let duracAcum = 0;
	let duracEstim = 0;
	let desvio = 0;
	let respuesta;

	// Muestra el cartelProgreso
	DOM.progreso.style.width = "0%";
	DOM.cartelProgreso.classList.add("aparece");
	DOM.cartelProgreso.classList.remove("ocultar");

	// Ejecuta las APIs
	const inicio = Date.now();
	for (let API of APIs) {
		// Busca la información
		let pendiente = true;
		respuesta = fetch(API.ruta).then((n) => {
			pendiente = false;
			return n;
		});

		// Evoluciona el progreso mientras espera la información
		duracEstim += API.duracion;
		while (pendiente) {
			await pierdeTiempo(pausa - desvio);

			// Evoluciona el progreso
			if (duracAcum < duracEstim) {
				duracAcum += pausa;
				desvio = Date.now() - inicio - duracAcum;
				DOM.progreso.style.width = Math.round(((duracAcum + Math.min(desvio, pausa)) / duracTotal) * 100) + "%";
			}
		}
		// console.log(Date.now() - inicio, duracAcum, Date.now() - inicio - duracAcum);
		respuesta = await respuesta;
		if (respuesta.statusText != "OK") {
			DOM.cartelProgreso.classList.add("ocultar");
			DOM.cartelProgreso.classList.remove("aparece");
			return "Tuvimos un problema con una API";
		}
	}

	// Si se completaron las tareas antes de lo previsto, completa la barra de progreso más rápido
	while (duracAcum < duracEstim) {
		await pierdeTiempo(pausaBreve);
		duracAcum += pausa;
		DOM.progreso.style.width = Math.round((duracAcum / duracTotal) * 100) + "%";
	}

	// Pierde tiempo para mostrar la barra terminada
	await pierdeTiempo(pausa);

	// Oculta el cartelProgreso
	DOM.cartelProgreso.classList.remove("aparece");
	DOM.cartelProgreso.classList.add("ocultar");

	// Fin
	return respuesta.json();
};
