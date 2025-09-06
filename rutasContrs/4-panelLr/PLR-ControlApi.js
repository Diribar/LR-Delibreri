"use strict";
// Variables
const ExcelJS = require("exceljs");
const procesos = require("./PLR-Procesos");

module.exports = {
	graficos: {
		porPeriodo: async (req, res) => res.json({fechasPeriodos, ...procesos.valoresLr()}),
		porAntig: async (req, res) => res.json(fechasEjercs),
		planesAccion: async (req, res) => {},
	},
	planesAccion: {
		// Obtiene
		datosIniciales: (req, res) => res.json({rolUsuario: req.session.usuario.rol, planAccionReserva_id}),
		obtieneProductos: async (req, res) => {
			// Variables
			const {filtroPlanAccion_id, proveedor_id, familia_id, ejercicio_id} = req.cookies;
			const ej_id = procesos.obtieneEj_id(ejercicio_id);
			console.log(101, ej_id, ejercicio_id);
			const [provs, fams, prods] = await Promise.all([
				baseDatos.obtieneTodos("maestroProvs"),
				baseDatos.obtieneTodos("maestroFams"),
				baseDatos.obtieneTodos("stock", ["proveedor", "familia"]),
			]);

			// Obtiene la info para el gráfico de columnas, los gráficos de torta, las opciones de los filtros, la tabla de productos
			let {prodsGrCols, prodsGrTorta, prodsOpcs, prodsTabla} = procesos.filtra({prods, proveedor_id, familia_id, ej_id});
			prodsGrCols = procesos.procesaInfo.prodsGrCols({prodsGrCols, ej_id});
			prodsGrTorta = procesos.procesaInfo.prodsGrTorta({provs, fams, prodsGrTorta, ej_id});
			prodsOpcs = procesos.procesaInfo.prodsOpcs({provs, fams, prodsOpcs, ej_id});
			prodsTabla = procesos.procesaInfo.prodsTabla({prodsTabla, ej_id, filtroPlanAccion_id});

			// Fin
			return res.json({prodsGrCols, prodsGrTorta, prodsOpcs, prodsTabla});
		},
		descargaProds: async (req, res) => {
			// Variables
			const {filtroPlanAccion_id, proveedor_id, familia_id, ejercicio_id} = req.cookies;

			// Filtra los productos por prov, fam, antig, y por el plan de acción
			let prods = await baseDatos.obtieneTodos("stock", ["proveedor", "familia", "planAccion"]);
			({prodsGrafs: prods} = procesos.filtraProds({prods, proveedor_id, familia_id, ejercicio_id}));
			prods = prods.filter((n) => n.cantLrActual);
			if (filtroPlanAccion_id) {
				const objetivo = filtroPlanAccion_id == "sinPlan" ? null : filtroPlanAccion_id;
				prods = prods.filter((n) => n.planAccion_id == objetivo);
			}

			// Elige las columnas del archivo
			const campos = procesos.eligeLasColumnasDescarga(prods);

			// Crea el archivo y hoja
			const archivo = new ExcelJS.Workbook();
			const hoja = archivo.addWorksheet("BD");
			comp.formatoTablaDescarga(hoja, prods, campos);

			// Envía el archivo Excel al navegador
			res.setHeader("Content-Disposition", "attachment;");
			res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			await archivo.xlsx.write(res);

			// Fin
			return res.end();
		},
		obtienePlanesAccion: async (req, res) => {
			// Variables
			const {filtroResp_id, filtroEstado} = req.cookies;

			// Filtros
			let planesAccion = await baseDatos.obtieneTodos("planesAccion", ["responsable", "creadoPor"]);
			if (filtroResp_id) planesAccion = planesAccion.filter((n) => n.responsable_id == filtroResp_id);
			if (filtroEstado)
				planesAccion = planesAccion.filter((n) => (filtroEstado == "cerrados" ? n.cerradoEn : !n.cerradoEn));
			planesAccion = planesAccion.sort((a, b) => (a.creadoEn > b.creadoEn ? -1 : 1));

			// Fin
			return res.json(planesAccion);
		},

		// Cambios en BD
		actualizaProds: async (req, res) => {
			// Variables
			let {edicionPlan_id: planAccion_id, prod_id: producto_id} = req.query;
			if (!producto_id || !planAccion_id) return res.json({mensaje: "Faltan datos"});
			if (planAccion_id == "sinPlan") planAccion_id = null;

			// Obtiene el producto
			const producto = await baseDatos.obtienePorId("stock", producto_id);
			if (producto.planAccion_id == planAccion_id) return res.json({mensaje: "El producto ya tiene ese plan de accion"});

			// Le quita al planAccion anterior, el valor de LR actual
			const {valorLrActual} = producto;
			if (producto.planAccion_id) {
				const planAccion = await baseDatos.obtienePorId("planesAccion", producto.planAccion_id);
				const dismLrInicial = Math.min(valorLrActual, planAccion.valorLrInicial); // si es posible, le disminuye el valor actual
				const dismLrActual = Math.min(valorLrActual, planAccion.valorLrActual); // ídem
				await baseDatos.variaElValorDeCampos("planesAccion", producto.planAccion_id, {
					valorLrInicial: -dismLrInicial,
					valorLrActual: -dismLrActual,
				});
			}

			// Le agrega al nuevo planAccion, el valor de LR actual
			if (planAccion_id)
				await baseDatos.variaElValorDeCampos("planesAccion", planAccion_id, {
					valorLrInicial: valorLrActual,
					valorLrActual: valorLrActual,
				});

			// Le agrega al producto su nuevo planAccion_id
			await baseDatos.actualizaPorId("stock", producto_id, {planAccion_id});

			// Fin
			return res.json();
		},
		actualizaPlanes: async (req, res) => {
			const {accion} = req.query;

			// Alta
			if (accion == "nuevoPlan") {
				// Variables
				const {nombrePlan: nombre, responsable_id} = req.query;
				if (!nombre || !responsable_id) return res.json({mensaje: "Faltan datos"});
				const creadoPor_id = req.session.usuario.id;

				// Actualiza la BD
				await baseDatos.agregaReg("planesAccion", {nombre, responsable_id, creadoPor_id});
			}

			// Cierre o Elimina
			if (accion == "cierraElimina") {
				// Variables
				const {plan_id} = req.query;
				if (!plan_id) return res.json({mensaje: "Faltan datos"});

				// Obtiene el planAccion
				const planAccion = await baseDatos.obtienePorId("planesAccion", plan_id);
				if (!planAccion) return res.json({mensaje: "No existe ese plan de accion"});

				// Elimina las vinculaciones de productos
				if (!planAccion.cerradoEn) {
					// Actualiza el stock
					await baseDatos.actualizaPorCondicion("stock", {planAccion_id: plan_id}, {planAccion_id: null});

					// Actualiza el planAccion
					const datosCerrado = {cerradoEn: new Date(), valorLrInicial: 0, valorLrActual: 0};
					await baseDatos.actualizaPorId("planesAccion", plan_id, datosCerrado);
				} else await baseDatos.eliminaPorId("planesAccion", plan_id);
			}

			// Edición
			if (accion == "edicion") {
				// Variables
				const {cambioNombrePlan: nombre, cambioResp_id: responsable_id, plan_id: planAccion_id} = req.query;
				if ((!nombre && !responsable_id) || !planAccion_id) return res.json({mensaje: "Faltan datos"});

				// Arma el update
				const datos = {};
				if (nombre) datos.nombre = nombre;
				if (responsable_id) datos.responsable_id = responsable_id;

				// Actualiza el registro
				await baseDatos.actualizaPorId("planesAccion", planAccion_id, datos);
			}

			// Fin
			return res.json();
		},
	},
};
