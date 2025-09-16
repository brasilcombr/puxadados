priceRangeSlider = [];

priceRangeSlider.rangeEvent = function() {
    if ($("#slider-filter").length <= 0) {
        return;
    }

    minp = $("#slider-filter").children("[name='minp']").val();
    maxp = $("#slider-filter").children("[name='maxp']").val();
    baseurl = $("#slider-filter").children("[name='baseurl']").val();
    baseurl = baseurl.replace("/?", "?");

    $("#slider-range").slider({
        range: true,
        min: Number(minp),
        max: Number(maxp) + 1,
        values: [ 0, maxp ],
        slide: function(event, ui) {
            $("#min").val("R$" + ui.values[ 0 ]);
            $("#max").val("R$" + ui.values[ 1 ]);
            filterurl = baseurl + "?&minp=" + ui.values[ 0 ] + "&maxp=" + ui.values[ 1 ];
            $("#btn-filtrar").attr("href",filterurl);
        }
    });

    $("#min").val("R$" + minp);
    $("#max").val("R$" + maxp);
    filterurl = baseurl + "?&minp=" + minp + "&maxp=" + maxp;
    $("#btn-filtrar").attr("href",filterurl);
}

$(function(){
    priceRangeSlider.rangeEvent();
});