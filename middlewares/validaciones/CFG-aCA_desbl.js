"use strict";

module.exports = (req, res, next) => {
	// Si las Fechas Clave están confirmadas, redirige
	if (CA_bloq) return res.redirect("/configuracion/carga-de-archivos-desbloqueo");

	// Fin
	return next();
};
