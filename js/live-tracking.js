var liveTracking = {};

liveTracking.getUrl = function() {
    var trackUrl = "//livexa.com.br/?utm_source=LogoLojas&utm_medium=" + 
                    window.location.hostname + "&utm_campaign=Logos";
    return trackUrl;
}

liveTracking.getLogo = function(settings, colorImgFooter) {
    var imgSrcDefault = "https://static.cdnlive.com.br/uploads/562/etc/17497536212189.png";
    var imgSrcWhite = "https://static.cdnlive.com.br/uploads/562/etc/17497536674222.png";

    settings.class == undefined ? settings.class = "" : null;
    settings.version == undefined ? settings.version = "v1" : null;
    settings.data == undefined ? settings.data = "" : null;
    var imgSrc = colorImgFooter ? imgSrcWhite : imgSrcDefault;

    let image = "<img " + settings.data + "src='" + imgSrc + "'width='150' alt='Logo da Livexa' class='" + settings.class + "'>";
    return image;
}

liveTracking.showLogo = function(settings, colorImgFooter = false) {
    settings == undefined ? settings = {"version": "v1", "class": "", "data": ""} : null;

    var html  = "<a href='" + liveTracking.getUrl() + "' target='_blank' aria-label='Ir para a página da Livexa'>" + liveTracking.getLogo(settings, colorImgFooter) + "</a>";
    $('#live-logo').html(html);
}