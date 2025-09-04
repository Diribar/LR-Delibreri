module.exports = (sequelize, dt) => {
	const alias = "fechasPeriodos";
	const columns = {
		// Fecha y nombre
		fecha: {type: dt.STRING(10)},
		nombre: {type: dt.STRING(20)},

		// Valores
		valorLr0: {type: dt.INTEGER},
		valorLr123: {type: dt.INTEGER},
	};
	const config = {
		tableName: "fechas_periodos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
