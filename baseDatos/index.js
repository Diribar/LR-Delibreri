"use strict";

// Variables
const nombreDeEsteArch = path.basename(__filename); // el nombre de este archivo
const tablas = {};

// Obtiene las carpetas
const carpetas = fs.readdirSync(__dirname);
for (let i = carpetas.length - 1; i >= 0; i--) if ([".", "SQL"].some((n) => carpetas[i].includes(n))) carpetas.splice(i, 1); // elimina lo que no sean carpetas de tablas
carpetas.push("/");

// Agrega cada tabla a 'tablas'
for (const carpeta of carpetas) {
	fs.readdirSync(path.join(__dirname, carpeta)) // lee el directorio 'prueba'
		.filter(
			(archivo) =>
				archivo !== nombreDeEsteArch && // archivo distinto a éste
				archivo.indexOf(".") > 0 && // tiene '.' en el nombre y no está en el primer caracter
				archivo.slice(-3) === ".js" // con terminación '.js'
		)
		.map((archivo) => {
			const tabla = require(path.join(__dirname, carpeta, archivo))(sequelize, Sequelize.DataTypes);
			tablas[tabla.name] = tabla;
		});
}

// Agrega las asociaciones
for (let tabla in tablas) if (tablas[tabla].associate) tablas[tabla].associate(tablas);

// Agrega las funciones
tablas.Sequelize = Sequelize;
tablas.sequelize = sequelize;

// Fin
module.exports = tablas;
