module.exports = (sequelize, dt) => {
	const alias = "usuarios";
	const columns = {
		// Campos de login
		email: {type: dt.STRING(50)},
		contrasena: {type: dt.STRING(100)},

		// Campos de completar datos
		nombreCompl: {type: dt.STRING(30)},
		apodo: {type: dt.STRING(30)},
		avatar: {type: dt.STRING(100)},

		// Otros campos
		diasNaveg: {type: dt.INTEGER},
		ultNavegEn: {type: dt.STRING(10)},
		version: {type: dt.STRING(4)},
		creadoEn: {type: dt.DATE},

		intentosLogin: {type: dt.INTEGER},
		fechaContrasena: {type: dt.DATE},

		rol_id: {type: dt.INTEGER},
		rolFijo_id: {type: dt.BOOLEAN},
		statusReg_id: {type: dt.INTEGER},

		esPropio: {type: dt.BOOLEAN},
		aptoPlanAccion: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "us_usuarios",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.roles, {as: "rol", foreignKey: "rol_id"});
		entidad.belongsTo(n.roles, {as: "rolFijo", foreignKey: "rolFijo_id"});
		entidad.belongsTo(n.statusRegs, {as: "statusReg", foreignKey: "statusReg_id"});
		entidad.hasMany(n.planesAccion, {as: "planesAccion", foreignKey: "responsable_id"});
	};

	return entidad;
};
