"use strict";

module.exports = {
	session: (req, res) => res.send(req.session), // session
	cookies: (req, res) => res.send(req.cookies), // cookies
	limpiaTodo: async (req, res) => {
		// Variables
		const espera = [];
		let tablas;

		// Elimina tablas con vinculación ascendente y sin descendencia - 1a etapa
		tablas = ["inEj0", "inEj1", "inEj2", "outSoluc", "reserva"];
		for (const tabla of tablas) espera.push(baseDatos.eliminaTodos(tabla));
		await Promise.all(espera);

		// Elimina tablas con vinculación ascendente y sin descendencia -2a etapa
		await baseDatos.eliminaTodos("stock");

		// Elimina tablas sin vinculación
		tablas = [
			...["fechasEjercs", "fechasPeriodos"],
			...["inEj1_orig", "inEj2_orig", "outSoluc_orig", "reserva_orig", "stock_orig"],
			...["maestroProds_orig", "maestroProvs_orig", "maestroFams_orig", "maestroProvs", "maestroFams"],
		];
		for (const tabla of tablas) espera.push(baseDatos.eliminaTodos(tabla));
		await Promise.all(espera);

		// Elimina variables globales
		fechasEjercs = [];
		fechasPeriodos = [];

		// Actualiza los paneles
		const datosNull = {icono: iconosCA.sinRegs, desde: null, hasta: null, actualizadoPor_id: null, actualizadoEn: null};
		espera.push(baseDatos.actualizaTodos("tablasCfg", datosNull));
		espera.push(baseDatos.actualizaTodos("tablasCa", datosNull));

		// Variables globales
		FC_inicio = null;
		FC_codPlazo = null;
		FC_fin = null;
		FC_por = null;
		FC_en = null;
		FC_bloq = false;
		CA_bloq = false;
		const datos = {FC_inicio, FC_codPlazo, FC_fin, FC_por, FC_en, FC_bloq, CA_bloq};
		comp.gestionArchs.actualizaJson(datos);

		// Usuario
		const datosUsuario = {statusReg_id: 1};
		await baseDatos.actualizaTodos("usuarios", datosUsuario);

		// Fin
		return res.redirect("/usuarios/logout");
	},
};
