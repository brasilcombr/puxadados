tiktokPixel = {};
tiktokPixel.sendContact = function (event, ttkPixelId) {
    ttq.track(event.name, event.data);

    var tiktokPixelImage = `<noscript><img height="1" width="1" style="display:none"
        src="https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=${ttkPixelId}&ev=${event.name}&noscript=1${event.urlData}"
        /></noscript>`;

    $('header').append(tiktokPixelImage);
}

tiktokPixel.saveTtClid = function () {
    var urlParams = new URLSearchParams(window.location.search);
    var ttclid = urlParams.get('ttclid');

    if (ttclid) {
        helper.defineCookie('_pixelclid', ttclid);
    }
}

$(function() {
	tiktokPixel.saveTtClid();
});
