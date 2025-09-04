// SIEMPRE - para el plan de acción
// Sólo los productos en stock inicial

module.exports = (sequelize, dt) => {
	const alias = "reserva_orig";
	const columns = {
		// Producto y cantidad
		codProd: {type: dt.STRING(30)},
		cantidad: {type: dt.INTEGER},

		// Datos de la transacción
		fecha: {type: dt.STRING(10)},
		documento: {type: dt.STRING(10)},
		cliente: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "orig_lr_reserva",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
