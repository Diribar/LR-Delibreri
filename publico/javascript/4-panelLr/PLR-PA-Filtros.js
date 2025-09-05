"use strict";

window.addEventListener("load", async () => {
	// Variables
	const domInformacion = document.querySelector("#planesAccion.zonaPanel #informacion");
	const DOM = {
		// Secciones
		vCortas: domInformacion.querySelectorAll("#tituloFiltro .vCorta"),
		secciones: domInformacion.querySelectorAll("form .seccion"),

		// Gráficos
		grInicialActual: domInformacion.querySelector("#inicialActual.graficoSelect .grafico"),
		grProv: domInformacion.querySelector("#proveedor_id.graficoSelect .grafico"),
		grFam: domInformacion.querySelector("#familia_id.graficoSelect .grafico"),
		grEjerc: domInformacion.querySelector("#ejercicio_id.graficoSelect .grafico"),
		selsGrafs: {},
		opcsGrafs: {},

		// Filtro de tabla productos
		filtroPlanAccion_id: domInformacion.querySelector("form select[name='filtroPlanAccion_id']"),
		optgroupFiltroPlan: domInformacion.querySelectorAll("form select[name='filtroPlanAccion_id'] optgroup"),

		// Tablas
		tablaProds: domInformacion.querySelector("#tablaProds tbody"),
		tablaProdsModelo: domInformacion.querySelector("#tablaProds tbody tr"),
		tablaPlanes: domInformacion.querySelector("#tablaPlanesAccion tbody"),
		tablaPlanesModelo: domInformacion.querySelectorAll("#tablaPlanesAccion tbody tr"),

		// Otros
		form: domInformacion.querySelector("form"),
		selects: domInformacion.querySelectorAll("form select"),
	};
	// Filtros de gráficos
	for (const campoFiltro of camposFiltros) {
		DOM.selsGrafs[campoFiltro] = domInformacion.querySelector("form select[name='" + campoFiltro + "']");
		DOM.opcsGrafs[campoFiltro] = domInformacion.querySelectorAll("form select[name='" + campoFiltro + "'] option");
	}
	const {rolUsuario, planAccionReserva_id} = await fetch(rutas.datosIniciales).then((res) => res.json());
	let datosBeProds, datosBePlanes, pintar;

	// Funciones
	const actualizaEnBe = {
		productos: async (campo) => {
			// Variables
			const {name: nombre, value: valor, dataset} = campo;
			const {prod_id} = dataset;

			// Actualiza
			await fetch(rutas.actualizaProdsEnBd + nombre + "=" + valor + "&prod_id=" + prod_id);

			// Fin
			return;
		},
		planesAccion: async (campo) => {
			// Variables
			const {name: nombre} = campo;
			let ruta = rutas.actualizaPlanesEnBd;

			// nuevoPlan
			if (nombre == "nuevoPlan") {
				ruta += nombre;
				const nombrePlan = document.querySelector("#nuevoPlan input[name='nombrePlan']").value;
				const responsable_id = document.querySelector("#nuevoPlan select[name='responsable_id']").value;
				await fetch(ruta + "&nombrePlan=" + nombrePlan + "&responsable_id=" + responsable_id);
			}

			// cierraElimina
			if (nombre == "cierraElimina") {
				// Cierra o elimina
				ruta += nombre;
				const {plan_id} = campo.dataset;
				await fetch(ruta + "&plan_id=" + plan_id);

				// Acciones si se cierra el 'filtroPlanAccion_id'
				if (DOM.filtroPlanAccion_id.value == plan_id) {
					DOM.filtroPlanAccion_id.value = "";
					document.cookie = "filtroPlanAccion_id=; max-age=0";
				}
			}

			// edición
			if (["cambioNombrePlan", "cambioResp_id"].includes(nombre)) {
				ruta += "edicion";
				const {plan_id} = campo.dataset;
				const valor = campo.value;
				await fetch(ruta + "&" + nombre + "=" + valor + "&plan_id=" + plan_id);
			}

			// Fin
			return;
		},
	};
	const obtieneDelBe = {
		productos: async () => (datosBeProds = await fetch(rutas.obtieneProductos).then((n) => n.json())),
		planesAccion: async () => (datosBePlanes = await fetch(rutas.obtienePlanesAccion).then((n) => n.json())),
	};
	const actualizaGraficos = {
		consolidado: function () {
			this.inicioActual();
			this.proveedores();
			this.familias();
			this.antigs();
			actualizaOpcsGrafs.consolidado();

			// Fin
			return;
		},

		// Tipos de gráfico
		inicioActual: function () {
			// Variables
			const {pfaGrafs} = datosBeProds;
			const {antigs} = pfaGrafs;
			const ejercicio_id = FN.cookies("ejercicio_id"); // se necesita sacar de la cookie porque el select se actualiza más tarde
			const indice = ejercicio_id && antigs.findIndex((n) => n.id == ejercicio_id);

			// Toma el valor de LR exclusivamente de los ejercicios elegidos
			const valorLrInicial =
				ejercicio_id && indice > -1
					? antigs[indice].valorLrInicial // LR de un ejercicio
					: antigs
							.filter((n) => n.codigo != "ej0") // porque es LR123
							.reduce((acum, n) => acum + n.valorLrInicial, 0);

			const valorConPlan = ejercicio_id
				? indice > -1
					? antigs[indice].valorLrConPlan // LR de un ejercicio
					: antigs
							.filter((n) => n.codigo != "ej0") // porque es LR123
							.reduce((acum, n) => acum + n.valorLrConPlan, 0)
				: antigs.reduce((acum, n) => acum + n.valorLrConPlan, 0); // LR completo
			const valorSinPlan = ejercicio_id
				? indice > -1
					? antigs[indice].valorLrSinPlan // LR de un ejercicio
					: antigs
							.filter((n) => n.codigo != "ej0") // porque es LR123
							.reduce((acum, n) => acum + n.valorLrSinPlan, 0)
				: antigs.reduce((acum, n) => acum + n.valorLrSinPlan, 0); // LR completo

			// Actualiza el gráfico
			this.columnas({valorLrInicial, valorSinPlan, valorConPlan});

			// Fin
			return;
		},
		proveedores: function () {
			// Variables
			const {pfaGrafs} = datosBeProds;
			const {provs} = pfaGrafs;
			const {tabla, valorConPlan} = FN.valorActual(provs);
			const titulo = "LR x Proveedor";

			// Actualiza el gráfico
			this.torta({dom: DOM.grProv, tabla, valorConPlan, titulo});

			// Fin
			return;
		},
		familias: function () {
			// Variables
			const {pfaGrafs} = datosBeProds;
			const {fams} = pfaGrafs;
			const {tabla, valorConPlan} = FN.valorActual(fams);
			const titulo = "LR x Familia";

			// Actualiza el gráfico
			this.torta({dom: DOM.grFam, tabla, valorConPlan, titulo});

			// Fin
			return;
		},
		antigs: function () {
			// Variables
			const {pfaGrafs} = datosBeProds;
			const {antigs} = pfaGrafs;
			const {tabla, valorConPlan} = FN.valorActual(antigs);
			const titulo = "LR x Antiguedad";

			// Actualiza el gráfico
			this.torta({dom: DOM.grEjerc, tabla, valorConPlan, titulo});

			// Fin
			return;
		},

		// Gráficos
		columnas: ({valorLrInicial, valorSinPlan, valorConPlan}) => {
			// Variables
			const data = google.visualization.arrayToDataTable([
				["Etapa", "Sin plan", {role: "annotation"}, "Con plan"],
				["Inicial", valorLrInicial, "", 0],
				["Actual", valorSinPlan, Math.round((valorSinPlan / valorLrInicial) * 100) + "%", valorConPlan],
			]);
			const opciones = {
				...opcsPlanAccion,
				title: "LR Inicial vs Actual",
				isStacked: true,
				legend: {position: "right"},
				colors: [marronInterm, "#b3e59f"],
				vAxis: {title: "AR$ M", minValue: 0, format: "short"},
				hAxis: {textStyle: {bold: true}},
				chartArea: {left: 50, right: 80},
			};

			// Actualiza el gráfico
			const chart = new google.visualization.ColumnChart(DOM.grInicialActual);
			chart.draw(data, opciones);

			// Fin
			return;
		},
		torta: ({dom, tabla, valorConPlan, titulo}) => {
			// Variables relacionadas con la tabla
			const valorActual = tabla.reduce((acum, n) => acum + n.valorLrSinPlan, 0) + valorConPlan;
			tabla = tabla.filter((n) => n.valorLrSinPlan);

			// Empieza a crear los datos
			const datos = [["Categoría", "Valor", {role: "tooltip", type: "string"}, "id"]];
			if (valorConPlan) {
				const aux = "Con plan - " + moneda(valorConPlan) + " - " + Math.round((valorConPlan / valorActual) * 100) + "%";
				datos.push(["Con plan", valorConPlan, aux, null]);
			}

			// Rutina para armar los datos del gráfico
			const umbral = 0.05; // 5%
			let resto = 0;
			for (const registro of tabla) {
				// Si el registro no supera el umbral, aporta al "resto", y además se cumple que no es solamente el último registro
				if (registro.valorLrSinPlan / valorActual < umbral && (resto || registro.id != tabla.at(-1).id)) {
					resto += registro.valorLrSinPlan;
					continue;
				}

				// Crea los parámetros del registro
				const nombre =
					registro.codigo || registro.descripcion.slice(0, 1) + registro.descripcion.slice(1, 4).toLowerCase();
				const anotacion =
					registro.descripcion.concat(" - ") +
					moneda(registro.valorLrSinPlan).concat(" - ") +
					Math.round((registro.valorLrSinPlan / valorActual) * 100) +
					"%";

				// Agrega el registro a la tabla
				datos.push([nombre, registro.valorLrSinPlan, anotacion, registro.id]);
			}

			// Si hay valor en resto, lo agrega a la tabla
			if (resto) {
				const nombre = "Resto";
				const anotacion = nombre + " - " + moneda(resto) + " - " + Math.round((resto / valorActual) * 100) + "%";
				datos.push([nombre, resto, anotacion, null]);
			}

			// Crea el gráfico
			const data = google.visualization.arrayToDataTable(datos);
			const opciones = {
				...opcsPlanAccion,
				title: titulo,
				legend: "none",
				pieSliceText: "label", // muestra en la porción
				pieSliceTextStyle: {
					fontSize: 12,
				},
				chartArea: {top: 40, height: "70%"},
			};
			const chart = new google.visualization.PieChart(dom);
			chart.draw(data, opciones);

			// Escuchar el clic (selección)
			google.visualization.events.addListener(chart, "select", () => {
				// Obtiene lo que fue seleccionado
				const selection = chart.getSelection();
				if (!selection.length) return;

				// Obtiene el 'id' del sector
				const {row: fila} = selection[0];
				const id = data.getValue(fila, 3);
				if (!id) return;

				// La cambia el valor al select
				const domSelect = dom.parentElement.querySelector("select");
				domSelect.value = id;

				// Genera un evento para el select
				domSelect.dispatchEvent(new Event("change", {bubbles: true}));
			});

			// Fin
			return;
		},
	};
	const actualizaOpcsGrafs = {
		consolidado: function () {
			// Variables
			const {pfaOpcs} = datosBeProds;
			const {provs, fams, antigs} = pfaOpcs;
			const cookies = FN.cookies();

			// Actualiza las opciones
			[provs, fams, antigs].forEach((tabla, i) => this.actualizaOpcs({tabla, i, cookies}));

			// Fin
			return;
		},
		actualizaOpcs: ({tabla, i, cookies}) => {
			// Variables
			const campoFiltro = camposFiltros[i];
			const select = DOM.selsGrafs[campoFiltro];
			const opciones = Array.from(DOM.opcsGrafs[campoFiltro]);
			select.innerHTML = "";

			// Primeras opciones
			const elegi = Array.from(opciones).find((n) => n.dataset.tema == "elegi");
			const sinFiltro = Array.from(opciones).find((n) => n.dataset.tema == "sinFiltro");
			select.appendChild(elegi);
			select.appendChild(sinFiltro);

			// Opciones 123
			const opc123 = Array.from(opciones).find((n) => n.value == "123");
			if (opc123) select.appendChild(opc123);

			// Rutina para las opciones estándar
			const estandar = Array.from(opciones).find((n) => n.dataset.tema == "estandar");
			for (const registro of tabla) {
				const opcion = estandar.cloneNode();
				opcion.value = registro.id;
				opcion.innerHTML = registro.descripcion;
				select.appendChild(opcion);
			}

			// Asigna la opción que había sido elegida
			const opcionElegida = cookies[campoFiltro];
			if (opcionElegida) select.value = opcionElegida;

			// Fin
			return;
		},
	};
	const actualizaTablas = {
		productos: {
			consolidado: function () {
				// Variables
				const {prodsTabla: prods} = datosBeProds;

				// Actualiza la tabla
				DOM.tablaProds.innerHTML = "";
				for (const producto of prods) {
					// Crea la fila y obtiene los tds
					const tr = DOM.tablaProdsModelo.cloneNode(true);
					tr.classList.remove("ocultar");
					pintar = !pintar;
					if (pintar) tr.classList.add("pintar");
					const tds = tr.querySelectorAll("td");

					// Tds iniciales
					tds[0].innerHTML = producto.codProd; // código de producto
					tds[1].innerHTML = producto.descripcion.slice(0, 30); // descripción
					tds[1].title = producto.descripcion; // descripción
					tds[2].innerHTML = formatoSimela(producto.cantLrActual); // cantidad lr actual
					tds[3].innerHTML = moneda(producto.costoUnit, true); // costo unitario
					tds[4].innerHTML = moneda(producto.valorLrActual, true); // valor lr actual

					// Plan de acción
					if (rolUsuario.cfg && producto.planAccion_id != planAccionReserva_id) {
						tds[5].querySelector("select").dataset.prod_id = producto.id;
						this.opciones(tds[5]);
						tds[5].querySelector("select").value = producto.planAccion_id || "sinPlan";
					} else
						tds[5].innerHTML =
							datosBePlanes.find((n) => n.id == producto.planAccion_id)?.nombre || "Sin plan de acción";

					// Demás campos
					tds[6].innerHTML = producto.proveedor.descripcion.slice(0, 25); // proveedor
					tds[6].title = producto.proveedor.descripcion; // proveedor
					tds[7].innerHTML = producto.familia.descripcion; // familia
					tds[8].innerHTML = producto.ultEj;

					// Agrega la fila
					DOM.tablaProds.appendChild(tr);
				}

				// Fin
				return;
			},
			opciones: (td) => {
				// Limpia el selector
				const selector = td.querySelector("select");
				const opcion0 = selector.querySelectorAll("option")[0];
				const opcion1 = selector.querySelectorAll("option")[1];

				// Situación inicial
				selector.innerHTML = "";
				selector.appendChild(opcion0);

				// Rutina
				const planesAccion = datosBePlanes.filter((n) => !n.cerradoEn && n.id != planAccionReserva_id);
				for (const planAccion of planesAccion) {
					const opcion = opcion1.cloneNode();
					opcion.value = planAccion.id;
					opcion.innerHTML = planAccion.nombre;
					selector.appendChild(opcion);
				}

				// Fin
				return;
			},
		},
		planesAccion: {
			consolidado: function () {
				// Variables
				DOM.tablaPlanes.innerHTML = "";

				this.listado();
				if (rolUsuario.cfg) this.nuevo();
				return;
			},
			listado: () => {
				// Completa los tds
				const planesAccion = datosBePlanes;
				for (const planAccion of planesAccion) {
					// Crea la fila y obtiene los tds
					const tr = DOM.tablaPlanesModelo[0].cloneNode(true);
					tr.classList.remove("ocultar");
					const tds = tr.querySelectorAll("td");

					// Nombre y responsable
					if (planAccion.perenne || !rolUsuario.cfg) {
						tds[0].innerHTML = planAccion.nombre; // Nombre del Plan
						tds[1].innerHTML = planAccion.responsable.apodo; // Responsable
					} else {
						tds[0].querySelector("input").value = planAccion.nombre; // Nombre del Plan
						tds[0].querySelector("input").dataset.plan_id = planAccion.id;
						tds[1].querySelector("select").dataset.plan_id = planAccion.id;
						tds[1]
							.querySelectorAll("option")
							.forEach((option) => (option.selected = option.value == planAccion.responsable_id)); // Responsable
					}

					// Demás campos
					const {valorLrInicial, valorLrActual} = planAccion;
					const mejora = valorLrInicial - valorLrActual;
					tds[2].innerHTML = moneda(valorLrActual, true); // Valor Actual
					tds[3].innerHTML = valorLrInicial ? moneda(mejora, true) : "-"; // Mejora $
					tds[4].innerHTML = valorLrInicial ? Math.round((mejora / valorLrInicial) * 100) + "%" : "-"; // Mejora %
					tds[5].innerHTML = FN.fechas["d/mmm/aa"](planAccion.creadoEn); // Abierto en
					tds[6].innerHTML = planAccion.creadoPor.apodo; // Abierto por
					tds[7].innerHTML = planAccion.cerradoEn ? FN.fechas["d/mmm/aa"](planAccion.cerradoEn) : "-"; // Cerrado en
					// cierraElimina
					if (planAccion.perenne || !rolUsuario.cfg) tds[8].classList.add("ocultar");
					else {
						tds[8].querySelector("label").append(planAccion.cerradoEn ? "⛔" : "❌");
						tds[8].querySelector("label").title = planAccion.cerradoEn ? "Eliminar" : "Cerrar";
						tds[8].querySelector("input").dataset.plan_id = planAccion.id;
					}

					// Agrega la fila
					DOM.tablaPlanes.appendChild(tr);
				}

				// Fin
				return;
			},
			nuevo: () => {
				// Crea la fila y obtiene los tds
				const tr = DOM.tablaPlanesModelo[1].cloneNode(true);
				tr.classList.remove("ocultar");

				// Agrega la fila
				DOM.tablaPlanes.appendChild(tr);
				return;
			},
		},
	};
	const otros = {
		filtroPlanAccion: () => {
			// 1er grupo
			DOM.filtroPlanAccion_id.innerHTML = "";
			DOM.filtroPlanAccion_id.appendChild(DOM.optgroupFiltroPlan[0]);

			// Prepara el 2° grupo
			const grupo = DOM.optgroupFiltroPlan[1].cloneNode();
			DOM.filtroPlanAccion_id.appendChild(grupo);
			const planesAccion = datosBePlanes.filter((n) => !n.cerradoEn);

			// Rutina
			for (const planAccion of planesAccion) {
				const opcion = document.createElement("option");
				opcion.value = planAccion.id;
				opcion.innerHTML = planAccion.nombre;
				grupo.appendChild(opcion);
			}

			// Valor actual del filtroPlanAccion_id
			const filtroPlanAccion_id = FN.cookies("filtroPlanAccion_id");
			if (filtroPlanAccion_id) DOM.filtroPlanAccion_id.value = filtroPlanAccion_id;

			// Fin
			return;
		},
		descargaProds: () => {
			// Variables
			const nombrePlan = datosBePlanes.find((n) => n.id == DOM.filtroPlanAccion_id.value)?.nombre || "Sin plan de acción";

			// Realiza la descarga
			fetch(rutas.descargaProds)
				.then((n) => n.blob())
				.then((blob) => {
					// Crea objetos
					const a = document.createElement("a");
					const url = window.URL.createObjectURL(blob);

					// La anexa propiedades al anchor
					a.href = url;
					a.download = "Productos - " + nombrePlan + ".xlsx";
					document.body.appendChild(a);

					// Realiza la descarga
					a.click();

					// Limpia lo creado
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				});
		},
	};

	// Eventos - reemplaza 'Quitar la opcion elegida' por el placeholder
	for (const select of DOM.selects) select.addEventListener("change", () => !select.value && (select.value = ""));

	// Eventos - oculta secciones
	DOM.vCortas.forEach((vCorta, i) =>
		vCorta.addEventListener("click", () => {
			if (["flechaAbajo", "flechaDer"].some((n) => vCorta.className.includes(n))) vCorta.classList.toggle("flechaAbajo");
			vCorta.classList.toggle("flechaDer");
			DOM.secciones[i].classList.toggle("ocultar");
			return;
		})
	);

	// Eventos - cambios en el formulario
	DOM.form.addEventListener("change", async (e) => {
		// Variables
		const campo = e.target;
		const {name: nombre, value: valor} = campo;

		// GRÁFICOS - Quita filtros
		if (nombre == "sinPFA") {
			for (const campo of camposFiltros) {
				DOM.selsGrafs[campo].value = "";
				document.cookie = campo + "=; max-age=0";
			}
			DOM.selsGrafs.proveedor_id.dispatchEvent(new Event("change", {bubbles: true}));
		}

		// GRÁFICOS - Asigna filtros
		if (camposFiltros.includes(nombre)) {
			// Guarda en cookie
			document.cookie = nombre + "=" + valor + "; max-age=" + (valor ? 86400 : 0); // un día o lo elimina

			// Actualiza la BD
			await obtieneDelBe.productos(); // Obtiene datos del BE-prods
			actualizaGraficos.consolidado(); // Actualiza los gráficos
			actualizaTablas.productos.consolidado(); // Actualiza el listado de productos
		}

		// TABLA PRODUCTOS - Quita filtro
		if (nombre == "sinPlan") {
			DOM.filtroPlanAccion_id.value = "";
			document.cookie = "filtroPlanAccion_id=; max-age=0";
			DOM.filtroPlanAccion_id.dispatchEvent(new Event("change", {bubbles: true}));
		}

		// TABLA PRODUCTOS - Asigna filtro
		if (["filtroPlanAccion_id", "actualizaPlan"].includes(nombre)) {
			// Guarda en cookie
			if (nombre == "filtroPlanAccion_id")
				document.cookie = "filtroPlanAccion_id=" + valor + "; max-age=" + (valor ? 86400 : 0); // un día o lo elimina

			await obtieneDelBe.productos(); // Obtiene datos del BE-prods
			actualizaTablas.productos.consolidado(); // Actualiza el listado de productos
		}

		// TABLA PRODUCTOS - Descarga
		if (nombre == "descargar") otros.descargaProds();

		// TABLA PRODUCTOS - Cambio de plan de acción para un producto
		if (nombre == "edicionPlan_id") {
			await actualizaEnBe.productos(campo); // Actualiza la BD - productos y planesAccion
			await obtieneDelBe.productos(); // Obtiene datos del BE-prods
			await obtieneDelBe.planesAccion(); // Obtiene datos del BE-planesAccion
			actualizaGraficos.consolidado(); // Actualiza los gráficos
			actualizaTablas.planesAccion.consolidado(); // Actualiza el listado de planesAccion
		}

		// 4. TABLA PLANES DE ACCIÓN - Cambio de filtros
		if (["filtroResp_id", "filtroEstado"].includes(nombre)) {
			await obtieneDelBe.planesAccion(); // Obtiene datos del BE-planesAccion
			actualizaTablas.planesAccion.consolidado(); // Actualiza el listado de planesAccion
		}

		// TABLA PLANES DE ACCIÓN - Alta
		if (nombre == "nuevoPlan") {
			await actualizaEnBe.planesAccion(campo); // Actualiza la BD - planesAccion
			await obtieneDelBe.planesAccion(); // Obtiene datos del BE-planesAccion
			actualizaTablas.productos.consolidado(); // Actualiza el listado de productos
			actualizaTablas.planesAccion.consolidado(); // Actualiza el listado de planesAccion
			otros.filtroPlanAccion();
		}

		// TABLA PLANES DE ACCIÓN - Cierre
		if (nombre == "cierraElimina") {
			await actualizaEnBe.planesAccion(campo); // Actualiza la BD - planesAccion y productos
			await obtieneDelBe.productos(); // Obtiene datos del BE-prods
			await obtieneDelBe.planesAccion(); // Obtiene datos del BE-planesAccion
			actualizaGraficos.consolidado(); // Actualiza los gráficos
			actualizaTablas.productos.consolidado(); // Actualiza el listado de productos
			actualizaTablas.planesAccion.consolidado(); // Actualiza el listado de planesAccion
			otros.filtroPlanAccion();
		}

		// TABLA PLANES DE ACCIÓN - Cambio de nombre o responsable
		if (["cambioNombrePlan", "cambioResp_id"].includes(nombre)) {
			await actualizaEnBe.planesAccion(campo); // Actualiza la BD - planesAccion
			await obtieneDelBe.productos(); // Obtiene datos del BE-prods
			await obtieneDelBe.planesAccion(); // Obtiene datos del BE-planesAccion
			actualizaTablas.productos.consolidado(); // Actualiza el listado de productos
			actualizaTablas.planesAccion.consolidado(); // Actualiza el listado de planesAccion
			otros.filtroPlanAccion();
		}

		// Fin
		return;
	});
	DOM.form.addEventListener("submit", async (e) => e.preventDefault());

	// Start-up - Planes de acción
	await obtieneDelBe.planesAccion();
	otros.filtroPlanAccion();
	actualizaTablas.planesAccion.consolidado();

	// Start-up - Productos
	await obtieneDelBe.productos();
	actualizaGraficos.consolidado();
	actualizaTablas.productos.consolidado();

	// Fin
	return;
});

