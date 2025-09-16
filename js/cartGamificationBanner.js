var cartGamificationBanner = [];
var cartGamificationBannerItems = null;

cartGamificationBanner.generateBanners = (element = '') => {
	var cartGamificationItemsHtml = $(`[cartGamificationBannerItems${element}]`).html().trim();

	if (cartGamificationItemsHtml == '') {
		return;
	}

	cartGamificationItemsHtml = cartGamificationItemsHtml.substring(0, cartGamificationItemsHtml.length - 1);
	cartGamificationItemsHtml = `[${cartGamificationItemsHtml}]`;
	cartGamificationBannerItems = JSON.parse(cartGamificationItemsHtml);

	var html = '';
	cartGamificationBannerItems.map(item => {
		item = cartGamificationBanner.encodeCartGamificationBannerName(item);
		html += cartGamificationBanner.bannerItemHtml(item, element);
	});

	$(`[cartGamificationBannerContainer${element}]`).html(html);
	$(`[cartGamificationBannerContainer${element}]`).addClass('cart-gamification-banner__active');
	cartGamificationBanner.initializeCarousel(element);
}

cartGamificationBanner.encodeCartGamificationBannerName = (item = '') => {
	var textarea = document.createElement("textarea");
	textarea.innerHTML = item.nome;
	item.nome = textarea.value;
	item.nome = item.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
	item.nome = item.nome.replace(/[^a-z0-9]/gi, '');

	return item;
}

cartGamificationBanner.initializeCarousel = (element = '') => {
	var banners = $(`[cartGamificationBannerName${element}]`);
	var itemBanner = banners.first();
	var bannersLength = banners.length;
	var bannerCount = 0;
	var margin = 0;

	if (bannersLength < 2) {
		return;
	}

	setInterval(() => {
		if (bannerCount + 1 == bannersLength) {
			bannerCount = 0;
		} else {
			bannerCount++;
		}

		margin = bannerCount * $("[cartgamificationbannername]").first().outerHeight();
		itemBanner.css('margin-top', `-${margin}px`);
	}, 4000);
}

cartGamificationBanner.bannerItemHtml = (item, element = '') => {
	var icone = '';
	if (item.textoIcone) {
		var icone = `<img class="cart-gamification-banner__icon" src="${item.textoIcone}" alt="gamification" />`;
	}

	var fontSize = item.tamanhoDaFonte ? `font-size: ${item.tamanhoDaFonte};` : '';
	var fontWeight = item.pesoDaFonte ? `font-weight: ${item.pesoDaFonte};` : '';
	var backgroundHeight = item.tamanhoBarraProgresso ? `height: ${item.tamanhoBarraProgresso};` : "";
	var heightPosition = item.posicaoBarraProgresso ? `${item.posicaoBarraProgresso}: 0;` : "";

	var html = `<div class="cart-gamification-banner__item" cartGamificationBannerName${element}=${item.nome}>`;
	html += ` <div class="cart-gamification-banner__text" style="color: ${item.corDaFonte}; ${fontSize} ${fontWeight}">${icone} <span cartGamificationBannerText${element}>${item.textoInicial}</span></div>`;

	if (item.imagemDoProgresso) {
		html += `<div class="cart-gamification-banner__progress-background" style="background-image: url('${item.imagemDoProgresso}'); width: 0%; ${backgroundHeight} ${heightPosition}" cartGamificationBannerProgress${element}></div>`;
	} else {
		html += `<div class="cart-gamification-banner__progress-background" style="background: ${item.corDoProgresso}; width: 0%;  ${backgroundHeight} ${heightPosition}" cartGamificationBannerProgress${element}></div>`;
	}

	if (item.corDoFundo) {
		html += `<div class="cart-gamification-banner__initial-background" style="background: ${item.corDoFundo}" ></div>`;
	} else {
		html += `<div class="cart-gamification-banner__initial-background" style="background-image: url('${item.imagemDeFundo}');" ></div>`;
	}

	html += `</div>`;

	return html;
}

cartGamificationBanner.parseStringToFloat = (value) => {
	return parseFloat(value.replace('&nbsp;', ' ').replace('R$ ', '').replace('.','').replace(',', '.'));
}

cartGamificationBanner.parseFloatToCurrency = (value) => {
	return value.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'}).replace('R$', '');
}

cartGamificationBanner.parseStringToInteger = (value) => {
	return parseInt(value.replace('R$ ', '').replace('.','').replace(',', '.'));
}

