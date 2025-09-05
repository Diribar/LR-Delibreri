"use strict";

// Start-up - última carpeta git subida: 2.60
console.clear();

// Requires
global.path = require("path");
global.fs = require("fs");
global.express = require("express");
global.carpRaiz = __dirname; // Carpeta raíz del proyecto
const app = express();

// Aplicaciones express
app.use(express.urlencoded({extended: false})); // Para usar el método post
app.use(express.json()); // para convertir las APIs en json
app.use(express.text()); // para convertir las APIs en text
// Para usar la propiedad "session"
const session = require("express-session");
app.use(session({secret: "lr", resave: false, saveUninitialized: false}));
// Para usar cookies
const cookies = require("cookie-parser");
app.use(cookies());

// Variables que toman valores de 'path'
const entProducc = global.path.basename(__dirname) == "1-Delibreri";
const entPrueba = global.path.basename(__dirname) == "0-Prueba";
const entDesarr = !entProducc && !entPrueba;

// Listener - para conectarse con el servidor
const puerto = entProducc ? 4205 : entPrueba ? 4202 : 3007;
const carpCreds = "/archsCliente/0-credenciales";
if (entDesarr) {
	const https = require("https");
	const opciones = {
		cert: fs.readFileSync(path.join(__dirname, carpCreds, "https-cert.pem")),
		key: fs.readFileSync(path.join(__dirname, carpCreds, "https-clave.pem")),
	};
	https.createServer(opciones, app).listen(puerto, () => console.log("\nLR Delibreri - Servidor funcionando...")); // Para conectarse con el servidor
} else app.listen(puerto, () => console.log("\nLR Delibreri - Servidor funcionando..."));

// Variables que dependen del entorno
const entornoBd = !entDesarr ? "produccion" : "desarrollo";
if (!entDesarr) global.dominio = {domain: "lentarotacion.com.ar"};

// Carpetas 'publico' para usar en toda la aplicación
app.use("/publico", express.static(path.join(__dirname, "publico")));
app.use("/formatos", express.static(path.join(__dirname, "publico", "formatos")));
app.use("/js", express.static(path.join(__dirname, "publico", "javascript")));

// Imágenes para usar en toda la aplicación
const carpLr = path.join(__dirname, "..", ".."); // otros dominios
app.use("/imgsComp", express.static(path.join(carpLr, "9-CompImgs")));
// app.use("/imgsProds", express.static(path.join(__dirname, "..", "imgsProds")));

// Base de datos
global.Sequelize = require("sequelize");
global.credenciales = require(path.join(__dirname, carpCreds, "credenciales.js"));
const credencsBD = credenciales.bd[entornoBd];
const {database, username, password} = credencsBD;
global.bdNombre = credencsBD.database;
global.sequelize = new Sequelize(database, username, password, credencsBD);
const bd = require("./baseDatos");
global.Op = bd.Sequelize.Op;

// Variables globales
const constantes = require("./variables/constantes");
for (const metodo in constantes) global[metodo] = constantes[metodo];

// Procesos que requieren de 'async' y 'await'
(async () => {
	// Variables que requieren 'require'
	global.variables = require("./variables/depends");
	global.comp = require("./funciones/compartidas.js");

	// Variables json
	const varsJson = comp.gestionArchs.lecturaJson();
	for (let varJson in varsJson) global[varJson] = varsJson[varJson];

	// Variables que dependen de las lecturas de BD
	global.baseDatos = require("./funciones/baseDatos.js");
	const varsBd = require("./variables/baseDatos.js");
	const lecturasBd = await varsBd.lecturasBd();
	for (let campo in lecturasBd) global[campo] = lecturasBd[campo]; // asigna una variable a cada lectura
	const datosPartics = varsBd.datosPartics();
	for (let campo in datosPartics) global[campo] = datosPartics[campo]; // asigna una variable a valores específicos
	global.version = novedades[novedades.length - 1].version;

	// Todas las carpetas donde se almacenan vistas
	app.set("view engine", "ejs"); // Terminación de los archivos de vista
	app.set("views", obtieneLasCarpsDeVista("./vistas"));

	// Middlewares transversales
	app.use(require("./middlewares/transversales/login"));
	app.use(require("./middlewares/transversales/rutasPorRol.js"));

	// Vistas de start-up
	app.use("/usuarios", require("./rutasContrs/1-usuarios/US-Rutas.js"));
	app.use("/configuracion", require("./rutasContrs/2-config/CFG-Rutas.js"));
	app.use("/abm-usuarios", require("./rutasContrs/8-abmUs/ABM-Rutas.js"));
	app.use("/", require("./rutasContrs/9-miscelaneas/MS-Rutas"));

	// Vistas en régimen
	app.use("/carga-archivos", require("./rutasContrs/3-cargaArchs/CA-Rutas"));
	app.use("/", require("./rutasContrs/4-panelLr/PLR-Rutas.js"));

	// Url no encontrado
	//app.use(require(path.join(carpRaiz, "middlewares/transversales/urlDesconocida"))); // Si no se reconoce el url - se debe informar después de los urls anteriores

	// Fin
	return;
})();

// Funciones
const obtieneLasCarpsDeVista = (carpetaVistas) => {
	const subCarpetas = fs.readdirSync(carpetaVistas, {withFileTypes: true});
	const todasLasCarps = [carpetaVistas];

	// Recorre las carpetas
	for (const subCarpeta of subCarpetas)
		if (subCarpeta.isDirectory()) todasLasCarps.push(...obtieneLasCarpsDeVista(carpetaVistas + "/" + subCarpeta.name));

	// Fin
	return todasLasCarps;
};
