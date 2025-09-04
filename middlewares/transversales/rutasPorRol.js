"use strict"; // Obtiene 'usuario' y 'cliente'

module.exports = async (req, res, next) => {
	// Si es una de las aplicaciones triviales, avanza
	if (comp.omitirMiddlewsTransv(req)) return next();

	// Rutas para las que no se necesita el redireccionamiento
	if (rutasSinValidar.includes(req.originalUrl)) return next();

	// Variables
	const {usuario} = req.session;
	const ruta = req.originalUrl.split("/").slice(1, 2).join("");

	// Vistas en régimen
	if (ruta == "configuracion" && !usuario.rol.cfg) return res.redirect("/");
	if (ruta == "carga-archivos" && !usuario.rol.ca) return res.redirect("/");
	if (ruta == "abm-usuarios" && !usuario.rol.abm) return res.redirect("/");
	if (ruta == "" && !usuario.rol.plr) return res.redirect("/abm-usuarios");

	// Fin
	return next();
};
