var category = [];

category.viewMore = () => {
	const section = document.querySelector('.category-page__info');

    if (!section) {
        return;
    }

    const button = section.querySelector('.category-page__more-info');
    const html = section.querySelector('.category-page__html');

    if (window.outerHeight > 300) {
        button.addEventListener('click', () => {
			if (html.classList.contains("open")) {
				html.classList.remove("open");
			} else {
				html.classList.add("open");
                button.classList.add('hidden');
			}
		});
    } else {
        button.classList.add('hidden');
    }
}

category.toggleFilters = () => {
    const buttons = document.querySelectorAll('.filters__button');

    function removeCssToAllSubmenus() {
        const submenus = document.querySelectorAll('.filters__submenu');

        submenus.forEach(submenu => {
            submenu.classList.remove('open');
        });
    }

    buttons.forEach((button) => {
        const submenu = button.parentElement.querySelector('.filters__submenu');
        button.addEventListener('click', () => {
            const isOpen = submenu.classList.contains('open');
            removeCssToAllSubmenus();

            if (!isOpen) {
                category.toggleClass(submenu, 'open');
            }
        });
    });
}

category.menuMobile = () => {
	const grid = document.querySelector('#grid');
	const overlay = document.querySelector('.overlay');
	const closeButton = document.querySelector('[data-close-menu]');
	const menuButton = document.querySelector('[data-menu-button]');
	const menuMobile = document.querySelector('.menu-mobile');
	const menu = document.querySelector('[data-menu-mobile]');
	const menuElement = '.header__menu__item';

	const closeMenu = () => {
		overlay.classList.remove('open');
		menuMobile.classList.remove('open');
		grid.classList.remove('noscroll');
	}

	closeButton.addEventListener('click', closeMenu);
	overlay.addEventListener('click', closeMenu);

	menuButton.addEventListener('click', () => {
		menuMobile.classList.add('open');
		overlay.classList.add('open');
		grid.classList.add('noscroll');
	});

	const buttons = menu.querySelectorAll(`.menu-mobile__icon`);

	buttons.forEach((button) => {
		button.addEventListener('click', () => {
			category.toggleClass(button, 'open');

			const child = button.parentElement.parentElement.querySelector(`${menuElement}__child`);
			if (child) {
				category.toggleClass(child, 'open');
			} else {
				const grandChild = button.parentElement.parentElement.querySelector(`${menuElement}__grandchild`);

				if (grandChild) {
					category.toggleClass(grandChild, 'open');
				}
			}
		});
	});
}

category.toggleClass = (element, className) => {
	if (!element) {
		return false;
	}

	if (element.classList.contains(className)) {
		element.classList.remove(className);
		return false;
	} else {
		element.classList.add(className);
		return true;
	}
}

category.changeProductListType = () => {
    const grid = 'product-list--alternative';
    const simple = 'product-list--simple';

    const productList = document.querySelector('.product-list');
    const gridButtons = document.querySelectorAll('[data-product-list-grid]');
    const simpleButtons = document.querySelectorAll('[data-product-list-simple]');

	function removeSelectedOnButton(buttons) {
		buttons.forEach(button => button.classList.remove("selected"));
	}

    gridButtons.forEach(gridButton => {
        gridButton.addEventListener('click', () => {
            gridButton.classList.add('selected');
			removeSelectedOnButton(simpleButtons);
            productList.classList.add(grid);
            productList.classList.remove(simple);
        });
    });

    simpleButtons.forEach(simpleButton => {
        simpleButton.addEventListener('click', () => {
			removeSelectedOnButton(gridButtons);
            simpleButton.classList.add('selected');
            productList.classList.remove(grid);
            productList.classList.add(simple);
        });
    });
}


category.filtersMobile = () => {
	const grid = document.querySelector('#grid');
	const overlay = document.querySelector('.overlay');
	const closeButton = document.querySelector('[data-close-filters]');
	const menuButton = document.querySelectorAll('[data-filters-button]');
	const menuMobile = document.querySelector('.filters-mobile');
	const menu = document.querySelector('[data-menu-mobile]');

	const closeMenu = () => {
		overlay.classList.remove('open');
		menuMobile.classList.remove('open');
		grid.classList.remove('noscroll');
	}

	closeButton.addEventListener('click', closeMenu);
	overlay.addEventListener('click', closeMenu);

    menuButton.forEach(button => {
        button.addEventListener('click', () => {
            menuMobile.classList.add('open');
            overlay.classList.add('open');
            grid.classList.add('noscroll');
        });
    });
}

category.getOrdSelected = function() {
    const ordUrlParams = new URLSearchParams(window.location.search);
	const ord = ordUrlParams.get('ord');

	if (ord) {
		const label = document.querySelectorAll(`label[for="ord${ord}"]`);

		if  (label.length) {
			const buttons = document.querySelectorAll('.filters__button span');

            if (buttons.length) {
                buttons.forEach((button) => button.innerText = label[0].innerText);
            }
			
		}
	}
}

$(function() {
    category.viewMore();
    category.toggleFilters();
    category.changeProductListType();
    category.filtersMobile();
	category.getOrdSelected();
	category.menuMobile();
});