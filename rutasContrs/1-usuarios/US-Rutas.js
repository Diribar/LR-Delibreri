"use strict";
// Variables
const router = express.Router();
const API = require("./US-ControlApi");
const vista = require("./US-ControlVista");

// Middlewares - Login
const loginSinErrores = require("../../middlewares/validaciones/US-loginSinErrores");
const envioContrasena = require("../../middlewares/validaciones/US-envioContrasena");

// Middlewares - Datos personales
const statusMailValidado = require("../../middlewares/validaciones/US-statusMailValidado");
const obtieneDatos = require("../../middlewares/ocasionales/US-obtieneDatos");
const validaDatosPers = require("../../middlewares/validaciones/US-datosPers");

// APIs - Login
router.get("/api/us-valida-email", API.validaMail);
router.get("/api/us-valida-contrasena", API.validaContr);
router.get("/api/us-envio-de-contrasena", envioContrasena, API.envioDeContr);

// APIs - Completa datos
router.get("/api/us-valida-nombreCompl", API.validaNombreCompl);
router.get("/api/us-valida-apodo", API.validaApodo);

// Vistas - Login
router.get("/login", vista.login.form);
router.post("/login", loginSinErrores, vista.login.guardar);
router.get("/logout", vista.login.logout);

// Vistas - CRUD
router.get("/completa-datos", statusMailValidado, obtieneDatos, vista.completaDatos.form);
router.post("/completa-datos", validaDatosPers, vista.completaDatos.guardar);

// Fin
module.exports = router;
