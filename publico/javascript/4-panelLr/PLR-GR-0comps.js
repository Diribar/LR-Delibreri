// Opciones del gráfico
const margenes = {top: 10, bottom: 10, left: 120, right: 0};
const colores = {
	lrInicial: marronInterm,
	lr123: naranjaOscuro,
	lr0: naranjaClaro,
	lrTotal: marronInterm,
	riesgo: rojoInterm,
	mejora: verdeInterm,
	lrVigente: azulFrances,
	lrResuelto: verdeClaro,
};

// Librería de gráficos
google.charts.load("current", {packages: ["corechart", "bar"]});

// Funciones
const moneda = (valor, tresDigs) => {
	// Variables
	const mil = 1000;
	const unMillon = mil * mil;

	// Si corresponde, convierte en miles o millones
	if (Math.abs(valor) >= unMillon) valor = (Math.round((valor / unMillon) * 10) / 10).toFixed(1) + "M";
	else if (!tresDigs && Math.abs(valor) >= mil * 100) valor = (Math.round((valor / unMillon) * 10) / 10).toFixed(1) + "M";
	else if (Math.abs(valor) >= mil) valor = (Math.round((valor / mil) * 10) / 10).toFixed(1) + "K";

	// Si es mayor a mil y tiene 2 o más dígitos enteros, quita el decimal
	if (String(valor).replace("-", "").length > 5 && valor.indexOf(".") > -1) {
		// Obtiene el valor redondeado
		let nuevoValor = parseFloat(valor);
		nuevoValor = Math.round(nuevoValor);

		// Le agrega el caracter
		const caracter = valor.slice(-1);
		if (["M", "K"].includes(caracter)) nuevoValor += caracter;

		// Actualiza el valor
		valor = nuevoValor;
	}

	// Reemplaza el punto por la coma
	valor = String(valor).replace(".", ",");

	// Fin
	return valor;
};
const formatoSimela = (numero) => new Intl.NumberFormat("es-AR").format(numero); // SIMELA
const opcionesComunes = (domGrafico) => ({
	backgroundColor: "transparent",
	legend: {position: "none"},
	chartArea: margenes,
	vAxis: {format: "short"},
	height: domGrafico.clientHeight * 0.8,
});
