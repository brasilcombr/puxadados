facebookPixel = {};
facebookPixel.sendContact = function (event, fbPixelId) {
    fbq(`track${event.custom}`, event.name, event.data);

    var facebookPixelImage = `<noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${fbPixelId}&ev=${event.name}&noscript=1${event.urlData}"
    /></noscript>`;

    $('header').append(facebookPixelImage);
}

facebookPixel.saveFbClid = function () {
    var urlParams = new URLSearchParams(window.location.search);
    var fbclid = urlParams.get('fbclid');

    if (fbclid) {
        helper.defineCookie('_pixelclid', fbclid);
    }
}

$(function() {
	facebookPixel.saveFbClid();
});