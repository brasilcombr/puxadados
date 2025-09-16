if (typeof appEvents == "undefined") {
    appEvents = [];
    appEvents.isReady = false;
}

appEvents.googleAnalyticsEvents = (event = 'view_item', params = {}, ga4 = true) => {
    if (!appEvents.isReady) {
        return; 
    }

    window.flutter_inappwebview.callHandler('googleAnalytics', {
        referer: window.location.pathname,
        event: event,
        params: params,
        page_name: document.title,
        ga4: ga4
    });
}

appEvents.setPageType = () => {
    if (!appEvents.isReady) {
        return; 
    }

    const pageType = document.querySelector('.page-type');

    if (!pageType) {
        return;
    }

    window.flutter_inappwebview.callHandler('pageType', pageType.value);
}

appEvents.setSessionInfos = () => {
    let quantity = 0;
    let user = {};

    if (!appEvents.isReady) {
        return;
    }

    if (demo?.appInfos) {
        const quantityEl = document.querySelector(demo?.appInfos?.quantity);
        quantity = parseInt(quantityEl.innerText);
    }

    if (demo?.loginHtmlElement) {
        const name = document.querySelector(demo?.appInfos?.name);
        const email = document.querySelector(demo?.appInfos?.email);

        if (name && email) {
            user = {
                pessoa: {
                    nome: name.innerText,
                    email: email.innerText
                }
            }
        }
    }

    window.flutter_inappwebview.callHandler('sessionInfos', {
        cartLength: quantity,
        user: user || {}
    });
}

window.addEventListener('flutterInAppWebViewPlatformReady', function () {
    appEvents.isReady = true;

    appEvents.setPageType();
    appEvents.setSessionInfos();
});
