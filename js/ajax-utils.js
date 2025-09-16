var ajaxutils = {};

ajaxutils.showAskModal = function(message, ajax, action, parameters, callback, templateSelector) {
	if($(templateSelector).length !== 0) {
		ajaxutils.showStoreModal($(templateSelector), ajax, message);
		return false;
	}

	ajaxutils.showModal('Alerta', message, ajax, true, action, parameters, callback);
	return false;
}

ajaxutils.showCustomModal = function(html) {
	var randomName = 'modal' + $.now();
	var modal =
		`<div id="${randomName}" class="modal checkout fade">
			<div class="modal-dialog modal-add-product-cart">
				${html}
			</div>
		</div>`;

	if ($('.ajax-modal-content').length == 0) {
		$('body').append('<div class="ajax-modal-content">');
	}

	$('.ajax-modal-content').html(modal);
	$('#' + randomName).modal('show');
}

ajaxutils.showModal = function(title, content, ajax, small, action, parameters, callback) {
	small = typeof small !== "undefined" ? small : false;

	var additionalClass = small ? "modal-sm" : "";
	var randomName = "modal" + $.now();
	var html = ajaxutils.getModalTemplate(title, content, ajax, action, parameters, callback);
	var modalContent = "<div class=\"" + additionalClass + " modal-dialog\">" + html + "</div>";
	var modal = "<div id=\"" + randomName + "\" class=\"modal fade checkout\">" + modalContent + "</div>";

	if ($(".ajax-modal-content").length == 0) {
		$("body").append('<div class="ajax-modal-content">');
	}
	$(".ajax-modal-content").html(modal);

	$("#" + randomName).modal("show");

	return false;
}

ajaxutils.getModalTemplate = function(title, content, ajax, action, parameters, callback) {
	var _action = action || null;
	var _parameters = parameters || null;
	var _callback = callback || null;
	var template = "<div class=\"modal-content\">";
	template += "<div class=\"modal-header\">";
	template += "<button type=\"button\" class=\"close\" data-dismiss=\"modal\">";
	template += "<span aria-hidden=\"true\">&times;</span>";
	template += "<span class=\"sr-only\">Close</span>";
	template += "</button>";
	template += "<h4 class=\"modal-title\">" + title + "</h4>";
	template += "</div>";
	template += "<div class=\"modal-body\">";
	template += "<span class=\"modal-ask\">" + content + "</span>";
	template += "</div>";

	 if (typeof ajax !== "undefined" && ajax != null && _action == null && _parameters == null) {
		template += "<div class=\"modal-footer justify-content-between\">";
		template += "<button class=\"pull-left btn btn-secondary\" data-dismiss=\"modal\">Cancelar</button>";
		if (_callback == null) {
			template += "<button data-href=\"" + ajax + "\" class=\"pull-right btn btn-primary\">Confirmar</button>";
		} else {
			template += "<button data-href=\"" + ajax + "\" data-callback=\"" + _callback + "\" class=\"pull-right btn btn-primary\">Confirmar</button>";
		}
		template += "</div>";
	} else if (_action !== null && _parameters !== null) {
		var params = JSON.parse(_parameters) || null;
		if (_callback == null) {
			template += "<form method=\"post\" data-action=\"" + ajax + "\">";
		} else {
			template += "<form method=\"post\" data-action=\"" + ajax + "\" data-callback=\"" + _callback + "\">";
		}
		template += "<input type=\"hidden\" name=\"act\" value=\"" + _action + "\">";
		template += "<input type=\"hidden\" name=\"isModal\" value=\"" + true + "\">";
		if (params) {
			$.each(params, function (key, value) {
				template += "<input type=\"hidden\" name=\"" + key + "\" value=\"" + value + "\">";
			});
		}
		template += "<div class=\"modal-footer justify-content-between\">";
		template += "<button class=\"pull-left btn btn-secondary\" data-dismiss=\"modal\">Cancelar</button>";
		template += "<button  data-submit type=\"button\" class=\"pull-right btn btn-primary\">Confirmar</button>";
		template += "</div>";
		template += "</form>";
	}

	template += "</div>";

	return template;
}

ajaxutils.showStoreModal = function(template, url, message) {
	if (template.length == 0) {
		template = ajaxutils.getAskTemplate();
	} else {
		template = template.html();
	}

	var randomName = "modal" + $.now();
	var modal = "<div id=\"" + randomName + "\" class=\"modal fade\"><div class=\"modal-sm modal-dialog\">" + template + "</div></div>";
	modal = modal.replace("{TemplateAjax}", url);
	modal = modal.replace("{TemplateMessage}", message);

	$("body").append(modal);
	$("#" + randomName).modal("show");

	return false;
}

