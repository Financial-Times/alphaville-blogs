const oGrid = require('o-grid');

document.addEventListener('o.DOMContentLoaded', function () {
	const av2ContentEl = document.querySelector('.alphaville-content');
	const mlTabContainer = document.querySelector('.ml-tabs-container');
	let tabSelected = 0;


	if (mlTabContainer) {
		mlTabContainer.addEventListener('oTabs.tabSelect', function (evt) {
			switch (evt.detail.selected) {
				case 0:
					tabSelected = 0;
					av2ContentEl.classList.remove('alphaville-alternative-bg');
					break;
				case 1:
					tabSelected = 1;
					av2ContentEl.classList.add('alphaville-alternative-bg');
					break;
			}
		});
	}

	window.addEventListener('resize', function () {
		if (['default', 'S'].indexOf(oGrid.getCurrentLayout()) === -1) {
			av2ContentEl.classList.remove('alphaville-alternative-bg');
		} else {
			if (tabSelected === 0) {
				av2ContentEl.classList.remove('alphaville-alternative-bg');
			} else {
				av2ContentEl.classList.add('alphaville-alternative-bg');
			}
		}
	});
});
