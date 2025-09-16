// Data de implementação: 28/05/2014 10:16:48
/* Ação:
	Objeto que trabalha com ajax, suportando parâmetros para trabalhar diretamente no HTML com as respostas do servidor.
*/
if (typeof X == "undefined") {
	X = [];
	X.isLoaded = false;
    X.ajaxSubmitEventsCreated = false;
}

X.currentForm = null;

X.get = function (u, callback) {
    return X.ajax(u, 'GET', callback);
};

X.post = function (u, values, callback) {
    return X.ajaxData(u, values, callback);
};

X.ajax = function (u, method, callback) {
    $.ajax({
        url: u,
        type: method,
        dataType: "json",
        success: function (data) {
            X.ajaxHandleResponse(data, callback);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            X.ajaxError(XMLHttpRequest.status, XMLHttpRequest.responseText);
        }
    });
    return false;
};

X.ajaxData = function (u, values, callback) {
    $.ajax({
        url: u,
        type: 'POST',
        data: values,
        dataType: "json",
        success: function (data) {
            X.ajaxHandleResponse(data, callback);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            X.ajaxError(XMLHttpRequest.status, XMLHttpRequest.responseText, callback);
        },
        async: true
    });
    return false;
    };

X.ajaxHandleResponse = function(data, callback, exception = false) {
    X.json(data);
    X.currentForm = null;
    callback = callback || null;
    $(document).trigger('jsonSuccess').unbind('jsonSuccess');

    finalData = {
        "error": false,
        "data": data
    };

    if (exception) {
        finalData = data;
    }

    X.executeFunctionByName(callback, window, finalData);
}

X.ajaxError =  function(status, text, callback) {
    X.submittingForm = false;
    var response;
    try {
        response = JSON.parse(text);
    } catch (e) {
        response = null;
    }

    if (status == 422 && response && response.erroRecaptchaGlobal) {
        ajaxutils.showAlertModal('Aviso', `Não foi possível processar a requisição pois o recaptcha não foi validado. ${response.erroRecaptchaGlobal}`, '');
        X.currentForm = null;
    } else if (response.error) {
        X.ajaxHandleResponse(response, callback, exception = true);
    }
}

X.executeFunctionByName = function (functionName, context , args) {
    if (functionName == null || context == null || typeof context === "undefined") {
        return false;
    }
    args = args || null;
    if (args != null){ 
        var args = Array.prototype.slice.call(arguments, 2);
    }
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    var funcao = context[func].apply(context, args);
    if (typeof (funcao) === 'function') {
        return funcao;
    } else {
        return false;
    }
}

