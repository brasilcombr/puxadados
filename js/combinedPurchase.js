/**
 * Configurações de atributos necessárias para a execução do combined purchase na loja
 *
 * @var Object
*/
const combinedPurchaseSettings = {
    combinedPurchaseContainer: '[combinedPurchaseContainer]',
    combinedPurchaseContainerCss: 'combined-purchase',
    productAttribute: 'product-attribute',
    mainProductContainer: '[combinedPurchaseMainProduct]',
    carouselContainer: '[combinedPurchaseCarousel]',
    pricesContainer: '[combinedPurchasePrices]',
    finalPrice: '[combinedPurchaseFinalPrice]',
    installments: '[buyTogheterInstallments]',
    productsJson: '#skuProducts',
    mainProduct: 'mainProduct',
    productCarousel: 'productCarousel',
    imageItemCss: 'combined-purchase__image',
    optionItemCss: 'combined-purchase__option',
    sizeContainerItemCss: 'combined-purchase__size-container',
    sizeItemCss: 'combined-purchase__size',
    buyButton: '[combinedPurchaseBuyButton]',
    buyButtonDisabled: '[combinedPurchaseBuyDisabledButton]',
    buyButtonCss: 'combined-purchase__buy-button',
    sizeType: 'div',
    showUnitsOutOfStock: true,
    installmentsNumber: 6
};

/**
 * Inicializa o combined purchase, pegando o Json inserido no código a partir do atributo "productsJson"
 *
 * @returns void
 */

const initilizeCombinedPurchase = () => {
    let productsJson = document.querySelector(combinedPurchaseSettings.productsJson);

    if (!productsJson) {
        return;
    }

    productsJson = productsJson.innerHTML;

    if (!productsJson) {
        hideProductTogether();
        return;
    }

    productsJson = JSON.parse(productsJson);
    createCombinedPurchase(productsJson);
};


/**
 * Oculta o compre junto
 */
const hideProductTogether = () => {
    let combinedPurchaseContainer = document.querySelector(combinedPurchaseSettings.combinedPurchaseContainer);
    combinedPurchaseContainer.classList.add(`${combinedPurchaseSettings.combinedPurchaseContainerCss}--hidden`);
}

/**
 * Cria o combined purchase, utilizando o array recebido na inicialização
 *
 * @param {Array} productsJson 
 */
const createCombinedPurchase = (productsJson) => {
    let products = productsJson.produtos;
    let productsCombinedPurchase = products.compreJunto;

    if (!productsCombinedPurchase || productsCombinedPurchase.length < 1) {
        hideProductTogether();
        return;
    }

    generateMainProduct(products);
    let productsCreated = generateCombinedPurchaseProducts(productsCombinedPurchase);

    if (!productsCreated) {
        hideProductTogether();
        return;
    }

    initializeCombinedPurchaseCarousel();
    getProdutsToAddEvents();
};

/**
 * Gera todo o conteúdo do produto principal
 *
 * @param {Array} products 
 */
const generateMainProduct = (products) => {
    let productId = Object.keys(products)[0];
    let product = products[productId];
    let attribute = combinedPurchaseSettings.mainProduct;

    let productHtml = getProductHtml(product, productId, attribute);
    let productContainer = document.querySelector(combinedPurchaseSettings.mainProductContainer);

    productContainer.innerHTML = productHtml;
};

/**
 * Gera todo o conteudo dos produtos listados em compre junto
 *
 * @param {Array} productsCombinedPurchase
 * @returns {Boolean} retorna se a criação dos produtos foi um sucesso ou não
 */
const generateCombinedPurchaseProducts = (productsCombinedPurchase) => {
    let attribute = combinedPurchaseSettings.productCarousel;
    let productContainer = document.querySelector(combinedPurchaseSettings.carouselContainer);

    productsCombinedPurchase.forEach(products => {
        let productId = Object.keys(products)[0];
        let product = products[productId];

        let productHtml = getProductHtml(product, productId, attribute);

        productContainer.innerHTML += productHtml;
    });

    if (!productContainer) {
        return false;
    }

    return true;
};

/**
 * Inicializa o carrossel do compre junto
 */
