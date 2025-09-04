module.exports = (sequelize, dt) => {
	const alias = "maestroMovs";
	const columns = {
		id: {type: dt.STRING(10), primaryKey: true},
		descripcion: {type: dt.STRING(20)},

		inLr: {type: dt.BOOLEAN},
		solucOut_id: {type: dt.INTEGER},

		esencial: {type: dt.BOOLEAN},
		enUso: {type: dt.BOOLEAN},

		// Usuario
		creadoPor_id: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "maestro_movs",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.solucsOut, {as: "solucOut", foreignKey: "solucOut_id"});
		entidad.belongsTo(n.usuarios, {as: "creadoPor", foreignKey: "creadoPor_id"});
		entidad.hasMany(n.outSoluc, {as: "outsSoluc", foreignKey: "movim_id"});
	};

	return entidad;
};
