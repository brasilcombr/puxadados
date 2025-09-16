var popup = {};
popup.eventNull = 0;
popup.eventoLeave = 1;
popup.eventoOpen = 2;
popup.showed = false;
popup.countLeave = 0;
popup.queueStarted = false;
popup.queue = [];
popup.viewedItems = false;

popup.getViewedPopups = function() {
	const items = helper.getCookie('viewedPopups');

	if (!items) {
		popup.viewedItems = [];
		return;
	}

	popup.viewedItems = JSON.parse(items);
}

popup.sendPopupToQueue = function(id, showEvent, timeout) {
	var item = {
		'id': id,
		'showEvent': showEvent,
		'timeout': timeout
	};

	if (!popup.viewedItems) {
		popup.getViewedPopups();
	}

	if (popup.viewedItems.length) {
		let found = popup.viewedItems.find(item => item == id);

		if (found) {
			return;
		}
	}

	if (item.showEvent == popup.eventoLeave) {
		popup.addMouseLeaveEventToPopup(item);
	} else {
		popup.addToQueue(item);
	}
}

popup.addToQueue = function(item) {
	popup.queue.push(item);

	if (!popup.queueStarted) {
		if (typeof lazyLoadService == 'undefined') {
			popup.startShowPopups();
		} else {
			lazyLoadService.addFunctionToQueue(popup.startShowPopups);
		}
	}
}

popup.startShowPopups = function() {
	if (popup.queueStarted) {
		return;
	}

	var interval = setInterval(() => {
		popup.queueStarted = true;
		if (popup.queue.length < 1) {
			clearInterval(interval);
			popup.queueStarted = false;
			return;
		}

		if (!popup.showed) {
			popup.showed = true;
			popup.showPopupItem(popup.queue.shift());
		}
	}, 1000);
}

popup.addMouseLeaveEventToPopup = function(item) {
	document.addEventListener("visibilitychange", function() {
		if(document.hidden){
			popup.addToQueue(item);
		}
	});
}

popup.showPopupItem = function(item) {
	if (item.timeout > 0) {
		setTimeout(popup.loadPopup(item), item.timeout);
	} else {
		popup.loadPopup(item);
	}
}

popup.showPopup = function(id, showEvent, timeout) {
	var loadPopup = function(){
		if (popup.showed === false) {
			var popupElement = $('.popup .modal[data-id='+id+']');
			popupElement = popupElement[0];
			$(popupElement).modal('show');
			popup.showed = true;
			var url = $("#urlajax").val()+"/cliente.php?act=popupVisualizado&id="+id;
			ajax.enqueue(ajax.GET, url);	
		}
	};

	if (showEvent == popup.eventNull || showEvent == popup.eventoOpen) {
		if (timeout > 0) {
			setTimeout(loadPopup, timeout);
		} else {
			loadPopup();
		}
	} else if (showEvent == eventoLeave) {
		$('html').on('mouseleave', function () {
			if (popup.countLeave == 0) {
				popup.showed = false;
				popup.countLeave = 1;
				if (timeout > 0) {
					setTimeout(loadPopup, timeout);
				} else {
					loadPopup();
				}

			}
		});
	}
}

popup.loadPopup = function(item) {
	if(!item || !item.id) {
		return;
	}

	var popupElement = $('.popup .modal[data-id=' + item.id + ']');
	popupElement = popupElement[0];
	$(popupElement).modal('show');

	if (!window.isCacheable) {
		var url = $("#urlajax").val()+"/cliente.php?act=popupVisualizado&id=" + item.id;
		X.get(url);
	}

	popup.viewedItems.push(item.id);
	const popupCookie = JSON.stringify(popup.viewedItems);

	var date = new Date();
	var year  = date.getFullYear();
	var month = date.getMonth();
	var day = date.getDate();

	var date = new Date(year, month + 1, day);
	date = date.toGMTString();

	document.cookie = `viewedPopups=${popupCookie}; expires=${date}; path=/;`;

	$('.modal-open').on('mouseup', function() {
		popup.showed = false;
		$('.modal-open').off('mouseup');
	});
};
