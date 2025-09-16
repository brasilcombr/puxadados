var checkoutcustomer = {};

// Urls
var ajaxCustomer = helper.getBaseUrl() + '/ajax/checkout/cliente.php';
var ajaxLogin = helper.getBaseUrl() +  '/ajax/cliente/login.php';

// Static Variables
var emailValidating = ".validating-email";
var emailPasswordValidating = ".validating-email-password";
var passwordEmailValidating = ".validating-password-email";
var accessValidating = ".validating-access";
var personalSelector = ".personal";
var personalValidating = ".personal .validating-content";
var personalValidated = ".personal .validated-content";
checkoutcustomer.emailInput = ".validating-email input[name='email']";
checkoutcustomer.emailPasswordInput = ".validating-email-password input[name='email']";
checkoutcustomer.passwordEmailInput = ".validating-password-email input[name='password']";
var infoSelector = ".waiting-info";
var customerLoadedData = null;
var enableEdit = false;
var showGuestModal = false;
var missingDocument = false;
var showLockMessage = false;
var loginType = null;
checkoutcustomer.blockChangeCnpj = false;

// Modal Selectors
var errorLabelSelector = '[data-error-container]';
var errorLabelContainerSelector = '.warning-container';
var securityErrorLabelSelector = '[data-security-error]';
var securityErrorLabelContainerSelector = '.security-warning-container';
var okLabelSelector = '.label.ok';
checkoutcustomer.loginTypeSelector = '[data-login-type]';

checkoutcustomer.loginTypes = {guestCheckout: 1, passwordLogin: 2};

checkoutcustomer.initialize = function() {
	var selectoremail = ".validating-email button";
	var selectorpassword = ".validating-email-password button";

	var event = "click";

	selector = checkoutcustomer.loginTypeSelector;
	loginType = $(selector).val();

	if (loginType == checkoutcustomer.loginTypes.guestCheckout) {
		$(document).on(event, selectoremail, function(e) {
			checkoutSetup.loadLoginData();

			if ($("#useinvisiblerecaptcha").val() != 'true') {
				checkoutcustomer.checkEmail();
			} else {
				checkout.sendInvisibleRecaptchaValidation('checkoutcustomer.validateRecaptcha');
			}
		});
	} else {
		$(document).on(event, selectorpassword, function(e) {
			e.preventDefault();

			checkoutSetup.loadLoginData();

			if ($("#useinvisiblerecaptcha").val() != 'true') {
				checkoutcustomer.checkEmailAndPassword();
			} else {
				checkout.sendInvisibleRecaptchaValidation('checkoutcustomer.validateRecaptcha');
			}
		});
	}
}

// Verifica se o cliente existe de acordo com o email
checkoutcustomer.checkEmail = function() {
	var email = $(checkoutcustomer.emailInput).val();

	var data = {
		act: "verificaremail",
		email: email
	};

	loading.show(personalSelector);

	checkoutSetup.ajaxCheckoutCache(ajax.POST, ajaxCustomer, data, 'checkoutcustomer.handleCustomer');
}

// Verifica se o cliente existe de acordo com o email e senha
checkoutcustomer.checkEmailAndPassword = function() {
	var email = $(checkoutcustomer.emailPasswordInput).val();
	var password = $(checkoutcustomer.passwordEmailInput).val();

	checkoutcustomer.handleCustomerLoginPassword(email,password);
}

checkoutcustomer.validateRecaptcha = function(response) {
	if (!response.data || !response.data.data) {
		$("#email-error").text("Desculpe, não foi possível finalizar sua requisição, tente novamente mais tarde.");
		return;
	}

	checkoutcustomer.verifyLoginType();
}

checkoutcustomer.verifyLoginType = function() {
	selector = checkoutcustomer.loginTypeSelector;
	loginType = $(selector).val();

	if (loginType == checkoutcustomer.loginTypes.passwordLogin) {
		return checkoutcustomer.checkEmailAndPassword();
	}
	return checkoutcustomer.checkEmail();
}

// Verifica travas de pedido pendente
checkoutcustomer.checkPendingOrderLock = function() {
	var customerEmail = $(checkoutcustomer.emailInput).length ? $(checkoutcustomer.emailInput).val() : null;
	var data = {
		act: "verificartravapedidoaberto",
		email: customerEmail
	};

	loading.show(personalSelector);

	checkoutSetup.ajaxCheckoutCache(ajax.POST, ajaxCustomer, data, 'checkoutcustomer.handleLocks');
}

checkoutcustomer.handleLocks = function(response) {
	loading.hide();

	checkoutcustomer.hidePendingOrderMessage();

	if (response.data.data == 1 || response.data.data == null) {
		return;
	}
	
	if (response.data.data == 2) {
		checkoutcustomer.showPendingOrderMessage();
	} else if (response.data.data == 3) {
		checkoutcustomer.showPendingOrderMessage('Não é possível prosseguir com pedidos pendentes.');
		checkoutcustomer.lockOrderCompletion('Prosseguimento bloqueado');
	}
}

