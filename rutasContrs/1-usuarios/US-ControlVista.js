"use strict";

module.exports = {
	login: {
		form: async (req, res) => {
			// Variables
			const tema = "usuarios";
			const subTema = "login";
			const titulo = "Login";

			// Info para la vista
			const login = (req.session && req.session.login) || {};
			const dataEntry = login.dataEntry || {};
			const errores = login.errores || {};
			const campos = [
				{nombre: "email", tipo: "text", placeholder: "correo electrónico"},
				{nombre: "contrasena", tipo: "password", placeholder: "contraseña"},
			];
			const tituloCartelProgreso = "Enviando el mail";

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, subTema, titulo, tituloCartelProgreso},
				...{dataEntry, errores, campos},
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {email} = req.body;
			let destino = "/";

			// Actualiza cookies - no se actualiza 'session'', para que se ejecute el middleware 'clientesSession'
			res.cookie("email", email, {maxAge: unAno, ...global.dominio});

			// Si corresponde, le actualiza el status
			const usuario = await comp.obtieneUsuarioPorMail(email);
			if (usuario.statusReg_id == stMailPendValidar_id)
				await baseDatos.actualizaPorId("usuarios", usuario.id, {statusReg_id: stMailValidado_id});

			// Si corresponde, le actualiza el destino
			if (usuario.statusReg_id < stDatosCompletados_id) destino = "/usuarios/completa-datos";

			// Redirecciona
			return res.redirect(destino);
		},
		logout: (req, res) => {
			// Borra los datos de session y cookie
			delete req.session.usuario;
			res.clearCookie("email", {...global.dominio});

			// Fin
			return res.redirect("/usuarios/login");
		},
	},
	completaDatos: {
		form: async (req, res) => {
			// Variables
			const tema = "usuarios";
			const subTema = "completaDatos";
			const titulo = "Datos del Usuario";

			// Info para la vista
			const completaDatos = (req.session && req.session.completaDatos) || {};
			const dataEntry = completaDatos.dataEntry || {};
			const errores = completaDatos.errores || {};
			const campos = [
				{nombre: "nombreCompl", tipo: "text", placeholder: "nombre completo"},
				{nombre: "apodo", tipo: "text", placeholder: "apodo"},
			];

			// Render del formulario
			// return res.send({tema, subTema, titulo, dataEntry, errores, campos})
			return res.render("CMP-0Estructura", {tema, subTema, titulo, dataEntry, errores, campos});
		},
		guardar: async (req, res) => {
			// Variables
			const datos = req.body;
			const {usuario} = req.session;

			// Si corresponde, le cambia el status a 'datosCompletados'
			if (usuario.statusReg_id == stMailValidado_id) datos.statusReg_id = stDatosCompletados_id;

			// Actualiza el usuario
			baseDatos.actualizaPorId("usuarios", usuario.id, datos);
			req.session.usuario = {...usuario, ...datos};

			// Limpia la información que ya no se necesita
			delete req.session.completaDatos;

			// Redirecciona
			return res.redirect("/");
		},
	},
};