X.json = function (r) {
    if (r['data'] == undefined || r['data']['data'] == undefined || r['data']['type'] == undefined) {
        return;
    }

    var type = r['data']['type'];
    var data = r['data']['data'];
    if (type == 'triggerfunction') {
        var datalayer = data['datalayer'];
        var fbpixel = data['fbpixel'];

        if (datalayer) {
            $('body').append(datalayer);
        }

        if (fbpixel) {
            $('body').append(fbpixel);
        }

        var response = data['response'] ? data['response'] : null;
        X.executeFunctionByName(data['func'], window, response);
    } else if (type == 'redirectpost') {
        ajaxutils.redirectPost(window.location.href, X.currentForm.find(':input'));
    } else if (type == 'facebookpixel') {
        facebookPixel.sendContact(data['event'], data['fbPixelId']);
        window.location.reload();
    } else if (type === 'tiktokPixel') {
        tiktokPixel.sendContact(data['event'], data['ttkPixelId']);
        window.location.reload();
    } else if (type === 'bothpixels') {
        facebookPixel.sendContact(data['facebook']['event'], data['facebook']['fbPixelId']);
        tiktokPixel.sendContact(data['tiktok']['event'], data['tiktok']['ttkPixelId']);
        window.location.reload();
    } else if (type == 'alert') {
        alert(data);
    } else if (type == 'eval') {
        eval(data);
    } else if (type == 'refresh') {
        window.location.reload();
    } else if (type == 'redir') {
        if (data['secs'] > 0 && data['location'] != '') {
            window.setTimeout(function() {
                window.location = data['location']
            }, data['secs'] * 1000);
        } else {
            window.location = data;
        }
    } else if (type == 'updater') {
        var id = data['id'];
        var classe = data['class'];
        var inner = data['html'];
        $('#' + id).html(inner);
        $('.' + classe).html(inner)
    } else if (type == 'attr') {
        var id = data['id'];
        var classe = data['class'];
        var attr = data['attr'];
        var value = data['value'];
        $('#' + id).attr(attr, value);
        $('.' + classe).attr(attr, value);
    } else if (type == 'append') {
        var id = data['id'];
        var classe = data['class'];
        var inner = data['html'];
        $('#' + id).append(inner);
        $('.' + classe).append(inner);
    } else if (type == 'addclass') {
        var id = data['id'];
        var classe = data['class'];
        $('#' + id).addClass(classe);
    } else if (type == 'remclass') {
        var id = data['id'];
        var classe = data['class'];
        $('#' + id).removeClass(classe);
    } else if (type == 'close'){
        X.boxClose();
    } else if (type == 'dialog') {
        X.boxShow(data, true)
    } else if (type == 'css') {
        var id = data['id'];
        var classe = data['class'];
        var css_attr = data['css'];
        var value = data['value'];
        $('#' + id).css(css_attr, value);
        $('.' + classe).css(css_attr, value);
    } else if (type == 'modal-bootstrap') {
        $('.modal-content').html("");
        $('.modal-content').append(data['html']);
        $('.modal').appendTo("body").modal('show');
        //X.ajaxSubmit();
    } else if (type == 'modal') {
        $('.modal-dialog').parent().remove();
        $('.modal').remove();
        $('[class^="modal"].fade').remove();

        $('body').removeClass("modal-open").removeAttr('style').append('<div class="modal fade"><div class="modal-dialog"><div class="modal-content">'+data['html']+'</div></div></div>');
        if ($('.modal-content .is-modal-lg').length > 0)
            $('.modal-dialog').addClass('modal-lg');
        $('.modal').on('shown.bs.modal', function (e) {
            $('.thumbs[data-for="modal"]').find('.thumb-trigger').first().trigger('click');
        });
        
        $('.modal').modal('show').on('hidden.bs.modal', function () {
            $('.modal-dialog').parent().remove();
            $('.modal').remove();
            $('[class^="modal"].fade').remove();
        });
        //X.ajaxSubmit();

        $('html').on('keyup', function (e) {
            if (e.keyCode === 27) {
                $('.modal').modal('hide');
                /*$('.modal-dialog').parent().remove();
                $('.modal').remove();
                $('.fade').remove();*/
            }
        });

        //$('.thumb-trigger').first().trigger('click');
        //layout.thumbOculto();

        //layout.treatGrid();

        $(document).trigger('loadvzoom');
        $(document).trigger('icontrigger');

        $('.thumb-trigger').on('click', function () {
            if ($(this).parent().attr('data-for') == 'modal') {
                id = 'image-container-modal';
            } else {
                id = 'image-container';
            }
            element = $('<img/>');
            element.attr('src', $(this).attr('data-normal')).attr('data-zoom', $(this).attr('data-zoom')).addClass('img-responsive').addClass('vzoom');
            $('#'+id+' img').remove();
            $('#'+id+' .vzoom-container').remove();
            $('#'+id).append(element);
            
            $(document).trigger('loadvzoom');
        });
        $(document).trigger('makeajaxlink');
        $(document).trigger('modalCreated');

        $('.modal').find('.thumb-trigger').first().trigger('click');
    } else if (type == 'mix') {
        for (var x in data) {
            r['data'] = data[x];
            X.json(r)
        }
    } else if (type == 'checkout') {
        if (data['enderecos']) {
            var tmp = $('<div></div>');
            var genericElement = $('[data-generic-address]');
            tmp.append($(genericElement[0].cloneNode(true)));
            var genericAddress = tmp.html();
            for (var x in data['enderecos']) {
                var address = data['enderecos'][x];
                if (x != 'new' && $('[data-idend="'+x+'"]').length == 0 ) {
                    var newAddress = $(genericAddress);
                    newAddress.find('.address-title').html(address.logradouro+', '+address.numero+' ('+address.cep+')');
                    newAddress.find('[data-idend]').attr('data-idend', x);
                    newAddress.find('[href="#novoEndereco"]').attr('href', '#end'+x);
                    newAddress.find('#novoEndereco').attr('id', 'end'+x);
                    newAddress.removeAttr('data-generic-address').attr('data-client-address', '');
                    newAddress.find('.cep').mask("99999-999");
                    newAddress.find('[name="cep"].checkout-field').val(address.cep).after('<input type="hidden" name="ceporiginal" value="'+address.ceporiginal+'" class="ceporiginal">');
                    newAddress.find('[name="logradouro"].checkout-field').val(address.logradouro);
                    newAddress.find('[name="numero"].checkout-field').val(address.numero);
                    newAddress.find('[name="bairro"].checkout-field').val(address.bairro);
                    newAddress.find('[name="complemento"].checkout-field').val(address.complemento);
                    newAddress.find('[name="cidade"].checkout-field').val(address.cidade);
                    newAddress.find('#cep').removeAttr('id');
                    newAddress.find('[data-endindex]').attr('data-endindex', x);
                    var estado = newAddress.find('[name="estado"].checkout-field');
                    estado.find('option:selected').prop('selected', false);
                    estado.find('option[value="'+address.estado+'"]').prop('selected', true);
                    genericElement.before(newAddress);
                }
                if (data['enderecos'][X.toString()].disabled) {
                    Checkout.disableChildren($('[data-idend="'+x+'"]').parents('[data-client-address]'));
                } else if (data['enderecos'][X.toString()].enabled) {
                    Checkout.enableChildren($('[data-idend="'+x+'"]').parents('[data-client-address]'));
                }

                if (data['enderecos'][X.toString()].active) {
                    $('[data-idend="'+x+'"]').trigger('selectaddress');
                } else {
                    $('[data-idend="'+x+'"]').trigger('hideaddress');
                }
            }
        }

        if (data['limparenderecos']) {
            $('[data-client-address]').remove();
        }

        if (data['showauth'])
            $('[data-only-auth]').css('display', 'block');

        if (data['fieldval']) {
            for (var x in data['fieldval']) {
                $('[name="'+x+'"].checkout-field').val(data['fieldval'][x]);
            }
        }

        if (data['disable']) {
            for (var x in data['disable']) {
                $('[name="'+x+'"].checkout-field').prop('disabled', true);
            }
        }

        if (data['enable']) {
            for (var x in data['enable']) {
                $('[name="'+x+'"].checkout-field').prop('disabled', false);
            }
        }

        if (data['click']) {
            for (var x in data['click']) {
                $(x).trigger('click');
            }
        }

        if (data['hide']) {
            for (var x in data['hide']) {
                $(x).hide();
            }
        }

        if (data['show']) {
            for (var x in data['show']) {
                $(x).show();
            }
        }

        if (data['cleanerrors']) {
            for (var x in data['cleanerrors']) {
                Checkout.cleanAllStatus($('[data-step="'+x+'"]'));
            }
        }

        if (data['field']) {
            for (var x in data['field']) {
                Checkout.launchError($('[name="'+x+'"].checkout-field'), data['field'][x]);
            }
        }

        if (data['gostep']) {
            Checkout.goStep(data['gostep']);
        }

        if (data['enablestep']) {
            Checkout.enableStep($('[data-step="'+data['gostep']+'"]'));
        }

        if (data['triggererror']) {
            $('[data-ok-container]').html('');
            $('[data-error-container]').html(data['triggererror']);
        }

        if (data['triggerok']) {
            $('[data-error-container]').html('');
            $('[data-ok-container]').html(data['triggerok']);
        }

        if (data['disabletimers']) {
            $(document).trigger('disabletimers');
        }

        if (data['setnewaddressID']) {
            $('[data-idend="new"]').attr('data-newid', data['setnewaddressID']);
        }

        if (data['refresh']) {
            window.location.reload();
        }
    }
    $("#loading").css('display', 'none');
};

