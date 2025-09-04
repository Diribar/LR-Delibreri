"use strict";

module.exports = async (req, res, next) => {
	// Si alguna tabla está pendiente de cargar, redirige a la carga de archivos
	const registro = await baseDatos.obtieneTodos("tablasCfg").then((n) => n.find((m) => m.icono != iconosCA.pendGua));
	if (registro) return res.redirect("/configuracion/carga-de-archivos-bloqueo");

	// Fin
	return next();
};
