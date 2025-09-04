"use strict";
window.addEventListener("load", () => {
	// Variables
	const form = document.querySelector("#form");
	const DOM = {
		// OK/Errores
		iconosOK: form.querySelectorAll(".inputError .fa-circle-check"),
		iconosError: form.querySelectorAll(".inputError .fa-circle-xmark"),
		mensajesError: form.querySelectorAll(".inputError .mensajeError"),
		credenciales: form.querySelector("#credenciales"),

		// Varios del form
		inputs: form.querySelectorAll(".inputError .input"),
		submit: form.querySelector("button[type='submit']"),
		olvidoContr: form.querySelector(".iconos #olvidoContr"),

		// Partes del cartel
		cartelMailExitoso: document.querySelector("#cartelMailExitoso"),
		contenedorMensajes: document.querySelector("#cartelMailExitoso #contenedorMensajes"),
	};
	const testigo = {};
	const errores = {};

	// Funciones
	const FN = {
		obtieneErroresPorCampo: async (input) => {
			// Variables
			const campo = input.name;
			const valor = encodeURIComponent(input.value);
			const ruta = "/usuarios/api/us-valida-" + campo + "/?" + campo + "=" + valor;

			// Averigua los errores
			const ahora = Date.now();
			testigo[campo] = ahora; // 'testigo' es una variable global
			const obtieneErrores = await fetch(ruta).then((n) => n.json());

			// Si fue el último fetch, actualiza los errores del campo
			if (testigo[campo] == ahora) errores[campo] = obtieneErrores;

			// Fin
			return;
		},
		muestraErroresPorCampo: (indice) => {
			// Variables
			const campo = DOM.inputs[indice].name;
			const mensaje = errores[campo];

			// Reemplaza el mensaje, con particularidad para 'avatar'
			DOM.mensajesError[indice].innerHTML = mensaje;

			// Acciones en función de si hay o no mensajes de error
			mensaje ? DOM.iconosError[indice].classList.remove("ocultar") : DOM.iconosError[indice].classList.add("ocultar");
			mensaje ? DOM.iconosOK[indice].classList.add("ocultar") : DOM.iconosOK[indice].classList.remove("ocultar");

			// Fin
			return;
		},
		actualizaBotonSubmit: () => {
			// Variables
			const errores = Array.from(DOM.iconosError)
				.map((n) => n.className)
				.every((n) => n.includes("ocultar"));

			// Actualiza el botón 'login'
			errores ? DOM.submit.classList.remove("inactivo") : DOM.submit.classList.add("inactivo");

			// Fin
			return;
		},
		envioDeContrasena: async function () {
			// Elementos a ocultar
			DOM.olvidoContr.classList.add("inactivo"); // Inactiva el ícono de olvido de contraseña
			DOM.iconosError[1].classList.add("ocultar"); // oculta el error de la contraseña
			DOM.credenciales.classList.add("ocultar"); // oculta el error de credenciales
			DOM.inputs[1].value = ""; // elimina el valor de la contraseña

			// Genera los datos para el envío del mail
			const APIs = [{ruta: rutaEnvioContrasena + DOM.inputs[0].value, duracion: 9000}];

			// Envío de mail más cartel de progreso
			const mailEnviado = await barraProgreso(APIs);

			// Muestra el cartel de envío exitoso
			if (mailEnviado === true) this.muestraElCartel();
			else {
				errores.email = mailEnviado; // Actualiza el error para el mail
				this.muestraErroresPorCampo(0); // Muestra el error en el mail
			}

			// Fin
			return;
		},
		muestraElCartel: function () {
			// Crea el mensaje
			const mensajes = ["Te enviamos una nueva contraseña a tu email", "Copiala y usala en el login"];
			const [clase, titulo] = ["fa-thumbs-up", "Entendido"];

			// Crea el cartel en el DOM
			this.contenidoEnvioExitoso({mensajes, clase, titulo});

			// Muestra el cartel
			DOM.cartelMailExitoso.classList.remove("ocultar");

			// Espera un tiempo para ocultarlo
			setTimeout(this.ocultaCartelEnvioExitoso, 5000);

			// Fin
			return;
		},
		contenidoEnvioExitoso: ({mensajes, clase, titulo}) => {
			// Si el cartel ya fue creado, interrumpe la función
			if (DOM.contenedorMensajes.querySelector("#mensajes")) return;

			// Mensajes - crea el sector
			DOM.mensajes = document.createElement("ul");
			DOM.mensajes.id = "mensajes";
			DOM.mensajes.style.listStyleType = "disc";
			DOM.contenedorMensajes.appendChild(DOM.mensajes);

			// Mensajes - contenido
			for (let mensaje of mensajes) {
				const li = document.createElement("li");
				li.innerHTML = mensaje;
				DOM.mensajes.appendChild(li);
			}

			// Crea el ícono
			const i = document.createElement("i");
			i.classList.add("fa-solid", clase);
			i.title = titulo;

			// Crea el div 'iconosCartel'
			const div = document.createElement("div");
			div.id = "iconosCartel";
			div.appendChild(i);

			// Agrega todo al DOM
			DOM.cartelMailExitoso.appendChild(div);

			// Fin
			return;
		},
		ocultaCartelEnvioExitoso: () => {
			DOM.cartelMailExitoso.classList.add("ocultar"); // Oculta el cartel
			DOM.inputs[1].focus(); // Pone el foco en la contraseña
			return; // Fin
		},
	};

	// Eventos - Input
	DOM.inputs.forEach((input, i) => {
		input.addEventListener("input", async () => {
			// Mail en minúsculas
			if (input.name == "email") {
				const posicCursor = input.selectionStart;
				input.value = input.value.toLowerCase();
				input.selectionEnd = posicCursor;
				DOM.olvidoContr.classList.remove("inactivo");
			} else if (input.type == "password") DOM.iconosError[0].classList.add("ocultar"); // oculta el error de email

			// Oculta los errores del input
			DOM.iconosError[i].classList.add("ocultar");
			DOM.iconosOK[i].classList.add("ocultar");
			DOM.credenciales.classList.add("ocultar");

			// Tareas varias
			await FN.obtieneErroresPorCampo(input); // Detecta si hay errores
			FN.muestraErroresPorCampo(i); // Muestra los aciertos/errores
			FN.actualizaBotonSubmit(); // Activa/Desactiva el botón 'Guardar'

			// Fin
			return;
		});
	});
	// Eventos - Submit
	form.addEventListener("submit", async (e) => DOM.submit.className.includes("inactivo") && e.preventDefault());
	// Eventos - Olvido de contraseña
	DOM.olvidoContr.addEventListener("click", async () => {
		// Si el ícono está inactivo, interrumpe la función
		if (DOM.olvidoContr.className.includes("inactivo")) return;

		// Si el mail tiene algún error, interrumpe la función
		if (!DOM.iconosError[0].className.includes("ocultar")) return;

		// Revisa (otra vez) si el email está bien ingresado y si tiene algún error, interrumpe la función
		await FN.obtieneErroresPorCampo(DOM.inputs[0]);
		FN.muestraErroresPorCampo(0);
		if (!DOM.iconosError[0].className.includes("ocultar")) return;

		// Envía el mail de olvido de contraseña
		await FN.envioDeContrasena();

		// Fin
		return;
	});
	// Eventos - Cartel de envío exitoso
	DOM.cartelMailExitoso.addEventListener("click", () => FN.ocultaCartelEnvioExitoso());

	// Fin
	return;
});

// Variables
const rutaEnvioContrasena = "/usuarios/api/us-envio-de-contrasena/?email=";