// Variables
const rutas = {
	// Obtiene información del BE
	datosIniciales: "/api/pa-datos-iniciales",
	obtieneProductos: "/api/pa-obtiene-productos", // se usa esa herramienta, porque es la recomendada para GET
	obtienePlanesAccion: "/api/pa-obtiene-planes-accion",

	// Cambios en la BD
	actualizaProdsEnBd: "/api/pa-actualiza-productos/?",
	actualizaPlanesEnBd: "/api/pa-actualiza-planes-accion/?accion=",

	// Otros
	descargaProds: "/api/pa-descarga-productos", // se usa esa herramienta, porque es la recomendada para GET
};
const camposFiltros = ["proveedor_id", "familia_id", "ejercicio_id"];
const opcsPlanAccion = {
	titleTextStyle: {color: "#2c3e50", bold: true, fontSize: 14},
	width: 240,
	backgroundColor: "transparent",
};

// Funciones
const FN = {
	valorActual: (tabla) => {
		const valorConPlan = tabla.reduce((acum, n) => acum + n.valorLrConPlan, 0);
		return {tabla, valorConPlan};
	},
	fechas: {
		"d/mmm/aa": (fecha) =>
			fecha
				.split("-")
				.reverse()
				.map((p, i) => (i == 0 ? Number(p) : i == 1 ? mesesAbrev[Number(p) - 1] : p.slice(2)))
				.join("/"),
	},
	cookies: (elemento) => {
		// Obtiene las cookies
		const cookies = document.cookie
			.split("; ") // convierte el texto en un array de clave + valor
			.reduce((obj, cookie) => {
				const [clave, valor] = cookie.split("="); // convierte el texto en un array de clave y valor
				obj[clave] = decodeURIComponent(valor); // crea el método en el objeto
				return obj;
			}, {});

		// Obtiene el resultado
		const resultado = elemento ? cookies[elemento] : cookies;

		// Fin
		return resultado;
	},
};
