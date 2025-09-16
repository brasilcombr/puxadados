/*
 * Eventos de Ajax:
 * 
 * 'ajax.started' - Inicio da requisição:
 * Evento disparado quando se inicia requisição que foi processada na fila
 * 
 * 'ajax.ended' - Fim da requisição:
 * Evento disparado quando acaba requisição que foi processada na fila
 */

var ajax = {};

ajax.POST = 1;
ajax.GET = 2;

ajax.checkTimeout;

ajax.setup = function() {
	if (ajax.loaded) {
		return;
	}

	ajax.queue = [];
	ajax.maxQueue = 10;
	ajax.totalEnqueued = 0;
	ajax.busy = false;
	ajax.loaded = true;

	ajax.form();
	ajax.link();

	ajax.processQueue();
	ajax.loaded = true;
	ajax.blockedCheck = false;

	ajax.trackEvents();
}

ajax.isBusy = function() {
	return ajax.busy;
}

ajax.hasEmptyQueue = function() {
	return ajax.queue.length == 0;
}

ajax.enqueue = function(
	method,
	url,
	data,
	callback,
	processData,
	contentType
) {
	ajax.setup();

	if (ajax.queue.length == ajax.maxQueue) {
		return;
	}

	var request = {
		_method: method,
		_url: url,
		_data: data,
		_callback: callback,
		_processData: processData,
		_contentType: contentType
	};

	ajax.queue.push(request);
	ajax.totalEnqueued++;
}

ajax.checkBackdrop = function() {
	if (!backdrop || ajax.blockedCheck) {
		return;
	}

	if (ajax.isBusy()) {
		backdrop.show();
		clearTimeout(ajax.checkTimeout);
	} else {
		ajax.checkTimeout = setTimeout(function() {
			if (ajax.isBusy() || ajax.blockedCheck) {
				return;
			}

			backdrop.hide();
		}, 500);
	}
}

ajax.forcedBusy = function() {
	ajax.blockedCheck = true;
	backdrop.show();
}

ajax.removeForcedBusy = function() {
	backdrop.hide();
	ajax.blockedCheck = false;
}

ajax.processQueue = function() {
	setInterval(function() {
		if (ajax.isBusy() || ajax.hasEmptyQueue()) {
			return;
		}

		var nextRequest = $(ajax.queue).first()[0];
		ajax.queue.shift();

		ajax.send(
			nextRequest._method,
			nextRequest._url,
			nextRequest._data,
			nextRequest._callback,
			nextRequest._contentType,
			nextRequest._processData
		);
	}, 100);
}

ajax.send = function(
	method,
	url,
	data,
	callback,
	contentType,
	processData
) {
	var link = url;
	var values = data;
	var defaultError = 'Houve um problema ao processar sua requisi&ccedil;&atilde;o, tente novamente mais tarde.';

	if (method == ajax.POST) {
		method = "POST";
	} else {
		method = "GET";
	}

	if (contentType == 'undefined') {
		contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
	}

	if (processData == 'undefined') {
		processData = true;
	}

	ajax.busy = true;
	$(document).trigger("ajax.started");

	$.ajax({
		url: link,
		type: method,
		data: values,
		dataType: "json",
		async: true,
		contentType: contentType,
		processData: processData,
		success: function(data) {
			var finalData = null;
			callback = callback || null;
			if (typeof X !== 'undefined' && typeof X.json !== 'undefined' && data.data && typeof data.data.type !== 'undefined') {
				X.json(data);
			} else {
				finalData = {
					"error": false,
					"data": data
				};
			}

			ajaxutils.executeFunctionByName(callback, window, finalData);

			ajax.busy = false;
			$(document).trigger("ajax.ended");
		},
		error: function(request) {
			var finalData = {};
			finalData.error = true;
			finalData.message = typeof request.responseJSON === 'object' ? request.responseJSON.message : defaultError;
			finalData.callback = typeof request.responseJSON === 'object' ? request.responseJSON.callback : null;

			callback = callback || null;
			ajaxutils.executeFunctionByName(callback, window, finalData);

			ajax.busy = false;
			$(document).trigger("ajax.ended");
		}
	});

	return false;
}

ajax.link = function() {
	var selector = "a[data-href],button[data-href],input[data-href],label[data-href]";
	var event = "click";
	var urlSource = "data-href";
	var askSource = "data-ask";
	var askModalSource = "data-ask-modal";
	var callbackSource = "data-callback";
	var askActionSource = "data-ask-action";
	var askParamsSource = "data-ask-params";
	var templateSource = "data-template-selector";

	ajax.makeLink(selector);

	$(document).on(event, selector, function(e) {
		var url = $(this).attr(urlSource);
		var ask = $(this).attr(askSource);
		var callback = $(this).attr(callbackSource);
		var askModal = $(this).attr(askModalSource);
		var askAction = $(this).attr(askActionSource);
		var askParams = $(this).attr(askParamsSource);
		var templateSelector = $(this).attr(templateSource) || '#msgModalTemplate';

		if (askModal) {
			ajaxutils.showAskModal(askModal, url, askAction, askParams, callback, templateSelector);
			return false;
		} else if (ask && !confirm(ask)) {
			return false;
		}

		ajax.enqueue(ajax.GET, url, null, callback);
		return false;
	});
}

ajax.form = function() {
	ajax.formButton();
	ajax.formInput();

	var selector = "form[data-action]";
	var event = "submit";
	var urlSource = "data-action";
	var encodeSource = "data-encode";
	var callbackSource = "data-callback";
	
	var additionalSource = "additional-form-data";
	var additionalRemoveSource = "additional-form-data-remove";

	$(document).on(event, selector, function(e) {
		var url = $(this).attr(urlSource);
		var encode = $(this).attr(encodeSource);
		var callback = $(this).attr(callbackSource);
		var additional = $(this).attr(additionalSource);
		var additionalRemove = $(this).attr(additionalRemoveSource);
		
		var data = $(this).serialize();
		var method = $(this).attr("method");

		if (additional) {
			var additionalData = ajaxutils.getFormData(additional, additionalRemove);
			data += "&" + additionalData;
		}

		if (encode == "true") {
			data = "encode=" + btoa(data);
		}

		if (method == "get" || !method) {
			method = ajax.GET;
			url += "?" + data;
			data = null;
		} else {
			method = ajax.POST;
		}

		ajax.enqueue(method, url, data, callback);

		e.preventDefault();
		return false;
	});
}

ajax.formButton = function() {
	var selector = "[data-submit]";
	var event = "click";

	$(document).on(event, selector, function(e) {
		var formSelector = $(this).attr("data-submit");

		if (formSelector.length > 0) {
			$(formSelector).submit();
		} else {
			$(this).closest("form").submit();
		}

		$('[data-remove-freight]').click();

		e.preventDefault();
		return false;
	});
}

ajax.formInput = function() {
	var selector = "form[data-action] input";
	var event = "keypress";

	$(document).on(event, selector, function(e) {
		var form = this.form;
		var enterKey = e.which == 13;
		var allowSubmit = helper.hasAttr(form, 'data-allow-submit');

		if (allowSubmit && enterKey) {
			$(form).submit();
			return false;
		} else if (enterKey) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	});
}

ajax.makeLink = function(selector) {
	var links = $(selector);

	if (links.length == 0) {
		return;
	}

	links.each(function() {
		$(this).attr("href", "javascript:void(0)");
	});
}

ajax.trackEvents = function() {
	$(document).on('ajax.started ajax.ended', function() {
		ajax.checkBackdrop();
	});
}

$(function(){
	ajax.setup();
});
