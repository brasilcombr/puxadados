// var filter = [];

// filter.removeLastCharacter = function(url) {
// 	if (url.substr(url.length - 1) == "?") {
// 		url = url.substr(0, url.length - 1);
// 	}

// 	return url;
// }

// filter.removeParameter = function(parameter, url) {
// 	if (!url) {
// 		url = window.location.href;
// 	}

// 	var urlParts = url.split('?');
	
// 	if (urlParts.length >= 2) {
// 		var prefix = parameter + '=';
// 		var pars = urlParts[1].split(/[&;]/g);

// 		for (var i = pars.length; i-- > 0;) {
// 			if (pars[i].lastIndexOf(prefix, 0) !== -1) {
// 				pars.splice(i, 1);
// 			}
// 		}

// 		url = urlParts[0]+'?'+pars.join('&');
// 		return url;
// 	}
	
// 	return url;
// }

// filter.insertParameter = function(key, value, url) {
// 	if (url == null) {
// 		var url = window.location.href;
// 	}

// 	var keyRegex = key.replace("[", "\\[");
// 	keyRegex = keyRegex.replace("]", "\\]");

// 	var re = new RegExp("([?&])" + keyRegex + "=.*?(&|#|$)(.*)", "gi");

// 	if (re.test(url)) {
// 		if (typeof value !== 'undefined' && value !== null) {
// 			url = url.replace(re, '$1' + key + "=" + value + '$2$3');
// 		} else {
// 			var hash = url.split('#');
// 			url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
			
// 			if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
// 				url += '#' + hash[1];
// 			}
// 		}
// 	} else {
// 		if (typeof value !== 'undefined' && value !== null) {
// 			var separator = url.indexOf('?') !== -1 ? '&' : '?',
// 			hash = url.split('#');
// 			url = hash[0] + separator + key + '=' + value;
			
// 			if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
// 				url += '#' + hash[1];
// 			}
// 		}
// 	}

// 	location.href = url;
// }

// filter.getParameter = function(key, returnObject) {
// 	var values = [];
// 	var target = location.href;

// 	if (returnObject) {
// 		values = {};
// 	}
	
// 	key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

// 	var pattern = key + '=([^&#]+)';
// 	var regex = new RegExp(pattern,'ig');
	
// 	while (true) {
// 		var matches = regex.exec(target);
		
// 		if (matches && matches[1]) {
// 			if (returnObject) {
// 				values[matches[1]] = unescape(matches[2]);
// 			} else {
// 				values.push(unescape(matches[1]));
// 			}
// 		} else {
// 			break;
// 		}
// 	}

// 	if (returnObject) {
// 		return values;
// 	}

// 	if (!values.length) {
// 		return null;
// 	} else {
// 		return values.length == 1 ? values[0] : values;
// 	}
// }

// filter.loadCheckParameter = function(key, fieldSelector) {
// 	var value = filter.getParameter(key);

// 	if (value !== null && value.length > 0) {
// 		if (value.indexOf(',') === -1) {
// 			$(fieldSelector + "[value='" + value + "']").prop('checked', true);
// 		} else {
// 			var values = value.split(',');
// 			$(fieldSelector).each(function(i, option) {
// 				var options = option.value.split(',');
// 				for (i=0; i < values.length; i++) {
// 					if (options.indexOf(values[i]) !== -1) {
// 						$(option).prop('checked', true);
// 					}
// 				}
// 			});
// 		}
// 	}
// }

// filter.loadCheckParameterArray = function(key, fieldSelector) {
// 	var parameter = filter.getParameter(key + "[(\\w+)]", true);

