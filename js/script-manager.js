var scriptManager = {};

scriptManager.init = function(classElement = '.src-script') {
    $(classElement).each(function(index, element){
        var script = document.createElement("script");
        script.src = $(this).attr('data-src');
        document.head.appendChild(script);
    });
}

$(function() {
    scriptManager.init('.src-script');

    setTimeout(() => {
        scriptManager.init('.src-script-defer');
    }, 2000);
});