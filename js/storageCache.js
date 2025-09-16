/**
 * StorageCache is created by Live eCommerce <dev@liveecommerce.com.br>
 * version: 1.3.0 <- this version is required to check the difference between new release and cache on production
 */

var storageCache = [];

storageCache.cartHtml = demo.cartHtml != undefined ? demo.cartHtml : null;
storageCache.login = demo.login != undefined ? demo.login : null;
storageCache.userType = ".user-type-container";
storageCache.retries = 0;
storageCache.maxRetries = 1;

storageCache.cartPriceElements = [
    "cart-total",
    "cart-total-de",
    "cart-original-total",
    "cart-automatic-pricing-table-total",
    "cart-automatic-pricing-table-customer-enable",
    "cart-quantity",
];

storageCache.getCartHtmlElements = function () {
    if (!storageCache.cartHtml) {
        console.error("Sorry, the cartHtml wasn't loaded.");
        return false;
    }

    const cartHtml = storageCache.cartHtml;

    if (
        !cartHtml.quantity &&
        !cartHtml.quantityMobile &&
        !cartHtml.items &&
        !cartHtml.total
    ) {
        console.error("Sorry, the cartHtml wasn't loaded.");
        return false;
    }

    return cartHtml;
};

storageCache.getLoginHtmlElements = function () {
    if (!storageCache.login) {
        console.error("Sorry, the login wasn't loaded.");
        return false;
    }

    const login = storageCache.login;

    if (
        !login.loginHtmlElement &&
        !login.loginHtmlElementMobile &&
        !login.logoutButtons
    ) {
        console.error("Sorry, the login wasn't loaded.");
        return false;
    }

    return login;
};

storageCache.setCartPrices = function () {
    let cartPrices = [];

    storageCache.cartPriceElements.map((priceName) => {
        let elementObj = $(`.${priceName}`).first();

        if (elementObj.length) {
            cartPrices.push({ name: priceName, value: elementObj.text() });
        }
    });

    window.localStorage.setItem("cartPrices", JSON.stringify(cartPrices));
};

storageCache.getCartPrices = function () {
    let cartPricesCached = window.localStorage.getItem("cartPrices");

    cartPricesCached = JSON.parse(cartPricesCached);
    if (!cartPricesCached) {
        return;
    }

    storageCache.cartPriceElements.map((priceName) => {
        let elementObj = $(`.${priceName}`);

        if (elementObj.length) {
            const priceCached = cartPricesCached.find(
                (item) => item.name == priceName
            );

            if (priceCached) {
                elementObj.text(priceCached.value);
            }
        }
    });

    if ("cartGamificationBanner" in window) {
        cartGamificationBanner.calculateBannerProgressBar();
        cartGamificationBanner.calculateBannerProgressBar("OnProduct");

        if ($("[cartgamificationbannercontaineronproductmodal]").length > 0) {
            cartGamificationBanner.calculateBannerProgressBar("OnProductModal");
        }
    }
};

storageCache.setCartSaved = function () {
    const cartHtmlElements = storageCache.getCartHtmlElements();

    if (!cartHtmlElements) {
        return;
    }

    let quantity = null;
    if (cartHtmlElements.quantity) {
        quantity = $(cartHtmlElements.quantity).html();
    }

    let quantityMobile = null;
    if (cartHtmlElements.quantityMobile) {
        quantityMobile = $(cartHtmlElements.quantityMobile).html();
    }

    let items = null;
    if (cartHtmlElements.items) {
        items = $(cartHtmlElements.items).html();
    }

    let wholesaleTotal = null;
    if (cartHtmlElements.wholesaleTotal) {
        wholesaleTotal = $(cartHtmlElements.wholesaleTotal).html();
    }

    let total = null;
    if (cartHtmlElements.total) {
        total = $(cartHtmlElements.total).html();
    }

    let expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const cartHtmlJson = {
        quantity: quantity,
        quantityMobile: quantityMobile,
        items: items,
        total: total,
        wholesaleTotal: wholesaleTotal,
        updatedAt: new Date().getTime(),
        expiresAt: expires.getTime(),
    };

    window.localStorage.setItem("cartHtml", JSON.stringify(cartHtmlJson));
    storageCache.setUserType();
    storageCache.setCartPrices();
};

storageCache.getCartSaved = function () {
    const cartHtml = window.localStorage.getItem("cartHtml");

    if (!cartHtml) {
        return;
    }

    const cartHtmlJson = JSON.parse(cartHtml);

    if (!cartHtmlJson) {
        return;
    }

    const cartHtmlElements = storageCache.getCartHtmlElements();
    if (!cartHtmlElements) {
        return;
    }

    if (cartHtmlJson.expires <= new Date().getTime()) {
        window.localStorage.setItem("cartHtml", null);
        return;
    }

    if (cartHtmlJson.quantity) {
        $(cartHtmlElements.quantity).html(cartHtmlJson.quantity);
    }

    if (cartHtmlJson.quantityMobile) {
        $(cartHtmlElements.quantityMobile).html(cartHtmlJson.quantityMobile);
    }

    if (cartHtmlJson.items) {
        $(cartHtmlElements.items).html(cartHtmlJson.items);
    }

    if (cartHtmlJson.wholesaleTotal) {
        $(cartHtmlElements.wholesaleTotal).html(cartHtmlJson.wholesaleTotal);
    }

    if (cartHtmlJson.total) {
        $(cartHtmlElements.total).html(cartHtmlJson.total);
    }
};