checkoutcustomer.showPendingOrderMessage = function(message = null) {
	var alertSelector = '[data-pending-order-alert]';
	var textSelector = '[data-pending-order-alert-text]';

	if (!$(alertSelector).length) {
		return;
	}

	if (!message) {
		message = "Você possui pedidos pendentes.";
	}

	if ($(textSelector).length) {
		$(textSelector).html(message);
	}

	$(alertSelector).show();
}

checkoutcustomer.hidePendingOrderMessage = function() {
	var alertSelector = '[data-pending-order-alert]';

	if (!$(alertSelector).length) {
		return;
	}

	$(alertSelector).hide();
}

checkoutcustomer.lockOrderCompletion = function(lockMessage) {
	var lockInputSelector = '[data-order-lock]';

	if (!$(lockInputSelector).length) {
		return;
	}

	if (lockMessage) {
		$(infoSelector).html(lockMessage);
	}

	$(lockInputSelector).val("true");
}

checkoutcustomer.unlockOrderCompletion = function() {
	var lockInputSelector = '[data-order-lock]';

	if (!$(lockInputSelector).length) {
		return;
	}

	$(infoSelector).html("Aguardando preenchimento de dados")
	$(lockInputSelector).val("false");
}

checkoutcustomer.isOrderCompletionLocked = function() {
	var lockInputSelector = '[data-order-lock]';

	if (!$(lockInputSelector).length) {
		return false;
	}

	return $(lockInputSelector).val() == 'true';
}

// Logica de tratamento de clientes novos e existentes
// Se o cliente existir faz o guest login, se não habilita o form de cadastro
checkoutcustomer.handleCustomer = function(checkEmail) {
	loading.hide();

	checkoutcustomer.handleCustomerLoginGuest(checkEmail);
}

checkoutcustomer.handleCustomerLoginPassword = function(email, password) {
	var dataRequestCustomer = { 
		act:"logarComEmaileSenha",
		email: email,
		senha: password
	};

	loading.show(personalSelector);

	checkoutSetup.ajaxCheckoutCache(ajax.POST, ajaxLogin, dataRequestCustomer, 'checkoutcustomer.handleLoginGuestOrPassword');
}

checkoutcustomer.handleCustomerLoginGuest = function(checkEmail) {
	var emailButtonContainer = ".validating-email button";
	
	if (checkEmail.message) {
		var formControls = $('.form-control');
		formControls.removeClass('valid').addClass('error');
	
		var error = "<span class='error-field-list'>" + checkEmail.message + "</span>";
		ajaxutils.showAlertModal("", "Ops! Algo deu errado <br>" + error, "N&#227;o conseguimos realizar seu cadastro :(");
	
		return;
	}

	if (checkEmail.data.data == true) {
		var email = $(checkoutcustomer.emailInput).val();

		var dataRequestCustomer = { 
			act: "loginguest",
			email: email
		};

		loading.show(personalSelector);

		checkoutSetup.ajaxCheckoutCache(ajax.POST, ajaxLogin, dataRequestCustomer, 'checkoutcustomer.handleLoginGuestOrPassword');
	} else {
		$(checkoutcustomer.emailInput).prop("disabled",true);
		$(personalValidating).removeClass("d-none");
		$(emailButtonContainer).addClass("d-none");
		checkoutcustomer.fillCustomerData();
		layout.companyIeExempt();

		checkoutcustomer.leadTracker();
	}
}

checkoutcustomer.changeEmailEvent = function() {
	var selectorSubmit = ".change-email";
	var emailButtonContainer = ".validating-email button";
	var event = "click";

	$(document).on(event, selectorSubmit, function(e) {
		$(checkoutcustomer.emailInput).prop("disabled",false);
		$(personalValidating).addClass("d-none");
		$(emailButtonContainer).removeClass("d-none");
		checkoutcustomer.showAccessValidating();
		customerLoadedData = null;
		if (enableEdit) {
			checkoutcustomer.logout();
		}
	});

}

// Verifica o login guest ou login password, se não houver erro carrega os dados do cliente
checkoutcustomer.handleLoginGuestOrPassword = function(loginData) {
	loading.hide();
	if (loginData.error == true) {
		errorMessages = loginData.message;

		if (errorMessages.securityLoginMessage) {
			ajaxutils.showAlertModal("", errorMessages.securityLoginMessage, "Ops! Algo deu errado");
		} else if (errorMessages.failedLoginMessage) {
			ajaxutils.showAlertModal("", errorMessages.failedLoginMessage ,"Tivemos problemas com seu login");
		} else if (errorMessages) {
			ajaxutils.showAlertModal("", errorMessages ,"Tivemos problemas com seu login");
		} else {
			ajaxutils.showAlertModal("", "Tivemos problemas com seu login", "Ops! Algo deu errado");
		}

		return;
	}

	if (loginData.data.data == true) {
		showGuestModal = true;
		checkoutcustomer.getCustomerData();

		selector = checkoutcustomer.loginTypeSelector;
		loginType = $(selector).val();

		if (loginType == checkoutcustomer.loginTypes.passwordLogin) {
			checkout.loginEvent('password');
		} else {
			checkout.loginEvent('guest');
		}

		$(document).on('checkout.customer.data.loaded', function(e, customer) {
			if (customer.temClassificacao) {
				location.reload();
			} else {
				cart.removeItems();
				cart.listItems();
			}
		});
		return;
	}
}

