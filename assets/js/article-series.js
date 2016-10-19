{
	const toggleClass = (el, className) => {
		if (el.classList) {
			el.classList.toggle(className);
		} else {
			var classes = el.className.split(' ');
			var existingIndex = classes.indexOf(className);

			if (existingIndex >= 0)
				classes.splice(existingIndex, 1);
			else
				classes.push(className);

			el.className = classes.join(' ');
		}
	};

	document.addEventListener('o.DOMContentLoaded', () => {
		const avSeriesTitle = document.querySelectorAll('.av-series-title');
		if (avSeriesTitle && avSeriesTitle.length) {
			avSeriesTitle.forEach(el => {
				el.addEventListener('click', (e) => {
					let titleEl;
					if (e.target.className) {
						titleEl = e.target;
					} else {
						titleEl = e.target.parentNode;
					}
					let articlesEl = titleEl.nextElementSibling;
					toggleClass(titleEl, 'active');
					toggleClass(articlesEl, 'active');
				});
			});
		}
	});
}
