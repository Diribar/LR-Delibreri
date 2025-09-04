"use strict";

window.addEventListener("load", async () => {
	// Variables
	const DOM = document.querySelector("#carrera #informacion");
	const domGrafico = DOM.querySelector("#grafico");
	const {logradoFecha, logradoLr} = await fetch("/api/gr-carrera").then((n) => n.json());

	// Crea la tabla
	const datos = new google.visualization.DataTable();

	// Columnas
	datos.addColumn("string", "Competencia");
	datos.addColumn("number", "Logrado");
	datos.addColumn({type: "string", role: "annotation"}); // ← anotación
	datos.addColumn({type: "string", role: "style"});
	datos.addColumn("number", "Pendiente");
	datos.addColumn({type: "string", role: "annotation"}); // ← anotación
	datos.addColumn({type: "string", role: "style"});

	// Filas
	datos.addRow([
		"Tiempo del\nEjercicio", // Competencia
		...[logradoFecha, "Transcurrido ➝ " + Math.round(logradoFecha * 100) + "%", "color: rgb(127, 127, 127)"], // Celda 'logrado'
		...[1 - logradoFecha, null, "color: rgb(217, 217, 217)"], // Celda 'pendiente'
	]);
	const color = logradoLr >= logradoFecha ? colores.mejora : colores.riesgo;
	datos.addRow([
		"Reducción\nLR", // Competencia
		...[logradoLr, "Logrado ➝ " + (logradoLr * 100).toFixed(0) + "%", "color: " + color], // Celda 'logrado'
		...[1 - logradoLr, null, "color: rgb(217, 217, 217)"], // Celda 'pendiente'
	]);

	// Opciones
	const opciones = {
		...opcionesComunes(domGrafico),
		bars: "horizontal", // hace que las barras sean horizontales
		isStacked: true, // apilado
		annotations: {textStyle: {fontSize: 18}},
	};

	// Crea la imagen
	const grafico = new google.visualization.BarChart(domGrafico);
	grafico.draw(datos, opciones);

	// Redibuja cuando cambia el tamaño
	window.addEventListener("resize", () => grafico.draw(datos, opciones)); // si cambia el tamaño de la ventana

	// Texto
	const domTexto = DOM.querySelector("#texto");
	const boton = document.createElement("button");
	boton.classList.add(logradoLr >= logradoFecha ? "bien" : "danger");
	boton.innerHTML = logradoLr >= logradoFecha ? "Vamos bien..." : "Cuidado, hay<br>que mejorar";
	domTexto.appendChild(boton);

	// Fin
	return;
});
