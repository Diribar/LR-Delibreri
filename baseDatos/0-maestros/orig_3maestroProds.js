module.exports = (sequelize, dt) => {
	const alias = "maestroProds_orig";
	const columns = {
		// Datos del producto
		codProd: {type: dt.STRING(30)},
		descripcion: {type: dt.STRING(100)},
		costoUnit: {type: dt.DECIMAL(10, 2)},

		// Vinculados
		proveedor_id: {type: dt.STRING(3)},
		familia_id: {type: dt.STRING(4)},
		error: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "orig_maestro_prods",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
