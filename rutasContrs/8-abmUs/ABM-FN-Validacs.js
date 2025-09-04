"use strict";

module.exports = {
	altaUsuario: async ({email, rol_id}) => {
		// Variables
		const usuarios = await baseDatos.obtieneTodos("usuarios");

		// Valida el nombre
		const errores = {
			email: comp.validacs.email(email) || (usuarios.find((n) => n.email == email) && mailYaExistente) || "",
			rol_id: validaRol_id(rol_id),
		};

		// Completa el objeto 'errores'
		errores.hay = Object.values(errores).some((n) => !!n);

		// Fin
		return errores;
	},
	edicUsuario: async ({email, rol_id}) =>
		comp.validacs.email(email) || validaRol_id(rol_id, await baseDatos.obtienePorCondicion("usuarios", {email})),
	bajaUsuario: async (email) => {
		// Variables
		const tablas = [
			{tabla: "planesAccion", campo: "responsable_id"},
			{tabla: "planesAccion", campo: "actualizPor_id"},
		];

		// Averigua si el email es válido
		if (comp.validacs.email(email)) return "El mail es inválido";

		// Averigua si el usuario existe
		const usuario = await baseDatos.obtienePorCondicion("usuarios", {email});
		if (!usuario) return "El usuario no existe";

		// Averigua si el usuario tiene registros vinculados en alguna tabla
		const texto = "El usuario no puede ser eliminado porque tiene registros asociados en la tabla ";
		for (const tabla of tablas)
			if (await baseDatos.obtienePorCondicion(tabla, {usuario_id: usuario.id})) return texto + tabla;

		// Fin
		return {};
	},
};

const validaRol_id = (rol_id, usuario) =>
	!rol_id
		? "El rol es obligatorio."
		: !rolesSinProp_id.includes(rol_id)
		? "El rol no es válido."
		: rol_id == rolProp_id
		? "No se le puede asignar el rol de propietario a un usuario."
		: usuario && usuario.rol_id == rolProp_id && rol_id != rolProp_id
		? "No se le puede quitar el rol de propietario a un usuario."
		: "";
