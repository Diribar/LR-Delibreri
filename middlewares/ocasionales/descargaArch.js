"use strict";
// Variables
const multer = require("multer");

// Guarda la imagen
module.exports = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => cb(null, carpProvisorio),
		filename: (req, file, cb) => cb(null, path.basename(file.originalname)),// Date.now() + path.extname(file.originalname)
	}),
	fileFilter: (req, file, cb) => {
		const tamArchivo = Number(req.headers["content-length"]);
		return cb(null, tamArchivo <= tamMaxArch);
	},
});
