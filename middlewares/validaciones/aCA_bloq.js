"use strict";

module.exports = (req, res, next) => {
	// Si la carga de archivos está sin bloquear, redirige
	if (!CA_bloq) return res.redirect("/configuracion/carga-de-archivos-bloqueo");

	// Fin
	return next();
};
