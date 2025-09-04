// SIEMPRE - para el plan de acción

module.exports = (sequelize, dt) => {
	const alias = "reserva";
	const columns = {
		// Producto y cantidad
		producto_id: {type: dt.INTEGER},
		cantidad: {type: dt.INTEGER},

		// Datos de la transacción
		fecha: {type: dt.STRING(10)},
		documento: {type: dt.STRING(10)},
		cliente: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "lr_reserva",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
