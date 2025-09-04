"use strict";

module.exports = async (req, res, next) => {
	// Activa session
	if (!req.cookies.etiqActiva) res.cookie("etiqActiva", "carrera", {maxAge: unAno});

	// Fin
	return next();
};
