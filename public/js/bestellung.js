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
        amount: 0,
        name: null,
        email: null,
        address_street: null,
        address_street_no: null,
        address_code: null,
        address_city: null,
        sf_member: null,
        msg: null,
        is_reseller: false,
        agrees_agbs: false,
        agrees_data_privacy: false,
        payment: "banktransfer",
        reg: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
    },
    methods: {        
        validateInput() {
            if (this.amnt <= 0) {
                window.alert("Na, wenigstens einen Kalender sollten Sie schon bestellen wollen!")
                return false
            }
            if (!this.agrees_agbs) {
                window.alert("Sie müssen den AGBs zustimmen, um fortzufahren.")
                return false
            }
            if (!this.agrees_data_privacy) {
                window.alert("Sie müssen der Datenschutzerklärung zustimmen, um fortzufahren.")
                return false
            }
            if (!this.reg.test(this.email)) {
                window.alert("Die Emailadresse ist nicht gültig!")
                return false
            }
            return true
        },
        orderButtonClicked() {
            if (!this.validateInput()) {
                return
            }
            window.alert("all good")
            // $("#order-form").addClass('hide')
            // $("#loader-container").removeClass('hide')
            // $("#order-title").text("Übermittle Bestellung...")
            // axios({
            //     method: 'post',
            //     url: 'https://calendariumculinarium.de/api/orders',
            //     headers: {
            //         'Content-Type': 'application/json; charset=utf-8'
            //     },
            //     data: {
            //         "product_id": 1,
            //         "amount": parseInt(this.amnt),
            //         "name": this.name, 
            //         "email": this.email, 
            //         "address_street": this.address_street, 
            //         "address_code": this.address_code, 
            //         "address_city": this.address_city, 
            //         "slow_food_member": this.sf_member, 
            //         "message": this.msg
            //     }
            // }).then(function (response) {
            //     // handle success
            //     $("#loader").addClass('hide')
            //     $("#server-response").text(response.data)
            //     $("#problem-button").addClass('hide')
            // })
            // .catch(function (error) {
            //     // handle error
            //     $("#order-title").text("Fehler! :(")
            //     $("#loader").addClass('hide')
            //     $("#server-response").text("Entschuldigen Sie! Das passiert, wenn man alles selber baut... könnten Sie bitte diesen Fehler melden, und dabei die Fehlermeldung und eine möglichst genaue Beschreibung, welche Schritte zu diesem Fehler geführt haben beifügen? Vielen Dank!")
            //     $("#server-response-2").text(error)
            //     $("#server-response-3").text(error.response.data)
            //     $("#server-response-4").text("(falls selbst der Button nicht möchte: schicken Sie bitte eine Mail an diesdas(at)calendariumculinarium.de! Danke!")
            //     var email_body = "Guten Tag,%0D%0A%0D%0Ameine Bestellung konnte leider nicht aufgegeben werden.%0D%0A%0D%0AFehlercode: " + error + "%0D%0A Fehlermeldung: " + error.response.data + "%0D%0A%0D%0AMein Vorgehen: "
            //     $("#problem-button").attr("href", "mailto:diesdas@calendariumculinarium.de?subject=Fehler%20bei%20einer%20Kalenderbestellung&body=" + email_body)
            // })
        },
        backButtonClicked() {
            window.location.href = "/bestellen" + window.location.search
        },
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
        this.amount = parseInt(getUrlParameter('amount'))
        this.name = getUrlParameter('name').replace(/\+/g, ' ')        
        this.email = getUrlParameter('email')
        this.payment = getUrlParameter('payment')
        $("#payment-banktransfer").prop('checked', this.payment != "paypal")
        $("#payment-paypal").prop('checked', this.payment == "paypal")
        this.address_street = getUrlParameter('address_street').replace(/\+/g, ' ')
        this.address_street_no = getUrlParameter('address_street_no').replace(/\+/g, ' ')
        this.address_code = getUrlParameter('address_code')
        this.address_city = getUrlParameter('address_city').replace(/\+/g, ' ')        
        this.sf_member = getUrlParameter('slow_food_member') == 'on' ? true : false
        this.is_reseller = getUrlParameter('is_reseller') == 'on' ? true : false
        this.msg = getUrlParameter('message').replace(/\+/g, ' ')        
        $("#slow-food-member-check").prop('checked', this.sf_member)
        $("#reseller-check").prop('checked', this.is_reseller)        
    }
})