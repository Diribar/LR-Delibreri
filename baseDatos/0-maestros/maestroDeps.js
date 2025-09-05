module.exports = (sequelize, dt) => {
	const alias = "maestroDeps";
	const columns = {
		id: {type: dt.STRING(10), primaryKey: true},
		descripcion: {type: dt.STRING(20)},
		lr: {type: dt.BOOLEAN},
		enUso: {type: dt.BOOLEAN},

		// Usuario
		creadoPor_id: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "maestro_deps",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.outSoluc, {as: "outsSoluc", foreignKey: "deposito_id"});
		entidad.belongsTo(n.usuarios, {as: "creadoPor", foreignKey: "creadoPor_id"});
	};

	return entidad;
};
