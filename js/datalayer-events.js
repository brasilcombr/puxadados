var dataLayerEvent = [];
var clickTracker = [];

dataLayerEvent.pendingCartEvents = [];

dataLayerEvent.useGA4 = $('#google-ga4-enable').val().toLocaleLowerCase() == 's' ? true : false;
dataLayerEvent.advancedEcommerce = $('#google-ecommerce-enable').val().toLocaleLowerCase() == 's' ? true : false;

dataLayerEvent.addPendingCartEvent = function (item, eventName) {
	dataLayerEvent.pendingCartEvents.push({
		item: item,
		name: eventName
	});
};

dataLayerEvent.clearPendingCartEvent = function () {
	dataLayerEvent.pendingCartEvents = [];
}

dataLayerEvent.sendPendingCartEvents = function () {
	for (var event of dataLayerEvent.pendingCartEvents) {
		dataLayerEvent.makeGACartEvent(event.item, event.name);
	}

	dataLayerEvent.clearPendingCartEvent();
};

dataLayerEvent.getProduct = function (productId) {
	if (typeof(dataLayer) !== "object" || !dataLayer instanceof Array) {
		return;
	}

	var data = dataLayer.filter(function (property) {
		return property.ecommerce && property.ecommerce.impressions;
	}).shift();

	if (!data) {
		return;
	}

	var impressions = data.ecommerce.impressions;

	return impressions.filter(function (product) {
		return product.id == productId;
	}).shift();
};

dataLayerEvent.makeGAProductClickEvent = function (productId) {
	if (typeof(dataLayer) === "undefined") {
		return;
	}

	var product = dataLayerEvent.getProduct(productId);
	if (!product) {
		return;
	}

	product.list = product.list || 'produto';

	var eventData = {
		'event': 'productClick',
		'ecommerce': {
			'currencyCode': 'BRL',
			'click': {
				'actionField': { 'list': product.list },
				'products': [product]
			}
		}
	}

	dataLayer.push(eventData);
};

clickTracker.productClick = function () {
	$(document).on('click','a[href*="/produto/"]', function (ev) {
		var parents = $(this).parents();

		for (var key in parents) {
			var $element = $(parents[key]);
			if ($element.prop("tagName") == 'BODY') {
				return true;
			}
			if (!$element.attr('class') || !$element.attr('class').match(/product/)) {
				continue;
			}

			if ($element.find('input[value="comprarapida"]').length) {
				var productId = $element.find('input[name="id"]').val();
				dataLayerEvent.makeGAProductClickEvent(productId);
				return true;
			}

			var $link = $element.find('a[data-href*="avisodisponiveltodasunidades"]');
			if ($link.length) {
				var productId = helper.strstr($link.attr('data-href'), 'id=').replace('id=', '');
				dataLayerEvent.makeGAProductClickEvent(productId);
				return true;
			}
		}

		return true;
	});

	$('a[data-href*="avisodisponiveltodasunidades"]').on('click', function (ev) {
		$this = $(this);
		if (!$this.attr('data-href').match(/avisodisponiveltodasunidades/)) {
			return true;
		}
		
		var productId = helper.strstr($this.attr('data-href'), 'id=').replace('id=', '');
		dataLayerEvent.makeGAProductClickEvent(productId);
		return true;
	});

	$(document).on('submit','.ajaxform, form[data-action]', function () {
		var $this = $(this);
		if (!$this.find('input[value="comprarapida"]').length) {
			return true;
		}

		var productId = $this.find('input[name="id"]').val();

		dataLayerEvent.makeGAProductClickEvent(productId);
	});
};

dataLayerEvent.makeGACheckoutStepEvent = function (step) {
	if (typeof(dataLayer) === "undefined") {
		return;
	}

	var eventData = {
		'event': 'checkout',
		'ecommerce': {
			'checkout': {
				'actionField': { 'step': step || 1 },
			}
		}
	}

	dataLayer.push(eventData);
};

dataLayerEvent.makeGACheckoutOptionEvent = function (step, checkoutOption) {
	if (dataLayerEvent.useGA4) {
		return;
	}

	if (typeof(dataLayer) === "undefined") {
		return;
	}

	var eventData = {
		'event': 'checkoutOption',
		'ecommerce': {
			'checkout_option': {
				'actionField': { 'step': step, 'option': checkoutOption }
			}
		}
	}

	dataLayer.push(eventData);
};

dataLayerEvent.cartEvents = {
	'addToCart': 'add',
	'removeFromCart': 'remove'
};

