"use strict";
const procsCfg = require("../2-config/CFG-Procesos");
const procsCa = require("../3-cargaArchs/CA-Procesos");

module.exports = {
	// Obtiene
	obtieneValsYaEnBd: async (req, res) => {
		// Variables
		const {nombreTabla, campoCond} = req.query;
		const nombreTablaOrig = nombreTabla + "_orig";

		// Obtiene los valores
		let valoresEnOrig = baseDatos.obtieneTodos(nombreTablaOrig).then((n) => n.map((m) => m[campoCond]));
		let valoresEnFinal =
			nombreTabla == "outSoluc" ? baseDatos.obtieneTodos(nombreTabla).then((n) => n.map((m) => m[campoCond])) : [];
		[valoresEnOrig, valoresEnFinal] = await Promise.all([valoresEnOrig, valoresEnFinal]);

		// Quita los repetidos
		const valoresSinRepetir = [...new Set([...valoresEnOrig, ...valoresEnFinal])];

		// Fin
		return res.json(valoresSinRepetir);
	},

	// Cambios en BD
	eliminaTodos: async (req, res) => {
		// Variables
		const {nombreTabla} = req.query;
		const nombreTablaOrig = nombreTabla + "_orig";

		// Elimina original o final (final vale sólo para CA)
		const existeOriginal = await baseDatos.obtienePorCondicion(nombreTablaOrig, {}); // obtiene un registro para averiguar si existe
		existeOriginal ? await baseDatos.eliminaTodos(nombreTablaOrig) : await baseDatos.eliminaTodos(nombreTabla);

		// Acciones si se eliminó una tabla final de CA
		if (!existeOriginal && ["reserva", "outSoluc"].includes(nombreTabla)) {
			// Variables
			const stock = await baseDatos.obtieneTodos("stock");
			const reserva = nombreTabla != "reserva" ? await baseDatos.obtieneTodos("reserva") : [];
			const outSoluc = nombreTabla != "outSoluc" ? await baseDatos.obtieneTodos("outSoluc") : [];
			const espera = [];

			// Actualiza el stock por eliminación de outs
			let stockActual =
				nombreTabla == "outSoluc" ? procsCa.actualizaLrStockPeriodos.obtieneStockConEgresos({stock, outSoluc}) : stock;

			// Actualiza el stock por eliminación de reserva
			stockActual =
				nombreTabla == "reserva"
					? procsCa.actualizaLrStockPeriodos.obtieneStockConReservaMasPlanAccion({stockActual, reserva})
					: stockActual;
			await baseDatos.limpiaAgregaRegs("stock", stockActual);

			// Si se eliminaron los egresos, limpia los períodos posteriores al inicio
			if (nombreTabla == "outSoluc") {
				// Variables
				const fechaInicio = comp.fechas.nueva({fecha: FC_inicio, diasDif: -1});

				// Actualiza la tabla
				const condicion = {fecha: {[Op.gt]: fechaInicio}}; // deja intacto el periodo de inicio
				espera.push(baseDatos.actualizaPorCondicion("fechasPeriodos", condicion, {valorLr0: 0, valorLr123: 0}));

				// Actualiza la variable - deja intacto el periodo de inicio, y limpia los posteriores
				const valoresCero = {valorLr0: 0, valorLr123: 0};
				fechasPeriodos.forEach((n, i) => (fechasPeriodos[i] = {...n, ...(n.fecha > fechaInicio ? valoresCero : {})}));
			}

			// Actualiza otras tablas
			espera.push(procsCa.actualizaLrOtrasTablas.consolidado());

			// Fin
			await Promise.all(espera);
		}

		// Fin
		return res.json();
	},
	actualizaRegs: async (req, res) => {
		// Variables
		const {nombreTabla, campoCond, registros} = req.body;
		const nombreTablaOrig = nombreTabla + "_orig";
		const espera = [];

		// Rutina por registro
		for (const registro of registros) {
			const condicion = {[campoCond]: registro[campoCond]};
			espera.push(baseDatos.actualizaPorCondicion(nombreTablaOrig, condicion, registro)); // si no actualiza, desestima la función
		}
		await Promise.all(espera);

		// Fin
		return res.json();
	},
	agregaRegs: async (req, res) => {
		// Variables
		const {nombreTabla, registros} = req.body;
		const nombreTablaOrig = nombreTabla + "_orig";

		// Agrega
		await baseDatos.agregaRegs(nombreTablaOrig, registros);

		// Fin
		return res.json();
	},
	actualizaResult: async (req, res) => {
		// Variables
		const nombreTabla = req.body;
		const nombreTablaOrig = nombreTabla + "_orig";
		const CFG = tablasCfg.find((n) => n.nombreTablaRegs == nombreTabla);
		const tabla = CFG ? "tablasCfg" : "tablasCa";
		let icono = iconosCA.pendGua; // tiene que ser 'null', para cuando se guarda en la BD

		// Lectura de BD
		if (CFG) await baseDatos.actualizaTodos(nombreTablaOrig, {error: null});
		const registros = await baseDatos.obtieneTodos(nombreTablaOrig);

		// Posibles errores
		if (icono == iconosCA.pendGua && !registros.length) icono = iconosCA.sinRegs; // sin registros
		if (
			icono == iconosCA.pendGua &&
			["maestroProds", "stock"].includes(nombreTabla) &&
			(await procsCfg[nombreTabla]({nombreTablaOrig, registros})) // averigua si la 'nombreTablaOrig' tiene algún error
		)
			icono = iconosCA.conError; // otro error

		// Actualiza
		baseDatos.actualizaPorCondicion(tabla, {nombreTablaRegs: nombreTabla}, {icono});

		// Fin
		return res.json(icono);
	},
	actualizaDemas: async (req, res) => {
		// Variables
		const nombreTabla = req.body;
		const nombreTablaOrig = nombreTabla + "_orig";
		const CFG = tablasCfg.find((n) => n.nombreTablaRegs == nombreTabla);
		const tablaPanelNombre = CFG ? "tablasCfg" : "tablasCa";
		const tablaPanel = CFG ? tablasCfg : tablasCa;
		const tabla = tablaPanel.find((n) => n.nombreTablaRegs == nombreTabla);
		const respuesta = {actualizadoEn: comp.fechas["aaaa-mm-dd"]()};

		// Obtiene la info
		if (tabla.tipoTabla.conDesde) {
			let desdeOrig = baseDatos.minValor(nombreTablaOrig, "fecha");
			let desdeFinal = nombreTabla == "outSoluc" && baseDatos.minValor(nombreTabla, "fecha");
			[desdeOrig, desdeFinal] = await Promise.all([desdeOrig, desdeFinal]);
			respuesta.desde =
				desdeFinal && !desdeOrig // no existe desde original
					? desdeFinal
					: desdeOrig && !desdeFinal // no existe desde final
					? desdeOrig
					: desdeFinal < desdeOrig // desde final es anterior
					? desdeFinal
					: desdeOrig;
		}
		if (tabla.tipoTabla.conHasta) {
			let hastaOrig = baseDatos.maxValor(nombreTablaOrig, "fecha");
			let hastaFinal = nombreTabla == "outSoluc" && baseDatos.maxValor(nombreTabla, "fecha");
			[hastaOrig, hastaFinal] = await Promise.all([hastaOrig, hastaFinal]);
			respuesta.hasta =
				hastaFinal && !hastaOrig // no existe hasta original
					? hastaFinal
					: hastaOrig && !hastaFinal // no existe hasta final
					? hastaOrig
					: hastaFinal > hastaOrig // hasta final es posterior
					? hastaFinal
					: hastaOrig;
		}

		// Actualiza tablas
		const actualizadoPor_id = req.session.usuario.id;
		baseDatos.actualizaPorCondicion(tablaPanelNombre, {nombreTablaRegs: nombreTabla}, {...respuesta, actualizadoPor_id});

		// Fin
		const actualizadoPor = req.session.usuario.nombreCompl;
		return res.json({...respuesta, actualizadoPor});
	},

	cambiaRolDelUsuario: async (req, res) => {
		// Obtiene el rol
		const rol_id = req.body;
		const rol = roles.find((n) => n.id == rol_id);
		if (!rol) return res.json();

		// Variables
		const {id: usuario_id} = req.session.usuario;

		// Actualiza el rol del usuario
		baseDatos.actualizaPorId("usuarios", usuario_id, {rol_id});
		req.session.usuario = {...req.session.usuario, rol_id, rol};

		// Fin
		return res.json();
	},
};
