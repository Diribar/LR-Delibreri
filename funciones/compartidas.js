"use strict";
// Variables
const nodemailer = require("nodemailer");

// Exportar
module.exports = {
	// Usuarios
	obtieneUsuarioPorMail: (email) => baseDatos.obtienePorCondicion("usuarios", {email}, ["rol", "rolFijo", "statusReg"]),
	omitirMiddlewsTransv: (req) => {
		// Si es un url irrelevante
		if (req.originalUrl.includes("/api/")) return true;
		if (["/favicon.ico", "/cookies", "/session"].includes(req.originalUrl)) return true;
		if (req.originalUrl == "/.well-known/appspecific/com.chrome.devtools.json") return true;
		if (["/imgsProds/", "/imgsComp/"].some((n) => req.originalUrl.startsWith(n))) return true;

		// Si es una aplicación conocida que no es de navegación, pero que muestra datos del url visitado
		if (!req.headers["user-agent"] || requestsTriviales.some((n) => req.headers["user-agent"].startsWith(n))) return true;

		// Fin
		return false;
	},

	// Gestión de archivos
	gestionArchs: {
		existe: (rutaNombre) => rutaNombre && fs.existsSync(rutaNombre),
		elimina: (ruta, archivo, output) => FN.eliminaArch(ruta, archivo, output),
		mueve: function ({nombreOrigen, nombreDestino, carpOrigen, carpDestino}) {
			// Variables
			const rutaNombreOrigen = path.join(carpOrigen, nombreOrigen);
			const rutaNombreDestino = path.join(carpDestino, nombreDestino || nombreOrigen);

			// Si no existe la carpeta de destino, la crea
			if (!this.existe(carpDestino)) fs.mkdirSync(carpDestino);

			// Si no encuentra el archivo de origen, lo avisa
			if (!this.existe(rutaNombreOrigen)) console.log("No se encuentra el archivo " + rutaNombreOrigen + " para moverlo");
			// Mueve el archivo
			else
				fs.renameSync(rutaNombreOrigen, rutaNombreDestino, (error) => {
					if (error) throw error;
				});

			// Fin
			return;
		},
		copia: function (rutaNombreOrigen, rutaNombreDestino, carpDestino) {
			// Si no existe la carpeta de destino, la crea
			if (carpDestino && !this.existe(carpDestino)) fs.mkdirSync(carpDestino);

			// Si no existe el archivo de origen, lo avisa
			if (!this.existe(rutaNombreOrigen)) console.log("No se encuentra el archivo " + rutaNombreOrigen + " para copiarlo");
			// Si existe, lo copia o avisa el error
			else
				fs.copyFile(rutaNombreOrigen, rutaNombreDestino, (error) => {
					if (error) throw error;
				});

			// Fin
			return;
		},
		alAzar: (carpeta) => {
			// Obtiene el listado de archivos
			const archivos = fs.readdirSync(carpeta);

			// Elije al azar el n° de imagen
			const indice = parseInt(Math.random() * archivos.length);

			// Obtiene el nombre del archivo
			const alAzar = archivos[indice];

			// Fin
			return alAzar;
		},
		// Obtiene el archivo 'json'
		lecturaJson: function () {
			const rutaNombre = path.join(__dirname, "../variables", "variables.json");
			const existe = this.existe(rutaNombre);
			const lectura = existe ? fs.readFileSync(rutaNombre, "utf8") : null;
			const info = lectura ? JSON.parse(lectura) : {};

			// Fin
			return info;
		},
		actualizaJson: function (datos) {
			// Lee
			const lectura = this.lecturaJson();
			const guardado = {...lectura, ...datos};

			// Guarda la información actualizada
			const rutaNombre = path.join(__dirname, "../variables", "variables.json");
			fs.writeFileSync(rutaNombre, JSON.stringify(guardado), (err) =>
				err ? console.log("Actualiza variables JSON:", err, datos) : null
			);

			// Fin
			return;
		},
	},
	elimImgsSinRegEnBd: {
		obtieneLosAvatarPorEntEnBd: async ({entidad, status_id}) => {
			// Variables
			const condicion = {avatar: {[Op.and]: [{[Op.ne]: null}, {[Op.notLike]: "%/%"}]}};
			if (status_id) condicion.statusReg_id = status_id;

			// Obtiene los registros
			const registros = await baseDatos.obtieneTodosPorCondicion(entidad, condicion).then((n) =>
				n.map((m) => ({
					id: m.id,
					nombreArchivo: m.avatar,
					nombreReg: m.nombre || m.nombreCastellano || m.nombreOriginal,
					entidad,
				}))
			);

			// Fin
			return registros;
		},
		eliminaLasImagenes: ({carpeta, nombresArchsEnBd, avatarsEnBd}) => {
			// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
			const nombresArchsEnDisco = fs.readdirSync(carpeta);

			// Rutina para borrar archivos cuyo nombre no está en BD
			for (let nombreArchEnDisco of nombresArchsEnDisco)
				if (!nombresArchsEnBd.includes(nombreArchEnDisco)) FN.eliminaArch(carpeta, nombreArchEnDisco);

			// Rutina para detectar nombres de BD sin archivo
			for (let avatarEnBd of avatarsEnBd)
				if (!nombresArchsEnDisco.includes(avatarEnBd.nombreArchivo)) {
					const mensaje1 = "Archivo no encontrado: " + path.join(carpeta, avatarEnBd.nombreArchivo);
					const mensaje2 = "(" + (avatarEnBd.nombreReg || avatarEnBd.id) + " - " + avatarEnBd.entidad + ")";
					console.log(mensaje1, mensaje2);
				}

			// Fin
			return;
		},
	},
	validaImagen: ({avatar, tamano}) => {
		// Variables
		const ext = path.extname(avatar).toLowerCase();

		// Respuesta
		const respuesta = !ext // Valida la extensión
			? "El archivo debe tener alguna extensión"
			: ![".jpg", ".jpeg", ".png"].includes(ext)
			? "Usaste un archivo con la extensión '" +
			  ext.slice(1).toUpperCase() +
			  "'. Las extensiones válidas son JPG, JPEG y PNG"
			: !tamano
			? "El archivo no tiene tamaño"
			: tamano > tamMaxArch // Valida el tamaño
			? "El archivo tiene " + Math.ceil((tamano / tamMaxArch) * 100) / 100 + " MB. Necesitamos que no supere 1 MB"
			: "";

		// Fin
		return respuesta;
	},
	validacs: {
		// Texto
		texto: function (dato) {
			return (
				(!dato && inputVacio) ||
				this.longitud(dato, 2, 30) ||
				this.castellano.basico(dato) ||
				this.inicial.basico(dato) ||
				""
			);
		},
		longitud: (dato, corto, largo) =>
			dato.length < corto
				? "El contenido debe ser más largo"
				: dato.length > largo
				? "El contenido debe ser más corto"
				: "",
		castellano: {
			basico: (dato) => {
				let formato = /^[a-záéíóúüñ ,.'\-]+$/i;
				return !formato.test(dato) ? "Sólo se admiten letras del abecedario castellano" : "";
			},
			completo: (dato) => {
				let formato = /^[a-záéíóúüñ ,.'&$:;…"°¿?¡!+/()\d\-]+$/i;
				return !formato.test(dato) ? "Sólo se admiten letras del abecedario castellano" : "";
			},
		},
		inicial: {
			basico: (dato) => {
				let formato = /^[A-ZÁÉÍÓÚÜÑ]/;
				return !formato.test(dato) ? "La primera letra debe ser en mayúscula" : "";
			},
			completo: (dato) => {
				let formato = /^[A-ZÁÉÍÓÚÜÑ¡¿"\d]/;
				return !formato.test(dato) ? "La primera letra debe ser en mayúscula" : "";
			},
			sinopsis: (dato) => {
				let formato = /^[A-ZÁÉÍÓÚÜÑ¡¿"\d]/;
				return !formato.test(dato) ? "La primera letra debe ser en mayúscula" : "";
			},
		},
		// Otros
		email: (email) => {
			const formato = /^\w+([\.-_]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			return !email
				? "Necesitamos que escribas una dirección de correo electrónico"
				: !formato.test(email)
				? "Necesitamos que escribas un formato válido de correo electrónico"
				: "";
		},
		contrasena: (contrasena) =>
			!contrasena
				? "Necesitamos que escribas una contraseña"
				: contrasena.length != 6
				? "La contraseña debe tener 6 caracteres"
				: "",
		avatar: (datos) => {
			// Variables
			const {avatarUrl, tamano, esImagen, imgOpcional} = datos;
			const avatar = datos.avatar || avatarUrl || "";
			const ext = avatar ? path.extname(avatar).toLowerCase() : "";

			// Respuesta
			const respuesta = avatar // Mensajes si existe un avatar
				? esImagen == "NO" // Valida si es una imagen
					? "El archivo no es una imagen"
					: !ext // Valida la extensión
					? "El archivo debe tener alguna extensión"
					: ![".jpg", ".png", ".jpeg"].includes(ext)
					? "Usaste un archivo con la extensión '" +
					  ext.slice(1).toUpperCase() +
					  "'. Las extensiones válidas son JPG, JPEG y PNG"
					: tamano && tamano > tamMaxArch // Valida el tamaño
					? "El archivo tiene " + Math.ceil((tamano / tamMaxArch) * 100) / 100 + " MB. Necesitamos que no supere 1 MB"
					: ""
				: imgOpcional == "NO" || imgOpcional === false // Mensajes si no existe un avatar
				? "Necesitamos que agregues una imagen"
				: "";

			// Fin
			return respuesta;
		},
	},
	formatoTablaDescarga: (hoja, datos, campos) => {
		// Define las columnas
		hoja.columns = campos.map((campo) => ({header: comp.letras.inicialMayus(campo), key: campo}));

		// Aplica estilos a la cabecera
		const encabezado = hoja.getRow(1);
		encabezado.eachCell((cell) => {
			cell.font = {bold: true, color: {argb: "FF000000"}};
			cell.fill = {type: "pattern", pattern: "solid", fgColor: {argb: "FFBFBFBF"}};
			cell.border = {bottom: {style: "thin"}};
		});

		// Agrega las filas
		if (datos.length) hoja.addRows(datos);

		// Les ajusta el ancho y convierte los 'decimals' en números
		hoja.columns.forEach((columna) => {
			// Variables
			const {key} = columna;
			let max = 0;

			// Formato de la columna costoUnit
			if (["cantidad", "Cant."].includes(key)) columna.numFmt = "#,##0";
			if (["costoUnit", "Costo Unit."].includes(key)) columna.numFmt = '"$" * #,##0.00';
			if (key == "Valor Total") columna.numFmt = '"$" * #,##0';

			// Recorrido por celda
			columna.eachCell((celda, i) => {
				// Ancho
				const v = celda.value ? celda.value.toString() : "";
				if (v.length > max) max = v.length;

				// Formato costoUnit
				if (["costoUnit", "Costo Unit.", "Valor"].includes(key) && i > 1) celda.value = Number(celda.value);
			});
			columna.width = max + 2;
		});

		// Aplica autofiltros
		const primCelda = encabezado.getCell(1)._address;
		const ultCelda = encabezado.getCell(encabezado.cellCount)._address; // resta '1', por la columna eliminada
		hoja.autoFilter = {from: primCelda, to: ultCelda};

		// Fija la primera fila
		hoja.views = [{state: "frozen", ySplit: 1}];

		// Fin
		return;
	},

	// Varias
	letras: {
		convierteAlCastell: function (objeto) {
			// Rutina por campo
			for (let prop in objeto)
				if (typeof objeto[prop] == "string") objeto[prop] = this.convierteAlCastell_campo(objeto[prop]);
				else if (objeto[prop] === undefined) delete objeto[prop];

			// Fin
			return objeto;
		},
		convierteAlCastell_campo: (valor) => {
			return valor
				.replace(/á/g, "á") // letras del castellano mal escritas
				.replace(/é/g, "é")
				.replace(/í/g, "í")
				.replace(/ó/g, "ó")
				.replace(/ñ/g, "ñ")

				.replace(/[ÀÂÃÄÅĀĂĄ]/g, "A") // letras de otros idiomas
				.replace(/[àâãäåāăą]/g, "a")
				.replace(/Æ/g, "Ae")
				.replace(/æ/g, "ae")
				.replace(/ß/g, "b")
				.replace(/[ÇĆĈĊČ]/g, "C")
				.replace(/[çćĉċč]/g, "c")
				.replace(/[ÐĎĐ]/g, "D")
				.replace(/[đď]/g, "d")
				.replace(/[ÈÊËĒĔĖĘĚ]/g, "E")
				.replace(/[èêëēĕėęě]/g, "e")
				.replace(/[ĜĞĠĢ]/g, "G")
				.replace(/[ĝğġģ]/g, "g")
				.replace(/[ĦĤ]/g, "H")
				.replace(/[ħĥ]/g, "h")
				.replace(/[ÌÎÏĨĪĬĮİ]/g, "I")
				.replace(/[ìîïĩīĭįıï]/g, "i")
				.replace(/Ĳ/g, "Ij")
				.replace(/ĳ/g, "ij")
				.replace(/Ĵ/g, "J")
				.replace(/ĵ/g, "j")
				.replace(/Ķ/g, "K")
				.replace(/[ķĸ]/g, "k")
				.replace(/[ĹĻĽĿŁ]/g, "L")
				.replace(/[ĺļľŀł]/g, "l")
				.replace(/м/g, "m")
				.replace(/[ŃŅŇ]/g, "N")
				.replace(/[ńņňŉй]/g, "n")
				.replace(/[ÒÔÕŌŌŎŐ]/g, "O")
				.replace(/[òôõōðōŏőöø]/g, "o")
				.replace(/[ÖŒ]/g, "Oe")
				.replace(/[œ]/g, "oe")
				.replace(/[ŔŖŘ]/g, "R")
				.replace(/[ŕŗřг]/g, "r")
				.replace(/[ŚŜŞŠ]/g, "S")
				.replace(/[śŝşšș]/g, "s")
				.replace(/[ŢŤŦȚГ]/g, "T")
				.replace(/[țţťŧ]/g, "t")
				.replace(/[ÙÛŨŪŬŮŰŲ]/g, "U")
				.replace(/[ùûũūŭůűų]/g, "u")
				.replace(/Ŵ/g, "W")
				.replace(/[ŵш]/g, "w")
				.replace(/[ÝŶŸ]/g, "Y")
				.replace(/[ýŷÿ]/g, "y")
				.replace(/[ŽŹŻŽ]/g, "Z")
				.replace(/[žźżž]/g, "z")
				.replace(/[“”«»]/g, '"')
				.replace(/[‘’`]/g, "'")
				.replace(/[º]/g, "°")
				.replace(/[®​​#]/g, "")
				.replace(/–/g, "-")
				.replace("[", "(")
				.replace("]", ")")
				.replace(/[\t\n\r]/g, " ") // previene el uso de 'tab' y 'return'
				.replace(/[  ]/g, " ") // previene el uso de espacios 'raros'
				.replace(/ +/g, " "); // previene el uso de varios espacios
		},
		inicialMayus: (texto) => texto.slice(0, 1).toUpperCase() + texto.slice(1),
	},
	fechas: {
		"aaaa-mm-dd": (fecha) => new Date(FN.obtieneFechaLocal(fecha)).toLocaleDateString("en-CA"),
		"dd/mmm/aaaa": (fecha) =>
			new Date(FN.obtieneFechaLocal(fecha)).toLocaleDateString("es-ES", formatoFecha).replaceAll(" ", "/"),
		"dd/mmm/aa": function (fecha) {
			const fechaLarga = this["dd/mmm/aaaa"](fecha);
			return fechaLarga.slice(0, 7) + fechaLarga.slice(-2);
		},
		"d/mmm/aa": (fecha) =>
			fecha
				.split("-")
				.reverse()
				.map((p, i) => (i == 0 ? Number(p) : i == 1 ? mesesAbrev[Number(p) - 1] : p.slice(2)))
				.join("/"),
		"mmm/aa": function (fecha) {
			const fechaLarga = this["dd/mmm/aaaa"](fecha);
			return fechaLarga.slice(3, 7) + fechaLarga.slice(-2);
		},
		nueva: function ({fecha, mesesDif, diasDif, codPlazo}) {
			// Variables
			fecha = this["aaaa-mm-dd"](fecha);
			const [anoInicial, mesInicial, diaInicial] = fecha.split("-").map((n) => Number(n));
			mesesDif = codPlazo ? auxPlazos.find((n) => n.codigo == codPlazo).meses : mesesDif;

			// Obtiene el mes final
			let diaFinal = diaInicial + (diasDif || 0);
			let mesFinal = mesInicial + (mesesDif || 0);
			let anoFinal = anoInicial;

			// Correcciones por el mes
			anoFinal += mesFinal > 12 ? 1 : mesFinal < 1 ? -1 : 0;
			mesFinal += mesFinal > 12 ? -12 : mesFinal < 1 ? 12 : 0;

			// Correcciones para último día del mes - sólo para saltos entre meses
			if (diaInicial == diasFinales[mesInicial] && !diasDif) diaFinal = diasFinales[mesFinal];

			// Obtiene la fecha fin
			const fechaFin = comp.fechas["aaaa-mm-dd"](new Date(anoFinal, mesFinal - 1, diaFinal)); // se le resta uno porque los meses van del 0 al 11

			// Fin
			return fechaFin;
		},
		diasDif: (fechaInicio, fechaFin) => Math.round((new Date(fechaFin || new Date()) - new Date(fechaInicio)) / unDia),
	},
	enviaMail: async ({nombre, email, asunto, comentario}) => {
		// Variables
		const {host, puerto, direccion: user, contrasena: pass} = credenciales.mail;
		const datosTransporte = {host, port: Number(puerto), auth: {user, pass}, secure: true}; // secure: true for 465, false for other ports
		const transporte = nodemailer.createTransport(datosTransporte);
		const datos = {
			from: nombre + " <" + user + ">",
			to: email,
			subject: asunto,
			html: comentario,
		};
		let mailEnviado = "No pudimos enviar el mail";

		// Envío del mail
		await transporte
			.sendMail(datos)
			.then(() => (mailEnviado = true))
			.catch((error) => console.log("Mail no enviado. ", error));

		// Fin
		return mailEnviado;
	},
	variablesSemanales: function () {
		FN.primerLunesDelAno();

		// Otras variables
		semanaUTC = parseInt((Date.now() - primerLunesDelAno) / unDia / 7) + 1;
		lunesDeEstaSemana = primerLunesDelAno + (semanaUTC - 1) * unaSemana;

		// Fin
		return;
	},
	moneda: (valor) => {
		// Variables
		const mil = 1000;
		const unMillon = mil * mil;

		// Si corresponde, convierte en miles o millones
		if (Math.abs(valor) >= unMillon) valor = (Math.round((valor / unMillon) * 10) / 10).toFixed(1) + "M";
		else if (Math.abs(valor) >= mil * 100) valor = (Math.round((valor / unMillon) * 10) / 10).toFixed(1) + "M";
		else if (Math.abs(valor) >= mil) valor = (Math.round((valor / mil) * 10) / 10).toFixed(1) + "K";

		// Si es mayor a mil y tiene 2 o más dígitos enteros, quita el decimal
		if (String(valor).replace("-", "").length > 5 && valor.indexOf(".") > -1) {
			// Obtiene el valor redondeado
			let nuevoValor = parseFloat(valor);
			nuevoValor = Math.round(nuevoValor);

			// Le agrega el caracter
			const caracter = valor.slice(-1);
			if (["M", "K"].includes(caracter)) nuevoValor += caracter;

			// Actualiza el valor
			valor = nuevoValor;
		}

		// Fin
		return valor;
	},
};

// Variables
const formatoFecha = {day: "2-digit", month: "short", year: "numeric"};
const milisegsUTC = new Date().getTimezoneOffset() * 60 * 1000; // Obtiene la diferencia en milisegs respecto a UTC

// Funciones
const FN = {
	eliminaArch: (ruta, archivo) => {
		// Arma el nombre del archivo
		const rutaNombre = path.join(ruta, archivo);

		// Se fija si encuentra el archivo
		if (rutaNombre && fs.existsSync(rutaNombre)) {
			const queEs = fs.statSync(rutaNombre);
			if (queEs.isFile()) {
				fs.unlinkSync(rutaNombre); // Borra el archivo
				console.log("Archivo '" + rutaNombre + "' borrado"); // Avisa que lo borra
			} else if (queEs.isDirectory()) {
				fs.rmdirSync(rutaNombre); // Borra el directorio
				console.log("Carpeta '" + rutaNombre + "' borrada"); // Avisa que lo borra
			}
		}
		// Mensaje si no lo encuentra
		else console.log("Archivo/Carpeta " + rutaNombre + " no encontrado para borrar");

		// Fin
		return;
	},
	obtieneFechaLocal: (fecha) =>
		fecha
			? typeof fecha == "string"
				? new Date(fecha).getTime() + milisegsUTC // convierte el horario UTC en local (ej: 0hs UTC --> 21hs local + 3hs = 24hs local)
				: new Date(fecha) // para fecha en otro formato
			: new Date(),
};
