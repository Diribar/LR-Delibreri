"use strict";

window.addEventListener("load", () => {
	const domRol = document.querySelector("#derecha select[name='rol']");
	if (!domRol) return;

	// Evento
	domRol.addEventListener("change", async () => {
		const rol_id = domRol.value;
		console.log({rol_id});

		// Cambia el rol del usuario
		await fetch("/api/cambia-el-rol-del-usuario", {method: "PUT", body: rol_id});

		// Recarga la vista
		return location.reload();

	});

	// Fin
	return;
});
