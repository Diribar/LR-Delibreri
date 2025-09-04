module.exports = (sequelize, dt) => {
	const alias = "fechasEjercs";
	const columns = {
		// Código
		codigo: {type: dt.STRING(10)},
		descripcion: {type: dt.STRING(50)},

		// Fechas
		desde: {type: dt.STRING(10)},
		hasta: {type: dt.STRING(10)},

		// Valor LR
		valorLrInicial: {type: dt.INTEGER},
		valorLrActual: {type: dt.INTEGER},
	};
	const config = {
		tableName: "fechas_ejercs",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
