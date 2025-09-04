"use strict"; // Obtiene 'usuario' y 'cliente'

module.exports = async (req, res, next) => {
	// Variables
	let {usuario} = req.session;
	if (usuario) return next();

	// Obtiene el usuario de su cookie 'mail'
	const {email} = req.cookies;
	req.session.usuario = await comp.obtieneUsuarioPorMail(email);

	// Fin
	return next();
};