dataLayerEvent.makeGACartEvent = function (item, eventName) {
	if (typeof(dataLayer) === "undefined") {
		return;
	}

	if (!dataLayerEvent.useGA4) {
		var eventAction = dataLayerEvent.cartEvents[eventName] || 'none';
		var eventData = {
			'event': eventName,
			'ecommerce': {
				'currencyCode': 'BRL',
				eventAction: {
					'products': [item],
				}
			}
		}
	
		dataLayer.push(eventData);
		return;
	}

	dataLayerEvent.buildEventData(eventName, dataLayerEvent.buildItems([item]));
};

dataLayerEvent.buildEventData = function(eventName, items, additionalData) {
	let value = 0;

	if (cart.subtotalValue) {
		value = cart.subtotalValue - cart.couponValue;
	}

	if (checkout.order.total) {
		value = checkout.order.total;
	}

	if (!dataLayerEvent.advancedEcommerce) {
		gtag("event", eventName, {
			currency: value ? "BRL": null,
			value: value,
			coupon: orderCoupon.appliedCoupon.reference ? orderCoupon.appliedCoupon.reference : null,
			items: items,
			...additionalData
		});

		return;
	}

	dataLayer.push({
		event: eventName,
		value: value,
		coupon: orderCoupon.appliedCoupon.reference ? orderCoupon.appliedCoupon.reference : null,
		...additionalData,
		ecommerce: {
			items: items
		}
	});
}

dataLayerEvent.buildLoginEventData = function(eventName, method) {
	if (!dataLayerEvent.advancedEcommerce) {
		gtag("event", eventName, {
			method: method
		});

		return;
	}

	dataLayer.push({
		event: eventName,
		method: method
	});
}

dataLayerEvent.buildItems = function(items) {
	let itemsData = items.map(item => {
		return {
			item_id: item.id ? item.id : null,
			item_name: item.name ? item.name : null,
			price: item.price ? item.price : null,
			quantity: item.quantity ? item.quantity : 1,
			item_variant: item.variant ? item.variant : null
		}
	});

	return itemsData;
}

dataLayerEvent.translateCartToDataLayerItems = function() {
	if (!cart.items) {
		return null;
	}

	const items = cart.items.map(item => {
		let variant = null;
		if (item.tamanho && item.opcao) {
			variant = `${item.produto.id}-${item.opcao.id}-${item.tamanho.id}`;
		}

		return {
			item_id: item.produto.id ? item.produto.id : null,
			item_name: item.produto.nome ? item.produto.nome : null,
			price: item.preco ? item.preco : null,
			quantity: item.quantidade ? item.quantidade : 1,
			item_variant: variant
		}
	});

	return items;
}

clickTracker.cartEvents = function () {
	var selector = 'a[data-add-action]';
	var quantitySelector = 'input[data-quantity]';
	var removeSelector = 'a[data-ask-action="excluirUnidade"]';

	$(document).on('click', selector, function (ev) {
		dataLayerEvent.clearPendingCartEvent()

		var action = $(this).data('add-action');
		var $quantityUnit = $(this).parent('[data-quantity-unit]');

		var itemSku = $quantityUnit.data('quantity-unit');
		var productId = itemSku.split('-')[0];
		var item = {
			'id': productId,
			'variant': itemSku,
			'quantity': 1
		};

		var eventName = dataLayerEvent.useGA4 ? 'add_to_cart' : 'addToCart';
		if (action == 'down') {
			eventName = dataLayerEvent.useGA4 ? 'remove_from_cart' : 'removeFromCart';

			var quantity = $quantityUnit.find(quantitySelector).val();
			// O envio é executado após a confirmação do usuário
			if (quantity == 1) {
				dataLayerEvent.addPendingCartEvent(item, eventName);
				return true;
			}
		}

		dataLayerEvent.makeGACartEvent(item, eventName);
	});

	$(document).on('focus', quantitySelector, function () {
		if (!this.previousValue) {
			this.previousValue = this.value;
		}
	}).on('change', quantitySelector, function (ev) {
		dataLayerEvent.clearPendingCartEvent()

		var diffQuantity = this.value - this.previousValue;

		var eventName = dataLayerEvent.useGA4 ? 'add_to_cart' : 'addToCart';
		if (diffQuantity < 0) {
			eventName = dataLayerEvent.useGA4 ? 'remove_from_cart' : 'removeFromCart';
		}

		var itemSku = $(this).parent('[data-quantity-unit]').data('quantity-unit');
		var productId = itemSku.split('-')[0];
		var item = {
			'id': productId,
			'variant': itemSku,
			'quantity': Math.abs(diffQuantity)
		};

		this.previousValue = this.value;

		// O envio é executado após a confirmação do usuário
		if (this.value == 0) {
			dataLayerEvent.addPendingCartEvent(item, eventName);
			return true;
		}

		dataLayerEvent.makeGACartEvent(item, eventName);
	});

	$(document).on('click', removeSelector, function () {
		dataLayerEvent.clearPendingCartEvent()

		var itemSku = $(this).siblings('[data-quantity-unit]').data('quantity-unit');
		if (!itemSku) {
			itemSku = $(this).data('itemsku');
		}

		var productId = itemSku.split('-')[0];
		var item = {
			'id': productId,
			'variant': itemSku
		};

		dataLayerEvent.addPendingCartEvent(item, dataLayerEvent.useGA4 ? 'remove_from_cart' : 'removeFromCart');
	})
};