checkoutcustomer.verifyShowGuestModal = function(customer) {
	if (showGuestModal != true) {
		return;
	}

	var _header = '<i class="fa fa-check-square-o highlight" aria-hidden="true"></i>Ol&#225; <span class="text-capitalize">' + customer + '</span>!';
	var _title = 'Identificamos que voc&#234; j&#225; possui cadastro em nossa loja.';
	var _text = '<p>Para facilitar sua compra preenchemos os dados, mas por seguran&#231;a eles n&#227;o s&#227;o exibidos. Caso deseje alter&#225;-los, basta completar o login.</p>';

	ajaxutils.showAlertModal(_title, _text, _header, false, true);
}

// Carrega os dados do cliente 
checkoutcustomer.getCustomerData = function() {
	checkoutcustomer.checkPendingOrderLock();

	var dataRequestCustomer = { 
		act: "dadoscliente" 
	};

	loading.show(personalSelector);

	checkoutSetup.ajaxCheckoutCache(ajax.POST, ajaxLogin, dataRequestCustomer, 'checkoutcustomer.loadCustumerData');
}

checkoutcustomer.getCustomerForTemplate = function(data) {
	var customerInst = {
		register: false,
		customer: {
			id: data.id || '',
			displayName: checkoutcustomer.defineCustomerName(data)|| '',
			email: data.email || '',
			companyName: data.razao || '',
			companyDisplayName: data.fantasia || '',
			cnpj: data.cnpj || '',
			foreignDocument: data.documentoEstrangeiro || '',
			ie: data.ie || '',
			exempt: data.isento ? 'checked' : '',
			im: data.im || '',
			name: data.nome || '',
			lastname: data.sobrenome || '',
			cpf: data.cpf || '',
			rg: data.rg || '',
			gender: data.sexo || '',
			phone: data.telefone,
			mobile: data.celular || '',
			birthDate: data.dataNasc || '',
			registerDate: data.dataCadastro || '',
			register: false,
			hasClassification: data.temClassificacao,
			rememberedCard: data.rememberedCard || '',
			hasCredit: data.temCredito,
			credit: data.credito
		}
	};
	return customerInst;
}

checkoutcustomer.getCustomerStructureForTemplate = function() {
	var customerInst = {
		register: true,
		customer: {
			id: '',
			displayName: '',
			email: $(checkoutcustomer.emailPasswordInput).val() || $(checkoutcustomer.emailInput).val() || null,
			companyName: '',
			companyDisplayName: '',
			cnpj: '',
			foreignDocument: '',
			ie: '',
			exempt: '', 
			im: '',
			name: '',
			lastname: '',
			cpf: '',
			rg: '',
			gender: '',
			phone: '',
			mobile: '',
			birthDate: '',
			registerDate: '',
			newsletter: 'checked',
		}
	};
	return customerInst;
}

// Exibe os dados do cliente
checkoutcustomer.loadCustumerData = function(customerData) {
	var emailContainer = ".customer-email";
	var nameContainer = ".customer-name";

	loading.hide();
	if (customerData.error == true) {
		ajaxutils.showAlertModal("", "N&#227;o foi poss&#237;vel carregar os dados de seu cadastro", "Ops! Algo deu errado");
		return;
	}

	var customer = customerData.data.data;

	checkoutcustomer.showPersonalValidated();
	checkoutcustomer.hidePersonalValidating();
	checkoutcustomer.hideEmailValidating();
	checkoutcustomer.hideAccessValidating();

	var tplData = checkoutcustomer.getCustomerForTemplate(customer);
	var tpl = template.getTemplate('cliente/checkoutclienteresumo', tplData);
	$(".customer-summary-content").html(tpl);

	customerLoadedData = tplData;
	$("input[name=enderecoEmail]").val(customer.email);

	if(!checkoutcustomer.checkCustomerData(customer)) {
		return;
	}

	$(document).trigger('checkout.customer.data.loaded', [customer]);
	checkoutcustomer.blockChangeCnpj = customer.travaCnpj;

	//Apos o login permite a edição de dados cadastrais e logout
	checkoutcustomer.initializeCustomerEdit();
	checkoutcustomer.logout();

	if (checkoutcustomer.isOrderCompletionLocked()) {
		return;
	}

	checkoutPayment.selectDefaultPayment();
	checkoutcustomer.verifyShowGuestModal(checkoutcustomer.defineCustomerName(customer));

	if (checkoutcustomer.blockChangeCnpj) {
		$(".edit-button").addClass('d-none');
		$(".edit-button").removeClass('d-block');
	}

	address.initialize();
}

