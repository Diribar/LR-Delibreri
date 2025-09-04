"use strict";

module.exports = {
	lecturasBd: async () => {
		// Obtiene las lecturas de BD
		const lecturas = {
			// Usuarios
			statusRegs: baseDatos.obtieneTodos("statusRegs"),
			roles: baseDatos.obtieneTodos("roles"),

			// Fechas
			fechasEjercs: baseDatos.obtieneTodos("fechasEjercs"),
			fechasPeriodos: baseDatos.obtieneTodos("fechasPeriodos"),
			auxPlazos: baseDatos.obtieneTodos("auxPlazos"),

			// Maestros
			maestroMovs: baseDatos
				.obtieneTodos("maestroMovs", "solucOut")
				.then((n) => n.sort((a, b) => (a.descripcion < b.descripcion ? -1 : 1))),
			maestroDeps: baseDatos
				.obtieneTodosConOrden("maestroDeps", "descripcion")
				.then((n) => n.sort((a, b) => (a.nave < b.nave ? -1 : 1))), // ordena por nave y descripción

			// Configuración
			archsCabecera: baseDatos.obtieneTodos("archsCabecera", ["tipoTabla", "relacsCampo"]),
			tiposTablaCabecera: baseDatos.obtieneTodosConOrden("tiposTablaCabecera", "orden"),
			tiposTablaCampos: baseDatos.obtieneTodos("tiposTablaCampos"),
			tablasCfg: baseDatos.obtieneTodos("tablasCfg", ["tipoTabla", "actualizadoPor"]),
			tablasCa: baseDatos.obtieneTodos("tablasCa", ["tipoTabla", "actualizadoPor"]),

			// Otros
			solucsOut: baseDatos.obtieneTodos("solucsOut"),
			novedades: baseDatos.obtieneTodos("novedades"),
		};

		// Await
		const valores = await Promise.all(Object.values(lecturas));
		Object.keys(lecturas).forEach((campo, i) => (lecturas[campo] = valores[i]));

		// Fin
		return lecturas;
	},
	datosPartics: () => {
		// Variables
		const respuesta = {
			// Status de usuario
			stMailPendValidar_id: statusRegs.find((n) => n.codigo == "mailPendValidar").id,
			stMailValidado_id: statusRegs.find((n) => n.codigo == "mailValidado").id,
			stDatosCompletados_id: statusRegs.find((n) => n.codigo == "datosCompletados").id,

			// Roles
			rolesSinProp: roles.filter((n) => n.codigo != "propietario"),
			rolesSinProp_id: roles.filter((n) => n.codigo != "propietario").map((n) => n.id),
			rolProp_id: roles.find((n) => n.codigo == "propietario").id,

			// Otros
			fechasPlazo: FC_codPlazo && auxPlazos.find((n) => n.codigo == FC_codPlazo),
			fechasPlazoMeses: FC_codPlazo && auxPlazos.find((n) => n.codigo == FC_codPlazo).meses,
		};

		// Fin
		return respuesta;
	},
};
