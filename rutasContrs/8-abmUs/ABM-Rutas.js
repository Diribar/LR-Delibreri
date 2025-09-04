"use strict";
// Variables
const router = express.Router();
const API = require("./ABM-ControlApi");
const vista = require("./ABM-ControlVista");

// APIs
router.get("/api/alta", API.altaUsuario);
router.get("/api/edicion", API.edicUsuario);
router.get("/api/baja", API.bajaUsuario);

// Vistas - CRUD
router.get("/", vista.panel);

// Fin
module.exports = router;