checkoutcustomer.checkCustomerData =  function(customer) {
	missingDocument = false;

	let missingCorporatePersonData = checkoutcustomer.missingCorporatePersonData(customer);
	let missingIndividualPersonData = checkoutcustomer.missingIndividualPersonData(customer);
	let missingForeignPersonData = checkoutcustomer.missingForeignPersonData(customer);

	let missingInformation = missingCorporatePersonData && missingForeignPersonData && missingIndividualPersonData;

	if (helper.isEmpty(customer.telefone) || missingInformation) {
		missingDocument = true;
		var callback = 'checkoutcustomer.enableEditByLoginType';
		checkoutcustomer.verifyCustomerGuest(callback);
		return false;
	}

	return true;
}

checkoutcustomer.missingForeignPersonData = function(customer) {
	if (helper.isEmpty(customer.nome) || helper.isEmpty(customer.sobrenome) || helper.isEmpty(customer.documentoEstrangeiro)) {
		return true;
	}

	return false;
}

checkoutcustomer.missingCorporatePersonData = function (customer) {
	if (helper.isEmpty(customer.cnpj) || helper.isEmpty(customer.razao) || (!customer.isento && helper.isEmpty(customer.ie)))  {
		return true;
	}

	return false;
}

checkoutcustomer.missingIndividualPersonData = function(customer) {
	if (helper.isEmpty(customer.cpf) || helper.isEmpty(customer.nome) || helper.isEmpty(customer.sobrenome)) {
		return true;
	}

	return false;
}

// Cria o objeto de cliente com base no customer-form
checkoutcustomer.createCustomerObject = function() {
	let personTab = "#fisica-tab";
	let companyTab = "#juridica-tab";
	let customer = new Object();

	let personName = null;
	let personLastname = null;
	let personCpf = null;
	let companyName = null;
	let companyCnpj = null;
	let companyIe = null;
	let companyIeExempt = null;
	let phone = null;
	let foreignPersonName = null;
	let foreignPersonLastName = null;
	let foreignPersonDocument = null;
	let foreignPersonDocumentCountry = null;
	let foreignPersonPhone = null;

	let email = $(checkoutcustomer.emailInput).val();
	let newsletter = $(".customer-form input[name='newsletter']").is(':checked');
	let subscribeWhatsApp = $(".customer-form input[name='subscribeWhatsApp']").is(':checked');

	if ($(personTab).hasClass('active')) {
		personName = $(".customer-form input[name='personName']").val();
		personLastname = $(".customer-form input[name='personLastname']").val();
		personCpf = $(".customer-form input[name='personCpf']").val();
		phone = $(".customer-form input[name='personPhone']").val();
	} else if ($(companyTab).hasClass('active')) {
		companyName = $(".customer-form input[name='companyName']").val();
		companyCnpj = $(".customer-form input[name='companyCnpj']").val();
		companyIe = $(".customer-form input[name='companyIe']").val();
		companyIeExempt = $(".customer-form input[name='companyIeExempt']").is(':checked') ? '1' : '0';
		phone = $(".customer-form input[name='companyPhone']").val();
	} else {
		foreignPersonName = $(".customer-form input[name='foreignPersonName']").val();
		foreignPersonLastName = $(".customer-form input[name='foreignPersonLastname']").val();
		foreignPersonDocument = $(".customer-form input[name='foreignPersonDoc']").val();
		foreignPersonDocumentCountry = $(".customer-form select[name='pais']").val();
		foreignPersonPhone = $(".customer-form input[name='foreignPersonPhone']").val();
	}

	let customFields = [];
	$('input[name^="custom"]').each(function(){
		customFields.push({index: $(this).attr('indice'), value: $(this).val()});
	});

	customer.customFields = customFields;

	customer.email = email;
	customer.personName = personName;
	customer.personLastname = personLastname;
	customer.personCpf = personCpf;
	customer.companyName = companyName;
	customer.companyCnpj = companyCnpj;
	customer.companyIe = companyIe;
	customer.companyIeExempt = companyIeExempt;
	customer.phone = phone;
	customer.newsletter = newsletter;
	customer.subscribeWhatsApp = subscribeWhatsApp;
	customer.foreignPersonName = foreignPersonName;
	customer.foreignPersonLastName = foreignPersonLastName;
	customer.foreignPersonDocument = foreignPersonDocument;
	customer.foreignPersonDocumentCountry = foreignPersonDocumentCountry;
	customer.foreignPersonPhone = foreignPersonPhone;
	customer.fantasyName = $(".customer-form input[name='fantasyName']").val();
	customer.municipalityInscription = $(".customer-form input[name='municipalityInscription']").val();
	customer.rg = $(".customer-form input[name='rg']").val();
	customer.birthDate = $(".customer-form input[name='birthDate']").val();
	customer.gender = $(".customer-form select[name='gender']").val()
	customer.cellPhone = $(".customer-form input[name='cellPhone']").val();
	customer.origin = $(".customer-form select[name='origin']").val();
	customer.purchaseType = $(".customer-form input[name='purchaseType']").val();

	return customer;
}

