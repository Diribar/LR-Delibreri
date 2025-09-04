"use strict";

window.addEventListener("load", async () => {
	// Variables
	const DOM = document.querySelector("#inicialActual #informacion");
	const domGrafico = DOM.querySelector("#grafico");
	const datosBe = await fetch("/api/gr-inicial-actual").then((n) => n.json());
	const {valorLr123Inicial, valorLr0Inicial, valorLrInicial} = datosBe;// Inicial
	const {valorLr123Actual, valorLr0Actual, valorLrActual,valorMejoraActualLr123} = datosBe;// Actual
	const {valorLr123Proy, valorLr0Proy, valorLrProy,valorMejoraProyLr123} = datosBe;// Proyectado

	// Funciones
	const completaTexto = (valor1, valor2) => moneda(valor1) + " ➝ " + Math.round((valor1 / valor2) * 100) + "%";

	// Crea la tabla
	const datosTabla = new google.visualization.DataTable();

	// Agrega columnas - primera
	datosTabla.addColumn("string", "Momento del Ejercicio");

	// Agrega columnas - siguientes
	const columnas = [null, "LR Inicial", "Riesgo Inicial", "Mejora"];
	for (let i = 1; i < columnas.length; i++) {
		datosTabla.addColumn("number", columnas[i]);
		datosTabla.addColumn({type: "string", role: "annotation"});
	}

	// Fila 1: LR Inicial
	datosTabla.addRow([
		"LR Inicial", // Competencia
		...[valorLr123Inicial, completaTexto(valorLr123Inicial, valorLr123Inicial)], // LR Inicial
		...[valorLr0Inicial, completaTexto(valorLr0Inicial, valorLr0Inicial)], // LR0
		...[null, null], // Resuelto
	]);

	// Fila 2: LR Actual
	datosTabla.addRow([
		"LR Actual", // Competencia
		...[valorLr123Actual || null, valorLr123Actual ? completaTexto(valorLr123Actual, valorLr123Inicial) : null], // LR Inicial
		...[valorLr0Actual || null, valorLr0Actual ? completaTexto(valorLr0Actual, valorLr0Inicial) : null], // LR Actual
		...[valorMejoraActualLr123 || null, valorMejoraActualLr123 ? moneda(valorMejoraActualLr123) : null], // Resuelto
	]);

	// Fila 3: LR Proyectado
	const resueltoProy = valorLrInicial - valorLrProy;
	datosTabla.addRow([
		"LR Proy.", // Competencia
		...[valorLr123Proy || null, valorLr123Proy ? completaTexto(valorLr123Proy, valorLr123Inicial) : null], // LR Inicial
		...[valorLr0Proy || null, valorLr0Proy ? completaTexto(valorLr0Proy, valorLr0Inicial) : null], // LR Actual
		...[valorMejoraProyLr123 || null, valorMejoraProyLr123 ? moneda(valorMejoraProyLr123) : null], // Resuelto
	]);

	// Opciones
	const opciones = {
		...opcionesComunes(domGrafico),
		isStacked: true,
		annotations: {alwaysOutside: false, textStyle: {fontSize: 14}},
		legend: {position: "right", alignment: "center"},
		vAxis: {format: "short"},
		colors: [
			colores.lr123,
			colores.lr0,
			colores.mejora,
		],
	};
	opciones.chartArea.bottom = 20;
	opciones.chartArea.right = 120;

	// Crea la imagen
	const grafico = new google.visualization.ColumnChart(domGrafico);
	grafico.draw(datosTabla, opciones);

	// Redibuja cuando cambia el tamaño
	window.addEventListener("resize", () => grafico.draw(datosTabla, opciones)); // si cambia el tamaño de la ventana

	// Fin
	return;
});
