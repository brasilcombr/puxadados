/*var search = [];

search.showSearchMobile = function () {
	$("#showSearch").on("click", function(e) {
		$('#showSearchBox').toggle();
	});
}

search.resizeAutocompleteResults = function() {
	if ($(".search-autocomplete:visible").length > 0 || $(".search-autocomplete:visible").length > 0) {
		$(".ui-autocomplete").css("display", "none");
		$(".search-autocomplete").trigger("blur");
	}
}

search.executeSearchResult = function() {
	if ($(".search-autocomplete").length == 0) {
		return;
	}

	$(".search-autocomplete").autocomplete({
		delay: 500,
		minLength: 3,
		focus: function(event, ui) {
			$(this).val(ui.item.name);
			return false;
		},
		open: function() {
			$('.ui-autocomplete').width($(this).parent(".input-group").width());
		},
		select: function(event, ui) {
			window.location.href=$('#urlsite').val()+"/produto/"+ui.item.label;
			return false;
		},
		source: function (request, response) {
			$.ajax({
				delay: 250,
				url: $("#urlajax").val()+"/produto.php",
				dataType:"json",
				data: {
					act: "resultadoPesquisa",
					name: request.term
				},
				success: function(data) {
					response($.map(data, function(item) {
						return {
							name: item.name,
							label: item.label,
							midia: item.midia,
							preco: item.preco
						}
					}));
				}
			});
		}
	}).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
		var url = $("#urlsite").val();
		return $( "<li></li>" )
		.data( "item.autocomplete", item )
		.append('<a href="'+url+"/produto/"+item.label+'">' + '<img src="'+ item.midia +'" />' + '  ' + item.name + '<span class="search-price-result pull-right">' + item.preco + '</span></a>')
		.appendTo( ul );
	};
}

search.searchAutoComplete = function() {
	$(".search-autocomplete").on("focus", function() {
		if ($(this).val().length >= 3) {
			$(this).autocomplete("search", $(this).val());
		}
	});
	search.executeSearchResult();
}

search.searchAutoCompleteMobile = function() {
	var productAvailable = [];	

	$('.ui-menu-item').addClass('ui-search-autocomplete-mobile');
	$(".search-autocomplete-mobile").keyup(function(event) {
		$(".search-autocomplete-mobile").autocomplete({
			delay: 500,
			minLength: 3,
			open: function() {
				$('.ui-autocomplete').width($(this).parent(".input-group").width());
			},
			source: function (request, response) {
				$.ajax({
					delay: 250,
					url: $("#urlajax").val()+"/produto.php",
					dataType:"json",
					data: {
						act: "resultadoPesquisa",
						name: request.term,
						style: "mobile"
					},
					success: function(data) {
						response($.map(data, function(item) {
							return {
								name: item.name,
								label: item.label,
								midia: item.midia,
								preco: item.preco
							}
						}));
					}
				});
			}
		}).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
			var url = $("#urlsite").val();
			return $( "<li></li>" )
			.data( "item.autocomplete", item )
			.append(`<a href="${url}/produto/${item.label}"><img src="${item.midia}" />${item.name}<span class="search-price-result pull-right">${item.preco}</span></a>`)
			.appendTo( ul );
		};
	});
}

search.executSearchResultScrollHeader = function() {
	if($(".search-autocomplete-scroll-header").length == 0){
		return null;
	}
	$(".search-autocomplete-scroll-header").autocomplete({
		delay: 500,
		minLength: 3, 
		focus: function(event, ui) { 
			$(this).val(ui.item.name);
			return false; 
		}, 
		open: function() { 
			$('.ui-autocomplete').width($(this).parent(".input-group").width());
		}, 
		select: function(event, ui) { 
			window.location.href=$('#urlsite').val()+"/produto/"+ui.item.label; 
			return false; 
		},
		source: function (request, response) { 
			$.ajax({ 
				delay: 250, 
				url: $("#urlajax").val()+"/produto.php", 
				dataType:"json", 
				data: { 
					act: "resultadoPesquisa", 
					name: request.term,
					style: "mobile"
				},
				success: function(data) { 
					response($.map(data, function(item) { 
						return { 
							name: item.name, 
							label: item.label, 
							midia: item.midia, 
							preco: item.preco 
						}
					})); 
				}
			}); 
		}
	}).data( "ui-autocomplete" )._renderItem = function( ul, item ) { 
	var url = $("#urlsite").val(); 
		return $( "<li></li>" )
			.data( "item.autocomplete", item ) 
			.append('<a href="'+url+"/produto/"+item.label+'">' + '<img src="'+ item.midia +'" />' + '  ' + item.name + '<span class="search-price-result pull-right">' + item.preco + '</span></a>') 
			.appendTo( ul ); 
	};
}

search.searchAutoCompleteScrollHeader = function() {
	if($(".search-autocomplete-scroll-header").length == 0){
		return null;
	}
	$(".search-autocomplete-scroll-header").on("focus", function() {
		if ($(this).val().length >= 3) {
			$(this).autocomplete("search", $(this).val());
		}
	});
	search.executSearchResultScrollHeader();
}

search.onTouchendAutocompleteItem = function() { 
	$(document).on("touchend", "li.ui-menu-item a", function() {
		var el = $(this);
		var link = el.attr('href');
		window.location.href = link;
	});
}

$(function() {
	search.searchAutoComplete();
	search.searchAutoCompleteScrollHeader();
	search.searchAutoCompleteMobile();
	search.onTouchendAutocompleteItem();
});*/