clickTracker.stepsEvents = function() {
	$(document).on('checkout.stepevent', function(ev, step, stepsName) {
		clickTracker.buildGA4Event(step, stepsName);
	});
}

clickTracker.buildGA4Event = function(step, stepsName, additionalData = {}) {
	const stepsNameContent = {
		0: 'begin_checkout',
		1: 'sign_up',
		2: 'login',
		3: 'create_address',
		4: 'add_address_info',
		5: 'add_billing_info',
		6: 'add_shipping_info',
		7: 'add_coupon',
		8: 'add_payment_info'
	};

	if (dataLayerEvent.useGA4) {
		if (step == 1 || step == 2) {
			dataLayerEvent.buildLoginEventData(
				stepsNameContent[step],
				'Guest'
			);

			return;
		}

		dataLayerEvent.buildEventData(
			stepsNameContent[step],
			dataLayerEvent.translateCartToDataLayerItems(),
			additionalData
		);
	}
}

clickTracker.eventTriggered = {
	login: false,
	signUp: false,
	addAddress: false,
	createAddress: false,
	addShipping: false,
	addBilling: false
};

clickTracker.checkoutEvents = function () {
	$(document).on('checkout.step', function (ev, step, stepName) {
		if (!helper.isEmpty(step)) {
			dataLayerEvent.makeGACheckoutStepEvent(step);
		}
	});

	$(document).on('checkout.login', function (ev, option) {
		if (!helper.isEmpty(option) && !clickTracker.eventTriggered.login) {
			clickTracker.eventTriggered.login = true;
			clickTracker.buildGA4Event(2, 'login');
			dataLayerEvent.makeGACheckoutOptionEvent(1, option);
		}
	});

	$(document).on('checkout.address.selected', function (ev, option) {
		if (!helper.isEmpty(option) && !clickTracker.eventTriggered.addAddress) {
			clickTracker.eventTriggered.addAddress = true;
			clickTracker.buildGA4Event(4, 'add_address_info');
			dataLayerEvent.makeGACheckoutOptionEvent(2, 'selecionado');
		}
	});

	$(document).on('checkout.address.created', function (ev, option) {
		if (!helper.isEmpty(option) && !clickTracker.eventTriggered.createAddress) {
			clickTracker.eventTriggered.createAddress = true;
			clickTracker.buildGA4Event(3, 'create_address');
			dataLayerEvent.makeGACheckoutOptionEvent(2, 'cadastro');
		}
	});

	$(document).on('checkout.delivery.selected', function (ev, option) {
		if (!helper.isEmpty(option) && 'nome' in option && !clickTracker.eventTriggered.addShipping) {
			clickTracker.eventTriggered.addShipping = true;
			clickTracker.buildGA4Event(6, 'add_shipping_info');
			dataLayerEvent.makeGACheckoutOptionEvent(3, option.nome);
		}
	});

	$(document).on('checkout.billingaddress.selected', function (ev, option) {
		if (!helper.isEmpty(option) && !clickTracker.eventTriggered.addBilling) {
			clickTracker.eventTriggered.addBilling = true;
			clickTracker.buildGA4Event(5, 'add_billing_info');
			dataLayerEvent.makeGACheckoutOptionEvent(4, 'selecionado');
		}
	});

	$(document).on('checkout.billingaddress.created', function (ev, option) {
		if (!helper.isEmpty(option) && !clickTracker.eventTriggered.addBilling) {
			clickTracker.eventTriggered.addBilling = true;
			clickTracker.buildGA4Event(5, 'add_billing_info');
			dataLayerEvent.makeGACheckoutOptionEvent(4, 'cadastro');
		}
	});

	$(document).on('checkout.payment.selected', function (ev, option) {
		if (!helper.isEmpty(option) && 'nomeExibicao' in option) {
			const data = {payment_type: option.nomeExibicao};

			clickTracker.buildGA4Event(8, 'add_payment_info', data);
			dataLayerEvent.makeGACheckoutOptionEvent(4, option.nomeExibicao);
		}
	});

	$(document).on('checkout.coupon.applied', (ev, coupon) => {
		clickTracker.buildGA4Event(7, 'add_coupon');
	});
};

$(function () {
	clickTracker.productClick();
	clickTracker.cartEvents();
	clickTracker.checkoutEvents();
	clickTracker.stepsEvents();
});