X.getXY = function () {
    var x, y;
    if (document.body.scrollTop) {
        x = document.body.scrollLeft;
        y = document.body.scrollTop
    } else {
        x = document.documentElement.scrollLeft;
        y = document.documentElement.scrollTop
    }
    return {
        x: x,
        y: y
    }
};

X.submittingForm = null;
X.defaultCallbackSubmittingForm = function() {
    $(X.submittingForm).data('submitted', false);
}

X.ajaxSubmitEvents = function() {
    if (X.ajaxSubmitEventsCreated) {
        return;
    }

    X.ajaxSubmitEventsCreated = true;

	$(document).off('submit', '.ajaxform');
    $(document).off('submit', '.ajaxform, form[data-action]');
	$(document).off('click', '.ajaxsubmitbutton');

    $(document).on("submit", ".ajaxform", function(e) {
		X.ajaxSubmitAction(e, this);
		e.preventDefault();
	});

	$(document).on('click', '.ajaxsubmitbutton', function(e) {
		$(this).parent('form').trigger('submit');
		e.preventDefault();
	});
}

X.ajaxSubmit = function() {
	X.ajaxSubmitEvents();
}

X.ajaxSubmitAction = function (e, element) {
	if (!element) {
		return;
	}

	var callback = $(element).attr('data-callback');

	if (!callback && $(X.submittingForm).data('submitted') === true) {
		e.preventDefault();
		return false;
	}

	X.submittingForm = element;
	$(X.submittingForm).data('submitted', true)

	var data = $(element).serialize();
	var encode = $(element).attr('data-encode');

	if ($(element).attr('additional-form-data')) {
		var formSelector = $(element).attr('additional-form-data');
		var remove = $(element).attr('additional-form-data-remove');
		var additionalData = X.getFormData(formSelector, remove);

		data += '&' + additionalData;
	}

	if (typeof recaptchaGlobal != 'undefined') {
		recaptchaGlobal.sendInvisibleRecaptchaValidation();
		data += `&recaptcha_token=${recaptchaGlobal.token}`;
	}

	if (encode == 'true') {
		data = 'encode='+btoa(data);
	}

	if (!callback) {
		callback = 'X.defaultCallbackSubmittingForm';
	}

	X.currentForm = $(element);

	var actionAttr = $(element).attr('data-action') ? $(element).attr('data-action') : $(element).attr('action');

	if ($(element).attr('method') == 'post') {
		X.post(actionAttr, data, callback);
	} else {
		X.get(actionAttr + "?" + data, callback);
	}

	e.preventDefault();
	return false;
};

X.getFormData = function(formSelector, remove) {
    if ($(formSelector).length == 0) {
        return null;
    }

    var data = $(formSelector).serialize();

    if (remove) {
        remove = remove.split(",");

        if (remove.length == 0) {
            return data;
        }

        remove.forEach(function (value) {
            data = X.removeQueryParam(value, data);
        });
    }
    data = decodeURIComponent(data);

    return data;
};

X.removeQueryParam = function(key, sourceURL) {
    var rtn = sourceURL.split("&");
    var i = 0;
    rtn.forEach(function (value) {
        var param = value.split("=")[0];
        if (param === key) {
            rtn.splice(i, 1);
        }
        i++;
    });
    rtn = rtn.join("&");

    return rtn;
};

$(function () { 
    if (X.isLoaded) {
		return;
	}

    X.isLoaded = true;
    X.ajaxSubmitEvents(); 
});

X.ajaxSubmitEvents();
// X.alert = function () {
// 	alert("Teste do X.Alert");
// };