const initializeCombinedPurchaseCarousel = () => {
    let productsCarousel = $(combinedPurchaseSettings.carouselContainer);

    productsCarousel.owlCarousel({
        loop:false,
        margin:10,
        responsiveClass:true,
        nav: false,
        dots: false,
        responsive:{
            0:{
                items:1
            },
            1300:{
                items:1
            },
        }
    });

    productsCarousel.on('changed.owl.carousel', function(event) {
        let index = event.item.index;
        let products = document.querySelectorAll(`[${combinedPurchaseSettings.productCarousel}-item]`);

        clickOnFirstOption(products[index], combinedPurchaseSettings.productCarousel);
    });

    var arrowsText = '.combined-purchase__arrows';
    var arrows = $('.combined-purchase__products-carousel').find(arrowsText);

    
    if (productsCarousel.find(".owl-item").length < 2) {
        arrows.addClass('combined-purchase__arrows--hidden');
        return;
    }

    var arrowRight = arrows.find(arrowsText + '--right');
    var arrowLeft = arrows.find(arrowsText + '--left');

    arrowLeft.on('click', function(e) {
        productsCarousel.trigger('prev.owl.carousel');

        e.preventDefault();
        return false;
    });

    arrowRight.on('click', function(e){
        productsCarousel.trigger('next.owl.carousel');

        e.preventDefault();
        return false;
    });
};

/**
 * Clica na primeira opção do produto
 *
 * @param {HTMLElement} product 
 * @param {String} attribute 
 */
const clickOnFirstOption = (product, attribute) => {
    let option = product.querySelector(`[${attribute}-option]`);
    option.click();
};

/**
 * Clica no primeiro tamanho que possui estoque
 *
 * @param {Array} sizes 
 * @param {String} attribute 
 * @returns 
 */
const clickOnFirstSizeInStock = (sizes, attribute) => {
    let sizeSelected = null;

    sizes.forEach(size => {
        let stock = size.getAttribute(`${attribute}-stock`);

        if (stock > 0 && !sizeSelected) {
            sizeSelected = size;
        }
    });

    if (combinedPurchaseSettings.sizeType == 'select') {
        if (!sizeSelected) {
            sizeSelected = sizes[0];
        }

        let optionSelected = sizeSelected.getAttribute(`${attribute}-option-selected`);
        let sizeContainer = document.querySelector(`[${attribute}-size-container="${optionSelected}"]`);

        sizeContainer.value = sizeSelected.value;

        sizeContainer.dispatchEvent(new Event("change"));
    } else {
        if (!sizeSelected) {
            sizes[0].click();
            return;
        }
    
        sizeSelected.click();
    }
};

/**
 * Adiciona a primeira imagem no seu respectivo produto
 *
 * @param {String} productId
 * @param {String} attribute 
 */
const addFirstImageToProduct = (productId, attribute) => {
    let item = document.querySelector(`[${attribute}-item="${productId}"]`);
    let imageContainer = document.querySelector(`[${attribute}-image-container="${productId}"]`);;

    let image = item.querySelector(`[${attribute}-image]`);

    if (!image) {
        return;
    }

    imageContainer.innerHTML = image.innerHTML;
};

/**
 * Busca os produtos para adicionar os event listeners
 */
const getProdutsToAddEvents = () => {
    let products = document.querySelectorAll(`[${combinedPurchaseSettings.productAttribute}]`);

    products.forEach(product => {
        let attribute = product.getAttribute(combinedPurchaseSettings.productAttribute);
        let productId = product.getAttribute(`${attribute}-item`);

        addFirstImageToProduct(productId, attribute);
        addEventsToProduct(productId, attribute);
    });

    let mainProduct = document.querySelector(`[${combinedPurchaseSettings.mainProduct}-item]`);
    clickOnFirstOption(mainProduct, combinedPurchaseSettings.mainProduct);

    let productCarousel = document.querySelector(`[${combinedPurchaseSettings.productCarousel}-item]`);
    clickOnFirstOption(productCarousel, combinedPurchaseSettings.productCarousel);
};

