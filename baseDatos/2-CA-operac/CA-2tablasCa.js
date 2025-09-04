module.exports = (sequelize, dt) => {
	const alias = "tablasCa"; // se guarda en global y se actualiza en el controlVista
	const columns = {
		// Identidad
		tipoTabla_id: {type: dt.STRING(10)},
		descripcion: {type: dt.STRING(20)},
		nombreTablaRegs: {type: dt.STRING(20)},

		// Campos panel
		icono: {type: dt.STRING(1)},
		desde: {type: dt.STRING(10)},
		hasta: {type: dt.STRING(10)},
		actualizadoPor_id: {type: dt.INTEGER},
		actualizadoEn: {type: dt.STRING(10)},
	};
	const config = {
		tableName: "ca_2tablas_ca",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.tiposTablaCabecera, {as: "tipoTabla", foreignKey: "tipoTabla_id"});
		entidad.belongsTo(n.usuarios, {as: "actualizadoPor", foreignKey: "actualizadoPor_id"});
	};

	return entidad;
};
