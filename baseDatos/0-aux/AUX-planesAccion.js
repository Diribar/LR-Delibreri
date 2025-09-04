module.exports = (sequelize, dt) => {
	const alias = "planesAccion";
	const columns = {
		// Datos característicos
		nombre: {type: dt.STRING(25)},
		valorLrInicial: {type: dt.INTEGER},
		valorLrActual: {type: dt.INTEGER},

		// Fechas
		responsable_id: {type: dt.INTEGER},
		creadoPor_id: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
		cerradoEn: {type: dt.DATE},
		perenne: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_planes_accion",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "responsable", foreignKey: "responsable_id"});
		entidad.belongsTo(n.usuarios, {as: "creadoPor", foreignKey: "creadoPor_id"});
		entidad.hasMany(n.stock, {as: "productos", foreignKey: "planAccion_id"});
	};

	return entidad;
};