/**
 * Adiciona todos os eventos de clique ao respectivo produto
 *
 * @param {String} productId
 * @param {String} attribute
 */
 const addEventsToProduct = (productId, attribute) => {
    let item = document.querySelector(`[${attribute}-item="${productId}"]`);
    let imageContainer = document.querySelector(`[${attribute}-image-container="${productId}"]`);;
    let options = item.querySelectorAll(`[${attribute}-option]`);
    let sizes = item.querySelectorAll(`[${attribute}-size]`);

    let allOptions = document.querySelectorAll(`[${attribute}-option]`);
    let allSizes = document.querySelectorAll(`[${attribute}-size]`);
    let allSizesContainer = document.querySelectorAll(`[${attribute}-size-container]`);

    options.forEach(option => {
        option.addEventListener('click', optionClicked => {
            let optionAttributeValue = optionClicked.target.getAttribute(`${attribute}-option`);

            allOptions.forEach(optionNotClicked => {
                optionNotClicked.classList.remove(`${combinedPurchaseSettings.optionItemCss}--active`);
            });

            allSizesContainer.forEach(sizeData => {
                sizeData.classList.remove(`${combinedPurchaseSettings.sizeContainerItemCss}--active`);
            });

            optionClicked.target.classList.add(`${combinedPurchaseSettings.optionItemCss}--active`);

            let image = item.querySelector(`[${attribute}-image="${optionAttributeValue}"]`);

            if (image) {
                imageContainer.innerHTML = image.innerHTML;
            }

            let sizeContainer = item.querySelector(`[${attribute}-size-container="${optionAttributeValue}"]`);
            sizeContainer.classList.add(`${combinedPurchaseSettings.sizeContainerItemCss}--active`);

            let sizes = sizeContainer.querySelectorAll(`[${attribute}-size]`);
            clickOnFirstSizeInStock(sizes, attribute);

            optionClicked.preventDefault();
        });
    });

    if (combinedPurchaseSettings.sizeType == 'select') {
        allSizesContainer.forEach(sizeContainer => {
            sizeContainer.addEventListener('change', sizeContainerChanged => {
                let sizeValue = sizeContainerChanged.target.value;
                let sizeClicked = document.querySelector(`[${attribute}-size="${sizeValue}"]`);
                let price = sizeClicked.getAttribute(`${attribute}-price`);

                addProductToForm(sizeClicked, attribute);
                getPrice(price, attribute);
                checkBuyButtonEnabled();

                sizeContainerChanged.preventDefault();
            });
        })
    } else {
        sizes.forEach(size => {
            size.addEventListener('click', sizeClicked => {
                allSizes.forEach(sizeData => {
                    sizeData.classList.remove(`${combinedPurchaseSettings.sizeItemCss}--active`);
                });
    
                sizeClicked.target.classList.add(`${combinedPurchaseSettings.sizeItemCss}--active`);
    
                let price = sizeClicked.target.getAttribute(`${attribute}-price`);
    
                addProductToForm(sizeClicked.target, attribute);
                getPrice(price, attribute);
                checkBuyButtonEnabled();

                sizeClicked.preventDefault();
            });
        });
    }
};

/**
 * Adiciona dados do produto no form do compre junto
 *
 * @param {HTMLElement} sizeHtml
 * @param {String} attribute
 */
const addProductToForm = (sizeHtml, attribute) => {
    let productIds = sizeHtml.getAttribute(`${attribute}-size`);
    let inputFormContainer = document.querySelector(`[${attribute}-form]`);
    let inputName = inputFormContainer.getAttribute(`${attribute}-form`);
    let stock = sizeHtml.getAttribute(`${attribute}-stock`);
    let [product, option, size] = productIds.split('-');

    let html = `
        <input type="hidden" name="produto${inputName}" value="${product}">
        <input type="hidden" name="opcao${inputName}" value="${option}">
        <input type="hidden" name="tamanho${inputName}" value="${size}">
        <span combinedpurchase-stock-data="${stock}"></span>
    `;

    inputFormContainer.innerHTML = html;
};

/**
 * Verifica se o botão de compra vai estar ativo ou não a partir do estoque dos produtos
 */
