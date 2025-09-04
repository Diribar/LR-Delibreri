"use strict";
// Variables
const router = express.Router();
const API = require("./PLR-ControlApi.js");
const vista = require("./PLR-ControlVista.js");

// Middlewares
const validacs = require("../../middlewares/validaciones/PLR-datosApi.js");
const aFC_bloq = require("../../middlewares/validaciones/aFC_bloq.js");
const aCA_bloq = require("../../middlewares/validaciones/aCA_bloq.js");
const etiqActiva = require("../../middlewares/ocasionales/etiqActiva.js");
const login = require("../../middlewares/ocasionales/login.js");

// Middlewares combinados
const apto = [aFC_bloq, aCA_bloq];

// APIs - Gráficos
router.get("/api/gr-por-periodo", API.graficos.porPeriodo);
router.get("/api/gr-por-antiguedad", API.graficos.porAntig);

// APIs - Planes de Acción - GET
router.get("/api/pa-datos-iniciales", API.planesAccion.datosIniciales);
router.get("/api/pa-obtiene-productos", API.planesAccion.obtieneProductos);
router.get("/api/pa-descarga-productos", API.planesAccion.descargaProds);
router.get("/api/pa-obtiene-planes-accion", API.planesAccion.obtienePlanesAccion);

// APIs - Planes de Acción - PUT
router.get("/api/pa-actualiza-productos", login, API.planesAccion.actualizaProds);
router.get("/api/pa-actualiza-planes-accion", login, API.planesAccion.actualizaPlanes);

// Vistas - CRUD
router.get("/", apto, etiqActiva, vista.form);

// Fin
module.exports = router;
