"use strict";

module.exports = (req, res, next) => {
	// Si las "Fechas Clave" están sin confirmar, redirige a las fechas clave
	if (!FC_bloq) return res.redirect("/configuracion/fechas-clave-bloqueo");

	// Fin
	return next();
};
