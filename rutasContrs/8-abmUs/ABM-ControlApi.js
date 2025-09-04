"use strict";
// Variables
const validacs = require("./ABM-FN-Validacs");

module.exports = {
	// ABM
	altaUsuario: async (req, res) => {
		const {email, rol_id} = req.query;
		const errores = await validacs.altaUsuario({email, rol_id});
		if (!errores.hay) baseDatos.agregaRegIdCorrel("usuarios", {email, rol_id});
		return res.json(errores);
	},
	edicUsuario: async (req, res) => {
		const {email, rol_id} = req.query;
		const mensaje = await validacs.edicUsuario({email, rol_id});
		if (!mensaje) baseDatos.actualizaPorCondicion("usuarios", {email}, {rol_id});
		return res.json(mensaje);
	},
	bajaUsuario: async (req, res) => {
		const {email} = req.query;
		const mensaje = await validacs.bajaUsuario(email);
		if (!mensaje) baseDatos.eliminaPorCondicion("usuarios", {email});
		return res.json(mensaje);
	},
};