const checkBuyButtonEnabled = () => {
    let stocks = document.querySelectorAll(`[combinedpurchase-stock-data]`);
    let buyButton = document.querySelector(combinedPurchaseSettings.buyButton);
    let buyButtonDisabled = document.querySelector(combinedPurchaseSettings.buyButtonDisabled);
    let buttonEnabled = true;

    if (!stocks) {
        return;
    }

    stocks.forEach(stock => {
        let quantity = stock.getAttribute(`combinedpurchase-stock-data`);

        if (quantity < 1) {
            buttonEnabled = false;
        }
    });

    if (!buttonEnabled) {
        buyButton.classList.add(`${combinedPurchaseSettings.buyButtonCss}--hidden`);
        buyButtonDisabled.classList.remove(`${combinedPurchaseSettings.buyButtonCss}--hidden`);
    } else {
        buyButton.classList.remove(`${combinedPurchaseSettings.buyButtonCss}--hidden`);
        buyButtonDisabled.classList.add(`${combinedPurchaseSettings.buyButtonCss}--hidden`);
    }
}

/**
 * Recebe o valor do produto e adiciona no input correspondente
 *
 * @param {String} priceString
 * @param {String} attribute
 */
const getPrice = (priceString, attribute) => {
    let price = priceString.replace('R$ ', '').replace('.', '').replace(',', '.');
    let priceInput = document.querySelector(`[${attribute}-priceinput]`);
    priceInput.setAttribute('value', price);

    calculateFinalPrice();
};

/**
 * Calcula o preço final do compre junto e apresenta ao usuário
 */
const calculateFinalPrice = () => {
    let mainProductPrice = document.querySelector(`[${combinedPurchaseSettings.mainProduct}-priceinput]`);
    let combinedPurchasePrice = document.querySelector(`[${combinedPurchaseSettings.productCarousel}-priceinput]`);
    
    let finalPriceContainer = document.querySelector(combinedPurchaseSettings.finalPrice);
    let installmentsContainer = document.querySelector(combinedPurchaseSettings.installments);

    mainProductPrice = parseFloat(mainProductPrice.value);
    combinedPurchasePrice = parseFloat(combinedPurchasePrice.value);

    let finalPrice = mainProductPrice + combinedPurchasePrice;
    finalPrice = finalPrice.toFixed(2);

    let installments = finalPrice / combinedPurchaseSettings.installmentsNumber;
    installments = installments.toFixed(2);

    let finalPriceString = 'R$ ' + finalPrice.replace(".", ",");
    let installmentsString = 'R$ ' + installments.replace(".", ",");

    finalPriceContainer.innerHTML = finalPriceString;
    installmentsContainer.innerHTML = installmentsString;
};

/**
 * Gera todo o código HTML do respectivo produto
 *
 * @param {Object} product
 * @param {String} productId
 * @param {String} attribute
 * @returns
 */
 const getProductHtml = (product, productId, attribute, atributeDiscount) => {
    const url = document.querySelector("#urlsite").value;

    let units = product.unidades;

    let unitsIds = Object.keys(units);
    let unitsOptions = [];
    let unitsSizes = [];

    unitsIds.forEach(function(unitId) {
        if (!combinedPurchaseSettings.showUnitsOutOfStock && units[unitId].estoque < 1) {
            return;
        }

        let splittedUnitId = unitId.split('/');
        let option = splittedUnitId[0];
        let size = splittedUnitId[1];

        if (!unitsOptions.includes(option)) {
            unitsOptions.push(option);
        }

        if (!unitsSizes.includes(size)) {
            unitsSizes.push(size);
        }
    });

    let optionContainerDisplayClass = unitsOptions.length < 2 ? " hidden" : '';
    let sizeContainerDisplayClass = unitsSizes.length < 2 ? " hidden" : '';

    let options = [];
    let optionsHtml = '';
    let imagesHtml = '';
    let sizesHtml = [];

    imagesHtml += getProductImagesHtml(product, productId, attribute);

    for (let unitId in units) {
        let unit = units[unitId];
        let optionId = unit.opcao.id;
        let sizeHtml = getSizeHtml(unit, productId, attribute,product);

        if (!sizeHtml && !combinedPurchaseSettings.showUnitsOutOfStock) {
            continue;
        }

        if (options.indexOf(optionId) < 0) {
            options.push(optionId);

            sizesHtml[optionId] = sizeHtml;

            imagesHtml += getUnitImagesHtml(unit.opcao, productId, attribute);
            optionsHtml += getOptionHtml(unit.opcao, productId, attribute);
        } else {
            sizesHtml[optionId] += getSizeHtml(unit, productId, attribute,product);
        }
    }

    if (sizesHtml.length < 1) {
        return '';
    }

    let sizesContentHtml = getSizesContentHtml(sizesHtml, productId, attribute);
    let urlProduct = `${url}/produto/${productId}`;

    return `
        <div class="combined-purchase__item" product-attribute-discount="${atributeDiscount}" product-attribute="${attribute}" ${attribute}-item="${productId}">
            <a href="${urlProduct}" class="combined-purchase__image-container" ${attribute}-image-container="${productId}">
            </a>
            <div class="combined-purchase__name">${product.nome}</div>
            <div class="combined-purchase__options-data${optionContainerDisplayClass}">
                ${optionsHtml}
            </div>
            <div class="combined-purchase__sizes-data${sizeContainerDisplayClass}">
                ${sizesContentHtml}
            </div>
            <div class="combined-purchase__image-data">
                ${imagesHtml}
            </div>
        </div>
    `;
};