cartGamificationBanner.calculateBannerProgressBar = (element = '') => {
	if (!cartGamificationBannerItems) {
		return;
	}

	cartGamificationBannerItems.map(item => {
		var cartValue = $(`[cartGamification${element}${item.atributo}]`).html();
		var cartItemsValue = $(`[cartGamification${element}Itens]`).html();
		let expectedValue = item.valorDesejado;
		let expectedItemsValue = item.valorItensDesejado; // usado apenas para maior+itens

		if (cartValue == undefined) {
			return;
		}

		switch (item.regra) {
			case 'itens':
				cartValue = cartGamificationBanner.parseStringToInteger(cartValue);
				expectedValue = cartGamificationBanner.parseStringToInteger(expectedValue);
				break;
			case 'maior+itens':
				if (cartItemsValue == undefined || expectedItemsValue == undefined) {
					return;
				}

				cartValue = cartGamificationBanner.parseStringToFloat(cartValue);
				expectedValue = cartGamificationBanner.parseStringToFloat(expectedValue);

				cartItemsValue = cartGamificationBanner.parseStringToInteger(cartItemsValue);
				expectedItemsValue = cartGamificationBanner.parseStringToInteger(expectedItemsValue);
				break;
			default:
				cartValue = cartGamificationBanner.parseStringToFloat(cartValue);
				expectedValue = cartGamificationBanner.parseStringToFloat(expectedValue);
				break;
		}

		let bannerItem = $(`[cartgamificationbannername${element}=${item.nome}]`);
		let actualValue = 0;
		let actualItemsValue = 0;
		let actualPorcentValue = 0;
		let finish = false;
		let widthItem = '';
		let textItem = '';

		var fontSize = item.tamanhoDaFonte ? `font-size: ${item.tamanhoDaFonte};` : '';
		var fontWeight = item.pesoDaFonte ? `font-weight: ${item.pesoDaFonte};` : '';

		let finishText = item.linkResultado 
			? `<a href="${item.linkResultado}" style="${fontSize} ${fontWeight}">${item.textoResultado}</a>`
			: item.textoResultado;

		if (cartValue <= 0) {
			textItem = item.textoInicial;

			if (item.regra.trim() == 'maior+itens') {
				textItem = textItem.replace('{items}', expectedItemsValue);
			}

			textItem = textItem.replace('{value}', item.valorDesejado);
			widthItem = '0%';
		} else {
			switch (item.regra) {
				case 'maior':
					if (cartValue >= expectedValue) {
						textItem = finishText;
						widthItem = '100%';
						finish = true;
						break;
					}

					actualValue = expectedValue - cartValue;
					actualPorcentValue = (cartValue * 100) / expectedValue;
					break;
				case 'menor':
					if (cartValue <= expectedValue) {
						textItem = finishText;
						widthItem = '100%';
						finish = true;
						break;
					}

					actualValue = cartValue - expectedValue;
					actualPorcentValue = (expectedValue * 100) / cartValue;
					break;
				case 'maior+itens':
					if (cartValue >= expectedValue && cartItemsValue >= expectedItemsValue) {
						textItem = finishText;
						widthItem = '100%';
						finish = true;
						break;
					}

					actualValue = expectedValue - cartValue;
					if (actualValue < 0) {
						actualValue = 0;
					}

					actualItemsValue = expectedItemsValue - cartItemsValue;
					if (actualItemsValue < 0) {
						actualItemsValue = 0;
					}

					if (actualValue > 0) {
						actualPorcentValue = (cartValue * 100) / expectedValue;
					} else {
						actualPorcentValue = (cartItemsValue * 100) / expectedItemsValue;
					}

					break;
			}

			if (item.atributo == 'precoportabeladeprecoautomatica') {
				let cartOriginalValue = $(`[cartGamification${element}ClienteBonificadoTabelaDePrecoAutomatica]`).html();

				if (cartOriginalValue == 'true') {
					finish = true;
				}
			}

			if (!finish) {
				textItem = item.textoAndamento;
			} else {
				textItem = finishText;
			}

			if (item.atributo == 'precopororiginal' || item.atributo == 'precoportabeladeprecoautomatica') {
				let cartActualValue = $(`[cartGamification${element}PrecoPorTabelaDePrecoAutomatica]`).html();
				let cartOriginalValue = $(`[cartGamification${element}PrecoPorOriginal]`).html();

				cartActualValue = cartGamificationBanner.parseStringToFloat(cartActualValue);
				cartOriginalValue = cartGamificationBanner.parseStringToFloat(cartOriginalValue);

				let discountValue = cartOriginalValue - cartActualValue;

				discountValue = cartGamificationBanner.parseFloatToCurrency(discountValue);
				textItem = textItem.replace('{discount}', discountValue);
			}

			if (!finish) {
				if (item.atributo != 'itens') {
					actualValue = cartGamificationBanner.parseFloatToCurrency(actualValue);
				}

				if (item.regra == 'maior+itens') {
					textItem = textItem.replace('{items}', actualItemsValue);
				}

				textItem = textItem.replace('{value}', actualValue);
				widthItem = actualPorcentValue + '%';
			}

			const applyResultBanner = bannerItem.find(`[cartGamification${element}ResultEnable]`);
			if (applyResultBanner.length > 0 && applyResultBanner.value == 'true') {
				finish = true;
			} 

			if (finish
				&& (item.imagemDoResultado != undefined || item.corDoResultado != undefined)
				&& (item.imagemDoResultado != "" || item.corDoResultado != "")
			) {
				if (item.imagemDoResultado != "") {
					bannerItem.find(`[cartgamificationbannerprogress${element}]`).css('background-image', `url('${item.imagemDoResultado}')`);
				} else {
					bannerItem.find(`[cartgamificationbannerprogress${element}]`).css('background-color', item.corDoResultado);
				}

				if (item.tamanhoBarraProgressoResultado) {
					bannerItem.find(`[cartgamificationbannerprogress${element}]`).css('height', item.tamanhoBarraProgressoResultado);
				}
			} else {
				if (item.imagemDoProgresso != "") {
					bannerItem.find(`[cartgamificationbannerprogress${element}]`).css('background-image', `url('${item.imagemDoProgresso}')`);
				} else {
					bannerItem.find(`[cartgamificationbannerprogress${element}]`).css('background-color', item.corDoProgresso);
				}

				if (item.tamanhoBarraProgresso) {
					bannerItem.find(`[cartgamificationbannerprogress${element}]`).css('height', item.tamanhoBarraProgresso);
				}

				if (item.corDaFonte) {
					bannerItem.find(`[cartgamificationbannerprogress${element}]`).css('color', item.corDaFonte);
				}
			}
		}

		bannerItem.find(`[cartgamificationbannertext${element}]`).html(textItem);
		bannerItem.find(`[cartgamificationbannerprogress${element}]`).css('width', widthItem);

		if (finish && item.corDaFonteResultado) {
			bannerItem.find(`.cart-gamification-banner__text`).css('color', item.corDaFonteResultado);

			if (item.linkResultado) {
				bannerItem.find(`.cart-gamification-banner__text a`).css('color', item.corDaFonteResultado);
			}
		} else {
			if (item.linkResultado) {
				bannerItem.find(`.cart-gamification-banner__text a`).css('color', item.corDaFonte);
			}
		}
	});
}

