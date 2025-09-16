var facebook = {};

facebook.initialize = function(appId, version) {
	window.fbAsyncInit = function() {
		FB.init({
			appId: appId || null,
			cookie: true,
			version: version || null,
			xfbml: true
		});
	};
}

facebook.logInWithFacebook = function(action, callback) {
	var loginUrl = helper.getBaseUrl() + '/ajax/cliente/login.php';
	action = action || 'loginFacebook';
	callback = callback || 'checkoutcustomer.handleOauthLogin';

	FB.login(function(response) {
		if (response.authResponse) {
			ajax.send(ajax.POST, loginUrl, {'act': action }, callback);
		} else {
			ajaxutils.showModal(
				"N&#227;o foi poss&#237;vel carregar todos os dados de seu cadastro",
				"Por favor, tente conectar ao facebook novamente e conceda todas as permiss&otilde;es solicitadas."
			);
		}
	}, {scope: 'public_profile, email', auth_type: 'rerequest'});
	return false;
};

facebook.checkLoginState = function() {
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			// the user is logged in and has authenticated your
			// app, and response.authResponse supplies
			// the user's ID, a valid access token, a signed
			// request, and the time the access token 
			// and signed request each expire
			var uid = response.authResponse.userID;
			var accessToken = response.authResponse.accessToken;
		} else if (response.status === 'not_authorized') {
			// the user is logged in to Facebook, 
			// but has not authenticated your app
		} else {
			// the user isn't logged in to Facebook.
		}
	});
};

facebook.loginButton = function() {
	$(document).on('click', '#fb-login', function(e) {
		var action = $(this).data('action');
		var callback = $(this).data('callback');
		facebook.logInWithFacebook(action, callback);
	});
}

facebook.loginButton();

(function(d, s, id){
	function executeFb() {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "https://connect.facebook.net/pt_BR/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
		$(document).trigger("facebook-ready");
	}

	if (typeof lazyLoadService == 'undefined') {
		executeFb();
	} else {
		lazyLoadService.addFunctionToQueue(executeFb);
	}

}(document, 'script', 'facebook-jssdk'));
