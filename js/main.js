console.log('js is working')

$(document).ready(function () {

    $('.menu-item').click(function () {
        dataFile = $(this).attr('data-file')
        dataFile = `content/${dataFile}`
        $.get(dataFile, function (data) {
            $('section.content').html(marked(data));
        }, "text");
    });
});