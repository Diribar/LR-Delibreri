// SIEMPRE - para el cálculo de LR (1 ejercicio)

module.exports = (sequelize, dt) => {
	const alias = "inEj0";
	const columns = {
		// Producto y cantidad
		producto_id: {type: dt.INTEGER},
		cantidad: {type: dt.INTEGER},
	};
	const config = {
		tableName: "inej_0",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.stock, {as: "producto", foreignKey: "producto_id"});
	};

	return entidad;
};
