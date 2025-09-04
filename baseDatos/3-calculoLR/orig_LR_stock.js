// SIEMPRE

module.exports = (sequelize, dt) => {
	const alias = "stock_orig";
	const columns = {
		// Producto y cantidad
		codProd: {type: dt.STRING(30)},
		costoUnit: {type: dt.DECIMAL(10, 2)}, // es necesario para cuando se copia en LRA
		cantidad: {type: dt.INTEGER},

		// Otros
		deposito_id: {type: dt.STRING(10)}, // movimiento y depósito van con 'string'
		error: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "orig_lr_stock",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
