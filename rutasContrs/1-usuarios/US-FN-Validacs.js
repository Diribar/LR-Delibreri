"use strict";

module.exports = {
	// Valida el nombreCompl y el apodo
	nombreCompl: async ({nombreCompl, usuario_id}) => {
		// Variables
		const condicion = {id: {[Op.ne]: usuario_id}}; // Excluye al usuario actual
		const usuarios = await baseDatos.obtieneTodosPorCondicion("usuarios", condicion);

		// Fin
		return comp.validacs.texto(nombreCompl) || (usuarios.find((n) => n.nombreCompl == nombreCompl) && nombreYaUsado) || "";
	},
	apodo: async ({apodo, usuario_id}) => {
		// Variables
		const condicion = {id: {[Op.ne]: usuario_id}}; // Excluye al usuario actual
		const usuarios = await baseDatos.obtieneTodosPorCondicion("usuarios", condicion);

		// Fin
		return comp.validacs.texto(apodo) || (usuarios.find((n) => n.apodo == apodo) && apodoYaUsado) || "";
	},
	nombreApodo: async function ({nombreCompl, apodo, usuario_id}) {
		// Valida
		const errores = {
			nombreCompl: await this.nombreCompl({nombreCompl, usuario_id}),
			apodo: await this.apodo({apodo, usuario_id}),
		};

		// Consolida la información
		errores.hay = Object.values(errores).some((n) => !!n);

		// Fin
		return errores;
	},
};

// Variables
const nombreYaUsado = "El nombre ya está usado por otro usuario";
const apodoYaUsado = "El apodo ya está usado por otro usuario";
