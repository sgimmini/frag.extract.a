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
        $('#extract').click(function () {
            $('#output').text($(".lang-py prettyprint prettyprinted").val())
        })

    })


});

$(document).ready(function(){
    $('body').on('click', 'a', function(){
      chrome.tabs.create({url: $(this).attr('href')});
      return false;
    });
 });