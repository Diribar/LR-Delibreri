"use strict";

window.addEventListener("load", async () => {
	// Variables
	const DOM = document.querySelector("#porAntig #informacion");
	const domGrafico = DOM.querySelector("#grafico");
	const regsBe = await fetch("/api/gr-por-antiguedad")
		.then((n) => n.json())
		.then((n) => n.reverse());

	// Crea la tabla
	const datos = new google.visualization.DataTable();

	// Agrega columnas
	datos.addColumn("string", "Ejercicio");
	for (const nombreColumna of ["Inicio", "Actual"]) {
		datos.addColumn("number", nombreColumna);
		datos.addColumn({type: "string", role: "annotation"});
		datos.addColumn({type: "string", role: "style"});
	}

	// Agrega filas
	regsBe.forEach((fila, i) => {
		// Obtiene los datos
		const {codigo, valorLrInicial, valorLrActual} = fila;

		// Empieza la fila con el nombre del ejercicio
		const datosFila = [codigo];

		// Agrega los datos
		const colorInicial = i < regsBe.length - 1 ? "rgb(237, 125, 49)" : "rgb(246, 192, 156)";
		datosFila.push(valorLrInicial, moneda(valorLrInicial), "color: " + colorInicial);
		datosFila.push(valorLrActual, moneda(valorLrActual), "color: rgb(132, 60, 12)");
		datos.addRow(datosFila);
	});

	// Opciones
	const opciones = {
		...opcionesComunes(domGrafico),
		legend: {position: "bottom"},
		colors: ["rgb(237, 125, 49)", "rgb(132, 60, 12)"],
	};
	opciones.chartArea.bottom = 50;
	opciones.chartArea.right = 50;

	// Crea la imagen
	const grafico = new google.visualization.ColumnChart(domGrafico);
	grafico.draw(datos, opciones);

	// Redibuja cuando cambia el tamaño
	window.addEventListener("resize", () => grafico.draw(datos, opciones)); // si cambia el tamaño de la ventana

	// Fin
	return;
});
