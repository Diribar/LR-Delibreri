"use strict";
// Variables
const procesos = require("./CA-Procesos");

module.exports = {
	form: async (req, res) => {
		// Variables
		const tema = "cargaArchs";
		const titulo = "Carga de Archivos del Ejercicio Actual";

		// Lectura de BD
		await procesos.actualizaIconosPanel();
		const regsPanel = tablasCa;
		const ocultarBoton = !tablasCa.find((n) => n.icono == iconosCA.pendGua); // si no encuentra ningún ícono pendiente de guardar, oculta el botón

		// Fechas movimientos
		const fechasMovs = {
			hastaFin: comp.fechas["d/mmm/aa"](FC_fin),
			hastaHoy: comp.fechas["d/mmm/aa"](comp.fechas.nueva({diasDif: -1})),
			desde: comp.fechas["d/mmm/aa"](FC_inicio),
		};

		// Fin
		return res.render("CMP-0Estructura", {tema, titulo, regsPanel, fechasMovs, ocultarBoton});
	},
	guardar: async (req, res) => {
		// Procesos
		await procesos.actualizaMovsReserva.consolidado(); // no se usa en 'CFG', porque están vacíos
		await procesos.actualizaLrStockPeriodos.consolidado(); // actualiza el cálculo de la LR en stock
		await procesos.actualizaLrOtrasTablas.consolidado(); // actualiza las tablas que se usan en el Panel de LR

		// Actualiza los íconos del panel
		await baseDatos.actualizaTodos("tablasCa", {icono: iconosCA.actualiz});

		// Limpieza
		await procesos.vaciaOriginales(); // vacía de contenido las tablas originales

		// Fin
		return res.redirect(req.originalUrl);
	},
};
