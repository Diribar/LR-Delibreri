"use strict";
// Variables
const procesos = require("./CFG-Procesos");

module.exports = {
	// Vistas - GET siempre
	fechasClave: ({fechaInicio, codPlazo}) => {
		// Valida fechas
		let error = validacs.fecha(fechaInicio) || validacs.plazo(codPlazo);

		// Otros posibles errores
		if (!error) {
			const fechaFin = comp.fechas.nueva({fecha: fechaInicio, codPlazo, diasDif: -1});
			error = fechaFin < comp.fechas["aaaa-mm-dd"]() ? "La fecha <em>Hasta</em> debe ser mayor que la actual" : "";
		}

		// Fin
		return error;
	},
	maestroMovs: {
		altaEdic: ({id, nuevoId, descripcion, startUpIn, startUpOut, solucOut_id}) =>
			validacs.consolidado(nuevoId, 1, 3) ||
			(nuevoId != id && maestroMovs.find((n) => n.id == nuevoId) && codUsado) ||
			(maestroMovs.find((n) => n.id != nuevoId && n.descripcion == descripcion) && descrUsada) ||
			((!id || !maestroMovs.find((n) => n.id == id).esencial) &&
				(validacs.inputVacio(startUpIn) ||
					(!["0", "1"].find((n) => n == startUpIn) && "Valor 'startUpIn' no aceptado") ||
					validacs.inputVacio(startUpOut) ||
					(startUpOut != "0" && startUpOut != "1" && "Valor 'startUpOut' no aceptado") ||
					validacs.inputVacio(solucOut_id) ||
					(!solucsOut.find((n) => n.id == solucOut_id) && "Valor 'solucion' no aceptado"))),
		alta: ({descripcion, esencial}) =>
			validacs.consolidado(descripcion, 2, 20) ||
			validacs.inputVacio(esencial) ||
			(esencial != "0" && esencial != "1" && "Valor 'esencial' no aceptado"),
		edicBaja: ({id}) => (validacs.consolidado(id, 1, 3) || !maestroMovs.find((n) => n.id == id)) && regDescon,
		edicion: ({id, descripcion, esPropietario}) =>
			(!maestroMovs.find((n) => n.id == id).esencial || (maestroMovs.find((n) => n.id == id).esencial && esPropietario)) &&
			validacs.consolidado(descripcion, 2, 20),
	},
	maestroDeps: {
		altaEdic: ({id, nuevoId, descripcion, nave, lr}) =>
			validacs.consolidado(nuevoId, 1, 3) ||
			(nuevoId != id && maestroDeps.find((n) => n.id == nuevoId) && codUsado) ||
			validacs.consolidado(descripcion, 2, 20) ||
			(maestroDeps.find((n) => n.id != id && n.descripcion == descripcion) && descrUsada) ||
			validacs.consolidado(nave, 2, 20) ||
			validacs.inputVacio(lr) ||
			(!["0", "1"].find((n) => n == lr) && "Valor 'LR' no aceptado"),
		edicBaja: ({id}) => (validacs.consolidado(id, 1, 10) || !maestroDeps.find((n) => n.id == id)) && regDescon,
	},
	archsInput: {
		altaEdic: async ({id, tipoTabla_id, distintTexto, col, fila}) =>
			// tipoTabla_id
			(!tipoTabla_id && selectVacio) ||
			(!tiposTablaCabecera.find((n) => n.id == tipoTabla_id) && opcionInvalida) ||
			// Texto distintivo
			validacs.consolidado(distintTexto, 2, 20) ||
			(archsCabecera.find((n) => n.id != id && n.distintTexto == distintTexto) &&
				"Ya existe otro registro con ese texto") ||
			// Columna y fila
			(!col && inputVacio) ||
			validacs.longitud(col, 1, 1) ||
			(!/[A-Z]/.test(col) && "Columna con carácter inválido") ||
			(!fila && inputVacio) ||
			validacs.longitud(fila, 1, 1) ||
			(!/[1-9]/ && "Fila con número inválido"),

		edicBaja: async ({id}) =>
			(validacs.consolidado(id, 1, 2) || !archsCabecera.find((n) => n.id == id) || isNaN(Number(id))) && regDescon,
	},

	// Vistas - GET con configuración de base ya bloqueada
	fechasPeriodos: {
		altaBaja: (fecha) =>
			validacs.fecha(fecha) || // Tiene que ser un valor válido
			(new Date(fecha) < new Date() && "Tiene que ser una fecha del futuro"),
		alta: (fecha) =>
			(fecha <= FC_inicio && "Tiene que ser mayor que la fecha clave de inicio") ||
			(fecha >= FC_fin && "Tiene que ser menor que la fecha clave de fin"),
	},
};

// Funciones
const validacs = {
	consolidado: function (dato, corto, largo) {
		return (!dato && inputVacio) || this.longitud(dato, corto, largo) || this.castellano(dato) || "";
	},
	inputVacio: (dato) => (!dato && inputVacio) || "",
	longitud: (dato, corto, largo) =>
		(dato.length < corto && "El contenido debe ser más largo") ||
		(dato.length > largo && "El contenido debe ser más corto") ||
		"",
	castellano: (dato) => (!/[a-záéíóúüñ\d\-]+$/i.test(dato) && "Sólo se admiten letras y números") || "",
	fecha: (fecha) =>
		(!fecha && "Necesitamos que completes la fecha") ||
		(!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(fecha) && "Formato de fecha inválido") || // 4 digítos para el año, meses 1-9 ó 10-12, días 01-09 ó 10-29 ó 30-31
		"",
	plazo: (plazo) =>
		(!plazo && inputVacio) || (!auxPlazos.map((n) => n.codigo).includes(plazo) && "No se reconoce el plazo") || "",
};
