"use strict";
// Variables
const router = express.Router();
const API = require("./CFG-ControlApi.js");
const vista = require("./CFG-ControlVista.js");

// Middlewares - Métodos y Fechas Clave
const aFC_bloq = require("../../middlewares/validaciones/aFC_bloq.js");
const aFC_desbl = require("../../middlewares/validaciones/CFG-aFC_desbl.js");
const aCA_bloq = require("../../middlewares/validaciones/aCA_bloq.js");
const aCA_desbl = require("../../middlewares/validaciones/CFG-aCA_desbl.js");
const FC_sinErrores = require("../../middlewares/validaciones/FC_sinErrores.js");
const panelSinErrores = require("../../middlewares/validaciones/CFG-panelSinErrores.js");
const login = require("../../middlewares/ocasionales/login.js");

// Middlewares combinados
const FC_aptoPost = [aFC_desbl, FC_sinErrores];
const CA_aptoPost = [aFC_bloq, panelSinErrores];

// Siempre - Fechas clave
router.get("/api/fc-datos-inciales", API.fechasClave.datosIniciales);
router.get("/api/fc-valida", API.fechasClave.valida);
router.get("/fechas-clave-bloqueo", aFC_desbl, vista.fechasClave.form);
router.get("/fechas-clave-desbloqueo", aFC_bloq, vista.fechasClave.form);
router.post("/fechas-clave-bloqueo", FC_aptoPost, vista.fechasClave.bloqueo);
router.post("/fechas-clave-desbloqueo", aFC_bloq, vista.fechasClave.desbloqueo);

// Siempre - Maestro de Movimientos
router.get("/api/mdm-alta", login, API.maestroMovs.alta);
router.get("/api/mdm-edicion", login, API.maestroMovs.edicion);
router.get("/api/mdm-baja", API.maestroMovs.baja);
router.get("/maestro-de-movimientos", vista.maestroMovs);

// Siempre - Maestro de Depósitos
router.get("/api/mdp-alta", login, API.maestroDeps.alta);
router.get("/api/mdp-edicion", login, API.maestroDeps.edicion);
router.get("/api/mdp-baja", API.maestroDeps.baja);
router.get("/maestro-de-depositos", vista.maestroDeps);

// Siempre - Archivos input
router.get("/api/ai-alta", login, API.archsInput.alta);
router.get("/api/ai-edicion", API.archsInput.edicion);
router.get("/api/ai-baja", API.archsInput.baja);
router.get("/archivos-input", vista.archsInput);

// Depende - Carga de Archivos - GET
router.get("/api/ca-obtiene-datos-iniciales", login, API.cargaArchs.datosInicialesCa);
router.get("/api/ca-descarga-una-tabla", API.cargaArchs.descargaUnaTabla);
router.get("/carga-de-archivos-bloqueo", aCA_desbl, aFC_bloq, vista.cargaArchs.form);
router.get("/carga-de-archivos-desbloqueo", aCA_bloq, aFC_bloq, vista.cargaArchs.form);

// Depende - Carga de Archivos - POST
router.post("/carga-de-archivos-bloqueo", aCA_desbl, CA_aptoPost, vista.cargaArchs.bloqueo);
router.post("/carga-de-archivos-desbloqueo", aCA_bloq, aFC_bloq, vista.cargaArchs.desbloqueo);

// Fin
module.exports = router;
