"use strict";

module.exports = async (req, res, next) => {
	// Activa session
	if (!req.cookies.etiqActiva) res.cookie("etiqActiva", "porPeriodo", {maxAge: unAno});

	// Fin
	return next();
};
