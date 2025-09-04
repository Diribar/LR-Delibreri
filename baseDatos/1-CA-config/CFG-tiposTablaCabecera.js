module.exports = (sequelize, dt) => {
	const alias = "tiposTablaCabecera"; // se guarda en global porque no se actualiza
	const columns = {
		id: {type: dt.STRING(10), primaryKey: true},
		orden: {type: dt.INTEGER},
		descripcion: {type: dt.STRING(20)},
		campoCond: {type: dt.STRING(15)},

		// Booleanos
		descarta: {type: dt.BOOLEAN},
		actualiza: {type: dt.BOOLEAN},
		elimina: {type: dt.BOOLEAN},
		conDesde: {type: dt.BOOLEAN},
		conHasta: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "cfg_tt_cabecera",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.archsCabecera, {as: "archsCabecera", foreignKey: "tipoTabla_id"});
		entidad.hasMany(n.tiposTablaCampos, {as: "campos", foreignKey: "tipoTabla_id"});
		entidad.hasMany(n.tablasCfg, {as: "tablasCfg", foreignKey: "tipoTabla_id"});
		entidad.hasMany(n.tablasCa, {as: "tablasCa", foreignKey: "tipoTabla_id"});
	};

	return entidad;
};
