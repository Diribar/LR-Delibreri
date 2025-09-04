module.exports = (sequelize, dt) => {
	const alias = "novedades";
	const columns = {
		fecha: {type: dt.DATE},
		version: {type: dt.STRING(4)},
		comentario: {type: dt.STRING(100)},
	};
	const config = {
		tableName: "aux_novedades",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
