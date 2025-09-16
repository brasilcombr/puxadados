var helper = {};

// 
helper.moneyFormat = function(value) {
	if (value == null) {
		return;
	}
	var result = null;
	if (value == 0) {
		result = "Gratuito";
		return result;
	}
	if (value == null) {
		return "--"
	}
	if (typeof value === 'string') {
		value = +value;
	}
	var options = {
		style: 'currency',
		currency: 'BRL',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}

	result = value.toLocaleString('pt-BR', options);

	return result;
}

helper.getBaseUrl = function () {
	var _url = window.location;
	if (_url.host == "www.devserver" || _url.host == "devserver") {
		return _url.protocol + "//" + _url.host + "/" + _url.pathname.split('/')[1] + "/" + _url.pathname.split('/')[2];
	}
	if (_url.host == "www.localhost" || _url.host == "localhost") {
		return _url.protocol + "//" + _url.host + "/" + _url.pathname.split('/')[1];
	}
	if (_url.host == "www.dockerdev" || _url.host == "dockerdev") {
		return _url.protocol + "//" + _url.host + "/" + _url.pathname.split('/')[1];
	}
	if (_url.host == "www.servidor" || _url.host == "servidor") {
		return _url.protocol + "//" + _url.host + "/" + _url.pathname.split('/')[1];
	}
	if (_url.host == "www.dockerdev" || _url.host == "dockerdev") {
		return _url.protocol + "//" + _url.host + "/" + _url.pathname.split('/')[1];
	}
	if (_url.host.slice(-9) == "dockerdev") {
		return _url.protocol + "//" + _url.host + "/" + _url.pathname.split('/')[1];
	}
	if (_url.host.slice(-9) == "devserver") {
		return _url.protocol + "//" + _url.host + "/" + _url.pathname.split('/')[1] + "/" + _url.pathname.split('/')[2] + "/" + _url.pathname.split('/')[3];
	}
	if (_url.host == "www.dev.liveecommerce.com.br") {
		if (_url.pathname.indexOf('developers') != -1) {
			return _url.protocol + "//" + _url.host + "/" + _url.pathname.split('/')[1] + "/" + _url.pathname.split('/')[2] + "/" + _url.pathname.split('/')[3];
		}
		return _url.protocol + "//" + _url.host + "/" + _url.pathname.split('/')[1];
	}
	
	return _url.protocol + "//" + _url.host;
}

helper.getUrlParams = function () {
	var queryString = window.location.search;
	var keyValPairs = [];
	var params = {};
	queryString = queryString.replace(/.*?\?/,"");

	if (queryString.length) {
		keyValPairs = queryString.split('&');
		for (pairNum in keyValPairs) {
			var key = keyValPairs[pairNum].split('=')[0];
			if (!key.length) continue;

			if (typeof params[key] === 'undefined')
				params[key] = [];

			params[key].push(keyValPairs[pairNum].split('=')[1]);
		}
	}
	return params;
}

helper.redirect = function (url) {
	if (window.isCacheable) {
		$(document).on('ajaxcache.ended', () => {
			window.location.href = url;
		});

		$(document).trigger({type: "ajaxcache.needupdate", url: url});

		return;
	}

	window.location.href = url;
}

helper.getFormData = function($form) {
	var unindexedArray = $form.serializeArray();
	var indexedArray = {};

	$.map(unindexedArray, function(n, i) {
		indexedArray[n['name']] = n['value'];
	});

	return indexedArray;
}

helper.htmlEncode = function(value) {
	return $('<div/>').text(value).html();
}

helper.htmlDecode = function(value) {
	return $('<div/>').html(value).text();
}

helper.isCartPage = function () {
	var cartPage = $("#cart-page");
	return cartPage.length == 0 ? false : true;
}

helper.isCheckoutPage = function () {
	var checkoutPage = $("#checkout-page");
	if (checkoutPage.length == 0){
		return false;
	}
	return true;
}

helper.isSummaryPage = function () {
	var summaryPage = $("#summary-page");

	if (summaryPage.length == 0){
		return false;
	}
	return true;
}


helper.viewUrl = function(targetElement, urlViewer, section) {
	$(document).on('input', targetElement, function () {
		$(section).show();

		let url = $(targetElement).val();

		if (!url) {
			$(section).hide();
			return;
		}

		try {
			url = new URL(url);
		} catch (e) {
			fixedText = $(urlViewer).attr('fixed-text');
			url = `${fixedText}${url}`;
			$(targetElement).val(url);
		}

		$(urlViewer).text(`${url}`);
	});
};

helper.defineCookie = function (name, value = "", days = 0) {
	let expires = "";
	if (days) {
		let date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = `; expires=${date.toUTCString()}`;
	}

	let cookie = `${name}=${value}${expires}; path=/`;
	console.log(cookie);
	document.cookie = cookie;
}

helper.getDate = function(addDays = 0) {
	actualDate = new Date();

	if (addDays <= 0) {
		return actualDate.toLocaleDateString("pt-BR");
	}

	summedDate = new Date();
	summedDate.setDate(actualDate.getDate() + addDays);
	return summedDate.toLocaleDateString("pt-BR");
}

helper.getCookie = function(cookieName) {
	let cookie = {};

	document.cookie.split(';').forEach(function(element) {
		let [key,value] = element.split('=');
		cookie[key.trim()] = value;
	});

	return cookie[cookieName];
}

