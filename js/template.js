/*
Como utilizar:

Definir parametros:
	var param = {
		var1: 'valor 1',
		var2: {
			attr1: 'atributo 1',
			attr2: 'atributo 2'
		}
	}

Chamar a função:
	var meuTpl = template.getTemplate = function ('caminho/nome_do_arquivo', params);

Como fica: 
	No template: 
	<span>{{var1}}</span>
	<span>{{var2.attr1}}</span>
	<span>{{var2.attr2}}</span>

	Resultado:
	<span>valor 1</span>
	<span>atributo 1</span>
	<span>atributo 2</span>

*/

var template = [];

// Urls
var ajaxTemplateService = helper.getBaseUrl() + '/ajax/services/template.php';

template.getRawTemplatesAjax = function () {
	templateData = {
		act: 'gettemplates'
	}

	loading.show();
	ajax.enqueue(ajax.POST, ajaxTemplateService, templateData, 'template.formatResponse');
}

template.getRawTemplates = function () {
	if (typeof rawTemplates === 'undefined' || !rawTemplates) {
		return null;
	}

	return rawTemplates;
}

template.loadTpls = function () {
	$(document).ready(function () {
		$(document).trigger('templates.loading');

		var tpls = template.getRawTemplates();
		if (!helper.isEmpty(tpls)) {
			template.setTemplates(tpls);
		} else {
			template.getRawTemplatesAjax();
		}
	});
}

template.loadAjaxFunctionTpls = function () {
	if (!window.isCacheable) {
		$(document).ready(function () {
			template.executeCodificatedAjax();
		});
	}

	$(document).on("ajaxcache.needupdate", function(event) {
		template.executeCodificatedAjax();

		if (event.url != undefined) {
			$(document).on('ajaxcache.redirect', function() {
				window.location.href = event.url;
			});
		}
	});
}

template.executeCodificatedAjax = function() {
	let codes = [];

	$(document).trigger("ajaxcache.started");

	$('.ajaxFunction').each(function(i, e) {
		codes.push(e.attributes.code.value);
	});

	var data = {
		act: 'executecodificatedfunction',
		code: codes
	}

	ajax.send(ajax.POST, ajaxTemplateService, data, 'template.appendAjaxResult');

}

template.appendAjaxResult = function(response) {
	if (response.error) {
		return;
	}

	let needsLazyLoad = false;
	$(response.data.data).each(function(i ,e)  {
		let content = e.content;
		let code = e.code;

		var responses = null;
		if (window.isCacheable != undefined && window.isCacheable) {
			responses = $(`[code=${code}]`).html(content);
		} else {
			responses = $(`[code=${code}]`).replaceWith(content);
		}

		if (typeof content != 'undefined' && content.includes('data-src')) {
			needsLazyLoad = true;
		}
	
		responses.find('script').each(function(){
			eval($(this).text());
		});
	});

	//esse tratamento é para somente lojas que tenham o lazy loading, é chamado o loadIamges pois após a imagem
	//ser carregada pela resposta do ajax ela precisa ser iniciada pelo lazy loading para ser exibida
	if (typeof lazyLoad != 'undefined' && needsLazyLoad) {
		lazyLoad.loadImages();
	}

	$(document).trigger("ajaxcache.ended");
}

template.formatResponse = function(response) {
	loading.hide();
	if (response.error) {
		console.error('Não foi possível carregar os templates');
		console.error(response);
		return;
	}

	var _response = response.data.data;
	var _tpls = 'templates' in _response ? _response.templates : null;

	if (_tpls == null) {
		return null;
	}

	template.setTemplates(_tpls);
}

template.setTemplates = function(templates) {
	ajax.busy = true;
	$.each(templates, function (key, tpl) {
		template[key] = tpl;
	})
	ajax.busy = false;

	$(document).trigger('templates.loaded');
}

template.getTemplate = function (key, params) {
	if (typeof(template[key]) === 'undefined') {
		return null;
	}
	params = params || {};
	output = Mustache.render(template[key], params);

	return output;
}

template.hasTemplate = function(key) {
	return typeof(template[key]) !== 'undefined';
}

$(function() {
	template.loadTpls();
	template.loadAjaxFunctionTpls();
});