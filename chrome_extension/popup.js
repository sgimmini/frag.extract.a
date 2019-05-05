$(function () {
    $('#name').keyup(function () {
        $('#greet').text('Hello ' + $('#name').val());
    })
});

$(function () {
    $("#warning").click(function () {
        $(this).hide()
    })

});

$(function () {
    $('#input').keyup(function () {
        $('#output').text($('#input').val());
    })
});


$(function () {
    $('.someclass').click(function () {
        $(this).hide()
        $("#warning").show().text('Das ist gut');
        $('#output').text("")
    })
});

$(function () {
    $(document).ready(function () {
        $('#extract').onclick(function () {
            $('#output').text($(".lang-py prettyprint prettyprinted").val())
        })

    })


})