ajaxutils.getAskTemplate = function() {
	var template = "<div class=\"modal-content\">";
	template += "<div class=\"modal-header\">";
	template += "<button type=\"button\" class=\"close\" data-dismiss=\"modal\">";
	template += "<span aria-hidden=\"true\">&times;</span>";
	template += "<span class=\"sr-only\">Close</span>";
	template += "</button>";
	template += "<h4 class=\"modal-title\">Alerta</h4>";
	template += "</div>";
	template += "<div class=\"modal-body\">";
	template += "<span class=\"modal-ask\">{TemplateMessage}</span>";
	template += "</div>";
	template += "<div class=\"modal-footer\">";
	template += "<button class=\"pull-left btn btn-default\" data-dismiss=\"modal\">Cancelar</button>";
	template += "<button data-href=\"{TemplateAjax}\" class=\"pull-right btn btn-primary\">Confirmar</button>";
	template += "</div>";
	template += "</div>";

	return template;
}

ajaxutils.showAlertModal = function(title, text, header, backdrop, closeButton) {
	if (typeof closeButton === 'undefined' || typeof closeButton === 'null' || closeButton.length == 0) {
		closeButton = true
	}

	var tplData = {
		title: title,
		text: text,
		header: header || null,
		backdrop: backdrop ? "data-backdrop='static'" : false,
		closeButton: closeButton
	};

	var tpl = template.getTemplate('root/modalalerta', tplData);

	if ($(".alert-modal-content").length == 0) {
		$("body").append('<div class="alert-modal-content">');
	}

	$(".alert-modal-content").html(tpl);
	$('#alert-modal').modal('show');
}

ajaxutils.getFormData = function(formSelector, remove) {
	if ($(formSelector).length == 0) {
		return null;
	}

	var data = $(formSelector).serialize();
	data = decodeURIComponent(data);

	if (remove) {
		remove = remove.split(",");

		if (remove.length == 0) {
			return data;
		}

		remove.forEach(function(value) {
			data = ajaxutils.removeQueryParam(value, data);
		});
	}

	return data;
};

ajaxutils.removeQueryParam = function(key, sourceUrl) {
	var rtn = sourceUrl.split("&");
	var i = 0;
	
	rtn.forEach(function(value) {
		var param = value.split("=")[0];
		
		if (param === key) {
			rtn.splice(i, 1);
		}
		
		i++;
	});
	
	rtn = rtn.join("&");
	return rtn;
};

ajaxutils.executeFunctionByName = function(functionName, context, args) {
	if (functionName == null || context == null || typeof context === "undefined") {
		return false;
	}

	var namespaces = functionName.split(".");
	var functionContext = namespaces;

	if (namespaces.length > 1) {
		functionContext = namespaces.pop();

		for (var i = 0; i < namespaces.length; i++) {
			if (typeof context[namespaces[i]] === "undefined") {
				return false;
			}

			context = context[namespaces[i]];
		}
	}

	if (args != null) {
		args = Array.prototype.slice.call(arguments, 2);
	}

	context[functionContext].apply(context, args);
};

ajaxutils.getAskModalHtml = function(title, text, confirmButton, cancelButton, confirmButtonSelector, modalContentSelector = '') {
	var template =
		`<div ${modalContentSelector} class=\"modal-content\">
			<div class=\"modal-header\">
				<button type=\"button\" class=\"close\" data-dismiss=\"modal\">
					<span aria-hidden=\"true\">&times;</span>
					<span class=\"sr-only\">Close</span>
				</button>
				<h4 class=\"modal-title\">${title}</h4>
			</div>
			<div class=\"modal-body\">
				<span class=\"modal-ask\">${text}</span>
			</div>
			<div class=\"modal-footer\">
				<button class=\"pull-left btn btn-default\" data-dismiss=\"modal\">${cancelButton}</button>
				<button ${confirmButtonSelector} data-dismiss=\"modal\" class=\"pull-right btn btn-primary\">${confirmButton}</button>
			</div>
		</div>`;

	return template;
}

ajaxutils.redirectPost = function(location, inputs)
{
	var form = '';

	inputs.each(function(key, element) {
		form += `<input type="hidden" name="${element.name}" value="${element.value}">`;
	});

	$(`<form action="${location}" method="POST">${form}</form>`).appendTo($(document.body)).submit();
}