storageCache.getUserType = function () {
    const userTypeHtml = $(storageCache.userType);
    const userTypeSaved = window.localStorage.getItem("userType");

    if (userTypeHtml.length && userTypeSaved) {
        userTypeHtml.html(userTypeSaved);
    }
};

storageCache.setUserType = function () {
    const userTypeHtml = $(storageCache.userType);
    if (userTypeHtml.length) {
        window.localStorage.setItem("userType", userTypeHtml.html());
    }
};

storageCache.getLoginHtml = function () {
    const loginHtmlElements = storageCache.getLoginHtmlElements();
    if (!loginHtmlElements) {
        return;
    }

    const loginHtml = window.localStorage.getItem("login");
    const loginHtmlMobile = window.localStorage.getItem("loginMobile");

    let loginHtmlObj = null;
    let loginHtmlObjMobile = null;
    let loginStatic = null;
    let loginStaticMobile = null;

    if (loginHtmlElements.loginHtmlElement) {
        loginHtmlObj = $(loginHtmlElements.loginHtmlElement + " .ajaxFunction");
        loginStatic = $(
            loginHtmlElements.loginHtmlElement + " [login-data-static]"
        );
    }

    if (loginHtmlElements.loginHtmlElementMobile) {
        loginHtmlObjMobile = $(
            loginHtmlElements.loginHtmlElementMobile + " .ajaxFunction"
        );
        loginStaticMobile = $(
            loginHtmlElements.loginHtmlElementMobile + " [login-data-static]"
        );
    }

    if (loginHtmlObj) {
        if (loginHtml) {
            loginHtmlObj.html(loginHtml);
        } else {
            loginHtmlObj.html(loginStatic.html());
        }

        loginStatic.addClass("hidden");
    }

    if (loginHtmlObjMobile) {
        if (loginHtmlMobile) {
            loginHtmlObjMobile.html(loginHtmlMobile);
        } else {
            loginHtmlObjMobile.html(loginStaticMobile.html());
        }

        loginStaticMobile.addClass("hidden");
    }

    $(document).on("ajaxcache.ended", function () {
        if (loginHtmlObj) {
            const html = loginHtmlObj.html();
            window.localStorage.setItem("login", html);
        }

        if (loginHtmlObjMobile) {
            const htmlMobile = loginHtmlObjMobile.html();
            window.localStorage.setItem("loginMobile", htmlMobile);
        }

        $(document).trigger("ajaxcache.redirect");
        demo.updateCart();
    });

    if (storageCache.login.logoutButtons) {
        $(storageCache.login.logoutButtons).on("click", function (event) {
            event.preventDefault();

            if (loginHtmlObj) {
                window.localStorage.removeItem("login");
                loginHtmlObj.html(loginStatic.html());
            }

            if (loginHtmlObjMobile) {
                window.localStorage.removeItem("loginMobile");
                loginHtmlObjMobile.html(loginStaticMobile.html());
            }

            window.location = $("#urlsite").val() + "/cliente/logout";
        });
    }
};

storageCache.clearCache = function () {
    if (window.localStorage.getItem("needUpdate")) {
        window.localStorage.removeItem("needUpdate");
    }

    if (window.localStorage.getItem("cartHtml")) {
        window.localStorage.removeItem("cartHtml");
    }

    if (window.localStorage.getItem("login")) {
        window.localStorage.removeItem("login");
    }

    if (window.localStorage.getItem("loginMobile")) {
        window.localStorage.removeItem("loginMobile");
    }

    if (window.localStorage.getItem("userType")) {
        window.localStorage.removeItem("userType");
    }

    if (window.localStorage.getItem("cartPrices")) {
        window.localStorage.removeItem("cartPrices");
    }
};

storageCache.updateCache = function () {
    $(document).trigger("ajaxcache.needupdate");
};

storageCache.checkIfCacheNeedUpdate = function () {
    const lastUpdate = window.localStorage.getItem("lastCacheUpdate");
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!lastUpdate || now - lastUpdate >= twentyFourHours) {
        storageCache.clearCache();
        storageCache.updateCache();
        window.localStorage.setItem("lastCacheUpdate", now);
        return;
    }

    if (window.localStorage.getItem("needUpdate")) {
        storageCache.clearCache();
        storageCache.updateCache();
        window.localStorage.setItem("lastCacheUpdate", now);
    }

    const params = helper.getUrlParams();
    if (params.updateAjaxCache) {
        storageCache.clearCache();
        storageCache.updateCache();
        window.localStorage.setItem("lastCacheUpdate", now);
    }
    console.log(
        "Cache last updated on: " +
            new Date(
                parseInt(window.localStorage.getItem("lastCacheUpdate"))
            ).toLocaleString()
    );
};

$(function () {
    try {
        storageCache.getCartSaved();
        storageCache.getLoginHtml();
        storageCache.getUserType();
        storageCache.getCartPrices();

        // this function need to be the last called/
        storageCache.checkIfCacheNeedUpdate();
    } catch ($e) {
        console.error($e);

        if (storageCache.retries++ < storageCache.maxRetries) {
            storageCache.checkIfCacheNeedUpdate();
        }
    }
});