// Cadastra o cliente 
checkoutcustomer.registerCustomer = function() {
	var selectorSubmit = "#register-customer";
	var event = "click";

	$(document).on(event, selectorSubmit, function(e) {
		if (!checkoutcustomer.areTermsOfUseAgreed()) {
			e.preventDefault();
			ajaxutils.showAlertModal('', "É necessário aceitar os termos de uso para efetuar o cadastro", "Informa&#231;&#227;o");
			return;
		}

		var validCustomer = validator.isCustomerValid();
		if (validCustomer == false) {
			ajaxutils.showAlertModal("", "Precisamos de algumas informa&ccedil;&otilde;es para realizar o seu cadastro : <br>" + validator.customerErrorMsg, "N&#227;o conseguimos realizar seu cadastro :(");
			return;
		}
		var customer = checkoutcustomer.createCustomerObject();

		var phone = customer.phone ? customer.phone : customer.foreignPersonPhone;
		var celphone = phone.replace(/\D/g, '').length == 11 ? phone : '';

		var data = { 
			act: "cadastrar", 
			login: true,
			email: customer.email,
			origem: customer.origin,
			razao: customer.companyName,
			cnpj: customer.companyCnpj,
			ie: customer.companyIe,
			isento: customer.companyIeExempt,
			nome: customer.personName ? customer.personName : customer.foreignPersonName,
			sobrenome: customer.personLastname ? customer.personLastname : customer.foreignPersonLastName,
			cpf: customer.personCpf,
			telefone: phone,
			celular: celphone,
			receberNews: customer.newsletter,
			receberWhatsApp: customer.subscribeWhatsApp,
			documentoEstrangeiro: customer.foreignPersonDocument,
			documentoEstrangeiroPais: customer.foreignPersonDocumentCountry,
			fantasia: customer.fantasyName,
			im: customer.municipalityInscription,
			rg: customer.rg,
			dataNasc: customer.birthDate,
			sexo: customer.gender,
			celular: customer.cellPhone,
			origem: customer.origin,
			tipoCompra: customer.purchaseType,
			custom: customer.customFields
		};

		loading.show(personalSelector);
		checkoutSetup.registerCustomer(data, 'checkoutcustomer.handleCustomerRegister');
	});
}

// Verifica se não houve erros no cadastro, caso positivo carrega os dados do cliente
checkoutcustomer.handleCustomerRegister = function(customer) {
	loading.hide();
	if (('error' in customer && customer.error) || ('data' in customer.data && customer.data.data == false)) {
		if (customer.message) {
			ajaxutils.showAlertModal("", "N&#227;o conseguimos realizar seu cadastro :( <br>" + customer.message, "Ops! Algo deu errado" );
			return;
		}

		ajaxutils.showAlertModal("", "N&#227;o conseguimos realizar seu cadastro :(", "Ops! Algo deu errado");
		return;
	}

	$(document).trigger('checkout.customer.registered');
	checkout.loginEvent('cadastro');
	checkoutcustomer.registerTracker();
	checkoutcustomer.getCustomerData();
}

// Logout
checkoutcustomer.logout = function() {
	var selector = ".logout-button";
	var event = "click";

	$(document).on(event, selector, function(e) {
		var data = { 
			act: "logout"
		};
		loading.show();
		ajax.enqueue(ajax.POST, ajaxLogin, data, 'checkoutcustomer.handleLogout');
	});
}

// Verifica o logout, caso não haja erros recarrega a pagina 
checkoutcustomer.handleLogout = function(logout) {
	loading.hide();
	if (logout.data.data == true) {
		checkout.loginEvent('logout');

		location.reload(); 
	}
}

// Cria o evento do botão de editar cliente
checkoutcustomer.initializeCustomerEdit = function() {
	var selector = ".edit-button";
	var event = "click";

	if (checkoutcustomer.blockChangeCnpj) {
		return;
	}

	$(document).on(event, selector, function(e) {
		var callback = 'checkoutcustomer.enableEditByLoginType';
		checkoutcustomer.verifyCustomerGuest(callback);
	});
}

checkoutcustomer.verifyCustomerGuest = function(callback) {
	callback = callback ||'checkoutcustomer.enableEditByLoginType';
	var data = { 
		act: "verificarlogadoguest"
	};

	loading.show(personalSelector);
	/**
	 * Always remember to use 'loading.hide()' on the callback function
	 */
	checkoutSetup.ajaxCheckoutCache(ajax.POST, ajaxLogin, data, callback);
}


// Logica para edição de dados do cliente com base no tipo de login
checkoutcustomer.enableEditByLoginType = function(loginType) {
	loading.hide();
	if (loginType.data.data == true) {
		var loginTitle = '';
		var loginHeader = '';
		var closeButton = true;
		var backdrop = false;
		var showRegister = false;

		if (missingDocument) {
			loginTitle = '<small>Fa&ccedil;a login ou crie um token de acesso abaixo, para terminar seu cadastro.</small>';
			loginHeader = '<i class="fa fa-sign-in"></i>Ops! Seu cadastro est&aacute; incompleto!';
			closeButton = false;
			backdrop = true;
		}

		checkoutcustomer.showModalLogin(loginTitle, loginHeader, closeButton, backdrop, showRegister);
		return;
	}
	// Caso o cliente não esteja logado como guest os campos são habilitados para edição
	checkoutcustomer.enableEditForm(missingDocument);
}

