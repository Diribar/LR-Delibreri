module.exports = (sequelize, dt) => {
	const alias = "archsCabecera"; // se guarda en global, cuidando que se mantenga actualizado
	const columns = {
		tipoTabla_id: {type: dt.STRING(10)}, // se vincula a un tipo de tabla

		// Texto distintivo
		distintTexto: {type: dt.STRING(20)},
		distintCol: {type: dt.STRING(1)},
		distintFila: {type: dt.INTEGER},

		// Otros
		filaEncab: {type: dt.INTEGER},
	};
	const config = {
		tableName: "cfg_archs_cabecera",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.tiposTablaCabecera, {as: "tipoTabla", foreignKey: "tipoTabla_id"});
		entidad.hasMany(n.archsRelacsCampo, {as: "relacsCampo", foreignKey: "archivo_id"});
	};

	return entidad;
};
