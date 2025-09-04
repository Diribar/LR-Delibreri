"use strict"; // Obtiene 'usuario' y 'cliente'

module.exports = async (req, res, next) => {
	// Si ya existe la session, interrumpe la función
	if (req.session.completaDatos) return next();

	// Actualiza session
	const {nombreCompl, apodo, avatar} = req.session.usuario;
	req.session.completaDatos = {dataEntry: {nombreCompl, apodo, avatar}};

	// Fin
	return next();
};
