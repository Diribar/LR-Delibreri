"use strict";
// Variables
const valida = require("../../rutasContrs/1-usuarios/US-FN-Validacs");

module.exports = async (req, res, next) => {
	// Variables
	const {nombreCompl, apodo} = req.body;
	const {id: usuario_id} = req.session.usuario;

	// Averigua si hay errores
	const errores = await valida.nombreApodo({nombreCompl, apodo, usuario_id});

	// Si hay errores, los guarda en la session y redirecciona
	if (errores.hay) {
		req.session.completaDatos = {dataEntry: {nombreCompl, apodo}, errores}; // Actualiza la session
		return res.redirect("/usuarios/completa-datos"); // Redirecciona
	}

	// Fin
	return next();
};