// 	if (!$.isEmptyObject(parameter)) {
// 		$.each(parameter, function(fieldName, value) {
// 			if (value.indexOf(',') === -1) {
// 				$(fieldSelector + "[name='" + key + "\[" + fieldName + "\]'][value='" + value + "']").prop('checked', true);
// 			}
// 			else {
// 				var values = value.split(',');
// 				for (i = 0; i < values.length; i++) {
// 					$(fieldSelector + "[name='" + key + "\[" + fieldName + "\]'][value='" + values[i] + "']").prop('checked', true);
// 				}
// 			}
// 		});
// 	}
// }

// filter.loadSelectParameter = function(key, fieldSelector) {
// 	var value = filter.getParameter(key);
	
// 	if (value !== null && value.length > 0) {
// 		$(fieldSelector).find("option[value='" + value + "']").attr('selected', 'selected');
// 		$(fieldSelector).trigger("change");
// 	}
// }

// filter.treatParameterChange = function(selector) {
// 	$(document).on("change", selector, function() {
// 		var value = "";
// 		var name = $(this).attr("name");
		
// 		$(selector + "[name='" + name + "']").each(function() {
// 			if ($(this).is(':checked')) {
// 				value += $(this).val() + ",";
// 			}
// 		});

// 		value = value.substring(0, value.length - 1);
// 		url = window.location.href;
// 		url = filter.removeParameter('minp', url);
// 		url = filter.removeParameter('maxp', url);
// 		url = filter.removeParameter('pag', url);
		
// 		if (value.length > 0) {
// 			filter.insertParameter(name, value, url);
// 		} else {
// 			url = filter.removeParameter(name);
// 			url = filter.removeLastCharacter(url);

// 			location.href = url;
// 		}
// 	});
// }

// filter.treatGenericParameter = function() {
// 	$(document).on("change", ".url-modifier", function() {
// 		filter.insertParameter($(this).attr("data-urlparam"), $(this).val(), null);
// 	});
// }

// $(function(){
// 	filter.loadSelectParameter("ord", "#ordertype");
// 	filter.loadSelectParameter("list", "#listtype");

// 	filter.loadCheckParameter("tam", ".tamanho-order");
// 	filter.loadCheckParameter("opc", ".opcao-order");
// 	filter.loadCheckParameter("forn", ".forn-order");
// 	filter.loadCheckParameterArray("specs", ".specs-order");

// 	filter.treatParameterChange(".tamanho-order");
// 	filter.treatParameterChange(".opcao-order");
// 	filter.treatParameterChange(".forn-order");
// 	filter.treatParameterChange(".specs-order");

// 	filter.treatGenericParameter();
// });

var filter = [];

filter.removeLastCharacter = function(url) {
	if (url.substr(url.length - 1) == "?") {
		url = url.substr(0, url.length - 1);
	}

	return url;
}

filter.removeParameter = function(parameter, url) {
	if (!url) {
		url = window.location.href;
	}

	var urlParts = url.split('?');   
	
	if (urlParts.length >= 2) {
		var prefix = parameter + '=';
		var pars = urlParts[1].split(/[&;]/g);

		for (var i = pars.length; i-- > 0;) {    
			if (pars[i].lastIndexOf(prefix, 0) !== -1) {  
				pars.splice(i, 1);
			}
		}

		url = urlParts[0]+'?'+pars.join('&');
		return url;
	}
	
	return url;
}

filter.insertParameter = function(key, value, url) {
	if (url == null) {
		var url = window.location.href;
	}

	var keyRegex = key.replace("[", "\\[");
	keyRegex = keyRegex.replace("]", "\\]");

	var re = new RegExp("([?&])" + keyRegex + "=.*?(&|#|$)(.*)", "gi");

	if (re.test(url)) {
		if (typeof value !== 'undefined' && value !== null) {
			url = url.replace(re, '$1' + key + "=" + value + '$2$3');
		} else {
			var hash = url.split('#');
			url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
			
			if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
				url += '#' + hash[1];
			}
		}
	} else {
		if (typeof value !== 'undefined' && value !== null) {
			var separator = url.indexOf('?') !== -1 ? '&' : '?',
			hash = url.split('#');
			url = hash[0] + separator + key + '=' + value;
			
			if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
				url += '#' + hash[1];
			}
		}
	}

	location.href = url;
}

