var loading = {};

loading.defaultRelative = 'body';

loading.setup = function(element) {
	loading.setRelative(element);
	if (loading.isLoaded()) {
		return;
	}

	loading.element = null;
	loading.loaded = true;
	loading.showing = false;

	loading.create();
}

loading.isLoaded = function() {
	return loading.loaded;
}

loading.isShowing = function() {
	return loading.showing;
}

loading.canShow = function() {
	var path = window.location.pathname;

	if (/\/(compra|cliente|pedido|catalogo)\/.*/i.test(path) || /\/(catalogo)\//) {
		return true;
	}

	return false;
}

loading.setRelative = function(element) {
	element = element || loading.defaultRelative;

	// Caso mobile, sempre será fullscreen
	if (helper.screenWidth() <= 968) {
		element = loading.defaultRelative;
	}

	if (element !== loading.relative) {
		loading.removeRelativeClass();
		loading.showing = false;
		loading.loaded = false;
		$(loading.element).remove();
	}

	loading.relative = element;
}

loading.template = function() {
	var template = '<div id=\'loading\'>';
	template += '<div id=\'loader\'>';
	template += '<div class=\'spinner\'>';
	template += '<div class=\'ball ball-1\'> </div>';
	template += '<div class=\'ball ball-2\'> </div>';
	template += '<div class=\'ball ball-3\'> </div>';
	template += '<div class=\'ball ball-4\'> </div>';
	template += '</div>';
	template += '</div>';
	template += '<div class=\'loading-backdrop\'></div>';
	template += '</div>';

	return template;
}

loading.create = function() {
	loading.element = $(loading.template());
	$(loading.relative).append(loading.element);
	
	loading.element.hide();
}

/**
 * Function display the loading fullscreen by default, otherwise display on the element passed by parameter
 * 
 * Always remember to use 'loading.hide()' on the callback function
 * @param {string} [element=null] - Element selector, wich the loading will be displayed
 */
loading.show = function(element) {
	loading.setup(element);
	if (loading.isShowing() || !loading.canShow()) {
		return;
	}

	loading.addRelativeClass();
	loading.showing = true;
	loading.element.show();
}

/**
 * Function hide the actual loading if displayed
 */
loading.hide = function() {
	loading.setup();
	if (!loading.isShowing()) {
		return;
	}

	loading.removeRelativeClass();
	loading.showing = false;
	loading.element.hide();
}

loading.addRelativeClass = function() {
	element = loading.relative || loading.defaultRelative;

	$(element).addClass('loading-relative');
}

loading.removeRelativeClass = function() {
	element = loading.relative || loading.defaultRelative;

	$(element).removeClass('loading-relative');
}