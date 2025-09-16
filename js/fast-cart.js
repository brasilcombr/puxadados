var fastCart = [];

fastCart.inputQuantitySelector = 'input[name=quantity]';
fastCart.quantitySelector = '.fastCartContent input[name=quantity]';
fastCart.urlChangeQuantity = $('#urlajax').val() + '/checkout/pedido.php';
fastCart.quantityUnit = 'data-quantity-unit';

fastCart.quantityListener = function () {
    var selector = '.fastCartContent a.add-action';
    var event = 'click';

    $(document).on(event, selector, function (e){
        var quantityAction = $(this).hasClass('add-down') ? 'down' : 'up';
        var quantity = +$(this).parent().parent().find(fastCart.inputQuantitySelector).val();
        quantity += quantityAction == 'up' ? 1 : -1;
        fastCart.sendChangeQuantityRequest(this, quantity);

        e.preventDefault();
        return;
    });

    $(document).on('change', fastCart.quantitySelector, function (e) {
        data.quantity = +$(this).val();
        fastCart.sendChangeQuantityRequest(this, quantity);

        e.preventDefault();
        return false;
    });
}

fastCart.sendChangeQuantityRequest = function(element, quantity) {
    var data = {
        act: 'atualizarQuantidade'
    };

    var removeItemLink = $(element).parent().parent().parent().parent().parent().find('a.remove-item');
    var actualUnit = $(element).parent().parent('[' + fastCart.quantityUnit + ']');
    var unitData = actualUnit.attr(fastCart.quantityUnit).split('-');
    data.product = unitData[0];
    data.option = unitData[1];
    data.size = unitData[2];
    data.quantity = quantity

    if (data.quantity <= 0 ) {
        // Trigger remove button
        $(removeItemLink).click()
        return;
    }

    X.post(fastCart.urlChangeQuantity, data, 'fastCart.handleQuantityChange');
}

fastCart.handleQuantityChange = function(response) {
    var defaultMessage = 'Não foi possível alterar a quantidade';
    if (response.error) {
        var message = response.message ? response.message : defaultMessage;
        alert(message);
        return;
    }

    if (!response.data.data.atualizacao) {
        var message = response.data.data.titulo ? response.data.data.titulo : defaultMessage;
        alert(message);
        return;
    }

    var product = response.data.data.product ? response.data.data.product : null;
    var option = response.data.data.option ? response.data.data.option : null;
    var size = response.data.data.size ? response.data.data.size : null;
    var quantity = response.data.data.quantity ? response.data.data.quantity : null;

    if (!product || !option || !size || !quantity) {
        alert(defaultMessage);
        return;
    }

    $(`[data-quantity-unit='${product}-${option}-${size}']`).find(fastCart.inputQuantitySelector).val(quantity);

    if (typeof storageCache !== 'undefined') {
        storageCache.updateCache();
    }
}

$(function () {
    fastCart.quantityListener();
});