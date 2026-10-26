// «ESSTrapis en xifres»: evolució per any de totes les entitats (sense demo ni
// còpies de prova). Per actualitzar-ho, canvia només DADES i FINS_A.
// Font: recomptes a les bases de dades dels tenants + commits del front i del back antic (zarpilla/projectes).
(function () {
	var ANYS = [2021, 2022, 2023, 2024, 2025, 2026];
	var FINS_A = "fins a octubre de 2026"; // l'últim any encara no s'ha acabat

	var DADES = [
		{ titol: "Entitats", text: "que fan servir ESSTrapis", valors: [3, 4, 5, 9, 11, 14], total: "ultim" },
		{ titol: "Projectes", text: "gestionats", valors: [148, 176, 144, 192, 259, 242] },
		{ titol: "Hores", text: "dedicades i registrades", valors: [17069, 23342, 30577, 52757, 59931, 50400] },
		{ titol: "Factures emeses", text: "a clientes i finançadores", valors: [1, 178, 296, 405, 615, 534] },
		{ titol: "Factures rebudes", text: "de proveïdores", valors: [3, 333, 766, 1089, 1239, 983] },
		{ titol: "Canvis al codi", text: "commits a l'aplicació", valors: [176, 343, 104, 251, 195, 921] }
	];

	var num = function (n) { return n.toLocaleString("ca-ES"); };

	var lloc = document.getElementById("xifres-grafics");
	if (!lloc) return;

	DADES.forEach(function (d) {
		var max = Math.max.apply(null, d.valors);
		var total = d.total === "ultim" ? d.valors[d.valors.length - 1]
			: d.valors.reduce(function (a, b) { return a + b; }, 0);

		var barres = d.valors.map(function (v, i) {
			var parcial = i === ANYS.length - 1;
			var etiqueta = ANYS[i] + ": " + num(v) + (parcial ? " (" + FINS_A + ")" : "");
			return '<li class="barra' + (parcial ? " parcial" : "") + '" tabindex="0" aria-label="' + etiqueta + '">' +
				'<span class="barra-fons"><span class="barra-col" style="height:' + Math.max(1.5, (v / max) * 100) + '%"></span></span>' +
				'<span class="tip">' + etiqueta + "</span>" +
				'<span class="any">' + String(ANYS[i]).slice(2) + (parcial ? "*" : "") + "</span>" +
				"</li>";
		}).join("");

		var targeta = document.createElement("div");
		targeta.className = "xifra";
		targeta.innerHTML =
			'<p class="xifra-total">' + num(total) + "</p>" +
			'<p class="xifra-titol">' + d.titol + (d.text ? ' <span>' + d.text + "</span>" : "") + "</p>" +
			'<ol class="barres" aria-label="' + d.titol + ' per any">' + barres + "</ol>";
		lloc.appendChild(targeta);
	});

	var nota = document.getElementById("xifres-nota");
	if (nota) nota.textContent = "Totals des de 2021 (entitats: les d'ara). *2026: " + FINS_A + ".";
})();
