// SIEMPRE - para restar del stock inicial (ejercicio vigente)
// Sólo los productos en stock inicial y con maestroDep.lr y maestroMov.solucion_id

module.exports = (sequelize, dt) => {
	const alias = "outSoluc_orig";
	const columns = {
		// Producto y cantidad
		fecha: {type: dt.STRING(10)},
		codProd: {type: dt.STRING(30)},
		cantidad: {type: dt.INTEGER},

		// Datos de la transacción
		movim_id: {type: dt.STRING(3)}, // movimiento y depósito van con 'string'
		deposito_id: {type: dt.STRING(3)}, // movimiento y depósito van con 'string'
		documento: {type: dt.STRING(10)},
	};
	const config = {
		tableName: "orig_lr_out_soluc",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
