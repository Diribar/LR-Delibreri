"use strict";

window.addEventListener("load", async () => {
	// Variables
	const DOM = {
		// Campos generales
		marcoGrande: document.querySelector("#marcoGrande"),

		// Campos a la izquierda
		dropArea: document.querySelector("#izquierda #dropArea"),
		botonInput: document.querySelector("#dropArea button"),
		input: document.querySelector("#dropArea input"),
		statusArch: document.querySelector("#izquierda #statusArch"),

		// Campos a la derecha - tabla
		nombresTablaRegs: document.querySelectorAll("tbody .nombreTablaRegs"),
		resultadosBe: document.querySelectorAll("tbody #resultadoBe"),
		desde: document.querySelectorAll("tbody #desde"), // el nombre debe coincidir con el campo de la BD
		hasta: document.querySelectorAll("tbody #hasta"), // el nombre debe coincidir con el campo de la BD
		actualizadoPor: document.querySelectorAll("tbody #actualizadoPor"), // el nombre debe coincidir con el campo de la BD
		actualizadoEn: document.querySelectorAll("tbody #actualizadoEn"), // el nombre debe coincidir con el campo de la BD

		// Campos a la derecha - otros
		botonSubmit: document.querySelector("#derecha form"),
	};
	const v = {
		...(await fetch(rutas.datosInics).then((res) => res.json())),
		mouseEntrada: ["dragenter", "dragover"],
		mouseSalida: ["dragleave", "drop"],
		nombresTablaRegs: [...DOM.nombresTablaRegs].map((n) => n.id),
	};
	if (v.fechasEjercs) v.fechasEjercs.pop(); // el inEj3 es innecesario
	let tipoTablaElegido, tipoTabla_id;
	let errorFe, tablaErrores, tablaGuardar, mensajes;

	// Funciones
	const novsEnInput = {
		consolidado: async function (archivo) {
			// Si está inactivo, interrumpe la función
			if (DOM.dropArea.className.includes("inactivo")) return;
			DOM.dropArea.classList.add("inactivo");
			DOM.botonInput.classList.add("inactivo");
			DOM.botonSubmit.classList.add("ocultar");

			// Empieza un despliegue nuevo
			auxiliares.agregaMensParrafo("✅ Archivo recibido: <b>" + archivo.name + "</b>", true);

			// Procesos
			await this.procesos(archivo);

			// Fin
			DOM.dropArea.classList.remove("inactivo");
			DOM.botonInput.classList.remove("inactivo");
			return;
		},
		procesos: async (archivo) => {
			// Validaciones
			const validacsOk = await validaciones.consolidado(archivo);

			// Procesos
			if (validacsOk) {
				// Variables
				mensajes = [];

				// Procesos
				await descartes.consolidado();
				await procesosSinErrorFe.consolidado();

				// Mensajes
				if (mensajes.length == 1) auxiliares.agregaMensParrafo(mensajes[0]);
				else auxiliares.agregaMensLista(mensajes);
				auxiliares.agregaMensParrafo("✅ El tablero fue actualizado");
			}
			// Si se encontraron errores
			else await descargaLosErrores();

			// Fin
			return;
		},
	};

	// Camino feliz
	const validaciones = {
		consolidado: async function (archivo) {
			// Variables
			let archCargado, archElegido, solapaActiva;

			// Validaciones - Es Excel
			({errorFe, archCargado} = await this.esExcel(archivo));
			if (errorFe) return;

			// Validaciones - Identifica el tipo de tabla
			({errorFe, archElegido, solapaActiva} = await this.identificaElTipoTabla_id(archCargado));
			if (errorFe) return;

			// Validaciones - Se fija si el tipo de archivo se usa en esta vista
			errorFe = await this.tipoArchivoUtil(archElegido);
			if (errorFe) return;

			// Validaciones - Revisa si los registros tienen errores
			errorFe = this.revisaErrores({solapaActiva, archElegido});
			if (errorFe) return;

			// Fin
			return true;
		},
		esExcel: async (archivo) => {
			// 1a condición
			if (archivo.type != tipoXlsx) {
				auxiliares.agregaMensParrafo("❌ No es un archivo tipo Excel");
				return {errorFe: true};
			}

			// 2a condición
			const datos = await archivo.arrayBuffer();
			const archCargado = XLSX.read(datos, {type: "array", cellDates: true});
			if (!archCargado || !archCargado.Sheets || archCargado.bookType != "xlsx") {
				auxiliares.agregaMensParrafo("❌ No es un archivo tipo Excel válido");
				return {errorFe: true};
			}

			// 3a condición
			if (!archCargado.Workbook.WBView.length) {
				auxiliares.agregaMensParrafo("❌ Primero tenés que abrir y guardar el archivo en Excel");
				return {errorFe: true};
			}

			// Fin
			return {archCargado};
		},
		identificaElTipoTabla_id: async (archCargado) => {
			// Variables
			const tiposTabla_id = v.tablas.map((n) => n.tipoTabla_id);
			let archElegido;

			// Obtiene la solapa activa
			const numSolapaActiva = archCargado.Workbook.WBView[0].activeTab; // n° de la solapa activa
			const nombreSolapaActiva = archCargado.SheetNames[numSolapaActiva]; // nombre de la solapa activa
			const solapaActiva = archCargado.Sheets[nombreSolapaActiva];

			// Identifica el archElegido
			for (const archivo of v.archsCabecera) {
				// Obtiene el texto de la celda clave
				const celda = archivo.distintCol + archivo.distintFila;
				const contCelda = solapaActiva[celda];

				// Si el texto incluye el distintTexto, actualiza 'archElegido'
				if (contCelda && contCelda.t == "s" && contCelda.v.includes(archivo.distintTexto)) {
					archElegido = archivo;
					break;
				}
			}

			// Mensaje de errorFe si no se encuentra ningún archElegido
			if (!archElegido) {
				// Se fija si el tipoTabla_id se encuentra en el nombre de la hoja
				if (tiposTabla_id.find((n) => n == nombreSolapaActiva)) {
					// Variables
					const relacCamposTablaArch = {};
					const tipoTablaCampos = v.tiposTablaCampos.filter((n) => n.tipoTabla_id == nombreSolapaActiva);

					// Arma la información
					for (const tipoTabla of tipoTablaCampos)
						relacCamposTablaArch[tipoTabla.campo] = inicialMayus(tipoTabla.campo);
					archElegido = {tipoTabla_id: nombreSolapaActiva, filaEncab: 1, relacCamposTablaArch};
				}

				// Acciones si no se reconoce el archivo
				else {
					auxiliares.agregaMensParrafo("❌ No se pudo identificar el archivo");
					return {errorFe: true};
				}
			}

			// Identifica la tabla
			tipoTablaElegido = v.tiposTablaCabecera.find((n) => n.id == archElegido.tipoTabla_id);
			if (!tipoTablaElegido) {
				auxiliares.agregaMensParrafo("❌ No se pudo identificar el tipo de tabla"); // debería ser un errorFe de las tablas CGF
				return {errorFe: true};
			}

			// Variables globales
			tipoTabla_id = tipoTablaElegido.id;

			// Agrega texto
			auxiliares.agregaMensParrafo(`✅ El tipo de archivo es: <b>${tipoTablaElegido.descripcion}</b>`);

			// Fin
			return {archElegido, solapaActiva};
		},
		tipoArchivoUtil: (archElegido) => {
			// Variables
			const tiposTabla_id = v.tablas.map((n) => n.tipoTabla_id);

			// Averigua si el tipo de archivo se usa en esta vista
			const errorFe = !tiposTabla_id.find((n) => n == archElegido.tipoTabla_id) ? true : false;
			if (errorFe) auxiliares.agregaMensParrafo("❌ Este tipo de archivo no se usa en esta vista");

			// Fin
			return errorFe;
		},
		revisaErrores: ({solapaActiva, archElegido}) => {
			// Variables
			tablaGuardar = [];
			tablaErrores = [];
			let {relacCamposTablaArch} = archElegido;

			// 1. RELACIÓN DE NOMBRES DE CAMPOS - obtiene la relación de nombres de campo, entre la tabla y el archivo
			if (!relacCamposTablaArch) {
				relacCamposTablaArch = {};
				v.archsRelacsCampo
					.filter((n) => n.archivo_id == archElegido.id) // obtiene los campos del archivo
					.map((n) => (relacCamposTablaArch[n.campoTabla] = n.campoArch)); // crea el objeto
			}

			// 2. CARACTERÍSTICAS POR CAMPO - obtiene las características que debe cumplir cada campo de la tabla
			const caracsPorCampo = v.tiposTablaCampos.filter((n) => n.tipoTabla_id == tipoTabla_id);

			// 3. REVISA LOS ERRORES Y CREA LOS REGISTROS A GUARDAR EN UNA TABLA
			const regsArch = XLSX.utils.sheet_to_json(solapaActiva, {range: archElegido.filaEncab - 1}); // la fila en la que está el encabezado
			let i = 0;
			for (const regArch of regsArch) {
				// Variables
				i++;
				const fila = "Fila " + (i + archElegido.filaEncab) + ": ";
				const regTabla = {};
				let errorFe;

				// Recorre el registro horizontalmente
				for (const campoTabla in relacCamposTablaArch) {
					// Variables
					const caracsDelCampo = caracsPorCampo.find((n) => n.campo == campoTabla);
					const {esCritico, formato, largoMax} = caracsDelCampo;
					const campoArch = relacCamposTablaArch[campoTabla];
					let valor = regArch[campoArch];

					// El valor es nulo
					if (!valor) {
						// El valor es crítico
						if (esCritico) errorFe = mensajesError.vacio(campoArch);
					}

					// Arreglos y errores para el formato 'número'
					else if (formato == "número") {
						// Valida que sea un número
						valor = Number(valor);
						if (Number.isNaN(valor)) errorFe = mensajesError.formato(campoArch);
						// Valida la longitud
						else {
							valor = Math.round(valor * 100) / 100;
							const texto = String(valor).split(".");
							if (texto[0] && texto[0].length > largoMax) errorFe = mensajesError.largoMax(campoArch, largoMax);
						}
					}

					// Arreglos y errores para el formato 'fecha'
					else if (formato == "fecha") {
						// Formato inválido
						if (new Date(valor) == "Invalid Date") errorFe = mensajesError.formato(campoArch);
						// Fecha inválida
						else {
							// Variables
							valor = fechas["aaaa-mm-dd"](valor);
							if (tipoTabla_id == "reserva" && valor > v.FC_fin)
								errorFe = mensajesError.fechaCierreEjerc(campoArch);
						}
					}
					// Arreglos y errores para el formato texto
					else if (formato == "texto") {
						// Convierte en texto
						valor = String(valor);

						// Valida la longitud
						if (campoTabla == "deposito_id") {
							regTabla.posicion = valor;
							valor = valor.split("-")[0]; // Obtiene la nave
						} else if (["descripcion", "proveedor", "familia"].includes(campoTabla)) {
							// Estandariza el 'case'
							valor = estandarizaProv(valor);
							valor = uneSiglas(valor);
							valor = reemplsProv(valor);
							valor = valor.toUpperCase();
						}
						if (valor.length > largoMax) errorFe = mensajesError.largoMax(campoArch, largoMax);
					}
					// Error formato desconocido
					else errorFe = mensajesError.formatoDescon(campoArch);

					// Si es un código de MOVIMIENTO, revisa que sea conocido
					if (!errorFe && campoTabla == "movim_id" && !v.movsIds.includes(String(valor)))
						errorFe = "No reconocemos el código de movimiento " + valor;

					// Si es un código de DEPÓSITO, revisa que sea conocido
					if (!errorFe && campoTabla == "deposito_id" && !v.depsIds.includes(String(valor)))
						errorFe = "No reconocemos el código de depósito " + valor;

					// Si el registro ya tiene un errorFe, deja de recorrerlo horizontalmente
					if (errorFe) break;

					// Agrega el método de la tabla con el valor del archivo
					regTabla[campoTabla] = valor;
				}

				// Detecta repetidos - id
				if (
					!errorFe &&
					["mProvs", "mFams"].includes(tipoTabla_id) &&
					tablaGuardar.find((n) => n.id.toLowerCase() == regTabla.id.toLowerCase())
				)
					errorFe = mensajesError.repetido(relacCamposTablaArch.id);

				// Detecta repetidos - descripción
				if (
					!errorFe &&
					["mProvs", "mFams", "mProds"].includes(tipoTabla_id) &&
					tablaGuardar.find((n) => n.descripcion.toLowerCase() == regTabla.descripcion.toLowerCase())
				)
					errorFe = mensajesError.repetido(relacCamposTablaArch.descripcion);

				// Detecta repetidos - código de producto
				if (!errorFe && tipoTabla_id == "mProds" && tablaGuardar.find((n) => n.codProd == regTabla.codProd))
					errorFe = mensajesError.repetido(relacCamposTablaArch.codProd);

				// Detecta repetidos - combo codProd + posición
				if (
					!errorFe &&
					tipoTabla_id == "stock" &&
					tablaGuardar.find((n) => n.codProd == regTabla.codProd && n.posicion == regTabla.posicion)
				)
					errorFe = mensajesError.comboRepetido(relacCamposTablaArch.codProd, relacCamposTablaArch.deposito_id);

				// Contador de errores
				if (errorFe) {
					tablaErrores.push(fila + errorFe);
					if (tablaErrores.length == maxCantErrores) break;
					continue;
				}

				// Agrega el registro al consolidado
				tablaGuardar.push(regTabla);
			}

			// 4. Agrega texto
			if (tablaErrores.length) auxiliares.agregaMensParrafo("❌ Se encontraron errores");

			// Fin
			return !!tablaErrores.length;
		},
	};
	const descartes = {
		consolidado: async function () {
			// Acciones si el tipo de tabla es 'movs'
			if (tipoTabla_id == "movs") {
				this.fueraRangoEjercicio(); // descarta los registros fuera del rango de fechas
				this.depNoEsLr(); // descarta los registros que no son de depósitos LR
				this.movsNecesarios(); // descarta los registros que no son de ingreso/egreso
			}

			// Si el entorno es 'cargaArchs', descarta los registros con codProd fuera del stock inicial
			if (!CFG) this.sinStockInicial();

			// Fin
			return;
		},
		fueraRangoEjercicio: () => {
			// Variables
			const cantTotal = tablaGuardar.length;
			const {desde, hasta} = v.fechasRango;

			// Descarta los registros fuera de rango
			tablaGuardar = tablaGuardar.filter((n) => n.fecha >= desde && n.fecha <= hasta);

			// Descarta los registros con fechas de hoy o futuras
			const hoy = fechas["aaaa-mm-dd"]();
			tablaGuardar = tablaGuardar.filter((n) => n.fecha < hoy);
			const cantVigente = tablaGuardar.length;

			// Obtiene la cantidad de registros descartados
			const cantDescartada = cantTotal - cantVigente;
			if (cantDescartada) mensajes.push("✅ Se descartaron " + cantDescartada + " registros por fecha fuera de rango");

			// Fin
			return;
		},
		depNoEsLr: () => {
			// Variables
			const cantTotal = tablaGuardar.length;

			// Descarta los registros que no son de depósitos LR
			tablaGuardar = tablaGuardar.filter((n) => v.depsIds_lr.includes(n.deposito_id));
			const cantVigente = tablaGuardar.length;

			// Obtiene la cantidad de registros descartados
			const cantDescartada = cantTotal - cantVigente;
			if (cantDescartada) mensajes.push("✅ Se descartaron " + cantDescartada + " registros con depósito que no es de LR");

			// Fin
			return;
		},
		movsNecesarios: () => {
			// Variables
			const cantTotal = tablaGuardar.length;
			const movimTxt = CFG ? "ingreso" : "egreso";

			// Descarta los registros que no son de los movimientos necesarios (ingreso o egreso, según corresponda)
			tablaGuardar = tablaGuardar.filter((n) => v.movsNeces_ids.includes(n.movim_id));
			const cantVigente = tablaGuardar.length;

			// Obtiene la cantidad de registros descartados
			const cantDesc = cantTotal - cantVigente;
			if (cantDesc) mensajes.push("✅ Se descartaron " + cantDesc + " registros que no son de " + movimTxt);

			// Fin
			return;
		},
		sinStockInicial: () => {
			// Variables
			const cantTotal = tablaGuardar.length;

			// Descarta los registros sin stock inicial
			tablaGuardar = tablaGuardar.filter((n) => v.codsProds.includes(n.codProd));
			const cantVigente = tablaGuardar.length;

			// Obtiene la cantidad de registros descartados
			const cantDescartada = cantTotal - cantVigente;
			if (cantDescartada)
				mensajes.push("✅ Se descartaron " + cantDescartada + " registros por código de producto fuera del maestro");

			// Fin
			return;
		},
		filtroPorRangoInEj: (nombreTabla) => {
			// Variables
			const codigo = "ej" + -Number(nombreTabla.slice(-1));
			const ejercicio = v.fechasEjercs.find((n) => n.codigo == codigo);
			const {desde, hasta} = ejercicio;

			// Descarta los registros correspondientes
			const registros = tablaGuardar.filter((n) => desde <= n.fecha && n.fecha <= hasta);

			// Fin
			return registros;
		},
	};
	const procesosSinErrorFe = {
		consolidado: async function () {
			// Variables
			const tablasElegidas = v.tablas.filter((n) => n.tipoTabla_id == tipoTabla_id);
			const nombreTablas = tablasElegidas.map((n) => n.nombreTablaRegs);

			// Procesos por tabla
			for (const nombreTabla of nombreTablas) {
				await procesosSinErrorFe.guardaRegsEnTabla({nombreTabla, tablaGuardar});
				await actualizaDom.consolidado(nombreTabla);
			}

			// Acciones finales
			this.actualizaBotonSubmit();

			// Fin
			return;
		},
		guardaRegsEnTabla: async function ({nombreTabla, tablaGuardar}) {
			// Variables
			const {descarta, actualiza, elimina, campoCond} = tipoTablaElegido;
			const repetidos = [];
			let nuevos = [];

			// Para los movimientos 'inEj', descarta "sin ruido"
			const registros = nombreTabla.startsWith("inEj") ? descartes.filtroPorRangoInEj(nombreTabla) : tablaGuardar;

			// Interacciones con la BD: si corresponde, agrupa entre repetidos y nuevos
			if (descarta || actualiza) {
				// Obtiene los valores ya guardados en la BD
				const valoresEnBD = await comunicacBd.obtieneValsYaEnBd({nombreTabla, campoCond});

				// Según el 'campoCond', distribuye entre repetidos y nuevos
				for (const registro of registros)
					if (valoresEnBD.includes(registro[campoCond])) repetidos.push(registro);
					else nuevos.push(registro);
			}

			// Interacciones con la BD: si corresponde, elimina los registros de la BD
			if (elimina) {
				nuevos = registros;
				await comunicacBd.eliminaTodos(nombreTabla);
			}

			// Interacciones con la BD:
			if (actualiza && repetidos.length) await this.actualizaRegs({nombreTabla, campoCond, repetidos}); // si corresponde, actualiza los registros
			if (nuevos.length) await this.agregaRegs({nombreTabla, nuevos}); // Interacciones con la BD: agrega los registros que correspondan

			// Agrega el feedback
			auxiliares.armaFeedback({nuevos, repetidos});

			// Fin
			return;
		},
		actualizaRegs: async ({nombreTabla, campoCond, repetidos}) => {
			// Rutina por lote
			const lotes = auxiliares.lotes(repetidos);
			for (const lote of lotes) comunicacBd.actualizaRegs(JSON.stringify({nombreTabla, campoCond, registros: lote})); // Revisa y agrega

			// Fin
			return;
		},
		agregaRegs: async ({nombreTabla, nuevos}) => {
			const lotes = auxiliares.lotes(nuevos);
			for (const lote of lotes) await comunicacBd.agregaRegs(JSON.stringify({nombreTabla, registros: lote}));

			// Fin
			return;
		},
		actualizaBotonSubmit: () => {
			// Variables
			const resultadosBe = Array.from(DOM.resultadosBe).map((n) => n.innerHTML);
			const pendGua = resultadosBe.includes(v.iconosCA.pendGua);
			const noPendGua = resultadosBe.some((n) => !n.includes(v.iconosCA.pendGua));

			// Si corresponde, pone visible el botón submit
			if (
				(CFG && !noPendGua) || // en configuración, todos los íconos son 'pendGua'
				(!CFG && pendGua) // en cargaArchs, al menos uno es 'pendGua'
			)
				DOM.botonSubmit.classList.remove("ocultar");
			else DOM.botonSubmit.classList.add("ocultar");

			// Fin
			return;
		},
	};
	const actualizaDom = {
		consolidado: async function (nombreTabla) {
			// 1.A. Resultado propio
			const resultadoBe = await comunicacBd.actualizaResult(nombreTabla);
			this.actualizaDomComentario(nombreTabla, resultadoBe);

			// 1.B. Demás campos
			await this.actualizaDomDemas(nombreTabla);

			// 2. Resultado dependencias
			const nombreTablaNuevo =
				(["maestroProvs", "maestroFams"].includes(nombreTabla) && "maestroProds") ||
				(nombreTabla == "maestroProds" && "stock");
			if (nombreTablaNuevo) {
				const resultadoBe = await comunicacBd.actualizaResult(nombreTablaNuevo);
				this.actualizaDomComentario(nombreTablaNuevo, resultadoBe);
			}

			// Fin
			return;
		},
		actualizaDomComentario: (nombreTabla, resultadoBe) => {
			// Actualiza el resultadoBe
			const fila = v.nombresTablaRegs.findIndex((n) => n == nombreTabla);

			// Actualiza el resultado
			DOM.resultadosBe[fila].innerHTML = resultadoBe;
			DOM.resultadosBe[fila].title = v.mensajesCA[resultadoBe];

			// Fin
			return;
		},
		actualizaDomDemas: async (nombreTabla) => {
			// Variables
			const fila = v.nombresTablaRegs.findIndex((n) => n == nombreTabla);

			// Obtiene la respuesta
			const respuesta = await comunicacBd.actualizaDemas(nombreTabla);

			// Actualiza la respuesta en el DOM
			for (const metodo in respuesta)
				DOM[metodo][fila].innerHTML = respuesta[metodo]
					? metodo != "actualizadoPor"
						? fechas["d/mmm/aa"](respuesta[metodo])
						: respuesta[metodo]
					: "-";

			// Fin
			return;
		},
	};
	const auxiliares = {
		agregaMensParrafo: (mensaje, nuevo) => {
			// Si se empieza un despliegue nuevo, limpia el DOM
			if (nuevo) DOM.statusArch.innerHTML = "";

			// Actualiza el DOM
			const p = document.createElement("p");
			p.innerHTML = mensaje;
			DOM.statusArch.appendChild(p);

			// Fin
			return;
		},
		agregaMensLista: function (mensajes) {
			// Título
			this.agregaMensParrafo("✅ Resultados:");

			// Mensajes
			let cantTotal = 0;
			const ul = document.createElement("ul");
			for (let mensaje of mensajes) {
				// Actualiza 'ul'
				const li = document.createElement("li");
				li.innerHTML = mensaje.slice(2); // quita el ✅
				ul.appendChild(li);

				// Actualiza el conteo
				const elementos = mensaje.split(" ");
				const indice = elementos.findIndex((n) => n.includes("registro")) - 1; // el número está justo antes de la palabra registro/s
				cantTotal += Number(elementos[indice].replace(".", ""));
			}

			// Total
			const li = document.createElement("li");
			li.innerHTML = "Se procesaron " + formatoSimela(cantTotal) + " registros en total";
			ul.appendChild(li);

			// Fin
			DOM.statusArch.appendChild(ul);
			return;
		},
		lotes: (array) => {
			// Obtiene los lotes
			const lotes = [];
			for (let i = 0; i < array.length; i += v.loteTabla) lotes.push(array.slice(i, i + v.loteTabla));

			// Fin
			return lotes;
		},
		armaFeedback: ({nuevos, repetidos}) => {
			// Variables
			const {descarta, actualiza, elimina, campoCond} = tipoTablaElegido;
			const largo = {nuevos: nuevos.length, repetidos: repetidos.length};
			const oa = campoCond == "codProd" ? "o" : "a";

			// Arma el feedback
			if (largo.repetidos) {
				if (descarta)
					mensajes.push(
						"✅ Se descartaron " +
							formatoSimela(largo.repetidos) +
							" registros por " +
							campoCond +
							" ya cargad" +
							oa +
							" anteriormente"
					);
				if (actualiza) mensajes.push("✅ Se actualizaron " + formatoSimela(largo.repetidos) + " registros");
			}
			if (largo.nuevos)
				mensajes.push("✅ Se " + (elimina ? "guard" : "agreg") + "aron " + formatoSimela(largo.nuevos) + " registros");

			// Convierte en texto
			mensajes = mensajes.map((n) => n.replace("aron 1 registros", "ó 1 registro")); // pone en singular lo que corresponde

			// Fin
			return;
		},
	};

	// Procesos si el archivo SI tiene un errorFe
	const descargaLosErrores = async () => {
		// Proceso de los errores
		const cantErrores = tablaErrores.length;
		const mensaje =
			cantErrores == 1
				? "Se encontró un sólo error"
				: cantErrores < maxCantErrores
				? "Se encontraron " + cantErrores + " errores"
				: "Primeros " + maxCantErrores + " errores encontrados";
		tablaErrores.unshift(mensaje, ""); // agrega un elemento vacío al inicio

		// Crea el contenido y el blob
		const contenido = tablaErrores.join("\n");
		const blob = new Blob([contenido], {type: "text/plain"});

		// Crear URL y disparar descarga
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = tipoTablaElegido.descripcion + " - errores.txt";
		document.body.appendChild(a);
		a.click();

		// Limpiar
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		// Fin
		return;
	};

	// Eventos
	(() => {
		// Ingreso de archivos
		DOM.input.addEventListener("change", () => novsEnInput.consolidado(DOM.input.files[0]));
		DOM.dropArea.addEventListener("drop", (e) => novsEnInput.consolidado(e.dataTransfer.files[0]));

		// Eventos secundarios
		[...v.mouseEntrada, ...v.mouseSalida].forEach((evento) =>
			DOM.marcoGrande.addEventListener(evento, (e) => e.preventDefault())
		); // previene el comportamiento estándar de abrir el archivo
		v.mouseEntrada.forEach((evento) => DOM.dropArea.addEventListener(evento, () => DOM.dropArea.classList.add("activo"))); // cuando se mouseEntrada con el mouse
		v.mouseSalida.forEach((evento) => DOM.dropArea.addEventListener(evento, () => DOM.dropArea.classList.remove("activo"))); // cuando se mouseSalida con el mouse
		DOM.botonInput.addEventListener("click", () => !DOM.botonInput.className.includes("inactivo") && DOM.input.click()); // cuando se elige el botón

		// Descarga y elimina tablas
		DOM.resultadosBe.forEach((resultadoBe, i) => {
			resultadoBe.addEventListener("click", async () => {
				// Si el caracter está inactivo, interrumpe la función
				if (resultadoBe.className.includes("inactivo")) return;
				resultadoBe.classList.add("inactivo");

				// Variables
				const nombreTabla = DOM.nombresTablaRegs[i].id;
				const nombreArchDesc = DOM.nombresTablaRegs[i].innerText;
				const eliminar = resultadoBe.innerHTML == v.iconosCA.eliminar;

				// Eliminar
				if (eliminar) {
					// Impactos en la BD
					await comunicacBd.eliminaTodos(nombreTabla);

					// Actualiza el comentario
					await actualizaDom.consolidado(nombreTabla);
					procesosSinErrorFe.actualizaBotonSubmit();

					// Actualiza el comentario
					auxiliares.agregaMensParrafo("✅ Se eliminó la tabla <em>" + nombreArchDesc + "</em>", true);
				}

				// Descargar
				else {
					// Actualización del panel
					resultadoBe.title = "Eliminar";
					resultadoBe.innerHTML = v.iconosCA.eliminar;

					// Obtiene y descarga la tabla
					await comunicacBd
						.descargaUnaTabla(nombreTabla)
						.then((n) => n.blob())
						.then((blob) => {
							// Crea objetos
							const url = window.URL.createObjectURL(blob);
							const a = document.createElement("a");

							// La anexa propiedades al anchor
							a.href = url;
							a.download = "LR - " + nombreArchDesc + ".xlsx";
							document.body.appendChild(a);

							// Realiza la descarga
							a.click();

							// Limpia lo creado
							document.body.removeChild(a);
							window.URL.revokeObjectURL(url);
						});

					// Actualiza el comentario
					auxiliares.agregaMensParrafo("✅ Se descargó la tabla <em>" + nombreArchDesc + "</em>", true);
				}

				// Fin
				resultadoBe.classList.remove("inactivo");
				return;
			});
		});

		// Fin
		return;
	})();

	// Fin
	return;
});

