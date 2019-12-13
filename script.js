var playBtn = $('#playBtn');
var wordTypeContainer = $('#wordTypeContainer');
var wordInput = $('#wordInput');
var userButton = $('#userWord');
var suggestionContainer = $('#wordSuggestion');
var introScreen = $('#intro');
var questionScreen = $('#question');
var endGameScreen = $('#endGame');


var madApi = "https://madlibz.herokuapp.com/api/random?minlength=5&maxlength=25";

var blanks;
var sentences;
var title;
var userResponses = [];
var curIndex = 0;

function startGame() {
    introScreen.hide();
    questionScreen.show();
    $.ajax({
        url: madApi,
        method: "GET"
    }).then(function(response) {
        blanks = response.blanks;
        sentences = response.value;
        title = response.title;
        loadWordQuestion();
    });
};

function loadWordQuestion() {
    if (curIndex < blanks.length) {
        console.log(userResponses);
        wordTypeContainer.text(blanks[curIndex]);
    } else {
        endGame();
    }
}

function captureUserInput(e) {
    if (e.keyCode && e.keyCode !== 13) {
        return;
    }
    userResponses.push(wordInput.val().trim());
    wordInput.val('');
    curIndex++;
    loadWordQuestion();
}

function captureButtonInput() {
    if ($(this).matches('button')) {
        userResponses.push($(this).val());
        wordInput.val('');
        curIndex++;
        loadWordQuestion();
    }
}

function endGame() {
    // console.log(blanks);
    // console.log(userResponses);
    questionScreen.hide();
    renderStory();
}

function renderStory() {
    var storyHtml = "";
    for (var i = 0; i < sentences.length; i++) {

        // sentences[i].substring('\n*','<br><br>');

        // console.log(sentences[i]);

        if (sentences[i] !== "" && sentences[i] !== 0) {

            var sentence = sentences[i].replace('\n','<br><br>');
            sentence = sentence.replace('*','&bull;');

            storyHtml += sentence;
            console.log(sentence);
        }
        if (userResponses[i]) {
            storyHtml += "<span class='user-word'>"+userResponses[i]+"</span>";
        }
    }
    endGameScreen.html(storyHtml);
}

// Event Listeners
playBtn.on('click',startGame);
suggestionContainer.on('click',captureButtonInput);
userButton.on('click',captureUserInput);
wordInput.on('keyup',captureUserInput);