cartGamificationBanner.calculateBannerProgressBarOnCheckout = (element = '') => {
	$(`[cartGamificationPrecoDe${element}]`).text(cart.subtotalDe);
	$(`[cartGamificationPrecoPor${element}]`).text(cart.subtotal);
	$(`[cartGamificationPrecoPorOriginal${element}]`).text(cart.subtotalPorOriginal);
	$(`[cartGamificationPrecoPorTabelaDePrecoAutomatica${element}]`).text(cart.subtotalPorTabelaDePrecoAutomatica);
	$(`[cartGamificationClienteBonificadoTabelaDePrecoAutomatica${element}]`).text(cart.customerEnableForAutomaticPricingTable);
	$(`[cartGamificationItens${element}]`).text(cart.totalItemsQuantity);

	cartGamificationBanner.calculateBannerProgressBar(element);
};

$(function() {
	if ($(`[cartGamificationBannerItems]`).length != 0) {
		cartGamificationBanner.generateBanners('');
	}

	if ($('[cartGamificationBannerItemsOnCart]').length != 0) {
		cartGamificationBanner.generateBanners('OnCart');
	}

	if ($('[cartGamificationBannerItemsOnProduct]').length != 0) {
		cartGamificationBanner.generateBanners('OnProduct');
	}

	if ($('[cartGamificationBannerItemsOnProductModal]').length != 0) {
		cartGamificationBanner.generateBanners('OnProductModal');
	}

	if (helper.isCartPage()) {
		cartGamificationBanner.calculateBannerProgressBarOnCheckout('');

		$("#cart-items").on('change', function() {
			cartGamificationBanner.calculateBannerProgressBarOnCheckout('');
		});
	}
});
