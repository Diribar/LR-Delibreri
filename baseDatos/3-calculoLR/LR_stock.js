// SIEMPRE

module.exports = (sequelize, dt) => {
	const alias = "stock";
	const columns = {
		// Perenne - datos del producto
		codProd: {type: dt.STRING(30)}, // este campo es sólo a modo informativo, el que se usa es el del maestro
		costoUnit: {type: dt.DECIMAL(10, 2)}, // es necesario para cuando se copia en LRA

		// Perenne - movimientos
		cantInicial: {type: dt.INTEGER},
		valorInicial: {type: dt.INTEGER}, // cantInicial x costoUnit
		inEj0: {type: dt.INTEGER}, // todos los ingresos
		cantLr0Inicial: {type: dt.INTEGER}, // menor entre inEj0 y cantLrInicial
		valorLr0Inicial: {type: dt.INTEGER}, // cantLr0Inicial x costoUnit
		inEj1: {type: dt.INTEGER}, // todos los ingresos
		cantLr1Inicial: {type: dt.INTEGER}, // menor entre inEj1 y cantLrInicial - cantLr0Inicial
		valorLr1Inicial: {type: dt.INTEGER}, // cantLr1Inicial x costoUnit
		inEj2: {type: dt.INTEGER}, // todos los ingresos
		cantLr2Inicial: {type: dt.INTEGER}, // menor entre inEj2 y cantLrInicial - cantLr0Inicial - cantLr1Inicial
		valorLr2Inicial: {type: dt.INTEGER}, // cantLr2Inicial x costoUnit
		cantLr3Inicial: {type: dt.INTEGER}, // cantLrInicial - cantLr0Inicial - cantLr1Inicial - cantLr2Inicial
		valorLr3Inicial: {type: dt.INTEGER}, // cantLr3Inicial x costoUnit
		cantLr123Inicial: {type: dt.INTEGER}, // suma de cantLr1Inicial, cantLr2Inicial, cantLr3Inicial
		valorLr123Inicial: {type: dt.INTEGER}, // cantLr123Inicial x costoUnit

		// Valores actuales - cantidad actual
		outSolucs: {type: dt.INTEGER}, // sólo del ejercicio vigente, para restar del stock inicial
		cantLrActual: {type: dt.INTEGER}, // mayor entre cero y "cantLrActual - outSolucs"
		valorLrActual: {type: dt.INTEGER}, // cantLrActual x costoUnit

		// Valores actuales - cantidad por ejercicios anteriores
		cantLr0Actual: {type: dt.INTEGER}, // menor entre inEj0 y cantLrActual
		cantLr1Actual: {type: dt.INTEGER}, // menor entre inEj1 y cantLrActual - cantLr0Actual
		cantLr2Actual: {type: dt.INTEGER}, // menor entre inEj2 y cantLrActual - cantLr0Actual - cantLr1Actual
		cantLr3Actual: {type: dt.INTEGER}, // cantLrActual - cantLr0Actual - cantLr1Actual - cantLr2Actual
		cantLr123Actual: {type: dt.INTEGER}, // suma de cantLr1Actual, cantLr2Actual, cantLr3Actual
		valorLr0Actual: {type: dt.INTEGER}, // cantLr0Actual x costoUnit
		valorLr1Actual: {type: dt.INTEGER}, // cantLr1Actual x costoUnit
		valorLr2Actual: {type: dt.INTEGER}, // cantLr2Actual x costoUnit
		valorLr3Actual: {type: dt.INTEGER}, // cantLr3Actual x costoUnit
		valorLr123Actual: {type: dt.INTEGER}, // cantLr123Actual x costoUnit
		ultEj: {type: dt.STRING(4)},

		// Plan de acción
		cantReserva: {type: dt.INTEGER}, // lo que haya de reserva
		cantPorResolver: {type: dt.INTEGER}, // mayor entre cero y cantLrActual - cantOutRes
		valorPorResolver: {type: dt.INTEGER}, // cantPorResolver x costoUnit
		planAccion_id: {type: dt.INTEGER},

		// Detalles
		descripcion: {type: dt.STRING(100)},
		proveedor_id: {type: dt.INTEGER},
		familia_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "lr_stock",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		// De quienes depende
		entidad.belongsTo(n.maestroProvs, {as: "proveedor", foreignKey: "proveedor_id"});
		entidad.belongsTo(n.maestroFams, {as: "familia", foreignKey: "familia_id"});
		entidad.belongsTo(n.planesAccion, {as: "planAccion", foreignKey: "planAccion_id"});

		// LR Actual
		entidad.hasMany(n.outSoluc, {as: "outsSoluc", foreignKey: "producto_id"});
		entidad.hasMany(n.reserva, {as: "reserva", foreignKey: "producto_id"});
	};

	return entidad;
};

// Resultados Bruto - cantidades por tipo de solución
// solucMargen: {type: dt.INTEGER},
// solucCosto: {type: dt.INTEGER},
// solucDonac: {type: dt.INTEGER},
// solucPerdida: {type: dt.INTEGER},
// solucTransfer: {type: dt.INTEGER},

// Resultados Neto
// netoMargen: {type: dt.INTEGER}, // menor entre solucMargen y cantInicial
// netoCosto: {type: dt.INTEGER}, // menor entre solucCosto y cantInicial - netoMargen
// netoDonac: {type: dt.INTEGER}, // menor entre solucDonac y cantInicial - netoMargen - netoCosto
// netoPerdida: {type: dt.INTEGER}, // menor entre solucPerdida y cantInicial - netoMargen - netoCosto - netoDonac
// netoTransfer: {type: dt.INTEGER}, // menor entre solucTransfer y cantInicial - netoMargen - netoCosto - netoDonac - netoPerdida

// Resultados Neto - Valores
// valorMargen: {type: dt.INTEGER}, // netoMargen x costoUnit
// valorCosto: {type: dt.INTEGER}, // netoCosto x costoUnit
// valorDonac: {type: dt.INTEGER}, // netoDonac x costoUnit
// valorPerdida: {type: dt.INTEGER}, // netoPerdida x costoUnit
// valorTransfer: {type: dt.INTEGER}, // netoTransfer x costoUnit
