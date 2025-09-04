"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {usuario} = req.session;

	// Redirecciona
	if (usuario.statusReg_id == stMailPendValidar_id) return res.redirect("/usuarios/login");
	if (usuario.statusReg_id == stDatosCompletados_id) return res.redirect("/");

	// Fin
	return next();
};
