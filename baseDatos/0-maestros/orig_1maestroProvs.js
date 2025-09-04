module.exports = (sequelize, dt) => {
	const alias = "maestroProvs_orig";
	const columns = {
		descripcion: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "orig_maestro_provs",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
