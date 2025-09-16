if (typeof whatsappButtonService == "undefined") {
    whatsappButtonService = [];
    whatsappButtonService.useDefaultButton = true;
}

whatsappButtonService.getWhatsappButton = () => {
    if (typeof WhWidgetSendButton == "undefined") {
        whatsappButtonService.useDefaultButton = false;
    } else {
        whatsappButtonService.useDefaultButton = true;
        return;
    }

    const whatsappInput = document.querySelector(".whatsappbuttonnumber").value;
    let position = document.querySelector(".whatsappbuttonposition").value;

    if (whatsappInput) {
        position = position == 's' ? 'left' : 'right';

        const [whatsappNumber, message] = whatsappInput.split(';').map(item => item.trim());
        const onlyWhatsappNumber = whatsappNumber.replace(/[^0-9]/g, '');
        const whatsappMessage = message ? encodeURIComponent(message) : '';

        const linkWhatsapp = document.createElement('a');

        if (onlyWhatsappNumber.startsWith("55")) {
            linkWhatsapp.href = 'https://wa.me/' + onlyWhatsappNumber + (whatsappMessage ? `?text=${whatsappMessage}` : '');
        } else {
            linkWhatsapp.href = 'https://wa.me/55' + onlyWhatsappNumber + (whatsappMessage ? `?text=${whatsappMessage}` : '');
        }

        linkWhatsapp.target = '_blank';
        linkWhatsapp.id = "whatsappBtnFloating";
        linkWhatsapp.className = "whatsapp-btn-floating";
        linkWhatsapp.ariaLabel = "Ir para o Whatsapp";

        const iconeWhatsapp = document.createElement('i');
        iconeWhatsapp.id = 'whatsappBtnIcon';
        iconeWhatsapp.className = 'fa fa-whatsapp whatsapp-icon';
        iconeWhatsapp.ariaHidden = 'true';

        linkWhatsapp.appendChild(iconeWhatsapp);
        document.body.appendChild(linkWhatsapp);

        document.querySelector('.whatsapp-btn-floating').style[position] = '22px';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (!whatsappButtonService.useDefaultButton) {
        return;
    }

    if (typeof lazyLoadService == 'undefined') {
        whatsappButtonService.getWhatsappButton();
    } else {
        lazyLoadService.addFunctionToQueue(whatsappButtonService.getWhatsappButton);
    }
});