"use strict";
// Variables
const ExcelJS = require("exceljs");
const valida = require("./CFG-FN-Validacs");

module.exports = {
	// Vistas - GET siempre
	fechasClave: {
		datosIniciales: (req, res) => res.json({auxPlazos, diasFinales, mesesAbrev}),
		valida: (req, res) => res.json(valida.fechasClave(req.query) || ""),
	},
	maestroMovs: {
		alta: async (req, res) => {
			// Variables
			const datos = req.query; // id, descripcion, startUpIn, startUpOut, solucOut_id

			// Valida los datos
			const error = valida.maestroMovs.altaEdic(datos) || valida.maestroMovs.alta(datos);
			if (error) return res.json(error);

			// Agrega el nuevo depósito
			const creadoPor_id = req.session.usuario.id;
			const creadoEn = comp.fechas["aaaa-mm-dd"]();
			await baseDatos.agregaReg("maestroMovs", {...datos, creadoPor_id, creadoEn});

			// Fin
			return res.json();
		},
		edicion: (req, res) => {
			// Variables
			const datos = req.query;
			datos.esPropietario = req.session.usuario.rol_id == rolProp_id;

			// Valida los datos
			const error =
				valida.maestroMovs.altaEdic(datos) || valida.maestroMovs.edicBaja(datos) || valida.maestroMovs.edicion(datos);
			if (error) return res.json(error);

			// Actualiza el registro
			const {nuevoId} = datos;
			maestroMovs = maestroMovs.map((n) => (n.id == datos.id ? {...datos, id: nuevoId} : n));
			maestroMovs.sort((a, b) => (a.descripcion.toLowerCase() < b.descripcion.toLowerCase() ? -1 : 1));
			baseDatos.actualizaPorId("maestroMovs", datos.id, {...datos, id: nuevoId});

			// Fin
			return res.json();
		},
		baja: (req, res) => {
			// Variables
			const {id} = req.query;

			// Valida los datos
			const error = valida.maestroMovs.edicBaja({id});
			if (error) return res.json(error);

			// Elimina el registro
			maestroMovs = maestroMovs.filter((n) => n.id != id);
			baseDatos.eliminaPorId("maestroMovs", id);

			// Fin
			return res.json();
		},
	},
	maestroDeps: {
		alta: async (req, res) => {
			// Variables
			const datos = req.query; // id, descripcion, nave, lr

			// Valida los datos
			const error = valida.maestroDeps.altaEdic(datos);
			if (error) return res.json(error);

			// Agrega el nuevo depósito
			const creadoPor_id = req.session.usuario.id;
			const creadoEn = comp.fechas["aaaa-mm-dd"]();
			await baseDatos.agregaReg("maestroDeps", {...datos, creadoPor_id, creadoEn});

			// Fin
			return res.json();
		},
		edicion: (req, res) => {
			// Variables
			const datos = req.query;
			datos.esPropietario = req.session.usuario.rol_id == rolProp_id;

			// Valida los datos
			const error = valida.maestroDeps.altaEdic(datos) || valida.maestroDeps.edicBaja(datos);
			if (error) return res.json(error);

			// Actualiza el registro
			const {nuevoId} = datos;
			maestroDeps = maestroDeps.map((n) => (n.id == datos.id ? {...datos, id: nuevoId} : n));
			maestroDeps.sort((a, b) => (a.descripcion.toLowerCase() < b.descripcion.toLowerCase() ? -1 : 1));
			baseDatos.actualizaPorId("maestroDeps", datos.id, {...datos, id: nuevoId});

			// Fin
			return res.json();
		},
		baja: (req, res) => {
			// Variables
			const {id} = req.query;

			// Valida los datos
			const error = valida.maestroDeps.edicBaja({id});
			if (error) return res.json(error);

			// Elimina el registro
			maestroDeps = maestroDeps.filter((n) => n.id != id);
			baseDatos.eliminaPorId("maestroDeps", id);

			// Fin
			return res.json();
		},
	},
	archsInput: {
		alta: async (req, res) => {
			// Variables
			const archCabecera = req.query;

			// Valida los datos
			const error = valida.archsInput.altaEdic(archCabecera);
			if (error) return res.json(error);

			// Agrega las características del nuevo archivo
			const creadoPor_id = req.session.usuario.id;
			const creadoEn = comp.fechas["aaaa-mm-dd"]();
			await baseDatos.agregaReg("archsCabecera", {...archCabecera, creadoEn, creadoPor_id});

			// Fin
			return res.json();
		},
		edicion: async (req, res) => {
			// Variables
			const datos = req.query;

			// Valida los datos
			const error = valida.archsInput.altaEdic(datos) || valida.archsInput.edicBaja(datos);
			if (error) return res.json(error);

			// Actualiza el registro
			await baseDatos.actualizaPorId("archsCabecera", datos.id, datos);

			// Fin
			return res.json();
		},
		baja: async (req, res) => {
			// Variables
			const {id} = req.query;

			// Valida los datos
			const error = valida.archsInput.edicBaja({id});
			if (error) return res.json(error);

			// Elimina el registro
			await baseDatos.eliminaPorId("archsCabecera", id);

			// Fin
			return res.json();
		},
	},

	// Vistas - GET con configuración de base ya bloqueada
	cargaArchs: {
		datosInicialesCa: async (req, res) => {
			// Movimientos
			const movsIds = maestroMovs.map((n) => n.id);
			const movsNeces_ids = maestroMovs.filter((n) => n.inLr).map((n) => n.id);

			// Depósitos
			const depsIds = maestroDeps.map((n) => n.id);
			const depsIds_lr = maestroDeps.filter((n) => n.lr).map((n) => n.id);

			// Lectura de BD
			archsCabecera = await baseDatos.obtieneTodos("archsCabecera");
			const archsRelacsCampo = await baseDatos.obtieneTodos("archsRelacsCampo");

			// Rango de fechas del ejercicio
			const fechasRango = {
				hasta: fechasEjercs.find((n) => n.codigo == "ej0").hasta, // inclusive
				desde: fechasEjercs.find((n) => n.codigo == "ej-2").desde, // inclusive
			};

			// Fin
			return res.json({
				...{tiposTablaCabecera, tiposTablaCampos, loteTabla, iconosCA, mensajesCA}, // globales comunes CFG y CA
				...{tablas: tablasCfg}, // globales particulares CFG
				...{archsCabecera, archsRelacsCampo, fechasEjercs, fechasRango}, // variables obtenidas
				...{movsIds, movsNeces_ids, depsIds, depsIds_lr}, // variables obtenidas
			});
		},
		descargaUnaTabla: async (req, res) => {
			// Variables
			const {nombreTabla} = req.query;
			const nombreTablaOrig = nombreTabla + "_orig";
			const tipoTabla_id = tablasCfg.find((n) => n.nombreTablaRegs == nombreTabla)?.tipoTabla_id;

			// Crea el archivo y hoja
			const archivo = new ExcelJS.Workbook();
			const hoja = archivo.addWorksheet(tipoTabla_id || "BD");
			const datos = await baseDatos.obtieneTodos(nombreTablaOrig);
			const campos = baseDatos.obtieneCampos(nombreTablaOrig);
			comp.formatoTablaDescarga(hoja, datos, campos);
			hoja.spliceColumns(1, 1);

			// Envía el archivo Excel al navegador
			res.setHeader("Content-Disposition", "attachment;");
			res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			await archivo.xlsx.write(res);

			// Fin
			return res.end();
		},
	},
};
