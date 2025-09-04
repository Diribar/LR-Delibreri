"use strict"; // Obtiene 'usuario' y 'cliente'

module.exports = async (req, res, next) => {
	// Si es una de las aplicaciones triviales, avanza
	if (comp.omitirMiddlewsTransv(req)) return next();

	// Rutas para las que no se necesita el redireccionamiento
	if (rutasSinValidar.includes(req.originalUrl)) return next();

	// Variables
	let {usuario} = req.session;

	// Obtiene el usuario de su cookie 'mail'
	if (!usuario && req.cookies && req.cookies.email) {
		const {email} = req.cookies;
		usuario = await comp.obtieneUsuarioPorMail(email);

		// Si no existe el usuario, borra esa cookie
		if (!usuario) res.clearCookie("email", {...global.dominio});
		// Si existe, extiende la vida de la cookie
		else res.cookie("email", usuario.email, {maxAge: unAno, ...global.dominio});
	}

	// Si no existe el usuario, redirige a la vista de 'login'
	if (!usuario) return res.redirect("/usuarios/login");

	// Si el usuario tiene una fecha de navegación antigua, la actualiza
	const ultNavegEn = comp.fechas["aaaa-mm-dd"]();
	if (!usuario.ultNavegEn || usuario.ultNavegEn < ultNavegEn) {
		baseDatos.actualizaPorId("usuarios", usuario.id, {ultNavegEn});
		usuario.ultNavegEn = ultNavegEn;
	}

	// Actualiza usuario y cliente
	req.session.usuario = usuario;
	res.locals.usuario = usuario;

	// Si el usuario no completó sus datos, redirige a esa vista
	if (usuario.statusReg_id != stDatosCompletados_id && req.originalUrl != "/usuarios/completa-datos")
		return res.redirect("/usuarios/completa-datos");

	// Fin
	return next();
};