filter.getParameter = function(key, returnObject) {
	var values = [];
	var target = location.href;

	if (returnObject) {
		values = {};
	}
	
	key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

	var pattern = key + '=([^&#]+)';
	var regex = new RegExp(pattern,'ig');
	
	while (true) {
		var matches = regex.exec(target);
		
		if (matches && matches[1]) {
			if (returnObject) {
				values[matches[1]] = unescape(matches[2]);
			} else {
				values.push(unescape(matches[1]));
			}
		} else {
			break;
		}
	}

	if (returnObject) {
		return values;
	}

	if (!values.length) {
		return null;   
	} else {
		return values.length == 1 ? values[0] : values;
	}
}

filter.loadCheckParameter = function(key, fieldSelector) {
	var value = filter.getParameter(key);

	if (value !== null && value.length > 0) {
		if (value.indexOf(',') === -1) {
			$(fieldSelector + "[value='" + value + "']").prop('checked', true);
		} else {
			var values = value.split(',');
			$(fieldSelector).each(function(i, option) {
				var options = option.value.split(',');
				for (i=0; i < values.length; i++) {
					if (options.indexOf(values[i]) !== -1) {
						$(option).prop('checked', true);
					}
				}
			});
		}
	}
}

filter.loadCheckParameterArray = function(key, fieldSelector) {
	var parameter = filter.getParameter(key + "[(\\w+)]", true);

	if (!$.isEmptyObject(parameter)) {
		$.each(parameter, function(fieldName, value) {
			if (value.indexOf(',') === -1) {
				$(fieldSelector + "[name='" + key + "\[" + fieldName + "\]'][value='" + value + "']").prop('checked', true);
			}
			else {
				var values = value.split(',');
				for (i = 0; i < values.length; i++) {
					$(fieldSelector + "[name='" + key + "\[" + fieldName + "\]'][value='" + values[i] + "']").prop('checked', true);
				}
			}
		});
	}
}

filter.loadSelectParameter = function(key, fieldSelector) {
	var value = filter.getParameter(key);
	
	if (value !== null && value.length > 0) {
		$(fieldSelector).find("option[value='" + value + "']").attr('selected', 'selected');
	}
}

filter.treatParameterChange = function(selector) {
	$(document).on("change", selector, function() {
		var value = "";
		var name = $(this).attr("name");
		
		$(selector + "[name='" + name + "']").each(function() {
			if ($(this).is(':checked')) {
				value += $(this).val() + ",";
			}
		});

		value = value.substring(0, value.length - 1);
		url = window.location.href;
		url = filter.removeParameter('minp', url);
		url = filter.removeParameter('maxp', url);
		url = filter.removeParameter('pag', url);
		
		if (value.length > 0) {
			filter.insertParameter(name, value, url);
		} else {
			url = filter.removeParameter(name);
			url = filter.removeLastCharacter(url);

			location.href = url;
		}
	});
}

filter.treatGenericParameter = function() {
	$(document).on("change", ".url-modifier", function() {
		filter.insertParameter($(this).attr("data-urlparam"), $(this).val(), null);
	});
}

$(function(){
	filter.loadSelectParameter("ord", "#ordertype");
	filter.loadSelectParameter("list", "#listtype");

	filter.loadCheckParameter("tam", ".tamanho-order");
	filter.loadCheckParameter("opc", ".opcao-order");
	filter.loadCheckParameter("forn", ".forn-order");
	filter.loadCheckParameterArray("specs", ".specs-order");

	filter.treatParameterChange(".tamanho-order");
	filter.treatParameterChange(".opcao-order");
	filter.treatParameterChange(".forn-order");
	filter.treatParameterChange(".specs-order");

	filter.treatGenericParameter();
});