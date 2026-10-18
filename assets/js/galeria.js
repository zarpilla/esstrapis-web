(function() {

	var PATH = 'images/galeria/';

	var groups = [
		{ id: 'projectes', name: 'Projectes' },
		{ id: 'temps', name: 'Temps' },
		{ id: 'diners', name: 'Diners' },
		{ id: 'subvencions', name: 'Subvencions' },
		{ id: 'informes', name: 'Informes' },
		{ id: 'logistica', name: 'Logística' }
	];

	var images = [
		{ group: 'projectes', file: '02-projectes', title: 'Llistat de projectes', text: 'Resultat previst i real de cada projecte, d\'un cop d\'ull.' },
		{ group: 'projectes', file: '04-projecte-resum', title: 'Resum d\'un projecte', text: 'Ingressos, despeses i hores: previst, real i desviació.' },
		{ group: 'projectes', file: '06-projecte-pressupost-fases', title: 'Pressupost per fases', text: 'Ingressos, despeses i hores previstes a cada fase.' },
		{ group: 'projectes', file: '09-projecte-planificacio', title: 'Planificació', text: 'Diagrama de Gantt de les fases i les tasques.' },
		{ group: 'projectes', file: '19-tasques-tauler', title: 'Tasques', text: 'Tauler per estats, també en llista i en calendari.' },
		{ group: 'temps', file: '14-hores-calendari', title: 'Hores dedicades', text: 'El mes d\'una persona: cada color és un projecte.' },
		{ group: 'temps', file: '17-registre-jornades', title: 'Registre de jornada', text: 'Entrades i sortides, amb el resum de la setmana.' },
		{ group: 'temps', file: '70-mobil-hores', title: 'Des del mòbil', text: 'Al mòbil, el calendari del mes i, a sota, cada entrada amb el nom sencer del projecte.', mobile: true },
		{ group: 'diners', file: '22-ingressos', title: 'Ingressos', text: 'Factures emeses, amb els totals a dalt.' },
		{ group: 'diners', file: '30-tresoreria', title: 'Tresoreria', text: 'Saldo previst mes a mes i moviments pendents.' },
		{ group: 'diners', file: '63-admin-verifactu-face', title: 'Verifactu i FACe', text: 'Enviament de factures a l\'AEAT i a l\'Administració pública.' },
		{ group: 'subvencions', file: '53-subvencions', title: 'Subvencions', text: 'Imports concedits, cobrats i pendents de cada subvenció.' },
		{ group: 'informes', file: '40-informe-panell-projectes', title: 'Panell de projectes', text: 'Resultat previst i real de tots els projectes de l\'any.' },
		{ group: 'informes', file: '46-informe-previsio-economica', title: 'Previsió econòmica', text: 'Ingressos i despeses previstes per als anys vinents.' },
		{ group: 'informes', file: '41-informe-dedicacio', title: 'Dedicació', text: 'Hores previstes i reals per persona i per projecte.' },
		{ group: 'informes', file: '81-fosc-projecte-resum', title: 'Mode fosc', text: 'Tota l\'aplicació també en fosc.' },
		{ group: 'logistica', file: 'logistica-comandes-dia', title: 'Comandes per dia', text: 'Estadístiques de les comandes repartides, per tipus.' }
	];

	var dialog = document.getElementById('viewer');
	if (!dialog || !dialog.showModal) return;

	var img = dialog.querySelector('img');
	var title = dialog.querySelector('figcaption strong');
	var text = dialog.querySelector('figcaption small');
	var tabs = dialog.querySelector('.viewer-tabs');
	var current = 0;

	groups.forEach(function(g) {
		var b = document.createElement('button');
		b.type = 'button';
		b.textContent = g.name;
		b.dataset.group = g.id;
		b.addEventListener('click', function() { show(firstOf(g.id)); });
		tabs.appendChild(b);
	});

	function firstOf(group) {
		for (var i = 0; i < images.length; i++)
			if (images[i].group === group) return i;
		return 0;
	}

	function show(i) {
		current = (i + images.length) % images.length;
		var item = images[current];
		img.src = PATH + item.file + '.webp';
		img.alt = item.title;
		title.textContent = item.title;
		text.textContent = item.text + ' (' + (current + 1) + '/' + images.length + ')';
		tabs.querySelectorAll('button').forEach(function(b) {
			b.setAttribute('aria-pressed', b.dataset.group === item.group ? 'true' : 'false');
		});
		// Precarrega la següent
		new Image().src = PATH + images[(current + 1) % images.length].file + '.webp';
	}

	function open(i) {
		show(i);
		if (!dialog.open) dialog.showModal();
	}

	document.addEventListener('click', function(e) {
		var a = e.target.closest('[data-gallery]');
		if (!a) return;
		e.preventDefault();
		var key = a.getAttribute('data-gallery');
		var byFile = images.findIndex(function(x) { return x.file === key; });
		open(byFile >= 0 ? byFile : firstOf(key));
	});

	dialog.querySelector('.viewer-prev').addEventListener('click', function() { show(current - 1); });
	dialog.querySelector('.viewer-next').addEventListener('click', function() { show(current + 1); });
	dialog.querySelector('.viewer-close').addEventListener('click', function() { dialog.close(); });

	dialog.addEventListener('click', function(e) {
		if (e.target === dialog || e.target.tagName === 'FIGURE') dialog.close();
	});

	dialog.addEventListener('keydown', function(e) {
		if (e.key === 'ArrowLeft') show(current - 1);
		if (e.key === 'ArrowRight') show(current + 1);
	});

	var startX = null;
	dialog.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
	dialog.addEventListener('touchend', function(e) {
		if (startX === null) return;
		var dx = e.changedTouches[0].clientX - startX;
		if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
		startX = null;
	});

})();
