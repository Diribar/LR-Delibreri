"use strict";
// Variables
const valida = require("../../rutasContrs/2-config/CFG-FN-Validacs");

module.exports = (req, res, next) => {
	// Si las Fechas Clave tienen algún error, redirige
	const {fechaInicio, codPlazo} = req.body;

	// Validaciones
	const error = valida.fechasClave({fechaInicio, codPlazo});

	// Si hay errores, regresa al formulario
	if (error) {
		req.session.fechasClave = {dataEntry: {fechaInicio, codPlazo}, error};
		return res.redirect(req.originalUrl);
	} else delete req.session.fechasClave;

	// Fin
	return next();
};
