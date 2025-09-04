"use strict";

window.addEventListener("load", async () => {
	// Variables
	const DOM = document.querySelector("#porPeriodo #informacion");
	const domGrafico = DOM.querySelector("#grafico");
	const {fechasPeriodos, ...valoresLr} = await fetch("/api/gr-por-periodo").then((n) => n.json());
	const {valorLr123Inicial, valorLrInicial, valorLr123Proy, valorLr0Proy, valorLrProy} = valoresLr;

	// Variables - Tendencia
	const cantPeriodos = fechasPeriodos.length - 1; // no se cuenta el período inicial
	const difLr_total = valorLrProy - valorLrInicial;
	const difPorPeriodo_total = difLr_total / cantPeriodos;
	const difLr_123 = valorLr123Proy - valorLr123Inicial;
	const difPorPeriodo_123 = difLr_123 / cantPeriodos;

	// Variables - Tabla
	const titulos = {
		colLr123: [
			{label: "LR Inicial", type: "number"},
			{type: "string", role: "annotation"},
		],
		colLr0: [
			{label: "Riesgo Inicial", type: "number"},
			{type: "string", role: "annotation"},
		],
		colMejora: [
			{label: "Mejora", type: "number"},
			{type: "string", role: "annotation"},
		],
		lineaLrInicial: [{label: "LR Inicial", type: "number"}],
		lineaTendTotal: [{label: "Tendencia", type: "number"}],
		lineaTend123: [{label: "Tendencia", type: "number"}],
	};
	const infoDeTemas = [
		// Columnas
		{id: "colLr123", titulo: titulos.colLr123, color: colores.lr123, mostrarLeys: "siempre"}, // LR123 - naranja oscuro
		{id: "colLr0", titulo: titulos.colLr0, color: colores.lr0, mostrarLeys: "siempre"}, // LR0 - naranja claro
		{id: "colMejora", titulo: titulos.colMejora, color: colores.mejora, mostrarLeys: "depende"}, // Mejora - mejora oscuro

		// Líneas
		{id: "lineaLrInicial", titulo: titulos.lineaLrInicial, color: colores.lrInicial, mostrarLeys: "nunca", tipoDots: true}, // Línea LR Inicial
		{id: "lineaTendTotal", titulo: titulos.lineaTendTotal, color: azulOscuro, mostrarLeys: "siempre", tipoDash: true}, // Tendencia final
		{id: "lineaTend123", titulo: titulos.lineaTendTotal, color: azulOscuro, mostrarLeys: "nunca", tipoDash: true}, // Tendencia final
	];
	const filas = [["Períodos", ...infoDeTemas.map((n) => n.titulo).flat()]];

	// Agrega filas
	let fila, datosPorPeriodo;
	const periodos = [...fechasPeriodos, {nombre: "Proy.", valorLr123Proy, valorLr0Proy, valorLrProy}];
	periodos.forEach((periodo, i) => {
		// Variables
		const numPeriodo = i < periodos.length - 1 ? i : i - 1;
		datosPorPeriodo = {
			// Lleva todos los valores a null
			...infoDeTemas.reduce((obj, n) => Object.assign(obj, {[n.id]: null}), {}),

			// Actualiza los valores para las líneas
			lineaLrInicial: valorLr123Inicial,
			lineaTendTotal: Math.round(valorLrInicial + numPeriodo * difPorPeriodo_total),
			lineaTend123: Math.round(valorLr123Inicial + numPeriodo * difPorPeriodo_123),
		};
		const valorLrPeriodo = periodo.valorLrProy || periodo.valorLr123 + periodo.valorLr0; // el valor del período actual
		fila = [periodo.nombre];

		// Columnas
		datosPorPeriodo.colLr123 = periodo.valorLr123 || periodo.valorLr123Proy || null;
		datosPorPeriodo.colLr0 = periodo.valorLr0 || periodo.valorLr0Proy || null;
		datosPorPeriodo.colMejora =
			valorLrPeriodo && valorLr123Inicial > valorLrPeriodo ? valorLr123Inicial - valorLrPeriodo : null;

		const periodoInicial = !i;
		const periodoProy = valorLrPeriodo == valorLrProy;
		const periodoVigente = valorLrPeriodo && !periodoProy && !periodos[i + 1].valorLr123 && !periodos[i + 1].valorLr0;

		// Agrega los valores a la fila
		for (const campo in datosPorPeriodo) {
			// Variables
			const valorElemento = datosPorPeriodo[campo];
			fila.push(valorElemento);

			// Si corresponde, agrega la anotación a la fila
			if (titulos[campo].length > 1)
				fila.push(
					valorElemento && // el elemento tiene valor
						(periodoInicial || periodoVigente || periodoProy) // es alguno de los períodos clave
						? moneda(valorElemento)
						: null
				);
		}

		// Agrega la fila
		filas.push(fila);
	});

	// Series y Colores
	const series = {};
	const colors = [];
	infoDeTemas.forEach((infoDeTema, i) => {
		// Variables
		const {mostrarLeys, tipoDots, tipoDash} = infoDeTema;
		series[i] = {};

		// Agrega a la serie la información de tipo de línea
		if (tipoDots) series[i] = {...series[i], type: "line", lineWidth: 0.5};
		if (tipoDash) series[i] = {...series[i], type: "line", lineDashStyle: [6, 6], lineWidth: 0.75};

		// Agrega a la serie la información de leyenda
		series[i].visibleInLegend = mostrarLeys == "siempre";
		if (mostrarLeys == "depende") series[i].visibleInLegend = infoDeTema.id == "colMejora" && valorLrProy < valorLr123Inicial;

		// Le agrega el color
		colors.push(infoDeTema.color);
	});

	// Opciones
	const opciones = {
		...opcionesComunes(domGrafico),
		isStacked: true,
		legend: {position: "right", alignment: "center"},
		seriesType: "bars",
		series,
		colors,
	};
	opciones.chartArea.bottom = 20;
	opciones.chartArea.left = 100;
	opciones.chartArea.right = 150;

	// Crea el gráfico
	const grafico = new google.visualization.ComboChart(domGrafico);
	const datosTabla = new google.visualization.arrayToDataTable(filas);
	grafico.draw(datosTabla, opciones);

	// Redibuja cuando cambia el tamaño
	window.addEventListener("resize", () => grafico.draw(datosTabla, opciones)); // si cambia el tamaño de la ventana
});
