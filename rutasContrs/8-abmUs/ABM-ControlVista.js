"use strict";

module.exports = {
	panel: async (req, res) => {
		// Variables
		const tema = "abmUsuarios";
		const titulo = "ABM de Usuarios";
		const usuarios = await baseDatos.obtieneTodos("usuarios", "rol");

		// Fin
		// return res.send({tema, usuarios, rolesSinProp});
		return res.render("CMP-0Estructura", {tema,titulo, usuarios, rolesSinProp});
	},
};
