"use strict";

module.exports = (req, res, next) => {
	// Si la carga de archivos está sin bloquear, redirige
	if (!CA_bloq) {
		// Variables
		const {usuario} = req.session;

		// Si es un usuario con el rol adecuado, redirige
		if (usuario && usuario.rol && usuario.rol.cfg) return res.redirect("/configuracion/carga-de-archivos-bloqueo");

		// De lo contrario, avisa que no puede continuar
		const informacion = {};
		return res.render("CMP-0Estructura", informacion);
	}

	// Fin
	return next();
};
