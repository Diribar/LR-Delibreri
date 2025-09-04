module.exports = (sequelize, dt) => {
	const alias = "maestroFams_orig";
	const columns = {
		descripcion: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "orig_maestro_fams",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
