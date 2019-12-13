var playBtn = $('#playBtn');
var wordTypeContainer = $('#wordTypeContainer');
var wordInput = $('#wordInput');
var userButton = $('.userWord');
var suggestionButton = $('.suggestWord');


var madApi = "https://madlibz.herokuapp.com/api/random?minlength=5&maxlength=25";

var madObj;
var curIndex = 0;

playBtn.on('click',function() {
    $(this).hide();
    $('.question').show();
    $.ajax({
        url: madApi,
        method: "GET"
    }).then(function(response) {
        madObj = response;
        console.log(madObj);
        loadWordQuestion();
    });
});

function loadWordQuestion() {
    wordTypeContainer.text(madObj.blanks[curIndex]);
}