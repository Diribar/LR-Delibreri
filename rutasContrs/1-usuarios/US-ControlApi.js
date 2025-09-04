"use strict";
// Variables
const procesos = require("./US-Procesos");
const validacs = require("./US-FN-Validacs");

module.exports = {
	// Login
	validaMail: (req, res) => res.json(comp.validacs.email(req.query && req.query.email)),
	validaContr: (req, res) => res.json(comp.validacs.contrasena(req.query && req.query.contrasena)),
	envioDeContr: async (req, res) => {
		// Variables
		const {email} = req.query;
		const fechaContrasena = new Date();

		// Envía el mensaje con la contraseña
		const {contrasena, mailEnviado} = await procesos.envioDeMailConContrasena(email);

		// Si no hubo errores con el envío del email, actualiza la contraseña del usuario
		if (mailEnviado) baseDatos.actualizaPorCondicion("usuarios", {email}, {contrasena, fechaContrasena});

		// Fin
		return res.json(mailEnviado);
	},

	// Completa el usuario
	validaNombreCompl: async (req, res) => res.json(await validacs.nombreCompl({...req.query, usuario_id: req.session.usuario})),
	validaApodo: async (req, res) => res.json(await validacs.apodo({...req.query, usuario_id: req.session.usuario})),
};
