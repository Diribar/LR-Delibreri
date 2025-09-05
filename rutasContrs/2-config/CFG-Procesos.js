"use strict";
const procsCA = require("../3-cargaArchs/CA-Procesos");

module.exports = {
	// Fechas clave - novedades en fechas
	novsEnFechas: {
		consolidado: async function ({fechaInicio, fechaFin}) {
			// Limpieza
			await this.eliminaMovsCfg(); // Elimina todos los movimientos originales de CFG
			await this.limpiaPlanAccion(); // Actualiza otras tablas - ejercicios y períodos no hace falta, porque se eliminan y agregan

			// Rehace las fechasEjercs y fechasPeriodos
			await this.fechasEjercs(fechaInicio);
			await this.fechasPeriodos({fechaInicio, fechaFin});

			// Fin
			return;
		},
		eliminaMovsCfg: async () => {
			// Variables
			const espera = [];

			// Desbloquea la carga de archivos
			CA_bloq = false;
			comp.gestionArchs.actualizaJson({CA_bloq});

			// Elimina tablas inEjs
			const inEjs = [
				...nombresTablasCfg.filter((n) => n.startsWith("inEj")).map((n) => n + "_orig"),
				...nombresTablasCfg.filter((n) => n.startsWith("inEj")),
			];
			for (const tabla of inEjs) espera.push(baseDatos.eliminaTodos(tabla));

			// Actualiza el panel de archivos
			const datos = {icono: iconosCA.sinRegs, desde: null, hasta: null, actualizadoPor_id: null, actualizadoEn: null};
			espera.push(baseDatos.actualizaPorCondicion("tablasCfg", {tipoTabla_id: "movs"}, datos));

			// Fin
			await Promise.all(espera);
			return;
		},
		limpiaPlanAccion: async () => {
			await baseDatos.eliminaPorCondicion("planesAccion", {perenne: false});
			await baseDatos.actualizaTodos("planesAccion", datosCero);
			return;
		},
		fechasEjercs: async (desde) => {
			// Variables
			const registros = [];

			// Crea los registros y los guarda - para el 'for' se debe usar 'let', ya que 'i' cambia
			for (let i = 0; i < 4; i++) {
				const hasta = comp.fechas.nueva({fecha: desde, diasDif: -1});
				desde = i < 3 ? comp.fechas.nueva({fecha: desde, mesesDif: -fechasPlazoMeses}) : "0"; // el ej3 no tiene fecha 'desde'
				const codigo = i < 3 ? "ej" + -i : "< -2";
				const descripcion = i < 3 ? "Ejercicio " + -i : "Ejercs < -2";
				registros.push({codigo, descripcion, desde, hasta});
			}

			// Actualiza fechasEjercs
			await baseDatos.limpiaAgregaRegs("fechasEjercs", registros);
			fechasEjercs = await baseDatos.obtieneTodos("fechasEjercs");

			// Fin
			return;
		},
		fechasPeriodos: async ({fechaInicio, fechaFin}) => {
			// Variables
			const fechaInicial = comp.fechas.nueva({fecha: fechaInicio, diasDif: -1});
			const {frecDias, frecMeses} = fechasPlazo;
			let fecha = fechaFin;
			const registros = [];

			while (fecha >= fechaInicial) {
				if (frecDias) {
					// Guarda el registro
					const nombre = comp.fechas["dd/mmm/aa"](fecha);
					registros.push({fecha, nombre});

					// La fecha siguiente debe ser luego de agregar el registro
					fecha = comp.fechas.nueva({fecha, diasDif: -frecDias});
				} else if (frecMeses) {
					// Guarda el registro
					const nombre = comp.fechas["mmm/aa"](fecha);
					registros.push({fecha, nombre});

					// La fecha siguiente debe ser luego de agregar el registro
					fecha = comp.fechas.nueva({fecha, mesesDif: -frecMeses});
				}
			}

			// Guarda la información
			registros.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
			await baseDatos.limpiaAgregaRegs("fechasPeriodos", registros);
			fechasPeriodos = await baseDatos.obtieneTodos("fechasPeriodos");

			// Fin
			return;
		},
	},

	// Carga de Archivos - API
	maestroProds: async ({nombreTablaOrig, registros}) => {
		// Variables - descripción repetida + vínculos con mProvs y mFams
		const [mProvs, mFams] = await Promise.all([
			baseDatos.obtieneTodos("maestroProvs_orig"),
			baseDatos.obtieneTodos("maestroFams_orig"),
		]);
		const espera = [];

		// Guarda en cada registro el error que encuentra
		for (const registro of registros) {
			// Verifica que la descripción no esté repetida
			const casos = registros.filter((n) => n.descripcion.toLowerCase() == registro.descripcion.toLowerCase());
			if (casos.length > 1) {
				espera.push(baseDatos.actualizaPorId(nombreTablaOrig, registro.id, {error: mensError.descrRep}));
				continue;
			}
			// Verifica que tenga el vínculo de la familia
			const mFam = mFams.find((n) => n.id.toLowerCase() == registro.familia_id.toLowerCase());
			if (!mFam) {
				espera.push(baseDatos.actualizaPorId(nombreTablaOrig, registro.id, {error: mensError.sinFam}));
				continue;
			}
			// Verifica que tenga el vínculo del proveedor
			const mProv = mProvs.find((n) => n.id.toLowerCase() == registro.proveedor_id.toLowerCase());
			if (!mProv) espera.push(baseDatos.actualizaPorId(nombreTablaOrig, registro.id, {error: mensError.sinProv}));
		}

		// Espera a que se actualicen los registros
		await Promise.all(espera);
		const regsActs = await baseDatos.obtieneTodos(nombreTablaOrig);

		// Averigua si hay un error en la tabla
		const error = !!regsActs.find((n) => n.error);

		// Fin
		return error;
	},
	stock: async ({nombreTablaOrig, registros}) => {
		// Variables - vínculos con mProds y mDeps
		const mProds = await baseDatos.obtieneTodos("maestroProds_orig");
		const espera = [];

		// Guarda en cada registro el error que encuentra
		for (const registro of registros) {
			// Verifica que tenga el vínculo del producto
			const mProd = mProds.find((n) => n.codProd == registro.codProd);
			if (!mProd) espera.push(baseDatos.actualizaPorId(nombreTablaOrig, registro.id, {error: mensError.sinProd}));
		}

		// Espera a que se actualicen los registros
		await Promise.all(espera);
		const regsActs = await baseDatos.obtieneTodos(nombreTablaOrig);

		// Averigua si hay un error en la tabla
		const error = !!regsActs.find((n) => n.error);

		// Fin
		return error;
	},

	// Carga de Archivos CFG - Vista guardar
	guardaTablasCfgFins: {
		consolidado: async function () {
			// Elimina tablas para resolver dependencias
			await this.eliminaTablasCa();
			await this.eliminaTablasCfgFins();

			// Variables - se tienen que eliminar por las dependencias
			const tablasOrigs = await this.obtieneTablasOrigs();
			const tablasMaestros = this.obtieneMaestros(tablasOrigs);
			const tablasInEjsStock = this.obtieneInEjsStock(tablasOrigs);
			const tablasFinales = {...tablasMaestros, ...tablasInEjsStock};

			// Guardado
			await this.guardaTablasCfgFins(tablasFinales);
			await this.guardaParamsLrStock(); //  inEjs en stock

			// Fin
			return;
		},
		eliminaTablasCa: async () => {
			// Variables
			const tablas = ["reserva_orig", "reserva", "outSoluc_orig", "outSoluc"]; // se deben eliminar los originales también, porque un cambio en el stock cambia el filtro de 'codProd'
			const espera = [];

			// Elimina todos los movimientos de CA
			for (const tabla of tablas) espera.push(baseDatos.eliminaTodos(tabla));

			// Actualiza los paneles de archivos
			const datos = {icono: iconosCA.sinRegs, desde: null, hasta: null, actualizadoPor_id: null, actualizadoEn: null};
			espera.push(baseDatos.actualizaTodos("tablasCa", datos));

			// Fin
			await Promise.all(espera);
			return;
		},
		eliminaTablasCfgFins: async () => {
			// Variables
			const espera = [];

			// Elimina tablas con vinculación ascendente y sin descendencia - 1a etapa
			const tablasInEjs = nombresTablasCfg.filter((n) => n.startsWith("inEj"));
			for (const tabla of tablasInEjs) espera.push(baseDatos.eliminaTodos(tabla));
			await Promise.all(espera);

			// Elimina tablas con vinculación ascendente y sin descendencia -2a etapa
			await baseDatos.eliminaTodos("stock");

			// Elimina tablas sin vinculación
			for (const tabla of ["maestroProvs", "maestroFams"]) espera.push(baseDatos.eliminaTodos(tabla));
			await Promise.all(espera);

			// Fin
			return;
		},
		obtieneTablasOrigs: async () => {
			// Obtiene las tablas originales
			const tablasOrigs = {};
			for (const nombreTabla of nombresTablasCfg) tablasOrigs[nombreTabla] = baseDatos.obtieneTodos(nombreTabla + "_orig");
			const valores = await Promise.all(Object.values(tablasOrigs));
			nombresTablasCfg.forEach((nombreTabla, i) => (tablasOrigs[nombreTabla] = valores[i]));

			// Fin
			return tablasOrigs;
		},
		obtieneMaestros: (tablasOrigs) => {
			// Variables
			const tablasFinales = {};
			const maestroProds = [];

			// Obtiene el código de los productos de LR
			const codsProdsLr = obtieneCodsProdsLR(tablasOrigs);

			// Crea los registros en el Maestro de productos
			for (const codProd of codsProdsLr) maestroProds.push(tablasOrigs.maestroProds.find((n) => n.codProd == codProd));

			// Maestro de proveedores
			const proveedores = [...new Set(maestroProds.map((n) => n.proveedor))].sort((a, b) => (a < b ? -1 : 1));
			proveedores.forEach((proveedor, i) => {
				const registro = tablasOrigs.maestroProvs.find((n) => n.descripcion == proveedor);
				registro.id = i + 1;
				!tablasFinales.maestroProvs
					? (tablasFinales.maestroProvs = [registro])
					: tablasFinales.maestroProvs.push(registro);
			});

			// Maestro de familias
			const familias = [...new Set(maestroProds.map((n) => n.familia))].sort((a, b) => (a < b ? -1 : 1));
			familias.forEach((familia, i) => {
				const registro = tablasOrigs.maestroFams.find((n) => n.descripcion == familia);
				registro.id = i + 1;
				!tablasFinales.maestroFams ? (tablasFinales.maestroFams = [registro]) : tablasFinales.maestroFams.push(registro);
			});

			// Maestro de productos - reemplaza las descripciones por los ids de proveedor y familia
			maestroProds.forEach((maestroProd, i) => {
				// Obtiene el id, el proveedor_id y la familia_id
				maestroProd.id = i + 1;
				maestroProd.proveedor_id = tablasFinales.maestroProvs.find((n) => n.descripcion == maestroProd.proveedor).id;
				maestroProd.familia_id = tablasFinales.maestroFams.find((n) => n.descripcion == maestroProd.familia).id;

				// Crea el registro definitivo
				!tablasFinales.maestroProds
					? (tablasFinales.maestroProds = [maestroProd])
					: tablasFinales.maestroProds.push(maestroProd);
			});

			return tablasFinales;
		},
		obtieneInEjsStock: (tablasOrigs) => {
			// Variables
			const tablasFinales = {};

			// Obtiene el código de los productos de LR
			const codsProdsLr = obtieneCodsProdsLR(tablasOrigs); // no se usa el maestroProds_orig, porque puede tener codProds que no se necesitan

			// Crea las tablas inEjs y stock - Consolida por producto (producto_id y cantidad)
			for (const nombreTabla in tablasOrigs) {
				// Si es un maestro, interrumpe la rutina
				if (nombreTabla.startsWith("maestro")) continue;

				// Crea los registros
				codsProdsLr.forEach((codProd, i) => {
					// Obtiene la cantidad
					const cantidad = tablasOrigs[nombreTabla]
						.filter((n) => n.codProd == codProd)
						.map((n) => n.cantidad)
						.reduce((acum, cant) => acum + cant, 0);

					// Si no existe una cantidad (sólo puede ocurrir con movimientos), no crea el registro
					if (!cantidad) return;

					// Crea el registro
					const registro =
						nombreTabla == "stock"
							? {
									...tablasOrigs.maestroProds.find((n) => n.codProd == codProd),
									cantInicial: cantidad,
									costoUnit: tablasOrigs.stock.find((n) => n.codProd == codProd).costoUnit,
							  }
							: {producto_id: i + 1, cantidad};

					// Agrega el registro
					tablasFinales[nombreTabla] // no puede usarse el 'i' por el 'continue'
						? tablasFinales[nombreTabla].push(registro)
						: (tablasFinales[nombreTabla] = [registro]);
				});
			}

			// Fin
			return tablasFinales;
		},
		guardaTablasCfgFins: async (tablasFinales) => {
			// Guarda las tablas finales (maestros, inEjs, stock), en el orden de dependientes hacia no dependientes
			for (const tabla in tablasFinales)
				if (tabla != "maestroProds") await baseDatos.limpiaAgregaRegs(tabla, tablasFinales[tabla]); // 'await' para evitar problemas de dependencia

			// Fin
			return;
		},
		guardaParamsLrStock: async () => {
			// Variables
			const [stock, tInEj0, tInEj1, tInEj2] = await Promise.all([
				baseDatos.obtieneTodos("stock"),
				baseDatos.obtieneTodos("inEj0"),
				baseDatos.obtieneTodos("inEj1"),
				baseDatos.obtieneTodos("inEj2"),
			]);
			const espera = [];

			// Actualiza
			for (const registro of stock) {
				// Variables
				const {id: stkProd_id, cantInicial, costoUnit} = registro;

				// Obtiene los parámetros - Inicial
				const valorInicial = Math.round(cantInicial * costoUnit);

				// Obtiene los parámetros - ej0
				const inEj0 = tInEj0.find((n) => n.producto_id == stkProd_id)?.cantidad || 0;
				const cantLr0Inicial = Math.min(inEj0, cantInicial);
				const valorLr0Inicial = Math.round(cantLr0Inicial * costoUnit);

				// Obtiene los parámetros - ej1
				const inEj1 = tInEj1.find((n) => n.producto_id == stkProd_id)?.cantidad || 0;
				const cantLr1Inicial = Math.min(inEj1, cantInicial - cantLr0Inicial);
				const valorLr1Inicial = Math.round(cantLr1Inicial * costoUnit);

				// Obtiene los parámetros - ej2
				const inEj2 = tInEj2.find((n) => n.producto_id == stkProd_id)?.cantidad || 0;
				const cantLr2Inicial = Math.min(inEj2, cantInicial - cantLr0Inicial - cantLr1Inicial);
				const valorLr2Inicial = Math.round(cantLr2Inicial * costoUnit);

				// Obtiene los parámetros - ej3
				const cantLr3Inicial = cantInicial - cantLr0Inicial - cantLr1Inicial - cantLr2Inicial;
				const valorLr3Inicial = Math.round(cantLr3Inicial * costoUnit);

				// Obtiene los parámetros - ej123
				const cantLr123Inicial = cantInicial - cantLr0Inicial;
				const valorLr123Inicial = Math.round(cantLr123Inicial * costoUnit);

				// Consolida el resultado
				const datos = {
					...{inEj0, inEj1, inEj2, valorInicial},
					...{cantLr0Inicial, cantLr1Inicial, cantLr2Inicial, cantLr3Inicial, cantLr123Inicial},
					...{valorLr0Inicial, valorLr1Inicial, valorLr2Inicial, valorLr3Inicial, valorLr123Inicial},
				};
				espera.push(baseDatos.actualizaPorId("stock", stkProd_id, datos));
				if (espera.length == loteTabla) {
					await Promise.all(espera);
					espera.length = 0;
				}
			}
			await Promise.all(espera);

			// Fin
			return stock;
		},
	},

	// Carga de Archivos CA - Vista guardar
	actualizaValoresIniciales: {
		consolidado: async function () {
			// Limpieza
			await this.limpiaTablasLr();

			// Actualizaciones
			await this.periodoInicial();
			await procsCA.actualizaLrOtrasTablas.consolidado(); // actualiza las tablas que se usan en el Panel de LR
			await this.ejercicioInicial();

			// Fin
			return;
		},
		limpiaTablasLr: async () => {
			// Variables
			const espera = [];

			// Limpia tablas
			espera.push(baseDatos.actualizaTodos("fechasPeriodos", {valorLr0: 0, valorLr123: 0}));
			espera.push(baseDatos.actualizaTodos("fechasEjercs", datosCero));
			espera.push(baseDatos.actualizaTodos("planesAccion", datosCero));

			// Actualiza fechasEjercs
			fechasPeriodos.forEach((n, i) => (fechasPeriodos[i] = {...n, valorLr0: 0, valorLr123: 0}));
			fechasEjercs.forEach((n, i) => (fechasEjercs[i] = {...n, ...datosCero}));

			// Fin
			await Promise.all(espera);
			return;
		},
		periodoInicial: async () => {
			// Variables
			const periodo = fechasPeriodos[0]; // obtiene la fecha del primer período
			const {fecha} = periodo;

			// Actualiza la imputación de stock al período
			const stock = await baseDatos.obtieneTodos("stock");
			const stockActual = procsCA.actualizaLrStockPeriodos.obtieneStockConEgresos({fecha, stock, outSoluc: []}); // actualiza el cálculo de la LR en stock
			await procsCA.actualizaTabla("stock", stockActual);

			// Actualiza el período inicial
			await procsCA.actualizaLrStockPeriodos.actualizaPeriodo({periodo, stockActual});

			// Fin
			return;
		},
		ejercicioInicial: async () => {
			// Variables
			const espera = [];

			// Rutina
			fechasEjercs.forEach((n, i) => {
				const valorLrInicial = n.valorLrActual;
				espera.push(baseDatos.actualizaPorId("fechasEjercs", n.id, {valorLrInicial}));
				fechasEjercs[i] = {...n, valorLrInicial};
			});
			await Promise.all(espera);

			// Fin
			return;
		},
	},
};

// Variables
const nombresTablasCfg = [
	...["maestroProvs", "maestroFams", "maestroProds"],
	"stock",
	...["inEj0", "inEj1", "inEj2"], // sólo los movimientos
];
const mensError = {
	// Generales
	descrRep: "La descripción está repetida",

	// Maestros
	sinProv: "El proveedor no existe en el maestro",
	sinFam: "La familia no existe en el maestro",
	sinProd: "El producto no existe en el maestro",
};
const datosCero = {valorLrInicial: 0, valorLrActual: 0};

// Funciones
const obtieneCodsProdsLR = (tablas) => [...new Set(tablas.stock.map((n) => n.codProd))].sort((a, b) => (a < b ? -1 : 1));
