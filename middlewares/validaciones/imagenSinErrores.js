"use strict"; // Obtiene 'usuario' y 'cliente'

module.exports = (req, res, next) => {
	// Elimina el error de avatar en session
	delete req.session.errorAvatar;

	// Si no hay archivo, interrumpe la función
	if (!req.file) return next();

	// Obtiene la información sobre el avatar
	const avatar = req.file.filename;
	const tamano = req.file.size;

	// Actualiza el error de avatar en la session
	req.session.errorAvatar = comp.validaImagen({avatar, tamano});

	// Si hay un error, elimina el avatar
	if (req.session.errorAvatar) comp.gestionArchs.elimina(carpProvisorio, avatar);

	// Fin
	return next();
};
