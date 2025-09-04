"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {nombre, responsable_id, planAccion_id, producto_id, proveedor_id, familia_id, fechaEjerc_id} = req.query;

	// Validaciones básicas
	if (nombre && !/[^a-záéíóúüñ \d]/gi.test(nombre)) return res.json({mensaje: "'nombre' inválido"});
	if (responsable_id && !(await baseDatos.obtienePorId("usuarios", responsable_id)))
		return res.json({mensaje: "'responsable_id' desconocido"});
	if (planAccion_id && !(await baseDatos.obtienePorId("planesAccion", planAccion_id)))
		return res.json({mensaje: "'planAccion_id' desconocido"});
	if (producto_id && !(await baseDatos.obtienePorId("stock", producto_id)))
		return res.json({mensaje: "'producto_id' desconocido"});
	if (proveedor_id && !(await baseDatos.obtienePorId("maestroProvs", proveedor_id)))
		return res.json({mensaje: "'proveedor_id' desconocido"});
	if (familia_id && !(await baseDatos.obtienePorId("maestroFams", familia_id)))
		return res.json({mensaje: "'familia_id' desconocido"});
	if (fechaEjerc_id && !["0", "1", "2", "3", "123"].includes(fechaEjerc_id))
		return res.json({mensaje: "'fechaEjerc_id' desconocido"});

	// Fin
	return next();
};
