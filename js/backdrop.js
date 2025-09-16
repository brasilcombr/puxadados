var backdrop = {};

backdrop.setup = function() {
	if (backdrop.isLoaded()) {
		return;
	}

	backdrop.element = null;
	backdrop.loaded = true;
	backdrop.showing = false;

	backdrop.create();
}

backdrop.isLoaded = function() {
	return backdrop.loaded;
}

backdrop.isShowing = function() {
	return backdrop.showing;
}

backdrop.canShow = function() {
	var path = window.location.pathname;

	if (/\/(compra|cliente|pedido)\/.*/i.test(path)) {
		return true;
	}

	return false;
}

backdrop.template = function() {
	var template = '<div id=\'backdrop\'> </div>';

	return template;
}

backdrop.create = function() {
	if (helper.exists(backdrop.element)){
		return;
	}

	backdrop.element = $(backdrop.template());
	$('body').append(backdrop.element);

	backdrop.element.hide();
}

backdrop.show = function() {
	backdrop.setup();
	if (backdrop.isShowing() || !backdrop.canShow()) {
		return;
	}

	backdrop.showing = true;
	backdrop.element.show();
	if (helper.screenWidth() <= 968) {
		loading.show();
	}
}

backdrop.hide = function() {
	backdrop.setup();
	
	if (!backdrop.isShowing()) {
		return;
	}

	backdrop.showing = false;
	backdrop.element.hide();
	if (helper.screenWidth() <= 968) {
		loading.hide();
	}
}