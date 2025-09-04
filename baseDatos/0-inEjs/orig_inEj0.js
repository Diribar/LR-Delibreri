// SIEMPRE - para el cálculo de LR (1 ejercicio)

module.exports = (sequelize, dt) => {
	const alias = "inEj0_orig";
	const columns = {
		// Producto y cantidad
		fecha: {type: dt.STRING(10)},
		codProd: {type: dt.STRING(30)},
		cantidad: {type: dt.INTEGER},

		// Datos de la transacción
		deposito_id: {type: dt.STRING(3)}, // movimiento y depósito van con 'string'
		movim_id: {type: dt.STRING(3)}, // movimiento y depósito van con 'string'
		documento: {type: dt.STRING(10)},
	};
	const config = {
		tableName: "orig_inej_0",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
