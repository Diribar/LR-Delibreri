module.exports = (sequelize, dt) => {
	const alias = "archsRelacsCampo"; // no se guarda en global, porque se actualiza
	const columns = {
		archivo_id: {type: dt.STRING(10)}, // se vincula a un archivo

		// Títulos
		campoTabla: {type: dt.STRING(30)},
		campoArch: {type: dt.STRING(30)},
	};
	const config = {
		tableName: "cfg_archs_relacs_campo",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.archsCabecera, {as: "archCabecera", foreignKey: "archivo_id"});
	};

	return entidad;
};
