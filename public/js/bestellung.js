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

supported_countries = ["Deutschland", "Österreich", "Niederlande", "Schweiz", "Frankfreich"]

var setCountryCode = function setCountryCode(country_name) {
    if (country_name == "Deutschland")
        return "DE"
    else if (country_name == "Österreich")
        return "AT"
    else if (country_name == "Niederlande")
        return "NL"
    else if (country_name == "Schweiz")
        return "CH"
    else if (country_name == "Frankreich" || country_name == "France")
        return "FR"            
    else 
        return "UNKNOWN"
}

var TOTAL
var ORDER_ID
var STREET
var CITY
var CODE
var COUNTRY
var FULL_NAME
var COMPANY

var app = new Vue({
    el: '#order',
    delimiters: ['[[', ']]'],    
    data: {        
        price: 20,
        amount: 0,
        company_delivery: null,
        firstname_delivery: null,
        lastname_delivery: null,
        email: null,        
        company_invoice: null,
        firstname_invoice: null,
        lastname_invoice: null,
        address_street_invoice: null,
        address_street_no_invoice: null,
        address_code_invoice: null,
        address_city_invoice: null,
        address_country_invoice: null,
        different_delivery_address: null,                        
        address_street_delivery: null,
        address_street_no_delivery: null,
        address_code_delivery: null,
        address_city_delivery: null,
        address_country_delivery: null,        
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
            if (!this.reg_plz_de.test(this.address_code_invoice) && !this.reg_plz_at.test(this.address_code_invoice)) {
                window.alert("Die Postleitzahl ist nicht gültig (Rechnungsadresse)!")
                return false
            }
            if (this.different_delivery_address) {
                if (!this.reg_plz_de.test(this.address_code_delivery) && !this.reg_plz_at.test(this.address_code_delivery)) {
                    window.alert("Die Postleitzahl ist nicht gültig (Lieferadresse)!")
                    return false
                }
                if (this.firstname_delivery == null || this.firstname_delivery == "" || this.lastname_delivery == null || this.lastname_delivery == "") {
                    window.alert("Bitte Namen für Lieferadresse angeben!" + this.first_name_delivery)
                    return false
                }
                if (this.address_street_delivery == null || this.address_street_delivery == "") {
                    window.alert("Bitte Straße für Lieferadresse angeben!")
                    return false
                }
                if (this.address_street_no_delivery == null || this.address_street_no_delivery == "") {
                    window.alert("Bitte Hausnummer für Lieferadresse angeben!")
                    return false
                }
                if (this.address_city_delivery == null || this.address_city_delivery == "") {
                    window.alert("Bitte Stadt für Lieferadresse angeben!")
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
        preparePaypal() {            
            var head = document.getElementsByTagName('head')[0]
            var script = document.createElement('script')
            // Sandbox
            // script.src = "https://www.paypal.com/sdk/js?client-id=ARDSKiyNT-7Me_5MbJnxO8o7eiwO63MEhj7rB4gjZG05egtPPwYxKzY-SYtDssmmKioVabqW1LmCVjeL&currency=EUR"            
            // Live
            script.src = "https://www.paypal.com/sdk/js?client-id=AaajwREkp6udI8Cif5iEIJn-pTOU_q_t7McSR_XKDqmILqp4PLuNRX_6WIA1ETw8aveqOAhFuv1WTeBZ&currency=EUR"
            script.type = 'text/javascript'                           
            script.onload = function() {                                                     
                paypal.Buttons({
                    createOrder: function(data, actions) {                    
                    return actions.order.create({
                        application_context: {
                            // shipping_preference: "NO_SHIPPING"
                            shipping_preference: "SET_PROVIDED_ADDRESS",
                            user_action: "PAY_NOW", 
                            payment_method: {payer_selected: "PAYPAL", payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"}
                        },                                    
                        purchase_units: [{
                            amount: {value: TOTAL, currency_code: 'EUR', 
                                // breakdown: {
                                //     item_total: { currency_code: "EUR", value: "19.50"},
                                //     shipping: { currency_code: "EUR", value: "0.00"},
                                //     handling: { currency_code: "EUR", value: "0.00"},
                                //     tax_total: { currency_code: "EUR", value: "0.50"}
                                // }
                            },         
                            // items: [{
                            //     name: "Calendarium Culinarium",
                            // //     unit_amount: {currency_code: "EUR", value: "20.00"},
                            //     quantity: "2"
                            // }],
                            description: "Calendarium Culinarium " + ORDER_ID,         
                            soft_descriptor: "Calendarium",
                            custom_id: ORDER_ID,
                            reference_id: ORDER_ID,
                            shipping: {
                                address: {
                                    address_line_1: (COMPANY == null || COMPANY == "") ? STREET : COMPANY,
                                    address_line_2: (COMPANY == null || COMPANY == "") ? "" : STREET,
                                    admin_area_1: "",
                                    admin_area_2: CITY,                                    
                                    postal_code: CODE,                                    
                                    country_code: COUNTRY
                                },
                                name: {full_name: FULL_NAME}
                            },                                        
                        }],                               
                    });
                    },
                    onApprove: function(data, actions) {
                        return actions.order.capture().then(function(details) {
                            $("#paypal-button-container").addClass('hide')  
                            $("#server-response-2").addClass('mute')
                            $("#server-response-3").text('Bezahlung erfolgreich. Danke, ' + details.payer.name.given_name + '!')                            
                        });
                    },
                    onCancel: function(data) {
                        // Nix zu machen.
                    }
            }).render('#paypal-button-container'); // Display payment options on your web page
            }
            head.appendChild(script)                                    
        },
        computeNumericPrice() {
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
            return price_after_discount
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
                // url: 'http://localhost:8000/api/orders',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "product_id": 1,
                    "amount": parseInt(this.amount),
                    "company_invoice": this.company_invoice,
                    "first_name_invoice": this.firstname_invoice,
                    "last_name_invoice": this.lastname_invoice,
                    "first_name_delivery": this.different_delivery_address ? this.firstname_delivery : this.firstname_invoice,
                    "last_name_delivery": this.different_delivery_address ? this.lastname_delivery : this.lastname_invoice,
                    "email": this.email,
                    "address_street_invoice": this.address_street_invoice,
                    "address_street_no_invoice": this.address_street_no_invoice,
                    "address_code_invoice": this.address_code_invoice,
                    "address_city_invoice": this.address_city_invoice,
                    "address_country_invoice": this.address_country_invoice,
                    "company_delivery": this.different_delivery_address ? this.company_delivery : this.company_invoice,
                    "address_street_delivery": this.different_delivery_address ? this.address_street_delivery : this.address_street_invoice,
                    "address_street_no_delivery": this.different_delivery_address ? this.address_street_no_delivery : this.address_street_no_invoice,
                    "address_code_delivery": this.different_delivery_address ? this.address_code_delivery : this.address_code_invoice,
                    "address_city_delivery": this.different_delivery_address ? this.address_city_delivery : this.address_city_invoice,
                    "address_country_delivery": this.different_delivery_address ? this.address_country_delivery : this.address_country_invoice,
                    "payment": this.payment,
                    "is_reseller": this.is_reseller,
                    "slow_food_member": this.sf_member,
                    "message": this.msg,
                    "agrees_agb": this.agrees_agbs,
                    "agrees_data_privacy": this.agrees_data_privacy
                }
            }).then(function(response) {
                // handle success                
                $("#server-loader").addClass('hide')
                $("#server-response").text(response.data)                
                $("#server-response-2").text('Eine Auftragsbestätigung folgt per Mail.')
                // $("#server-response-3").text()
                var match = response.data.search("(').+?(')")
                order_id = response.data.substring(match+1, match+10)                
                $("#problem-button").addClass('hide')
                $("#note-preorder").addClass('mute')
                $("#order-title").text("Bestellung eingegangen!")                
                if (this.payment == "paypal") {                                                            
                    TOTAL = this.computeNumericPrice().toFixed(2)
                    ORDER_ID = order_id.toString()                                         
                    STREET = (this.different_delivery_address ? this.address_street_delivery : this.address_street_invoice) + " " + (this.different_delivery_address ? this.address_street_no_delivery.toString() : this.address_street_no_invoice.toString())                                         
                    CITY = this.different_delivery_address ? this.address_city_delivery : this.address_city_invoice
                    CODE = this.different_delivery_address ? this.address_code_delivery.toString() : this.address_code_invoice.toString()
                    COUNTRY = setCountryCode(this.different_delivery_address ? this.address_country_delivery : this.address_country_invoice)                                        
                    if (COUNTRY == "UNKNOWN") {
                        $("#server-response-3").text('Wir konnten Dein Länderkürzel nicht automatisch bestimmen.')
                        $("#server-response-4").text('Bitte erledige Deine PayPal-Zahlung manuell. Unsere PayPal Adresse erfährst Du mit der Zahlungsaufforderung per Mail. Deine Bestellung ist eingegangen und wird von uns bearbeitet.')
                        return
                    }
                    FULL_NAME = this.different_delivery_address ? (this.firstname_delivery + " " + this.lastname_delivery) : (this.firstname_invoice + " " + this.lastname_invoice)
                    COMPANY = this.different_delivery_address ? this.company_delivery : this.company_invoice
                    $("#paypal-button-container").removeClass('hide')                    
                    this.preparePaypal()                    
                    $("#paypal-loader").addClass('hide')
                }                
            }.bind(this))
            .catch(function(error) {
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
    },    
    mounted() {
        amnt = parseInt(getUrlParameter('amount'))
        this.amount = isNaN(amnt) ? 1 : amnt        
        this.company_delivery = getUrlParameter('company_delivery').replace(/\+/g, ' ')        
        this.firstname_delivery = getUrlParameter('firstname_delivery').replace(/\+/g, ' ')        
        this.lastname_delivery = getUrlParameter('lastname_delivery').replace(/\+/g, ' ')                
        this.company_invoice = getUrlParameter('company_invoice').replace(/\+/g, ' ')        
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
        this.different_delivery_address = (getUrlParameter('different_delivery_address') == 'checked' || getUrlParameter('different_delivery_address') == 'on' || getUrlParameter('different_delivery_address') == 'true') ? true : false        
        $("#different-delivery-check").prop('checked', this.different_delivery_address)
        if (this.different_delivery_address) {
            $("#delivery-fields").collapse()
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