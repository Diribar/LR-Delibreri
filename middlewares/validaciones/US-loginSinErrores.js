"use strict";
const bcryptjs = require("bcryptjs");

module.exports = async (req, res, next) => {
	// Variables
	const {email, contrasena} = req.body;

	// Averigua si hay errores
	const errores = await validaLogin({email, contrasena});

	// Si hay errores, los guarda en la session y redirecciona
	if (errores.hay) {
		req.session.login = {dataEntry: {email, contrasena}, errores};
		return res.redirect("/usuarios/login");
	}

	// Limpia la información obsoleta
	delete req.session.login;

	// Fin
	return next();
};

const validaLogin = async ({email, contrasena}) => {
	// Verifica errores
	const errores = {
		email: comp.validacs.email(email),
		contrasena: comp.validacs.contrasena(contrasena),
	};
	errores.hay = Object.values(errores).some((n) => !!n);

	// Sólo si no hay algún error previo, revisa las credenciales
	if (!errores.hay) {
		// Obtiene el usuario
		const usuario = await comp.obtieneUsuarioPorMail(email);

		// Averigua si el registro tiene contraseña en la tabla
		const {contrasena: contrTabla} = usuario;
		if (!contrTabla)
			errores.contrasena = "Este mail no tiene una contraseña asociada aún, debés generarla con el ícono rojo de abajo";
		// Si tiene contraseña, la verifica con la ingresada
		else errores.credenciales = !usuario || !bcryptjs.compareSync(contrasena, contrTabla);
	}

	// Consolida la información
	errores.hay = Object.values(errores).some((n) => !!n);

	// Fin
	return errores;
};
