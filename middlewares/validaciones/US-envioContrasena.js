"use strict";

module.exports = async (req, res, next) => {
	// Variables
	// Variables
	const {email} = req.query;

	// Si el email es inválido, devuelve un error
	const mensaje = comp.validacs.email(email);
	if (mensaje) return res.json(mensaje);

	// Si no existe el usuario, devuelve un error
	const usuario = await baseDatos.obtienePorCondicion("usuarios", {email});
	if (!usuario) return res.json("No existe un usuario con ese email");

	// Si se envió un mail hace menos de un día
	const {fechaContrasena} = usuario;
	if (fechaContrasena && new Date().getTime() - fechaContrasena.getTime() < unDia)
		return res.json("Ya se envió un mail hace menos de un día");

	// Fin
	return next();
};
