var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return ""
};

var app = new Vue({
    el: '#order',
    delimiters: ['[[', ']]'],
    data: {
        price: 20,
        amount: 0
    },
    methods: {
        computeCurrentPrice() {
            var discount = 0
            if (this.amount < 3) {
                discount = 0
            } else if (this.amount < 5) {
                discount = .1
            } else if (this.amount < 50) {
                discount = 0.15
            } else {
                discount = 0.2
            }
            var price_before_discount = this.amount * this.price
            var price_after_discount = price_before_discount * (1-discount)
            if (isNaN(price_after_discount)) {
                return "Bitte Menge auswählen!"
            } else {
                return price_after_discount + (discount > 0 ? " (" + (discount*100) + "% Rabatt!)" : "")
            }
        }
    },
    mounted() {
        amnt = parseInt(getUrlParameter('amount'))
        this.amount = isNaN(amnt) ? 1 : amnt        
        $("#form-amount").val(this.amount)
        $("#form-name").val(getUrlParameter('name'))
        $("#form-email").val(getUrlParameter('email'))        
        $("#payment-banktransfer").prop('checked', getUrlParameter('payment') != "paypal")
        $("#payment-paypal").prop('checked', getUrlParameter('payment') == "paypal")
        $("#form-address-street").val(getUrlParameter('address_street'))
        $("#form-address-street-no").val(getUrlParameter('address_street_no'))
        $("#form-address-code").val(getUrlParameter('address_code'))
        $("#form-address-city").val(getUrlParameter('address_city'))
        $("#slow-food-member-check").prop('checked', getUrlParameter('slow_food_member') == 'on' ? true : false)
        $("#reseller-check").prop('checked', getUrlParameter('is_reseller') == 'on' ? true : false)        
        $("#form-additional").val(getUrlParameter('message').replace(/\+/g, ' '))
    }
});