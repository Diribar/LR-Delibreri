module.exports = (sequelize, dt) => {
	const alias = "solucsOut";
	const columns = {
		nombre: {type: dt.STRING(10)},
	};
	const config = {
		tableName: "aux_solucs_out",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.maestroMovs, {as: "movimientos", foreignKey: "solucOut_id"});
	};

	return entidad;
};