checkoutcustomer.enableEditForm = function(missingDocument) {
	var editButton = "#edit-customer";
	var registerButton = "#register-customer";
	var termsOfUseDiv = "#terms-of-use-div";

	checkoutcustomer.showPersonalValidating()
	checkoutcustomer.showEmailValidating();
	checkoutcustomer.hideEmailValidatingButton();
	checkoutcustomer.hidePersonalValidated();
	checkoutcustomer.fillCustomerData();

	$(".validating-email input[name='email']").prop("disabled", true);
	$(".validating-email-password input[name='email']").prop("disabled", true);
	$(".validating-password-email input[name='password']").prop("disabled", true);

	if (missingDocument == false) {
		checkoutcustomer.disbledFieldsOnEdit();
	}

	$(termsOfUseDiv).addClass("d-none");
	$(registerButton).addClass("d-none");
	$(editButton).removeClass("d-none");

	enableEdit = true;
	checkout.stepEvent(1, 'login');

	address.hideAddressValidating();
	address.hideAddressValidated();
}

// Preenche o formulario do cliente de acordo com seus dados
checkoutcustomer.fillCustomerData = function() {
	var personTab = "#fisica-tab";
	var companyTab = "#juridica-tab";
	var personType = window.checkoutPersonType.personType;

	if (!customerLoadedData) {
		customerLoadedData = checkoutcustomer.getCustomerStructureForTemplate();
	} else {
		$(checkoutcustomer.emailInput).val(customerLoadedData.customer.email);
		$(checkoutcustomer.emailPasswordInput).val(customerLoadedData.customer.email);
	}

	var tpl = template.getTemplate('cliente/checkoutclientecadastro', customerLoadedData);
	$(".customer-form-content").html(tpl);

	if (personType == 2) {
		$(personTab).parent(".nav-item").removeClass("d-none");
		$(companyTab).parent(".nav-item").addClass("d-none");
		$(personTab).click();
	} else if (personType == 3) {
		$(personTab).parent(".nav-item").addClass("d-none");
		$(companyTab).parent(".nav-item").removeClass("d-none");
		$(companyTab).click();
	}

	if (customerLoadedData.customer.cpf != null && customerLoadedData.customer.cpf.length > 0) {
		$(personTab).tab("show");
		$(companyTab).addClass("d-none");
	} else if (customerLoadedData.customer.cnpj != null && customerLoadedData.customer.cnpj.length > 0) {
		$(companyTab).tab("show");
		$(personTab).addClass("d-none");
	}

	masks.loadMasks();
	checkoutcustomer.subscribeWhatsAppPhoneListener();
}

// Edita cliente 
checkoutcustomer.editCustomer = function() {
	var selectorSubmit = "#edit-customer";
	var event = "click";

	$(document).on(event, selectorSubmit, function(e) {
		var validCustomer = validator.isCustomerValid();
		if (validCustomer == false) {
			ajaxutils.showAlertModal("", "Precisamos de algumas informa&ccedil;&otilde;es para editar seu cadastro <br>" + validator.customerErrorMsg, "N&#227;o conseguimos editar seu cadastro :(");
			return;
		}

		var customer = checkoutcustomer.createCustomerObject();

		var phone = customer.phone ? customer.phone : customer.foreignPersonPhone;
		var celphone = phone.replace(/\D/g, '').length == 11 ? phone : '';

		//TO DO Alterar origem
		var data = { 
			act: "alterar",
			origem: 12,
			email: customer.email,
			razao: customer.companyName,
			cnpj: customer.companyCnpj,
			ie: customer.companyIe,
			isento: customer.companyIeExempt,
			nome: customer.personName ? customer.personName : customer.foreignPersonName,
			sobrenome: customer.personLastname ? customer.personLastname : customer.foreignPersonLastName,
			cpf: customer.personCpf,
			documentoEstrangeiro: customer.foreignPersonDocument,
			telefone: phone,
			celular: celphone,
			dataNasc: null,
			documentoEstrangeiroPais: customer.foreignPersonDocumentCountry,
			nomeFantasia: customer.fantasyName,
			im: customer.municipalityInscription,
			rg: customer.rg,
			dataNasc: customer.birthDate,
			genero: customer.gender,
			celular: customer.cellPhone,
			origem: customer.origin,
			tipoCompra: customer.purchaseType,
			custom: customer.customFields
		};

		loading.show(personalSelector);
		ajax.enqueue(ajax.POST, ajaxCustomer, data, 'checkoutcustomer.handleCustomerRegister');

		$(document).trigger('checkout.customer.data.edited', [customer]);
	});
}

checkoutcustomer.areTermsOfUseAgreed = function() {
	if (!$("#checktermosdeuso").is(":visible")) {
		return true;
	}

	return $("#checktermosdeuso").is(":checked");
}

// Define o nome do cliente a ser exibido 
checkoutcustomer.defineCustomerName = function(customerData) {
	var customerName = 'Cliente';

	if (!helper.isEmpty(customerData.nome)) {
		customerName = customerData.nome + " " + customerData.sobrenome;
	} else if (!helper.isEmpty(customerData.fantasia)) {
		customerName = customerData.fantasia;
	} else if (!helper.isEmpty(customerData.razao)) {
		customerName = customerData.razao;
	}

	return customerName;
}

