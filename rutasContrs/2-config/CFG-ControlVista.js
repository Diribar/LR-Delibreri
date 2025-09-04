"use strict";
// Variables
const procesos = require("./CFG-Procesos");
const tema = "configuración";
const titulo = "Configuración";

module.exports = {
	// Vistas - GET siempre
	fechasClave: {
		form: (req, res) => {
			// Variables
			const subTema = "fechasClave";
			const subTitulo = "Fechas Clave del Ejercicio";
			const dataEntry = {fechaInicio: FC_inicio, codPlazo: FC_codPlazo};
			const errores = req.session.fechasClave && req.session.fechasClave.error;

			// Fin
			return res.render("CMP-0Estructura", {
				...{tema, subTema, titulo, subTitulo, FC_bloq, fechasPlazo},
				...{dataEntry, errores, auxPlazos}, // para el bloqueo
				...{FC_inicio, FC_codPlazo, FC_fin, FC_por, FC_en}, // para el desbloqueo
			});
		},
		bloqueo: async (req, res) => {
			// Variables
			const {fechaInicio, codPlazo} = req.body;
			const fechaFin = comp.fechas.nueva({fecha: fechaInicio, codPlazo, diasDif: -1});
			fechasPlazo = auxPlazos.find((n) => n.codigo == codPlazo);
			fechasPlazoMeses = fechasPlazo.meses;

			// Acciones si hubieron cambios en las fechas
			if (FC_inicio != fechaInicio || FC_codPlazo != codPlazo)
				await procesos.novsEnFechas.consolidado({fechaInicio, fechaFin});

			// Guarda la información en global y en  json
			const camposJson = {
				...{FC_bloq: true, FC_inicio: fechaInicio, FC_codPlazo: codPlazo, FC_fin: fechaFin},
				...{FC_por: req.session.usuario.nombreCompl, FC_en: comp.fechas["aaaa-mm-dd"]()},
			};
			for (const campo in camposJson) global[campo] = camposJson[campo];
			comp.gestionArchs.actualizaJson(camposJson);

			// Fin
			return res.redirect(req.originalUrl);
		},
		desbloqueo: async (req, res) => {
			// Variables
			FC_bloq = false;
			comp.gestionArchs.actualizaJson({FC_bloq});

			// Fin
			return res.redirect(req.originalUrl);
		},
	},
	maestroMovs: (req, res) => {
		// Variables
		const subTema = "maestroMovs";
		const subTitulo = "Maestro de Movimientos";
		const registros = maestroMovs;

		// Fin
		return res.render("CMP-0Estructura", {tema, subTema, titulo, subTitulo, registros});
	},
	maestroDeps: (req, res) => {
		// Variables
		const subTema = "maestroDeps";
		const subTitulo = "Maestro de Depósitos";
		const registros = maestroDeps;

		// Fin
		return res.render("CMP-0Estructura", {tema, subTema, titulo, subTitulo, registros});
	},
	archsInput: async (req, res) => {
		// Variables
		const subTema = "archsInput";
		const subTitulo = "Características de los Archivos Input";

		// Lectura de BD
		archsCabecera = await baseDatos.obtieneTodos("archsCabecera", ["tipoTabla", "relacsCampo"]);

		// Fin
		return res.render("CMP-0Estructura", {tema, subTema, titulo, subTitulo, archsCabecera});
	},

	// Vistas - GET con configuración de base ya bloqueada
	cargaArchs: {
		form: async (req, res) => {
			// Variables
			const subTitulo = "Carga de Archivos de Start-up";
			const subTema = "cargaArchs";
			const cfgInput = req.path == "/carga-de-archivos-bloqueo";

			// tablasCfg
			tablasCfg = await baseDatos.obtieneTodos("tablasCfg", ["tipoTabla", "actualizadoPor"]); // ya está en global
			const regsPanel = tablasCfg;
			const ocultarBoton = !!tablasCfg.find((n) => n.icono != iconosCA.pendGua);

			// Fechas movimientos
			const fechasMovs = {
				hastaFin: comp.fechas["d/mmm/aa"](fechasEjercs[0].hasta),
				hastaHoy: comp.fechas["d/mmm/aa"](comp.fechas.nueva({diasDif: -1})),
				desde: comp.fechas["d/mmm/aa"](fechasEjercs[2].desde),
			};

			// Fin
			return res.render("CMP-0Estructura", {
				...{tema, subTema, titulo, subTitulo},
				...{regsPanel, cfgInput, fechasMovs, ocultarBoton},
			});
		},
		bloqueo: async (req, res) => {
			// Procesos CFG
			await procesos.guardaTablasCfgFins.consolidado(); // guarda maestros, inEjs, stock

			// Procesos CA
			await procesos.actualizaValoresIniciales.consolidado(); // fechasPeriodo, fechasEjercs, planesAccion

			// Procesos en variable global
			CA_bloq = true;
			comp.gestionArchs.actualizaJson({CA_bloq});

			// Fin
			return res.redirect(req.originalUrl);
		},
		desbloqueo: async (req, res) => {
			// Desbloquea la carga de archivos
			CA_bloq = false;
			comp.gestionArchs.actualizaJson({CA_bloq});

			// Fin
			return res.redirect(req.originalUrl);
		},
	},
};