/**
 * Gera o código Html das imagens do produto
 *
 * @param {Object} product
 * @param {String} productId
 * @param {String} attribute
 * @returns {String}
 */
 const getProductImagesHtml = (product, productId, attribute) => {
    let images = product.imagens;
    let html = '';

    if (!images) {
        return html;
    }

    images.forEach(image => {
        html +=  `
            <div ${attribute}-image="${productId}">
                <img class="combined-purchase__image" alt="image" src=${image} width="300" height="300" style="height: auto" loading="lazy"/>
            </div>
        `
    });

    return html;
};

/**
 * Gera o código Html das imagens da unidade
 *
 * @param {Object} option
 * @param {String} productId
 * @param {String} attribute
 * @returns {String}
 */
const getUnitImagesHtml = (option, productId, attribute) => {
    if (!option.imagem) {
        return '';
    }

    return `
        <div ${attribute}-image="${productId}-${option.id}">
            <img class="combined-purchase__image" alt="image" src=${option.imagem} width="300" height="300" style="height: auto" loading="lazy"/>
        </div>
    `;
};

/**
 * Gera o código Html das opcções
 *
 * @param {Object} option
 * @param {String} productId
 * @param {String} attribute
 * @returns {String}
 */
const getOptionHtml = (option, productId, attribute) => {
    let html = '';

    if (!option.imageCor) {
        html = `
            <a
                class="combined-purchase__option"
                style="background-color: #${option.corHexa}"
                alt="${option.descricao}"
                ${attribute}-option="${productId}-${option.id}"
            ></a>
        `;
    } else {
        html = `
        <a
            class="combined-purchase__option"
            style="background-color: url(${option.imageCor})"
            alt="${option.descricao}"
            ${attribute}-option="${productId}-${option.id}"
        ></a>
    `
    }

    return html;
};

/**
 * Gera o código Html dos tamanhos
 *
 * @param {Object} size
 * @param {String} productId 
 * @param {String} attribute
 * @returns {String}
 */
const getSizeHtml = (unit, productId, attribute) => {
    let size = unit.tamanho;
    let option = unit.opcao;
    let unitNotAllowed = '';

    if (!combinedPurchaseSettings.showUnitsOutOfStock && unit.estoque < 1) {
        return '';
    }

    if (unit.estoque < 1) {
        unitNotAllowed = "combined-purchase__size--disabled";
    }

    return `
        <a
            value="${productId}-${option.id}-${size.id}"
            class="combined-purchase__size ${unitNotAllowed}"
            ${attribute}-price="${unit.por}"
            ${attribute}-option-selected="${productId}-${option.id}"
            ${attribute}-size="${productId}-${option.id}-${size.id}"
            ${attribute}-stock="${unit.estoque}"
        >
            ${size.descricao}
        </a>
    `;
};

/**
 * Gera o código Html do container dos tamanhos e adiciona o HTML dos tamanhos dentro dele
 *
 * @param {String} sizesHtml
 * @param {String} productId
 * @param {String} attribute
 * @returns {String}
 */
const getSizesContentHtml = (sizesHtml, productId, attribute) => {
    let html = '';

    sizesHtml.map((sizes, optionId) => {
        html += `
            <div class="combined-purchase__size-container" ${attribute}-size-container="${productId}-${optionId}">
                ${sizes}
            </div>
        `;
    });

    return html;
};

/**
 * Executa a aplicação após o DOM estar pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    initilizeCombinedPurchase();
});
