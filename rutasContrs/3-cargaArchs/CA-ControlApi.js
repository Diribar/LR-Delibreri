"use strict";
// Variables
const procesos = require("./CA-Procesos");
const ExcelJS = require("exceljs");

module.exports = {
	datosIniciales: async (req, res) => {
		// Movimientos
		const movsIds = maestroMovs.map((n) => n.id);
		const movsNeces_ids = maestroMovs.filter((n) => n.solucOut_id).map((n) => n.id);

		// Depósitos
		const depsIds = maestroDeps.map((n) => n.id);
		const depsIds_lr = maestroDeps.filter((n) => n.lr).map((n) => n.id);

		// Lectura de BD
		const [archsRelacsCampo, codsProds] = await Promise.all([
			baseDatos.obtieneTodos("archsRelacsCampo"),
			baseDatos.obtieneTodos("stock").then((n) => n.map((m) => m.codProd)),
		]);

		// Rango de fechas del ejercicio
		const fechasRango = {
			desde: FC_inicio, // inclusive
			hasta: FC_fin, // inclusive
		};

		// Fin
		return res.json({
			...{tiposTablaCabecera, tiposTablaCampos, loteTabla, iconosCA, mensajesCA}, // globales comunes CFG y CA
			...{tablas: tablasCa, FC_fin}, // globales particulares CA
			...{movsIds, movsNeces_ids, depsIds, depsIds_lr}, // variables obtenidas
			...{archsCabecera, archsRelacsCampo, codsProds, fechasRango}, // variables obtenidas
		});
	},
	descargaUnaTabla: async (req, res) => {
		// Variables
		const {nombreTabla} = req.query;
		const tipoTabla_id = tablasCa.find((n) => n.nombreTablaRegs == nombreTabla)?.tipoTabla_id;

		// Crea el archivo y hoja
		const archivo = new ExcelJS.Workbook();
		const hoja = archivo.addWorksheet(tipoTabla_id || "BD");
		const {datos, campos} = await procesos.obtieneDatosTablaParaDescargar(nombreTabla);
		comp.formatoTablaDescarga(hoja, datos, campos);
		hoja.spliceColumns(1, 1);

		// Envía el archivo Excel al navegador
		res.setHeader("Content-Disposition", "attachment;");
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		await archivo.xlsx.write(res);

		// Fin
		return res.end();
	},
};
