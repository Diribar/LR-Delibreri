"use strict";
// Variables
const bd = require(path.join(carpRaiz, "baseDatos"));

module.exports = {
	// Obtiene todos
	obtieneTodos: (entidad, include) => bd[entidad].findAll({include}).then((n) => n.map((m) => m.toJSON())),
	obtieneTodosConOrden: (entidad, campoOrden, desc) =>
		bd[entidad].findAll({order: [[campoOrden, desc ? "DESC" : "ASC"]]}).then((n) => n.map((m) => m.toJSON())),
	obtieneTodosPorCondicion: (entidad, condicion, include) =>
		bd[entidad].findAll({where: condicion, include}).then((n) => n.map((m) => m.toJSON())),
	obtieneTodosPorCondicionConLimite: (entidad, condicion, limite, include) =>
		bd[entidad].findAll({where: condicion, include, limit: limite}).then((n) => n.map((m) => m.toJSON())),
	obtieneCampos: (entidad) => Object.keys(bd[entidad].rawAttributes),

	// Obtiene uno
	obtienePorId: (entidad, id, include) => bd[entidad].findByPk(id, {include}).then((n) => (n ? n.toJSON() : null)),
	obtienePorCondicion: (entidad, condicion, include) =>
		bd[entidad].findOne({where: condicion, include}).then((n) => (n ? n.toJSON() : null)),
	obtienePorCondicionElUltimo: (entidad, condicion, campoOrden) =>
		bd[entidad]
			.findAll({where: condicion, order: [[campoOrden ? campoOrden : "id", "DESC"]]})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => (n.length ? n[0] : null)),

	// ABM - Agrega
	agregaReg: (entidad, datos) => bd[entidad].create(datos).then((n) => n.toJSON()),
	agregaRegs: (entidad, datos, opciones) => bd[entidad].bulkCreate(datos, opciones).then((n) => n.map((m) => m.toJSON())),
	limpiaAgregaRegs: async (entidad, datos, opciones) => {
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {raw: true});
		await bd[entidad].destroy({where: {}, truncate: true}).then(() => bd[entidad].bulkCreate(datos, opciones));
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {raw: true});
	},
	copiaTablas: async (entidadOrigen, entidadDestino, opciones) => {
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {raw: true});
		await bd[entidadDestino]
			.destroy({where: {}, truncate: true}) // elimina el contenido de la tabla de destino
			.then(() => bd[entidadOrigen].findAll()) // obtiene todos los registros de la tabla de origen
			.then((datos) => bd[entidadDestino].bulkCreate(datos, opciones)); // copia los registros a la tabla de destino
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {raw: true});
	},
	agregaRegIdCorrel: async (entidad, datos) => {
		// Variables
		const regsId = await bd[entidad]
			.findAll({where: {id: {[Op.gt]: idsReserv}}}) // mayores que los idsReserv
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.map((m) => m.id));
		let nuevoReg;

		// Guarda el registro usando el primer 'id' disponible
		let contador = idsReserv + 1;
		for (let regId of regsId) {
			if (
				regId != contador && // id sin registro creado
				!(await bd[entidad].findByPk(contador).then((n) => !!n)) // se asegura de que no se haya creado durante la rutina
			) {
				nuevoReg = await bd[entidad].create({id: contador, ...datos}).then((n) => n.toJSON()); // lo crea
				break;
			} else contador++;
		}

		// Si no se guardó, lo guarda
		if (!nuevoReg) nuevoReg = await bd[entidad].create(datos).then((n) => n.toJSON()); // crea

		// Fin
		return nuevoReg;
	},
	agregaActualizaPorCondicion: async (entidad, condicion, datos) => {
		// Averigua si existe un registro con esa condición
		const existe = await bd[entidad].findOne({where: condicion}).then((n) => (n ? n.toJSON() : null));

		// Actualiza o crea un registro
		return existe
			? bd[entidad].update(datos, {where: condicion}) // actualiza
			: bd[entidad].create(datos).then((n) => n.toJSON()); // crea
	},

	// ABM - Actualiza
	actualizaTodos: (entidad, datos) => bd[entidad].update(datos, {where: {}}), // es obligatorio que figure un 'where'
	actualizaPorCondicion: (entidad, condicion, datos) => bd[entidad].update(datos, {where: condicion}),
	actualizaPorId: (entidad, id, datos) => bd[entidad].update(datos, {where: {id}}),
	variaElValorDeUnCampo: (entidad, id, campo, aumento) => bd[entidad].increment(campo, {where: {id}, by: aumento || 1}),
	variaElValorDeCampos: (entidad, id, campos) => bd[entidad].increment(campos, {where: {id}}),

	// ABM - Elimina
	eliminaTodos: async (entidad) => {
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {raw: true});
		await bd[entidad].destroy({where: {}, truncate: true});
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {raw: true});
	},
	eliminaPorCondicion: (entidad, condicion) => bd[entidad].destroy({where: condicion}),
	eliminaPorId: (entidad, id) => bd[entidad].destroy({where: {id}}),

	// Lectura
	contarCasos: (entidad, condicion) => bd[entidad].count({where: condicion}),
	minValor: (entidad, campo) => bd[entidad].min(campo),
	minValorPorCondicion: (entidad, condicion, campo) => bd[entidad].min(campo, {where: condicion}),
	maxValor: (entidad, campo) => bd[entidad].max(campo),
	maxValorPorCondicion: (entidad, condicion, campo) => bd[entidad].max(campo, {where: condicion}),
};
