"use strict";

module.exports = (req, res, next) => {
	// Si las Fechas Clave están confirmadas, redirige
	if (FC_bloq) return res.redirect("/configuracion/fechas-clave-desbloqueo");

	// Fin
	return next();
};
