"use strict";
// Variables
const router = express.Router();
const API = require("./MS-ControlApi");
const vista = require("./MS-ControlVista");

// Middlewares
const login = require("../../middlewares/ocasionales/login.js");

// APIs - Tablas
router.get("/api/ca-obtiene-valores-ya-en-bd", API.obtieneValsYaEnBd);
router.delete("/api/ca-elimina-todos-los-registros/", API.eliminaTodos);
router.put("/api/ca-actualiza-registros", API.actualizaRegs);
router.post("/api/ca-agrega-registros", API.agregaRegs);
router.put("/api/ca-actualiza-resultado", API.actualizaResult);
router.put("/api/ca-actualiza-demas", login, API.actualizaDemas);

// APIs - Otras
router.put("/api/cambia-el-rol-del-usuario", login, API.cambiaRolDelUsuario);

// Información para mostrar en el explorador
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);
router.get("/limpia-todo", vista.limpiaTodo);

// Fin
module.exports = router;