// Variables
const CFG = location.pathname.includes("configuracion");
const entorno = CFG ? "/configuracion" : "/carga-archivos";
const rutas = {
	// Obtiene información
	datosInics: entorno + "/api/ca-obtiene-datos-iniciales",
	obtieneValsYaEnBd: "/api/ca-obtiene-valores-ya-en-bd/?nombreTabla=",
	descargaUnaTabla: entorno + "/api/ca-descarga-una-tabla/?nombreTabla=",

	// Tablas
	eliminaTodos: "/api/ca-elimina-todos-los-registros/?nombreTabla=",
	actualizaRegs: "/api/ca-actualiza-registros",
	agregaRegs: "/api/ca-agrega-registros",
	actualizaResult: "/api/ca-actualiza-resultado",
	actualizaDemas: "/api/ca-actualiza-demas",
};
const tipoXlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const milisegsUTC = new Date().getTimezoneOffset() * 60 * 1000; // Obtiene la diferencia en milisegs respecto a UTC
const maxCantErrores = 10;
const headers = {"Content-Type": "application/json"};

// Funciones
const mensajesError = {
	vacio: (campoArch) => "El campo '" + campoArch + "' no tiene un valor y es necesario",
	formato: (campoArch) => "El campo '" + campoArch + "' no cumple con el formato",
	fechaCierreEjerc: (campoArch) => "La fecha en el campo '" + campoArch + "' es mayor que la del cierre del ejercicio",
	largoMax: (campoArch, largoMax) =>
		"El campo '" +
		campoArch +
		"' excede la longitud máxima permitida de " +
		largoMax +
		" caracteres (o dígitos enteros si es un número)",
	formatoDescon: (campoArch) => "No reconocemos el formato del campo " + campoArch,
	repetido: (campoArch) => "El campo '" + campoArch + "' tiene un valor duplicado",
	comboRepetido: (campoArch1, campoArch2) =>
		"La combinación de los campos '" + campoArch1 + "' y '" + campoArch2 + "' tiene un valor duplicado",
};
const fechas = {
	"aaaa-mm-dd": (fecha) => new Date(fechas.obtieneFechaLocal(fecha)).toLocaleDateString("en-CA"),
	obtieneFechaLocal: (fecha) =>
		fecha
			? typeof fecha == "string"
				? new Date(fecha).getTime() + milisegsUTC // convierte el horario UTC en local (ej: 0hs UTC --> 21hs local + 3hs = 24hs local)
				: new Date(fecha) // para fecha en otro formato
			: new Date(),
	"d/mmm/aa": (fecha) =>
		fecha
			.split("-")
			.reverse()
			.map((p, i) => (i == 0 ? Number(p) : i == 1 ? mesesAbrev[Number(p) - 1] : p.slice(2)))
			.join("/"),
};
const formatoSimela = (numero) => new Intl.NumberFormat("es-AR").format(numero); // SIMELA
const inicialMayus = (texto) => texto.slice(0, 1).toUpperCase() + texto.slice(1).toLowerCase();
const comunicacBd = {
	obtieneValsYaEnBd: ({nombreTabla, campoCond}) =>
		fetch(rutas.obtieneValsYaEnBd + nombreTabla + "&campoCond=" + campoCond).then((n) => n.json()),
	eliminaTodos: (nombreTabla) => fetch(rutas.eliminaTodos + nombreTabla, {method: "DELETE"}),
	descargaUnaTabla: (nombreTabla) => fetch(rutas.descargaUnaTabla + nombreTabla),
	actualizaRegs: (body) => fetch(rutas.actualizaRegs, {method: "PUT", body, headers}),
	agregaRegs: (body) => fetch(rutas.agregaRegs, {method: "POST", body, headers}),
	actualizaResult: (body) => fetch(rutas.actualizaResult, {method: "PUT", body}).then((n) => n.json()),
	actualizaDemas: (body) => fetch(rutas.actualizaDemas, {method: "PUT", body}).then((n) => n.json()),
};
const estandarizaProv = (nombre) => {
	// Estandariza
	nombre = nombre
		.replaceAll(/\./g, "")
		.split(" ")
		.map((n) => inicialMayus(n))
		.join(" ")
		.replaceAll(" Y ", " y ");

	// Fin
	return nombre;
};
const uneSiglas = (nombre) => {
	const palabras = nombre.split(" ");
	const resultado = [];
	let sigla = "";

	// Rutina
	for (const palabra of palabras) {
		if (palabra.length == 1 && palabra === palabra.toUpperCase()) sigla += palabra;
		else {
			if (sigla) resultado.push(sigla);
			sigla = "";
			resultado.push(palabra);
		}
	}
	if (sigla) resultado.push(sigla); // por si termina en sigla

	// Fin
	return resultado.join(" ");
};
const reemplsProv = (nombre) => {
	// Reemplazos
	if (nombre.endsWith("Sa") || nombre.endsWith("SA")) nombre = nombre.slice(0, -2) + " SA";
	if (nombre.endsWith("Srl") || nombre.endsWith("SRL")) nombre = nombre.slice(0, -3) + " SRL";

	// Estandariza
	nombre = nombre.replace("Sociedad Anonima", "SA").replace("Sociedad Anónima", "SA");
	nombre = nombre.replaceAll(/\s+/g, " ");

	// Fin
	return nombre;
};
