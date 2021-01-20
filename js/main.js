console.log('js is working');

$(document).ready(function () {

    $('.menu-item').click(function () {
        dataFile = $(this).attr('data-file');
        dataFile = `content/${dataFile}`;
        $('section.content').html('Loading...');
        $.get(dataFile, function (data) {
            $('section.content').html(marked(data));
        }, "text");
    });
});