module.exports = (sequelize, dt) => {
	const alias = "tiposTablaCampos"; // se guarda en global porque no se actualiza
	const columns = {
		// Tabla
		tipoTabla_id: {type: dt.STRING(10)}, // se vincula a un tipo de tabla

		// Campos
		campo: {type: dt.STRING(30)},
		esCritico: {type: dt.BOOLEAN},
		formato: {type: dt.STRING(6)},
		largoMax: {type: dt.INTEGER},
	};
	const config = {
		tableName: "cfg_tt_campos",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.tiposTablaCabecera, {as: "cabecera", foreignKey: "tipoTabla_id"});
	};

	return entidad;
};