checkoutcustomer.hidePersonalValidating = function() {
	$(personalValidating).addClass("d-none");
}

checkoutcustomer.showPersonalValidating = function() {
	$(personalValidating).removeClass("d-none");
}

checkoutcustomer.hidePersonalValidated = function() {
	$(personalValidated).addClass("d-none");
}

checkoutcustomer.showPersonalValidated = function() {
	$(personalValidated).removeClass("d-none");
}

checkoutcustomer.hideEmailValidating = function() {
	$(emailValidating).addClass("d-none");
	$(emailPasswordValidating).addClass("d-none");
	$(passwordEmailValidating).addClass("d-none");
}

checkoutcustomer.showEmailValidating = function() {
	$(emailValidating).removeClass("d-none");
	$(emailPasswordValidating).removeClass("d-none");
}

checkoutcustomer.hideAccessValidating = function() {
	$(accessValidating).addClass("d-none");
}

checkoutcustomer.showAccessValidating = function() {
	$(accessValidating).removeClass("d-none");
}

checkoutcustomer.hideEmailValidatingButton = function() {
	var button =  emailValidating + " button";
	$(button).addClass("d-none");

	var buttonPassword =  emailPasswordValidating + " button";
	$(buttonPassword).addClass("d-none");

	var buttonRegister =  emailPasswordValidating + " span";
	$(buttonRegister).addClass("d-none");
}

checkoutcustomer.disbledFieldsOnEdit = function() {
	$(".validating-email input[name='email']").prop("disabled", true);
	$(".customer-form input[name='personCpf']").prop("disabled", true);
	$(".customer-form input[name='companyCnpj']").prop('disabled', true);
	$(".customer-form input[name='companyIe']").prop('disabled', true);
	$(".customer-form input[name='companyIeExempt']").prop('disabled', true);
}

checkoutcustomer.showModalLogin = function(loginTitle, loginHeader, closeButton, backdrop, showRegister) {
	loginTitle = loginTitle || null;
	loginHeader = loginHeader || 'Fa&#231;a seu acesso';
	closeButton = (typeof closeButton !== 'undefined') ? closeButton : true;
	backdrop = (typeof backdrop !== 'undefined') ? backdrop : true;
	showRegister = (typeof showRegister !== 'undefined') ? showRegister : true;

	$('.modal-dialog').parent().remove();
	$('.modal').remove();
	$('[class^="modal"].fade').remove();
	$('body').removeClass("modal-open");

	var data = {
		showRegister: showRegister
	};
	var modalLoginTemplate = template.getTemplate('cliente/checkoutmodallogin', data);
	ajaxutils.showAlertModal(loginTitle, modalLoginTemplate, loginHeader, backdrop, closeButton);
}

checkoutcustomer.showNeedLogin = function() {
	var header = 'Aten&ccedil;&atilde;o!';
	var title = 'Acesso não permitido';
	var message = 'Para prosseguir com acesso, por favor, fa&#231;a o login na sua conta.';

	$('.modal-dialog').parent().remove();
	$('.modal').remove();
	$('[class^="modal"].fade').remove();
	$('body').removeClass("modal-open");

	ajaxutils.showAlertModal(title, message, header, null, true);	
}

checkoutcustomer.handleLogin = function(response) {
	checkoutcustomer.resetWarningContainers();

	if (response.error === true) {
		errorMessages = response.message;

		if (errorMessages.failedLoginMessage) {
			$(errorLabelSelector).html(errorMessages.failedLoginMessage);
			$(errorLabelContainerSelector).removeClass("hidden");
		}
		
		if (errorMessages.securityLoginMessage) {
			$(securityErrorLabelSelector).html(errorMessages.securityLoginMessage);
			$(securityErrorLabelContainerSelector).removeClass("hidden");
		}

		return;
	}

	var data = response.data.data;

	checkoutcustomer.handleLoginResponse(data);
}

checkoutcustomer.handleLoginResponse = function(data) {
	if (data === true) {
		helper.closeModal();

		if (!window.isCacheable) {
			location.reload();
			return;
		} else {
			$(document).trigger("ajaxcache.needupdate");
		}
	}

	if (data.redirect) {
		helper.redirect(data.redirect);
	}
}

checkoutcustomer.handleAccesKey = function(response) {
	if (response.error === true) {
		$(errorLabelSelector).html('Oops, email n&#227;o est&#225; cadastrado');
		$(errorLabelContainerSelector).removeClass("hidden");
		return;
	}

	if (response.data.data == true) {
		// Go to step4
		$('[data-stage-command=\'4\']').trigger('click');
		$(okLabelSelector).html('Em alguns minutos chegar&#225; em seu email o token de acesso');
		return;
	}
}

