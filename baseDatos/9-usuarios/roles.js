module.exports = (sequelize, dt) => {
	const alias = "roles";
	const columns = {
		// Código y nombre
		codigo: {type: dt.STRING(15)},
		nombre: {type: dt.STRING(20)},

		// Permisos
		plr: {type: dt.BOOLEAN},
		ca:{type: dt.BOOLEAN},
		cfg: {type: dt.BOOLEAN},
		abm: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "us_roles",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "rol_id"});
		entidad.hasMany(n.usuarios, {as: "usuariosFijos", foreignKey: "rolFijo_id"});
	};

	return entidad;
};
