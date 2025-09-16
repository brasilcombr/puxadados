var lazyLoadService = {};
lazyLoadService.eventExecuted = false;
lazyLoadService.eventAfterFirstInteractionExecuted = false;
lazyLoadService.inlineScriptsStored = [];
lazyLoadService.scriptTagsStored = [];
lazyLoadService.functionsStored = [];
lazyLoadService.videosStored = [];
lazyLoadService.functionsAfterInteractionStored = [];

lazyLoadService.addScriptTagToQueue = function(element, url, attributes = []) {
	lazyLoadService.scriptTagsStored.push({element, url, attributes});

	if (lazyLoadService.eventExecuted) {
		lazyLoadService.appendScriptTagsToDOM();
	}
}

lazyLoadService.addVideoToQueue = function(element, html) {
	lazyLoadService.videosStored.push({element, html});

	if (lazyLoadService.eventExecuted) {
		lazyLoadService.appendVideosToDOM();
	}
}

lazyLoadService.addInlineScriptToQueue = function(element, html) {
	lazyLoadService.inlineScriptsStored.push({element, html});

	if (lazyLoadService.eventExecuted) {
		lazyLoadService.appendInlineScriptsToDOM();
	}
}

lazyLoadService.addFunctionToQueue = function(func) {
	if (lazyLoadService.eventExecuted) {
		func();
	} else {
		lazyLoadService.functionsStored.push(func);
	}
}

lazyLoadService.addFunctionToQueueAfterInteraction = function(func) {
	if (lazyLoadService.eventAfterFirstInteractionExecuted) {
		func();
	} else {
		lazyLoadService.functionsAfterInteractionStored.push(func);
	}
}

lazyLoadService.appendHtml = function(element, html) {
	switch (element) {
		case 'body':
			document.body.appendChild(html);
			break;
		case 'head':
			document.head.appendChild(html);
			break;
		default:
			document.querySelector(element).appendChild(html);
			break;
	}
}

lazyLoadService.appendScriptTagsToDOM = function() {
	if (lazyLoadService.scriptTagsStored === undefined) {
		return;
	}

	if (!lazyLoadService.scriptTagsStored.length) {
		return;
	}

	lazyLoadService.scriptTagsStored.map((script) => {
		let html = document.createElement('script');
		html.type = 'text/javascript';
		html.async = true;
		html.src = script.url;

		if (script.attributes.length > 0) {
			script?.attributes?.map(attribute => {
				html.setAttribute(attribute.key, attribute.value);
			});
		}

		lazyLoadService.appendHtml(script.element, html);
	});

	lazyLoadService.scriptTagsStored = [];
}

lazyLoadService.appendInlineScriptsToDOM = function() {
	if (lazyLoadService.inlineScriptsStored === undefined) {
		return;
	}

	if (!lazyLoadService.inlineScriptsStored.length) {
		return;
	}

	lazyLoadService.inlineScriptsStored.map((script) => {
		lazyLoadService.appendHtml(script.element, script.html);
	});

	lazyLoadService.inlineScriptsStored = [];
}

lazyLoadService.appendVideosToDOM = function() {
	if (lazyLoadService.videosStored === undefined) {
		return;
	}

	if (!lazyLoadService.videosStored.length) {
		return;
	}

	lazyLoadService.videosStored.map((video) => {
		document.querySelector(video.element).innerHTML = video.html;
	});
}

lazyLoadService.runEnqueuedFunctionsAfterInteraction = function() {
	if (lazyLoadService.functionsAfterInteractionStored === undefined) {
		return;
	}

	if (!lazyLoadService.functionsAfterInteractionStored.length) {
		return;
	}

	lazyLoadService.functionsAfterInteractionStored.map(func => {
		func();
	});

	lazyLoadService.functionsAfterInteractionStored = [];
}

lazyLoadService.runEnqueuedFunctions = function() {
	if (lazyLoadService.functionsStored === undefined) {
		return;
	}

	if (!lazyLoadService.functionsStored.length) {
		return;
	}

	lazyLoadService.functionsStored.map(func => {
		func();
	});

	lazyLoadService.functionsStored = [];
}

lazyLoadService.executeFunctions = function() {
	lazyLoadService.eventExecuted = true;

	lazyLoadService.appendScriptTagsToDOM();
	lazyLoadService.appendInlineScriptsToDOM();
	lazyLoadService.runEnqueuedFunctions();
	lazyLoadService.appendVideosToDOM();
}

lazyLoadService.executeFunctionsAfterInteraction = function() {
	lazyLoadService.runEnqueuedFunctionsAfterInteraction();
}

lazyLoadService.runLazyloadFunctions = function() {
	setTimeout(() => {
		document.addEventListener('scroll', triggerFunctions);
		document.addEventListener('mousemove', triggerFunctions);
		document.addEventListener('touchstart', triggerFunctions);
	} , 3500);

	function triggerFunctions(event) {
		event.currentTarget.removeEventListener(event.type, triggerFunctions);

		if (lazyLoadService.eventExecuted) {
			return;
		}

		lazyLoadService.executeFunctions();
		console.log("functions executed with lazyload");
	}
}

lazyLoadService.runLazyLoadFunctionsAfterFirstInteraction = function() {
	function triggerAfterInteractions(event) {
		event.currentTarget.removeEventListener(event.type, triggerAfterInteractions);

		if (lazyLoadService.eventAfterFirstInteractionExecuted) {
			return;
		}

		lazyLoadService.executeFunctionsAfterInteraction();
		lazyLoadService.eventAfterFirstInteractionExecuted = true;
		console.log("functions lazy after first interaction executed");
	}

	document.addEventListener('scroll', triggerAfterInteractions);
	document.addEventListener('mousemove', triggerAfterInteractions);
	document.addEventListener('touchstart', triggerAfterInteractions);
}

lazyLoadService.loadNoScriptHtml = (selector = "lazyload-html") => {
	const data =  document.querySelectorAll(`[${selector}]`);

	if (!data) {
		return;
	}

	data.forEach(item => {
		let element = item.getAttribute(selector);
		let html = document.querySelector(element);

		const parser = new DOMParser();
		const dom = parser.parseFromString(item.innerText, "text/html");

		if (html) {
			html.innerHTML += dom.querySelector('body').innerHTML;
		}

		item.remove();
	});
}

document.addEventListener('DOMContentLoaded', () => {
	let path = window.location.pathname;

	if (/\/(compra|cliente|pedido|vendedor|catalogo|contarecebimento|historicocupom|mercadopago)\/.*/i.test(path)) {
		lazyLoadService.executeFunctions();
		lazyLoadService.executeFunctionsAfterInteraction();
		console.log("functions executed without lazyload");
	} else {
		lazyLoadService.runLazyloadFunctions();
		lazyLoadService.runLazyLoadFunctionsAfterFirstInteraction();
	}
});
