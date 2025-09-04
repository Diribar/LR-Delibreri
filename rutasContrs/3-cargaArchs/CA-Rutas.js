"use strict";
// Variables
const router = express.Router();
const API = require("./CA-ControlApi.js");
const vista = require("./CA-ControlVista.js");

// Middlewares
const aFC_bloq = require("../../middlewares/validaciones/aFC_bloq.js");
const aPA_bloq = require("../../middlewares/validaciones/aCA_bloq.js");
const login = require("../../middlewares/ocasionales/login.js");

// Middlewares combinados
const apto = [aFC_bloq, aPA_bloq];

// APIs
router.get("/api/ca-obtiene-datos-iniciales", login, API.datosIniciales);
router.get("/api/ca-descarga-una-tabla", API.descargaUnaTabla);

// Vistas - CRUD
router.get("/", apto, vista.form);
router.post("/", apto, vista.guardar);

// Fin
module.exports = router;
