$(function () {
    $('#name').keyup(function () {
        $('#greet').text('Hello ' + $('#name').val());
    })
})

$(function () {
    $('#warning').keyup(function () {
        $('#warning').text('WHAAAT');

    })

})