checkoutcustomer.handleLoginToken = function(response) {
	checkoutcustomer.resetWarningContainers();

	if (response.error === true) {
		errorMessages = response.message;

		if (errorMessages.failedLoginMessage) {
			$(errorLabelSelector).html(errorMessages.failedLoginMessage);
			$(errorLabelContainerSelector).removeClass("hidden");
		}
		
		if (errorMessages.securityLoginMessage) {
			$(securityErrorLabelSelector).html(errorMessages.securityLoginMessage);
			$(securityErrorLabelContainerSelector).removeClass("hidden");
		}

		if (errorMessages.emailtokenlogin) {
			$(errorLabelSelector).html(errorMessages.emailtokenlogin);
			$(errorLabelContainerSelector).removeClass("hidden");
		}

		return;
	}

	var data = response.data.data;

	checkoutcustomer.handleLoginResponse(data);
}

checkoutcustomer.showCensoredEmailInEmailContainer = function(emailCensurado) {
	const emailContainer = $('#email-container');

	if (emailContainer.length) {
		emailContainer.text(emailCensurado);
	}
}

checkoutcustomer.handlePasswordToken = function(response) {
	if (response.error === true) {
		$(errorLabelSelector).html(response.message);
		$(errorLabelContainerSelector).removeClass("hidden");
		return;
	}

	if (response.data.data.success == true) {
		checkoutcustomer.showCensoredEmailInEmailContainer(response.data.data.emailCensurado);
		helper.inputValueCopy();
		$('[data-stage-command=\'6\']').trigger('click');
		return;
	}
}

checkoutcustomer.handlePasswordChange = function(response) {
	checkoutcustomer.resetWarningContainers();

	if (response.error == true) {
		errorMessages = response.message;

		if (errorMessages.failedLoginMessage) {
			$(errorLabelSelector).html(errorMessages.failedLoginMessage);
			$(errorLabelContainerSelector).removeClass("hidden");
		}
		
		if (errorMessages.securityLoginMessage) {
			$(securityErrorLabelSelector).html(errorMessages.securityLoginMessage);
			$(securityErrorLabelContainerSelector).removeClass("hidden");
		}

		checkoutcustomer.showCensoredEmailInEmailContainer(response.data.data.emailCensurado);

		return;
	}

	var data = response.data.data;

	checkoutcustomer.handleLoginResponse(data);
}

checkoutcustomer.handleOauthLogin = function(response) {
	helper.closeModal();
	if (response.error) {
		errorMessages = response.message;

		if (errorMessages.securityLoginMessage) {
			ajaxutils.showModal("", "N&#227;o foi poss&#237;vel realizar o acesso", errorMessages.securityLoginMessage);
		} else {
			ajaxutils.showModal("N&#227;o foi poss&#237;vel realizar o acesso", errorMessages);
		}

		return;
	}

	if (!response.data || !response.data.data) {
		console.log('sem retorno');
		return;
	}

	if (response.data.data.redirect) {
		location.href = response.data.data.url;
		return;
	}

	window.localStorage.setItem("needUpdate", true);
	location.reload();
}

// Envia eventos de início de cadastro
checkoutcustomer.leadTracker = function() {
	if (typeof fbq !== 'undefined') {
		fbq('track', 'Lead');
	}
}

// Envia eventos de confirmação de cadastro
checkoutcustomer.registerTracker = function() {
	if (typeof fbq !== 'undefined') {
		fbq('track', 'CompleteRegistration', {currency: 'BRL', value: checkout.order.total});
	}
}

checkoutcustomer.socialNetworksLoginListener = function() {
	$(document).ready(function() {
		if ($('.g_id_signin').length > 0) {
			$('.social-login').addClass('row');
			return;
		}

		$('.fb-login-button').removeClass('col-sm-6').addClass('col-12');
		$('.google-login-button').addClass('hide');
	});
}

checkoutcustomer.subscribeWhatsAppPhoneListener = function() {
	var phones = $('.customer-form .phone');

	phones.each(function() {
		$(this).on('keyup', function(e) {
			var subscribeWhatsApp = $('[subscribe-whatsApp]');
			var subscribeWhatsAppCheckBox = $(".customer-form input[name='subscribeWhatsApp']");

			var phone = $(this).val();
			phone = phone.replace(/\D/g, '');

			if (phone.length == 11) {
				if (subscribeWhatsApp.hasClass('d-none')) {
					subscribeWhatsApp.removeClass('d-none');
				}

				if (!subscribeWhatsAppCheckBox.is(':checked')) {
					$(".customer-form input[name='subscribeWhatsApp']").click();
				}
			} else {
				if (!subscribeWhatsApp.hasClass('d-none')) {
					subscribeWhatsApp.addClass('d-none');
				}

				if (subscribeWhatsAppCheckBox.is(':checked')) {
					$(".customer-form input[name='subscribeWhatsApp']").click();
				}
			}
		});
	});
}

checkoutcustomer.resetWarningContainers = function() {
	$(errorLabelSelector).html('');
	$(errorLabelContainerSelector).addClass("hidden");
	$(securityErrorLabelSelector).html('');
	$(securityErrorLabelContainerSelector).addClass("hidden");
}

$(function(){
	checkoutcustomer.changeEmailEvent();
	checkoutcustomer.registerCustomer();
	checkoutcustomer.editCustomer();
	checkoutcustomer.socialNetworksLoginListener();
});