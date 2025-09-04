"use strict";

// Variables
const unaHora = 60 * 60 * 1000;
const unDia = unaHora * 24;
const unAno = unDia * 365;
const faSolid = "fa-solid ";
const iconos = {
	// Carteles
	...{triangulo: "fa-triangle-exclamation", entendido: "fa-thumbs-up"},

	// Formularios
	...{izquierda: "fa-circle-left", derecha: "fa-circle-right", check: "fa-circle-check", xMark: "fa-circle-xmark"},
	...{agregar: "fa-circle-plus", edicion: "fa-pen", eliminar: "fa-trash-can", guardar: "fa-floppy-disk"},

	// Secciones
	...{cargaArchs: "fa-file-circle-plus", panelControl: "fa-chart-simple"},
	...{config: "fa-gear", abmUsers: "fa-user-plus", usuario: "fa-user"},
	...{instituc: "fa-building-columns", mail: "fa-envelope"},

	// Otros
	vCorta: "fa-chevron-down",

	// Sin uso
	...{detalle: "fa-circle-info", rotar: "fa-rotate", hogar: "fa-home", ayuda: "fa-circle-question"},
	...{graficos: "fa-chart-line", chart: "fa-chart-pie", area: "fa-chart-area"},
};
for (const icono in iconos) iconos[icono] = faSolid + iconos[icono];
const iconosCA = {sinRegs: "➖", conError: "❌", pendGua: "💾", actualiz: "✅", eliminar: "⛔"};

module.exports = {
	...{unaHora, unDia, unAno},
	...{iconos, faSolid},

	// Menú de configuración
	menuConfig: [
		// Siempre
		{href: "fechas-clave-bloqueo", titulo: "Fechas clave", sinFcBloq: true},
		{href: "fechas-clave-desbloqueo", titulo: "Fechas clave", conFcBloq: true},
		{href: "maestro-de-movimientos", titulo: "Maestro de Movimientos"},
		{href: "maestro-de-depositos", titulo: "Maestro de Depósitos"},
		{href: "archivos-input", titulo: "Archivos Input"},

		// Sólo con FC_bloq
		{hr: true, conFcBloq: true},
		{href: "carga-de-archivos-bloqueo", titulo: "Carga de archivos", conFcBloq: true, sinCaBloq: true},
		{href: "carga-de-archivos-desbloqueo", titulo: "Carga de archivos", conFcBloq: true, conCaBloq: true},
	],

	// Carpetas de imágenes
	carpArchsCliente: path.join(carpRaiz, "archsCliente"),
	carpImgsProds: path.join(carpRaiz, "archsCliente", "1-productos"),
	carpCargaArchs: path.join(carpRaiz, "archsCliente", "2-cargaArchs"),
	carpProvisorio: path.join(carpRaiz, "archsCliente", "9-provisorio"), // carpeta donde se guardan las imágenes inicialmente

	// Validaciones
	inputVacio: "Necesitamos que completes este campo",
	selectVacio: "Necesitamos que elijas una opción",
	opcionInvalida: "La opción elegida tiene un valor inválido",
	radioVacio: "Necesitamos que elijas una opción",
	mailYaExistente: "El mail ya está usado por otro usuario",
	regDescon: "No reconocemos ese registro",
	codUsado: "Debe ser un código nuevo",
	descrUsada: "Debe ser una descripción nueva",
	iconosCA,
	mensajesCA: {
		[iconosCA.sinRegs]: "No tenés registros cargados para guardar",
		[iconosCA.conError]: "Los registros cargados tienen errores",
		[iconosCA.pendGua]: "Los registros cargados están listos para ser guardados",
		[iconosCA.actualiz]: "La tabla está actualizada",
		[iconosCA.eliminar]: "Eliminar (aparece luego de descargar)",
	},

	// Otras
	diasFinales: {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31},
	mesesAbrev: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
	requestsTriviales: ["WhatsApp", "Postman", "TelegramBot", "TwitterBot", "Zabbix"], // evita que se cuenten como visitas
	rutasSinValidar: ["/usuarios/login", "/usuarios/logout", "/cookies", "/session"],
	tamMaxArch: 1024000, // 1Mb
	loteTabla: 20,
	imgInstitucional: "/publico/Institucional.png",
	usAutom_id: 3,
	planAccionReserva_id: 1,
};
