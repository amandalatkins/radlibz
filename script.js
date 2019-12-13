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
    // if ($(this).matches('button')) {
        userResponses.push($(this).val());
        wordInput.val('');
        curIndex++;
        loadWordQuestion();
    // }
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
wordInput.on('keydown',captureUserInput);

wordInput.on('keyup',setSuggestionDelay);



// THESAURUS SUGGESTION CODE

var mwApiKey = "de6eeece-778a-44b5-8d01-ceb552ac108d";
var mwBaseUrl = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/";
var word;
var suggestionDelay;
var synonyms;
var suggestionButtonClass = '.suggestionButton';

$(document).on('click',suggestionButtonClass,captureButtonInput);

function getSynonyms(word) {
    $.ajax({
        url: mwBaseUrl + word + "?key="+mwApiKey,
        method: "GET"
    }).then(function(response) {
        synonyms = response[0].meta.syns;
        renderSuggestions();
    });
}

function setSuggestionDelay() {
    clearTimeout(suggestionDelay);
    suggestionDelay = setTimeout(function() {
        getSynonyms(wordInput.val());
    }, 1000);
}

function renderSuggestions() {
    // There are several arrays within the synonyms array. let's choose a random one, and then choose a random synonym within that array.
    // And do that three times
    suggestionContainer.empty();
    for (var i = 0; i < 3; i++) {
       var randIndex = Math.floor(Math.random() * synonyms.length);
       var randSubIndex = Math.floor(Math.random() * synonyms[randIndex].length);

       var word = synonyms[randIndex][randSubIndex];
       
       var newBtn = $('<button>').addClass(suggestionButtonClass);
       newBtn.val(word);
       newBtn.text(word);
       suggestionContainer.append(newBtn);
    }
}
