module.exports = (sequelize, dt) => {
	const alias = "auxPlazos";
	const columns = {
		// Plazos
		codigo: {type: dt.STRING(4)},
		nombre: {type: dt.STRING(12)},
		meses: {type: dt.INTEGER},

		// Frecuencia
		frecNombre: {type: dt.STRING(12)},
		frecDias: {type: dt.INTEGER},
		frecMeses: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_plazos",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
