"use strict";
// Variables
const procesos = require("./PLR-Procesos");
const tema = "panelLr";

module.exports = {
	form: async (req, res) => {
		// Variables
		const titulo = "";
		const etiqActiva =
			(tiposGraficos.find((n) => n.id == req.cookies.etiqActiva) && req.cookies.etiqActiva) || // si existe la etiqueta activa, la elije
			tiposGraficos[0].id; // de lo contrario, elija la primera
		const tituloPestana = "Panel de Lenta Rotación";
		const {proveedor_id, familia_id, fechaEjerc_id} = req.cookies;
		const filtros = {proveedor_id, familia_id, fechaEjerc_id};
		let subTema;

		// Lecturas de BD
		const responsables = await baseDatos.obtieneTodos("usuarios").then((n) => n.filter((m) => m.aptoPlanAccion));

		// Fin
		return res.render("CMP-0Estructura", {
			...{titulo, tema, tituloPestana, subTema, filtros},
			...{tiposGraficos, ...procesos.valoresLr(), etiqActiva, responsables},
		});
	},
};

// Variables
const tiposGraficos = [
	{id: "porPeriodo", etiqueta: "Por Período", titulo: "Evolución abierta por Período", include: true},
	{id: "porAntig", etiqueta: "Por Antigüedad", titulo: "Evolución abierta por Antigüedad"},
	{id: "planesAccion", etiqueta: "Planes de Acción"},
	// titulo: "Planes de Acción"
];
