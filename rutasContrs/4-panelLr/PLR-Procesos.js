"use strict";

module.exports = {
	// Gráficos
	tiempoTranscurrido: () => {
		// Variables de tiempo
		const diasTotales = comp.fechas.diasDif(FC_inicio, FC_fin) + 1;
		const diasTransc = comp.fechas.diasDif(FC_inicio);
		const logradoFecha = Math.min(100, Math.round((diasTransc / diasTotales) * 100) / 100);

		// Fin
		return logradoFecha;
	},
	valoresLr: function () {
		// Variables de tiempo
		const tiempoTranscPorc = this.tiempoTranscurrido();

		// Valores totales
		const valorLrInicial = fechasEjercs.reduce((acum, b) => acum + b.valorLrInicial, 0);
		const valorLrActual = fechasEjercs.reduce((acum, b) => acum + b.valorLrActual, 0);

		// Variables de LR0
		const valorLr0Inicial = fechasEjercs[0].valorLrInicial;
		const valorLr0Actual = fechasEjercs[0].valorLrActual;
		const valorLr0MejoraActual = valorLr0Inicial - valorLr0Actual;
		const valorLr0MejoraProy = valorLr0MejoraActual / tiempoTranscPorc;
		const valorLr0Proy = Math.max(0, Math.round(valorLr0Inicial - valorLr0MejoraProy));

		// Variables de LR123
		const valorLr123Inicial = valorLrInicial - valorLr0Inicial;
		const valorLr123Actual = valorLrActual - valorLr0Actual;
		const valorLr123MejoraActual = valorLr123Inicial - valorLr123Actual;
		const valorLr123MejoraProy = valorLr123MejoraActual / tiempoTranscPorc;
		const valorLr123Proy = Math.max(0, Math.round(valorLr123Inicial - valorLr123MejoraProy));

		// Valores totales
		const valorLrProy = valorLr0Proy + valorLr123Proy;
		const valorMejoraActualLr123 = Math.max(0, valorLr123Inicial - valorLrActual);
		const valorMejoraProyLr123 = Math.max(0, valorLr123Inicial - valorLrProy);

		// Arma la respuesta
		const datos = {
			...{valorLr0Inicial, valorLr123Inicial, valorLrInicial}, // Inicial
			...{valorLr0Actual, valorLr123Actual, valorLrActual, valorMejoraActualLr123}, // Actual
			...{valorLr0Proy, valorLr123Proy, valorLrProy, valorMejoraProyLr123}, // Proyectado

			// Comps Actual
			compLr0ActualLr0Inicial: Math.round((valorLr0Actual / valorLr0Inicial - 1) * 100),
			compLr123ActualLr123Inicial: Math.round((valorLr123Actual / valorLr123Inicial - 1) * 100),
			compLrActualLr123Inicial: Math.round((valorLrActual / valorLr123Inicial - 1) * 100),
			compLrActualLrInicial: Math.round((valorLrActual / valorLrInicial - 1) * 100),

			// Comps Proyectado
			compLr0ProyLr0Inicial: Math.round((valorLr0Proy / valorLr0Inicial - 1) * 100),
			compLr123ProyLr123Inicial: Math.round((valorLr123Proy / valorLr123Inicial - 1) * 100),
			compLrProyLr123Inicial: Math.round((valorLrProy / valorLr123Inicial - 1) * 100),
			compLrProyLrInicial: Math.round((valorLrProy / valorLrInicial - 1) * 100),
		};

		// Fin
		return datos;
	},

	// Planes de acción
	obtieneEj_id: (ejercicio_id) => {
		return ejercicio_id
			? ejercicio_id == "123"
				? "123"
				: ejercicio_id == "23"
				? "23"
				: ejercicio_id - 1 // se le resta 1, porque el id de ej0 es 1
			: ""; // tiene que ser '', para que no afecte al filtro
	},
	filtra: ({prods, proveedor_id, familia_id, ej_id}) => {
		// Variables
		const grupos = ["provs", "fams", "antigs"];

		// Crea las variables con todos los productos
		let prodsTabla = [...prods];
		let prodsGrCols = [...prods];
		let prodsGrTorta = grupos.reduce((obj, n) => ((obj[n] = prods), obj), {});
		let prodsOpcs = grupos.reduce((obj, n) => ((obj[n] = prods), obj), {});

		// Filtra por proveedor
		if (proveedor_id) {
			prodsGrCols = prodsGrCols.filter((n) => n.proveedor_id == proveedor_id);
			filtra(prodsGrTorta, grupos, (n) => n.proveedor_id == proveedor_id);
			filtra(prodsOpcs, ["fams", "antigs"], (n) => n.proveedor_id == proveedor_id); // no filtra en las opciones, para que figuren todos los proveedores
			prodsTabla = prodsTabla.filter((n) => n.proveedor_id == proveedor_id);
		}

		// Filtra por familia
		if (familia_id) {
			prodsGrCols = prodsGrCols.filter((n) => n.familia_id == familia_id);
			filtra(prodsGrTorta, grupos, (n) => n.familia_id == familia_id);
			filtra(prodsOpcs, ["provs", "antigs"], (n) => n.familia_id == familia_id); // no filtra en las opciones, para que figuren todas las familias
			prodsTabla = prodsTabla.filter((n) => n.familia_id == familia_id);
		}

		// Filtros por antigüedad, dejando sólo los que tienen lrActual
		if (ej_id !== "") {
			const campo = "valorLr" + ej_id + "Actual";
			prodsGrCols = prodsGrCols.filter((n) => n["valorLr" + ej_id + "Inicial"]); // se conservan los que tienen lrInicial, para poder comparar su evolución
			filtra(prodsGrTorta, grupos, (n) => n[campo]);
			filtra(prodsOpcs, ["provs", "fams"], (n) => n[campo]);
			prodsTabla = prodsTabla.filter((n) => n["valorLr" + ej_id + "Actual"]); // se conservan los que tienen lrInicial, para poder comparar su evolución
		}

		// Fin
		return {prodsGrCols, prodsGrTorta, prodsOpcs, prodsTabla};
	},
	procesaInfo: {
		prodsGrCols: ({prodsGrCols, ej_id}) => {
			// Inicial y Actual
			const ejIdInicial = ej_id === "" ? "123" : ej_id;
			const inicial = prodsGrCols.reduce((acum, n) => acum + n["valorLr" + ejIdInicial + "Inicial"], 0);

			// Con y Sin plan
			const conPlan = prodsGrCols
				.filter((n) => n.planAccion_id)
				.reduce((acum, n) => acum + n["valorLr" + ej_id + "Actual"], 0);
			const sinPlan = prodsGrCols
				.filter((n) => !n.planAccion_id)
				.reduce((acum, n) => acum + n["valorLr" + ej_id + "Actual"], 0);

			// Fin
			return {inicial, conPlan, sinPlan};
		},
		prodsGrTorta: ({provs, fams, prodsGrTorta, ej_id}) => {
			// Variables
			let antigs = [];

			// Actualiza los campos 'valorLrSinPlan' y 'valorLrConPlan' de la LR Actual
			provs.forEach((prov, i) => {
				provs[i].valorLrSinPlan = prodsGrTorta.provs
					.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
					.filter((n) => !n.planAccion_id) // el producto no tiene plan de acción
					.reduce((acum, n) => acum + n["valorLr" + ej_id + "Actual"], 0);
				provs[i].valorLrConPlan = prodsGrTorta.provs
					.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
					.filter((n) => n.planAccion_id) // el producto tiene plan de acción
					.reduce((acum, n) => acum + n["valorLr" + ej_id + "Actual"], 0);
			});
			fams.forEach((fam, i) => {
				fams[i].valorLrSinPlan = prodsGrTorta.fams
					.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
					.filter((n) => !n.planAccion_id) // el producto no tiene plan de acción
					.reduce((acum, n) => acum + n["valorLr" + ej_id + "Actual"], 0);
				fams[i].valorLrConPlan = prodsGrTorta.fams
					.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
					.filter((n) => n.planAccion_id) // el producto tiene plan de acción
					.reduce((acum, n) => acum + n["valorLr" + ej_id + "Actual"], 0);
			});
			fechasEjercs.forEach((ejerc, i) => {
				// Si corresponde, saltea la rutina
				if (ej_id !== "" && !String(ej_id).includes(i)) return; // si hay ej_id, sólo acepta la antigüedad seleccionada

				// Obtiene las variables de la antigüedad
				const {id, codigo, descripcion} = ejerc;
				const valorLrSinPlan = prodsGrTorta.antigs
					.filter((n) => !n.planAccion_id)
					.reduce((acum, n) => acum + n["valorLr" + i + "Actual"], 0);
				const valorLrConPlan = prodsGrTorta.antigs
					.filter((n) => n.planAccion_id)
					.reduce((acum, n) => acum + n["valorLr" + i + "Actual"], 0);

				// Agrega la antigüedad
				antigs.push({id, codigo, descripcion, valorLrSinPlan, valorLrConPlan});
			});

			// Filtra y deja solamente los que tienen valorLrSinPlan o valorLrConPlan
			provs = provs.filter((n) => n.valorLrSinPlan || n.valorLrConPlan);
			fams = fams.filter((n) => n.valorLrSinPlan || n.valorLrConPlan);
			antigs = antigs.filter((n) => n.valorLrSinPlan || n.valorLrConPlan); // en prodsGrafs no se deben filtrar, para que muestre la lrInicial completa

			// Los ordena en forma decreciente
			provs.sort((a, b) => b.valorLrSinPlan - a.valorLrSinPlan);
			fams.sort((a, b) => b.valorLrSinPlan - a.valorLrSinPlan);

			// Fin
			return {provs, fams, antigs};
		},
		prodsOpcs: ({provs, fams, prodsOpcs, ej_id}) => {
			// Variables
			let antigs = [];

			// Consolida la información por proveedor
			provs.forEach((prov, i) => {
				provs[i].valorLr = prodsOpcs.provs
					.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
					.reduce((acum, n) => acum + n["valorLr" + ej_id + "Actual"], 0);
			});

			// Consolida la información por proveedor
			fams.forEach((fam, i) => {
				fams[i].valorLr = prodsOpcs.fams
					.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
					.reduce((acum, n) => acum + n["valorLr" + ej_id + "Actual"], 0);
			});

			// Consolida la información por antigüedad
			fechasEjercs.forEach((ejerc, i) => {
				// Obtiene las variables de la antigüedad
				const {id, codigo, descripcion} = ejerc;
				const valorLr = prodsOpcs.antigs.reduce((acum, n) => acum + n["valorLr" + i + "Actual"], 0);

				// Agrega la antigüedad
				antigs.push({id, codigo, descripcion, valorLr});
			});

			// Filtra y deja solamente los que tienen valorLrSinPlan o valorLrConPlan
			provs = provs.filter((n) => n.valorLr);
			fams = fams.filter((n) => n.valorLr);
			antigs = antigs.filter((n) => n.valorLr);

			// Los ordena en forma decreciente
			provs.sort((a, b) => b.valorLr - a.valorLr);
			fams.sort((a, b) => b.valorLr - a.valorLr);

			// Fin
			return {provs, fams, antigs};
		},
		prodsTabla: ({prodsTabla, ej_id, filtroPlanAccion_id: plan_id}) => {
			// Filtra los productos por el plan de acción
			if (plan_id) {
				const condicion = (n) =>
					(plan_id == "sinPlan" && !n.planAccion_id) ||
					(plan_id == "algunPlan" && n.planAccion_id) ||
					n.planAccion_id == plan_id;
				prodsTabla = prodsTabla.filter(condicion);
			}

			// Obtiene las variables de la antigüedad
			prodsTabla.forEach((prod, i) => {
				const cantLr = prod["cantLr" + ej_id + "Actual"];
				const valorLr = prod["valorLr" + ej_id + "Actual"];
				prodsTabla[i] = {...prodsTabla[i], cantLr, valorLr};
			});

			// Ordena los productos por lrActual
			prodsTabla = prodsTabla.sort((a, b) => b.valorLr - a.valorLr).slice(0, 8);

			// Fin
			return prodsTabla;
		},
	},
	obtieneProdsTabla: ({prods, proveedor_id, familia_id, ej_id}) => {},
	eligeLasColumnasDescarga: (prods) => {
		// Elije las columnas del archivo
		const valores = prods.map((n) => [
			...[n.codProd, n.descripcion, n.cantLrActual, n.costoUnit, n.valorLrActual],
			n.planAccion ? n.planAccion.nombre : "Sin plan de acción",
			n.proveedor ? n.proveedor.descripcion : "Sin proveedor",
			n.familia ? n.familia.descripcion : "Sin familia",
			n.ultEj,
		]);
		const campos = [
			...["CodProd", "Descripción", "Cant.", "Costo Unit.", "Valor Total"],
			...["Plan de Acción", "Proveedor", "Familia", "Últ. Ej"],
		];
		for (let i = 0; i < valores.length; i++) {
			prods[i] = {};
			campos.forEach((campo, j) => (prods[i][campo] = valores[i][j]));
		}

		// Fin
		return campos;
	},
};

// Funciones
const filtra = (obj, grupos, condicion) => grupos.forEach((k) => (obj[k] = obj[k].filter(condicion)));