helper.isCustomerPage = function () {
	var customerPage = $("#new-checkout.customer-panel");
	if (customerPage.length == 0){
		return false;
	}
	return true;
}

helper.getMonths = function () {
	var months = {
		'data': [
			{ 'value': 1, 'display': '01' },
			{ 'value': 2, 'display': '02' },
			{ 'value': 3, 'display': '03' },
			{ 'value': 4, 'display': '04' },
			{ 'value': 5, 'display': '05' },
			{ 'value': 6, 'display': '06' },
			{ 'value': 7, 'display': '07' },
			{ 'value': 8, 'display': '08' },
			{ 'value': 9, 'display': '09' },
			{ 'value': 10, 'display': '10' },
			{ 'value': 11, 'display': '11' },
			{ 'value': 12, 'display': '12' },
		]
	};
	return months; 
}

helper.closeModal = function () {
	$('.modal.fade').modal('hide');
}

helper.defineValidationRules = function(container, rules) {
	var selectors = container + ' input, ' + container + ' select';

	if ($(selectors).length == 0) {
		return;
	}

	$(selectors).each(function() {
		var name = $(this).attr('name');

		if (typeof rules[name] !== 'undefined') {
			$(this).rules('add', rules[name]);
		}
	});
}

// Verify if content is empty or null than if is an empty string
helper.isEmpty = function (data) {
    return (!data || 0 === data.length);
}

helper.functionExists = function (data) {
	return typeof data === 'function';
}

helper.getBrowserName = function () {
	var browserName = '';
	var userAgent = navigator.userAgent;

	if(userAgent.indexOf('Chrome') > -1) {
		browserName = 'Google Chrome';
	} else if (userAgent.indexOf('Safari') > -1) {
		browserName = 'Apple Safari';
	} else if (userAgent.indexOf('Opera') > -1) {
		browserName = 'Opera';
	} else if (userAgent.indexOf('Firefox') > -1) {
		browserName = 'Mozilla Firefox';
	} else if (userAgent.indexOf('MSIE') > -1) {
		browserName = 'Microsoft Internet Explorer';
	} else {
		browserName = userAgent;
	}

	return browserName;
}

helper.getPlatform = function () {
	return navigator.platform;
}

helper.inputValueCopy = function () {
	var sourceSelector = '[data-value-source]';
	
	$(sourceSelector).each(function (index, element) {
		var targetSelector = '[data-value-target="'+ element.name +'"]';
		$(targetSelector).val(element.value);
	});
}

helper.strstr = function (haystack, needle, inversed) {
	var pos = 0;

	haystack += "";
	pos = haystack.indexOf(needle);
	if (pos == -1) {
		return false;
	}

	if (inversed) {
		return haystack.substr(0, pos);
	}

	return haystack.slice(pos);
}

helper.exists = function(selector) {
	if (helper.isEmpty(selector)) {
		return false;
	}

	return $(selector).length > 0;
}

helper.hasAttr = function (context, name) {
	var attr = $(context).attr(name);

	return typeof attr !== typeof undefined && attr !== false;
}

helper.screenWidth = function () {
	return (window.innerWidth > 0) ? window.innerWidth : screen.width;
}

helper.isObject = function (obj) {
	return obj === Object(obj);
}

helper.isNumeric = function (n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

helper.dataCopy = function (targetButton, targetSelector) {
	$(document).on('click', targetButton, function () {
		keyCopy = $(targetSelector).attr("text-target");
		try {
			var keyElement = document.createElement('textarea');
			keyElement.value = keyCopy;

			keyElement.style.display = 'none !important';

			document.body.appendChild(keyElement);
			keyElement.select();
			keyElement.setSelectionRange(0, 99999);

			// Now that we've selected the anchor text, execute the copy command
			document.execCommand('copy');
			document.body.removeChild(keyElement);

			alert("Copiado para a área de transferência: " + keyCopy);
		} catch(err) {
			console.log('Oops, unable to copy');
		}

		// Remove the selections - NOTE: Should use
		// removeRange(range) when it is supported
		window.getSelection().removeAllRanges();
	});
}

helper.changeElementExhibition = function (selector, action) {
	switch (action.toLowerCase()) {
		case 'hide':
			$(selector).hide();
			break;
		case 'show':
			$(selector).show();
			break;
		default:
			console.log('invalid action: ' + action + ', ' + selector);
			break;
	}
}

helper.downloadFile = function(url) {
	window.location.href = url + '?forcesave=true&v=' + new Date().getTime();
}

helper.charCount = function(haystack, needle) {
	if (!typeof haystack === "string" || !typeof needle === "string") {
		return;
	}

	let trimedHaystack = haystack.trim();
	let counter = 0;

	for (let index = 0; index < trimedHaystack.length; index++) {
		const element = trimedHaystack[index];

		if (element === needle) {
			counter++;
		}
	}

	return counter;
}

helper.removeSpecialChars = function() {
	$(document).on('keyup', '.form-control', function() {
		if ($(this).attr('accept-special-chars') == "true") {
			return;
		}

		var text = $(this).val();
		var clearedText = text.replace(/[^a-zA-ZÀ-ú-0-9\-\_\@\.\(\)\s\"\'\:\/\\#\$\%]/g, '');
		$(this).val(clearedText);

	});
}

$(function() {
	helper.removeSpecialChars();
})