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
	filtraProds: ({prods, proveedor_id, familia_id, referencia}) => {
		// Variables
		const grupos = ["provs", "fams", "antigs"];

		// Crea las variables con todos los productos
		let prodsGrCols = [...prods];
		const prodsGrTorta = grupos.reduce((obj, n) => ((obj[n] = prods), obj), {});
		const prodsOpcs = grupos.reduce((obj, n) => ((obj[n] = prods), obj), {});

		// Filtra por proveedor
		if (proveedor_id) {
			prodsGrCols = prodsGrCols.filter((n) => n.proveedor_id == proveedor_id);
			filtra(prodsGrTorta, grupos, (n) => n.proveedor_id == proveedor_id);
			filtra(prodsOpcs, ["fams", "antigs"], (n) => n.proveedor_id == proveedor_id); // no filtra en las opciones, para que figuren todos los proveedores
		}

		// Filtra por familia
		if (familia_id) {
			prodsGrCols = prodsGrCols.filter((n) => n.familia_id == familia_id);
			filtra(prodsGrTorta, grupos, (n) => n.familia_id == familia_id);
			filtra(prodsOpcs, ["provs", "antigs"], (n) => n.familia_id == familia_id); // no filtra en las opciones, para que figuren todas las familias
		}

		// Filtros por antigüedad, dejando sólo los que tienen lrActual
		if (referencia) {
			const campo = "valorLr" + referencia + "Actual";
			prodsGrCols = prodsGrCols.filter((n) => n["valorLr" + referencia + "Inicial"]); // se conservan los que tienen lrInicial, para poder comparar su evolución
			filtra(prodsGrTorta, grupos, (n) => n[campo]);
			filtra(prodsOpcs, ["provs", "fams"], (n) => n[campo]);
		}

		// Fin
		return {prodsGrCols, prodsGrTorta, prodsOpcs};
	},
	procesaInfo: {
		prodsGrCols,
		prodsGrTorta: ({provs, fams, prodsGrTorta, referencia}) => {
			// Variables
			let antigs = [];

			// Actualiza los campos 'valorLrSinPlan' y 'valorLrConPlan' de la LR Actual
			provs.forEach((prov, i) => {
				provs[i].valorLrSinPlan = prodsGrTorta.provs
					.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
					.filter((n) => !n.planAccion_id) // el producto no tiene plan de acción
					.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
				provs[i].valorLrConPlan = prodsGrTorta.provs
					.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
					.filter((n) => n.planAccion_id) // el producto tiene plan de acción
					.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
			});
			fams.forEach((fam, i) => {
				fams[i].valorLrSinPlan = prodsGrTorta.fams
					.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
					.filter((n) => !n.planAccion_id) // el producto no tiene plan de acción
					.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
				fams[i].valorLrConPlan = prodsGrTorta.fams
					.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
					.filter((n) => n.planAccion_id) // el producto tiene plan de acción
					.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
			});
			fechasEjercs.forEach((ejerc, i) => {
				// Si corresponde, saltea la rutina
				if (referencia && !String(referencia).includes(i)) return; // si hay referencia, sólo procesa la antigüedad seleccionada

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
		prodsOpcs: ({provs, fams, prodsOpcs, referencia}) => {
			// Variables
			let antigs = [];

			// Consolida la información por proveedor
			provs.forEach((prov, i) => {
				provs[i].valorLr = prodsOpcs.provs
					.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
					.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
			});

			// Consolida la información por proveedor
			fams.forEach((fam, i) => {
				fams[i].valorLr = prodsOpcs.fams
					.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
					.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
			});

			// Consolida la información por antigüedad
			fechasEjercs.forEach((ejerc, i) => {
				// Si corresponde, saltea la rutina
				if (referencia && !String(referencia).includes(i)) return; // si hay referencia, sólo procesa la antigüedad seleccionada

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
	},
	actualizaPFA: ({provs, fams, prodsGrafs, prodsOpcs, referencia}) => {
		// Actualiza los campos 'valorLrSinPlan' y 'valorLrConPlan' de la LR Actual
		provs.forEach((prov, i) => {
			provs[i].valorLrSinPlan = (prodsGrafs || prodsOpcs.provs)
				.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
				.filter((n) => !n.planAccion_id) // el producto no tiene plan de acción
				.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
			provs[i].valorLrConPlan = (prodsGrafs || prodsOpcs.provs)
				.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
				.filter((n) => n.planAccion_id) // el producto tiene plan de acción
				.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
		});
		fams.forEach((fam, i) => {
			fams[i].valorLrSinPlan = (prodsGrafs || prodsOpcs.fams)
				.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
				.filter((n) => !n.planAccion_id) // el producto no tiene plan de acción
				.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
			fams[i].valorLrConPlan = (prodsGrafs || prodsOpcs.fams)
				.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
				.filter((n) => n.planAccion_id) // el producto tiene plan de acción
				.reduce((acum, n) => acum + n["valorLr" + referencia + "Actual"], 0);
		});
		let antigs = [];
		fechasEjercs.forEach((ejerc, i) => {
			const {id, codigo, descripcion} = ejerc;
			antigs[i] = {id, codigo, descripcion};
			if (prodsGrafs) antigs[i].valorLrInicial = prodsGrafs.reduce((acum, n) => acum + n["valorLr" + i + "Inicial"], 0); // sólo se lo necesita para el gráfico Inicial vs Final
			antigs[i].valorLrSinPlan = (prodsGrafs || prodsOpcs.antigs)
				.filter((n) => !n.planAccion_id)
				.reduce((acum, n) => acum + n["valorLr" + i + "Actual"], 0);
			antigs[i].valorLrConPlan = (prodsGrafs || prodsOpcs.antigs)
				.filter((n) => n.planAccion_id)
				.reduce((acum, n) => acum + n["valorLr" + i + "Actual"], 0);
		});

		// Filtra y deja solamente los que tienen valorLrSinPlan o valorLrConPlan
		provs = provs.filter((n) => n.valorLrSinPlan || n.valorLrConPlan);
		fams = fams.filter((n) => n.valorLrSinPlan || n.valorLrConPlan);
		if (prodsOpcs) antigs = antigs.filter((n) => n.valorLrSinPlan || n.valorLrConPlan); // en prodsGrafs no se deben filtrar, para que muestre la lrInicial completa

		// Los ordena en forma decreciente
		provs.sort((a, b) => b.valorLrSinPlan - a.valorLrSinPlan);
		fams.sort((a, b) => b.valorLrSinPlan - a.valorLrSinPlan);
		antigs.sort((a, b) => b.valorLrSinPlan - a.valorLrSinPlan);

		// Fin
		return {provs, fams, antigs};
	},
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
