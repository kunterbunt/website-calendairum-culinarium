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
        firstname_delivery: null,
        lastname_delivery: null,
        email: null,
        address_street_delivery: null,
        address_street_no_delivery: null,
        address_code_delivery: null,
        address_city_delivery: null,
        address_country_delivery: null,
        different_invoice_address: null,
        firstname_invoice: null,
        lastname_invoice: null,
        address_street_invoice: null,
        address_street_no_invoice: null,
        address_code_invoice: null,
        address_city_invoice: null,
        address_country_invoice: null,        
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
        reg_email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/,
        reg_plz_de: /^\d{5}$/,
        reg_plz_at: /^\d{4}$/,

    },
    methods: {        
        validateInput() {
            if (this.amnt <= 0) {
                window.alert("Na, wenigstens einen Kalender solltest Du schon bestellen wollen!")
                return false
            }
            if (!this.reg_plz_de.test(this.address_code_delivery) && !this.reg_plz_at.test(this.address_code_delivery)) {
                window.alert("Die Postleitzahl ist nicht gültig (Lieferadresse)!")
                return false
            }
            if (this.different_invoice_address) {
                if (!this.reg_plz_de.test(this.address_code_invoice) && !this.reg_plz_at.test(this.address_code_invoice)) {
                    window.alert("Die Postleitzahl ist nicht gültig (Rechnungsadresse)!")
                    return false
                }
            }
            if (!this.reg_email.test(this.email)) {
                window.alert("Die Emailadresse ist nicht gültig!")
                return false
            }
            if (!this.agrees_agbs) {
                window.alert("Du musst den AGB zustimmen, um fortzufahren.")
                return false
            }
            if (!this.agrees_data_privacy) {
                window.alert("Du musst der Datenschutzerklärung zustimmen, um fortzufahren.")
                return false
            }            
            return true
        },
        orderButtonClicked() {
            if (!this.validateInput()) {
                return
            }                        
            $("#order-form").addClass('hide')
            $("#loader-container").removeClass('hide')
            $("#order-title").text("Übermittle Bestellung...")
            axios({
                method: 'post',                
                url: 'https://calendariumculinarium.de/api/orders',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "product_id": 1,
                    "amount": parseInt(this.amount),
                    "first_name_invoice": this.different_invoice_address ? this.firstname_invoice : this.firstname_delivery,     
                    "last_name_invoice": this.different_invoice_address ? this.lastname_invoice : this.lastname_delivery,
                    "first_name_delivery": this.firstname_delivery,
                    "last_name_delivery": this.lastname_delivery,
                    "email": this.email, 
                    "address_street_invoice": this.different_invoice_address ? this.address_street_invoice : this.address_street_delivery,
                    "address_street_no_invoice": this.different_invoice_address ? this.address_street_no_invoice : this.address_street_no_delivery,
                    "address_code_invoice": this.different_invoice_address ? this.address_code_invoice : this.address_code_delivery, 
                    "address_city_invoice": this.different_invoice_address ? this.address_city_invoice : this.address_city_delivery,                     
                    "address_country_invoice": this.different_invoice_address ? this.address_country_invoice : this.address_country_delivery, 
                    "address_street_delivery": this.address_street_delivery,
                    "address_street_no_delivery": this.address_street_no_delivery,
                    "address_code_delivery": this.address_code_delivery, 
                    "address_city_delivery": this.address_city_delivery, 
                    "address_country_delivery": this.address_country_delivery, 
                    "payment": this.payment,
                    "is_reseller": this.is_reseller, 
                    "slow_food_member": this.sf_member, 
                    "message": this.msg,
                    "agrees_agb": this.agrees_agbs, 
                    "agrees_data_privacy": this.agrees_data_privacy
                }
            }).then(function (response) {
                // handle success
                $("#loader").addClass('hide')
                $("#server-response").text(response.data)
                $("#problem-button").addClass('hide')
            })
            .catch(function (error) {
                // handle error
                $("#order-title").text("Fehler! :(")
                $("#loader").addClass('hide')
                $("#server-response").text("Entschuldigen Sie! Das passiert, wenn man alles selber baut... könnten Sie bitte diesen Fehler melden, und dabei die Fehlermeldung und eine möglichst genaue Beschreibung, welche Schritte zu diesem Fehler geführt haben beifügen? Vielen Dank!")
                $("#server-response-2").text(error)
                $("#server-response-3").text(error.response.data)
                $("#server-response-4").text("(falls selbst der Button nicht möchte: schicken Sie bitte eine Mail an hallo(at)calendariumculinarium.de! Danke!")
                var email_body = "Guten Tag,%0D%0A%0D%0Ameine Bestellung konnte leider nicht aufgegeben werden.%0D%0A%0D%0AFehlercode: " + error + "%0D%0A Fehlermeldung: " + error.response.data + "%0D%0A%0D%0AMein Vorgehen: "
                $("#problem-button").attr("href", "mailto:hallo@calendariumculinarium.de?subject=Fehler%20bei%20einer%20Kalenderbestellung&body=" + email_body)
            })
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
        amnt = parseInt(getUrlParameter('amount'))
        this.amount = isNaN(amnt) ? 1 : amnt
        console.log(this.amount)
        this.firstname_delivery = getUrlParameter('firstname_delivery').replace(/\+/g, ' ')        
        this.lastname_delivery = getUrlParameter('lastname_delivery').replace(/\+/g, ' ')                
        this.firstname_invoice = getUrlParameter('firstname_invoice').replace(/\+/g, ' ')        
        this.lastname_invoice = getUrlParameter('lastname_invoice').replace(/\+/g, ' ')                
        this.email = getUrlParameter('email')
        this.payment = getUrlParameter('payment')
        $("#payment-banktransfer").prop('checked', this.payment != "paypal")
        $("#payment-paypal").prop('checked', this.payment == "paypal")
        this.address_street_delivery = getUrlParameter('address_street_delivery').replace(/\+/g, ' ')
        this.address_street_no_delivery = getUrlParameter('address_street_no_delivery').replace(/\+/g, ' ')
        this.address_code_delivery = getUrlParameter('address_code_delivery')
        this.address_city_delivery = getUrlParameter('address_city_delivery').replace(/\+/g, ' ')        
        country_delivery = getUrlParameter('address_country_delivery').replace(/\+/g, ' ')        
        this.address_country_delivery = country_delivery == "" ? "Deutschland" : country_delivery        
        this.different_invoice_address = (getUrlParameter('different_invoice_address') == 'checked' || getUrlParameter('different_invoice_address') == 'on' || getUrlParameter('different_invoice_address') == 'true') ? true : false        
        $("#different-invoice-check").prop('checked', this.different_invoice_address)
        if (this.different_invoice_address) {
            $("#invoice-fields").collapse()
        }
        this.address_street_invoice = getUrlParameter('address_street_invoice').replace(/\+/g, ' ')
        this.address_street_no_invoice = getUrlParameter('address_street_no_invoice').replace(/\+/g, ' ')
        this.address_code_invoice = getUrlParameter('address_code_invoice')
        this.address_city_invoice = getUrlParameter('address_city_invoice').replace(/\+/g, ' ')        
        country_invoice = getUrlParameter('address_country_invoice').replace(/\+/g, ' ')
        this.address_country_invoice = country_invoice == "" ? "Deutschland" : country_invoice
        this.sf_member = (getUrlParameter('slow_food_member') == 'checked' || getUrlParameter('slow_food_member') == 'on') ? true : false
        this.is_reseller = (getUrlParameter('is_reseller') == 'checked' || getUrlParameter('is_reseller') == 'on') ? true : false
        this.msg = getUrlParameter('message').replace(/\+/g, ' ')        
        $("#slow-food-member-check").prop('checked', this.sf_member)
        $("#reseller-check").prop('checked', this.is_reseller)        
    }
})