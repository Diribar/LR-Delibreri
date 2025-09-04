module.exports = (sequelize, dt) => {
	const alias = "maestroFams";
	const columns = {
		descripcion: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "maestro_fams",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.stock, {as: "productos", foreignKey: "familia_id"});
	};

	return entidad;
};
