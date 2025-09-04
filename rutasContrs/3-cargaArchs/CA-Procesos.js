"use strict";
// Variables
const bd = require(path.join(carpRaiz, "baseDatos"));

module.exports = {
	// API
	obtieneDatosTablaParaDescargar: async (nombreTabla) => {
		// Variables
		const nombreTablaOrig = nombreTabla + "_orig";

		// Obtiene los datos a descargar
		const [tablaOrig, tablaFinal] = await Promise.all([
			baseDatos.obtieneTodos(nombreTablaOrig),
			baseDatos.obtieneTodos(nombreTabla),
		]);

		// Averigua si se usa la tabla original
		const original = tablaOrig.length || !tablaFinal.length;
		const datos = original ? tablaOrig : tablaFinal;

		// Si hay registros y se usó 'tablaFinal', reemplaza 'producto_id' por 'codProd'
		if (!original && datos.length) {
			const stock = await baseDatos.obtieneTodos("stock");
			datos.forEach((registro, i) => {
				const objeto = {};
				for (const key of Object.keys(registro))
					if (key == "producto_id") objeto.codProd = stock.find((n) => n.id == registro.producto_id)?.codProd;
					else objeto[key] = registro[key];
				datos[i] = objeto;
			});
		}

		// Obtiene los nombres de los campos
		const campos = baseDatos
			.obtieneCampos(original ? nombreTablaOrig : nombreTabla)
			.map((n) => n.replace("producto_id", "codProd"));

		// Fin
		return {datos, campos};
	},

	// Form
	actualizaIconosPanel: async () => {
		// Variables
		tablasCa = await baseDatos.obtieneTodos("tablasCa", ["tipoTabla", "actualizadoPor"]);

		// Actualiza el ícono
		tablasCa.forEach((registro, i) => {
			if (
				registro.icono == iconosCA.actualiz && // el ícono figura como actualizado
				registro.hasta < comp.fechas.nueva({diasDif: -1}) // no está actualizado, porque pasaron por lo menos 2 días
			) {
				tablasCa[i].icono = iconosCA.sinRegs;
				baseDatos.actualizaPorId("tablasCa", registro.id, {icono: iconosCA.sinRegs});
			}
		});

		// Fin
		return;
	},

	// Guardar
	actualizaMovsReserva: {
		consolidado: async function () {
			// Procesa los registros originales
			const tablasFinales = await this.obtieneRegsActuales(); // obtiene los registros por tipo de tabla
			await this.guardaRegsActualesEnTablasFinales(tablasFinales); // agregan los registros a sus tablas

			// Fin
			return;
		},
		obtieneRegsActuales: async () => {
			// Variables
			const stock = await baseDatos.obtieneTodos("stock");
			const tablasFinales = {};

			// Obtiene las tablas originales
			for (const nombreTabla of nombresResOut)
				tablasFinales[nombreTabla] = baseDatos
					.obtieneTodos(nombreTabla + "_orig")
					.then((n) => n.map((m) => ({...m, producto_id: stock.find((n) => n.codProd == m.codProd)?.id}))) // le agrega el 'producto_id
					.then((n) => n.filter((m) => m.producto_id)) // descarta los productos que no existen en el stock
					.then((n) => n.map(({id, ...rest}) => rest)) // elimina el 'id'
					.then((n) => n.sort((a, b) => (a.fecha < b.fecha ? -1 : 1))); // ordena por fecha

			// Espera las promesas
			const valores = await Promise.all(Object.values(tablasFinales));
			nombresResOut.forEach((nombreTabla, i) =>
				valores[i].length ? (tablasFinales[nombreTabla] = valores[i]) : delete tablasFinales[nombreTabla]
			);

			// Fin
			return tablasFinales;
		},
		guardaRegsActualesEnTablasFinales: async (tablasFinales) => {
			// Variables
			const espera = [];

			// Agrega los registros
			for (const nombreTabla in tablasFinales)
				if (tablasFinales[nombreTabla].length)
					espera.push(
						nombreTabla == nombreOut
							? baseDatos.agregaRegs(nombreTabla, tablasFinales[nombreTabla]) // para 'movimientos'
							: baseDatos.limpiaAgregaRegs(nombreTabla, tablasFinales[nombreTabla]) // para 'reservas'
					);
			await Promise.all(espera);

			// Fin
			return;
		},
	},
	actualizaLrStockPeriodos: {
		consolidado: async function () {
			// Variables
			const [periodos, reserva, outSoluc, stock] = await Promise.all([
				this.obtienePeriodosParaActualizar(),
				baseDatos.obtieneTodos("reserva"),
				baseDatos.obtieneTodos("outSoluc"),
				baseDatos.obtieneTodos("stock"),
			]);
			let stockActual = stock;

			// Actualiza los períodos
			for (const periodo of periodos) {
				const {fecha} = periodo;
				stockActual = this.obtieneStockConEgresos({stock, outSoluc, fecha});
				await this.actualizaPeriodo({periodo, stockActual});
			}

			// Actualiza la reserva
			stockActual = this.obtieneStockConReservaMasPlanAccion({reserva, stockActual});

			// Actualiza el stock
			await baseDatos.limpiaAgregaRegs("stock", stockActual);

			// Fin
			return;
		},
		// Actualiza los períodos
		obtienePeriodosParaActualizar: async () => {
			// Variables
			const hoy = comp.fechas["aaaa-mm-dd"]();

			// Obtiene la fecha mas antigua de los movimientos agregados
			const fechaMasAntigua = await baseDatos.minValor("outSoluc_orig", "fecha");
			if (!fechaMasAntigua) return []; // si no hay movimientos, interrumpe la función

			// Obtiene períodos especiales
			const antsFechaMasAntigua = fechasPeriodos.filter((n) => n.fecha < fechaMasAntigua && !n.valorLr123); // los anteriores al movimiento mas antiguo y que no tengan valor
			const postsFechaMasAntigua = fechasPeriodos.filter((n) => n.fecha >= fechaMasAntigua && n.fecha < hoy); // los posteriores al movimiento mas antiguo y menores a hoy
			const postsHoy = fechasPeriodos.find((n) => n.fecha >= hoy); // el primer período mayor o igual a hoy

			// Agrega un sólo período posterior a hoy
			const resultados = [...antsFechaMasAntigua, ...postsFechaMasAntigua];
			if (postsHoy) resultados.push(postsHoy);

			// Fin
			return resultados;
		},
		obtieneStockConEgresos: ({fecha, stock, outSoluc}) => {
			// Obtiene las variables para cada registro de stock
			stock.forEach((registro, i) => {
				// Toma del registro los datos perennes
				const {id: stkProd_id, costoUnit, cantInicial, inEj0, inEj1, inEj2} = registro;

				// Obtiene el 'outSolucs'
				const outSolucs = outSoluc
					.filter((n) => n.producto_id == stkProd_id && n.fecha <= fecha) // los outs del producto hasta el fin del período
					.reduce((acum, b) => acum + b.cantidad, 0);

				// Cantidad inicial menos outs
				const cantLrActual = Math.max(0, cantInicial - outSolucs);
				const valorLrActual = cantLrActual * costoUnit;

				// Actualizable - cantidad por ejercicio actual
				const cantLr0Actual = Math.min(inEj0, cantLrActual); // menor entre inEj0 y cantLrActual
				const valorLr0Actual = cantLr0Actual * costoUnit;

				// Actualizable - cantidad por ejercicios anteriores
				const cantLr1Actual = Math.max(0, Math.min(inEj1, cantLrActual - cantLr0Actual)); // menor entre inEj1 y cantLrActual - cantLr0Actual
				const cantLr2Actual = Math.max(0, Math.min(inEj2, cantLrActual - cantLr0Actual - cantLr1Actual)); // menor entre inEj2 y cantLrActual - cantLr0Actual - cantLr1Actual
				const cantLr3Actual = cantLrActual - cantLr0Actual - cantLr1Actual - cantLr2Actual; // cantLrActual - cantLr0Actual - cantLr1Actual - cantLr2Actual
				const cantLr123Actual = cantLr1Actual + cantLr2Actual + cantLr3Actual; // suma de cantLr1Actual, cantLr2Actual, cantLr3Actual
				const ultEj = cantLr0Actual ? "0" : cantLr1Actual ? "-1" : cantLr2Actual ? "-2" : "< -2";
				const valorLr1Actual = cantLr1Actual * costoUnit;
				const valorLr2Actual = cantLr2Actual * costoUnit;
				const valorLr3Actual = cantLr3Actual * costoUnit;
				const valorLr123Actual = cantLr123Actual * costoUnit;

				// Consolida el resultado
				stock[i] = {
					...registro,
					...{outSolucs, cantLrActual, valorLrActual},
					...{cantLr0Actual, cantLr1Actual, cantLr2Actual, cantLr3Actual, cantLr123Actual, ultEj},
					...{valorLr0Actual, valorLr1Actual, valorLr2Actual, valorLr3Actual, valorLr123Actual},
				};
			});

			// Fin
			return stock;
		},
		actualizaPeriodo: async ({periodo, stockActual}) => {
			// Valores
			const valorLr0 = stockActual.reduce((acum, b) => acum + b.valorLr0Actual, 0);
			const valorLr123 = stockActual.reduce((acum, b) => acum + b.valorLr123Actual, 0);

			// Actualiza variable y tabla
			await baseDatos.actualizaPorId("fechasPeriodos", periodo.id, {valorLr0, valorLr123});
			fechasPeriodos = await baseDatos.obtieneTodos("fechasPeriodos");

			// Fin
			return;
		},
		obtieneStockConReservaMasPlanAccion: ({reserva, stockActual}) => {
			stockActual.forEach((registro, i) => {
				// Toma del registro los datos perennes
				const {id: stkProd_id, costoUnit, cantLrActual} = registro;

				// Cantidad por resolver
				const cantReserva = reserva.filter((n) => n.producto_id == stkProd_id).reduce((acum, b) => acum + b.cantidad, 0);
				const cantPorResolver = Math.max(0, cantLrActual - cantReserva);
				const valorPorResolver = cantPorResolver * costoUnit;

				// Plan de acción - si se resuelve con la reserva, lo cambia al default
				const planAccion_id =
					cantLrActual && !cantPorResolver // si hay stock y se resuelve íntegramente con la reserva
						? planAccionReserva_id // plan de acción 'reserva'
						: registro.planAccion_id || null;

				// Consolida el resultado
				stockActual[i] = {...registro, cantReserva, cantPorResolver, valorPorResolver, planAccion_id};
			});

			// Fin
			return stockActual;
		},
	},
	actualizaLrOtrasTablas: {
		consolidado: async function () {
			// Variables
			const stock = await baseDatos.obtieneTodos("stock");
			const espera = [];

			// Actualiza tablas, sólo con los registros con valor
			espera.push(this.porEjercicio(stock));
			espera.push(this.porPlanAccion(stock));
			await Promise.all(espera);

			// Fin
			return;
		},
		porEjercicio: async (stock) => {
			// Variables
			const espera = [];

			// Rutina por ejercicio
			fechasEjercs.forEach((n, i) => {
				// Variables
				const campo = "valorLr" + i + "Actual"; // valorLr0Actual, valorLr1Actual, valorLr2Actual, valorLr3Actual
				const valorLrActual = stock.reduce((acum, b) => acum + b[campo], 0);

				// Actualiza la tabla y la variable
				espera.push(baseDatos.actualizaPorId("fechasEjercs", n.id, {valorLrActual}));
				fechasEjercs[i] = {...n, valorLrActual};
			});

			// Fin
			await Promise.all(espera);
			return;
		},
		porPlanAccion: async (stock) => {
			// Variables
			const planesAccion = await baseDatos.obtieneTodosPorCondicion("planesAccion", {cerradoEn: null});
			const espera = [];

			// Rutina
			for (const planAccion of planesAccion) {
				// Obtiene el valor de LR actual
				const productos = stock.filter((n) => n.planAccion_id == planAccion.id);
				const valorLrActual = productos.reduce((acum, b) => acum + b.valorLrActual, 0);

				// Guarda los cambios
				espera.push(baseDatos.actualizaPorId("planesAccion", planAccion.id, {valorLrActual}));
				if (espera.length == loteTabla) {
					await Promise.all(espera);
					espera.length = 0;
				}
			}
			await Promise.all(espera);

			// Fin
			return;
		},
	},
	vaciaOriginales: async () => {
		// Variables
		const tablas = nombresResOut.map((n) => n + "_orig");
		const espera = [];

		// Vacía las tablas originales
		for (const tabla of tablas) espera.push(baseDatos.eliminaTodos(tabla));
		await Promise.all(espera);

		// Actualiza el siguiente valor de ID a 1
		for (const tabla of tablas) {
			const texto = bdNombre + "." + bd[tabla].tableName;
			sequelize.query("ALTER TABLE " + texto + " AUTO_INCREMENT = 1;");
		}

		// Fin
		return;
	},

	// Auxiliares
	actualizaTabla: async (nombreTabla, registros) => actualizaTabla(nombreTabla, registros),
};

// Variables
const nombreRes = "reserva"; // se reemplazan
const nombreOut = "outSoluc"; // se suman
const nombresResOut = [nombreRes, nombreOut];

// Funciones
const actualizaTabla = async (nombreTabla, registros) => {
	// Variables
	const espera = [];

	// Actualiza - no se puede usar el 'forEach' porque no respeta el await
	for (const registro of registros) {
		espera.push(baseDatos.actualizaPorId(nombreTabla, registro.id, registro));
		if (espera.length == loteTabla) {
			await Promise.all(espera);
			espera.length = 0;
		}
	}
	await Promise.all(espera);

	// Fin
	return;
};
