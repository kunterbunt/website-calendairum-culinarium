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
};

$('document').ready(function(){
    $("#form-amount").val(getUrlParameter('amount'))
    $("#form-name").val(getUrlParameter('name'))
    $("#form-email").val(getUrlParameter('email'))
    $("#form-address-street").val(getUrlParameter('address_street'))
    $("#form-address-code").val(getUrlParameter('address_code'))
    $("#form-address-city").val(getUrlParameter('address_city'))
    $("#slow-food-member-check").prop('checked', getUrlParameter('slow_food_member') == 'on' ? true : false)
    $("#form-additional").val(getUrlParameter('message').replace(/\+/g, ' '))
})