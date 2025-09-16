var productPage = {};

// URLs

// Static variables
productPage.optionSectionSelector = 'section.options-section div.options li';

// Product page functions
productPage.handleSelectedProductOption = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedProductOptionId = urlParams.get('opcaoProdutoSelecionada');

    const selectedProductOption = $(productPage.optionSectionSelector).find(
        `span.color[data-sku="${selectedProductOptionId}"]`
    );
    if (!selectedProductOption.length) {
        return
    }

    selectedProductOption.click();
}

// Execution at file load time
$(function () {
    if (!$('input#exibiropcoesprodutonaslistas').length || $('input#exibiropcoesprodutonaslistas').val() != 's') {
        return;
    }
    lazyLoadService.addFunctionToQueueAfterInteraction(productPage.handleSelectedProductOption);
});
