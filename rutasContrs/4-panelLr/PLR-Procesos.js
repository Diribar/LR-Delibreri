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
	filtraProds: ({prods: prodsGrafs, proveedor_id, familia_id, ejercicio_id}) => {
		// Variables
		const prodsOpcs = ["provs", "fams", "antigs"].reduce((obj, n) => ((obj[n] = prodsGrafs), obj), {});

		// Filtros por proveedor
		if (proveedor_id) {
			prodsGrafs = prodsGrafs.filter((n) => n.proveedor_id == proveedor_id);
			prodsOpcs.fams = prodsOpcs.fams.filter((n) => n.proveedor_id == proveedor_id);
			prodsOpcs.antigs = prodsOpcs.antigs.filter((n) => n.proveedor_id == proveedor_id);
		}

		// Filtros por familia
		if (familia_id) {
			prodsGrafs = prodsGrafs.filter((n) => n.familia_id == familia_id);
			prodsOpcs.provs = prodsOpcs.provs.filter((n) => n.familia_id == familia_id);
			prodsOpcs.antigs = prodsOpcs.antigs.filter((n) => n.familia_id == familia_id);
		}

		// Filtros por antigüedad
		if (ejercicio_id) {
			// Variables
			const referencia = ejercicio_id == "123" ? "123" : ejercicio_id - 1;

			// Filtra los productos, dejando todos los que tienen lrInicial
			prodsGrafs = prodsGrafs.filter((n) => n["valorLr" + referencia + "Inicial"]); // se conservan los que tienen lr#Inicial, aunque no tengan lr#Actual

			// Filtra los productos, dejando sólo los que tienen lrActual - para las opciones, sólo cuenta la lr#Actual
			prodsOpcs.provs = prodsOpcs.provs.filter((n) => n["valorLr" + referencia + "Actual"]);
			prodsOpcs.fams = prodsOpcs.fams.filter((n) => n["valorLr" + referencia + "Actual"]);
		}

		// Fin
		return {prodsGrafs, prodsOpcs};
	},
	actualizaPFA: ({provs, fams, prodsGrafs, prodsOpcs}) => {
		// Actualiza los campos 'valorLrSinPlan' y 'valorLrConPlan'
		provs.forEach((prov, i) => {
			provs[i].valorLrSinPlan = (prodsGrafs || prodsOpcs.provs)
				.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
				.filter((n) => !n.planAccion_id) // el producto no tiene plan de acción
				.reduce((acum, n) => acum + n.valorLrActual, 0);
			provs[i].valorLrConPlan = (prodsGrafs || prodsOpcs.provs)
				.filter((n) => n.proveedor_id == prov.id) // el producto pertenece al proveedor
				.filter((n) => n.planAccion_id) // el producto tiene plan de acción
				.reduce((acum, n) => acum + n.valorLrActual, 0);
		});
		fams.forEach((fam, i) => {
			fams[i].valorLrSinPlan = (prodsGrafs || prodsOpcs.fams)
				.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
				.filter((n) => !n.planAccion_id) // el producto no tiene plan de acción
				.reduce((acum, n) => acum + n.valorLrActual, 0);
			fams[i].valorLrConPlan = (prodsGrafs || prodsOpcs.fams)
				.filter((n) => n.familia_id == fam.id) // el producto pertenece a la familia
				.filter((n) => n.planAccion_id) // el producto tiene plan de acción
				.reduce((acum, n) => acum + n.valorLrActual, 0);
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
