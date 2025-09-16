$(function(){
	// Data de implementação: 28/05/2014 10:30:51
	// Classe: modal-link
	// Parâmetros: data-show="id do elemento clicado"
	/* Ação: 
		Cria modal a partir de clique no elemento com a classe. O elemento clicado deve ter um id, que deve corresponder ao par�metro data-show do modal.
	*/
	$('.modal-link').on('click', function () {
		$('[data-show="'+$(this).attr('id')+'"]').css('display', 'block');
		$('[data-show="'+$(this).attr('id')+'"]').children('.timesclose').on('click', function () {
			$(this).parent('.modal').css('display', 'none');
			if($(this).attr('data-delete') == 'true')
				$(this).parent('.modal').remove();
		});
	});

	// Data de implementação: 28/05/2014 17:35:45
	// Elemento: a
	// Classe: ajaxlink
	// Parâmetros: data-ask="pergunta de confirmação" inserir parametro no elemento caso deseje gerar uma ação tipo confirm
	/* Ação: 
		Chama o ajax mandando as querys strings setadas no href
	*/
	$(document).on('makeajaxlink', function () {
		$('.ajaxlink').each(function () {
			if ($(this).attr('data-href') == undefined) {
				$(this).attr('data-href', $(this).attr('href'));
				$(this).attr('href', 'javascript:void(0);');
			}
		});
	});
	$(document).trigger('makeajaxlink');
	$('body').on('click', '.ajaxlink', function(){
		var link = $(this).attr('data-href') ? $(this).attr('data-href') : $(this).attr('href');
		var ask = $(this).attr('data-ask');
		var askModal = $(this).attr('data-modal');
		var template = $("#msgModalTemplate").html();
		var callback = $(this).attr('data-callback');

		if (askModal != null && askModal !== undefined) {
			var randomName = "modal"+$.now();
			var modal = "<div id=\""+randomName+"\" class=\"modal fade\"><div class=\"modal-sm modal-dialog\">"+template+"</div></div>";
			modal = modal.replace("{TemplateAjax}", link);
			modal = modal.replace("{TemplateMessage}", askModal);

			$("body").append(modal);
			$("#"+randomName).modal("show");

			return false;
		} else if(ask && !confirm(ask)) {
			return false;
		}

		X.get(link, callback);
		return false;
	});
	X.ajaxSubmit();

	// Data de implementação: 28/05/2014 11:30:21
	// Elemento: a
	/* Açãp: 
		Desabilita links com âncoras vazias
	*/
		$('a[href="#"], a[href=""]').on('click', function () {
			return false;
		});

	// Data de implementação: 28/05/2014 11:31:06
	// Classe: numeric
	/* Ação: 
		Força o campo a ser somente numérico
	*/
	$(".numeric").on('keypress', function(e) { 
		return ( e.which!=8 && e.which!=0 && (e.which<48 || e.which>57)) ? false : true ;
	});

	// Data de implementação: 29/05/2014 15:00:06
	// Elemento: select
	// Classe: js-hidedatashow, js-datashow
	/* Ação: 
		Habilita e desabilita o elemento com o class=hidedatashow

	tpl:
	contato/tpl/index.tpl
	*/
	$('select.js-datashow').on('change', function () {
		$('.js-hidedatashow').css('display', 'none');
		id = $(this).find('option:selected').attr('data-show');
		if (id !== undefined)
			$('#'+id).css('display', 'block');
	});

	// Data de implementação: 29/05/2014 14:55:35
	// Elemento: select
	// Parâmetros: data-selectedval="opção a ser setada no combo select"
	/* Ação: 
		Seta a opção determinada no parametro data-selectedval
	*/
	$('select').each(function () {
		if ($(this).attr('data-selectedval') !== undefined && $(this).attr('data-selectedval') != '') {
			var select = $(this);
			var option = $('option[value="'+select.attr('data-selectedval')+'"]');
			
			option.attr('selected', 'selected');
			select.val(option.attr('value'));
			select.trigger('change');
		}
	});

	// Data de implementação: 29/05/2014 10:27:14
	// Elemento: a
	// ID: bannerEbit
	// Parâmetros: data-src="imagem substituta"
	/* Ação: 
		Troca a imagem do banner E-bit padrão
	*/
	if ($("#bannerEbit").length > 0) {
		var ebitInterval = setInterval(function(){
			var el = $("#bannerEbit");
			var img = el.children('img');

			if (img.attr('src') != el.attr('data-src')) {
				img.attr('src', el.attr('data-src'));
				window.clearInterval(ebitInterval);
			}
		}, 50);
	}

	// Data de implementação: 29/05/2014 10:27:15
	// Elemento: select
	// ID: ordenacao
	/* Ação: 
		Monta a url adicionando uma querystring com o valor definido na option do select escolhido no caso controla a ordenação dos produtos
	*/

	$("#ordenacao").on('change', function(){
		var ordem = $(this).val();
		var href = $(location).attr('href');
		var loc = href.split('?')
		var base = loc[0]
		var query = '';
		//If we have query parameters, let's look through them.
		if (loc[1]) {
			if (loc[1].toLowerCase().indexOf("ord=") == -1){
				href = href + '&ord=' + ordem;
				window.location = href;
			}
			else {
				//Check out each parameter individually.
				var q = loc[1].split('&');
				for (var i = 0; i < q.length; i++) {
					//Examine the parameter-value pairs.
					var item = q[i].split('='), param = item[0];
					if (i == 0) {
						query += '?';
					}
					else {
						query += '&';
					}
					query += param +'=';
					//If there was a destination in the original link, change it to our current page.
					if (param == 'ord') {
						query += ordem;
					}
					else if (item[1]) {
						query += item[1];
					}
				}
				//Set the newly modified link.
				window.location = base + query;
			}
		} else {
			if (href.indexOf("?") >= 0)
				href = href + 'ord=' + ordem;
			else
				href = href + '?ord=' + ordem;
			window.location = href;
		}
	});
});