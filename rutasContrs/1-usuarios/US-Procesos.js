"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");

module.exports = {
	// ControlAPI
	envioDeMailConContrasena: async (email) => {
		// Variables
		const nombre = "Lenta Rotación";
		const asunto = "Contraseña para tu usuario";

		// Contraseña
		const contrasena = Math.round(Math.random() * Math.pow(10, 6))
			.toString()
			.padStart(6, "0"); // más adelante cambia por la codificada
		console.log("Contraseña: " + contrasena);

		// Crea el comentario y envía el mail al usuario
		let comentario = "";
		comentario += "¡Hola!";
		comentario += "<br>" + "La contraseña para tu usuario es: <bold><u>" + contrasena + "</u></bold>";
		const mailEnviado = await comp.enviaMail({nombre, email, asunto, comentario});

		// Encripta la contraseña
		const contrEncriptada = bcryptjs.hashSync(contrasena, 10);

		// Fin
		return {contrasena: contrEncriptada, mailEnviado};
	},
};
