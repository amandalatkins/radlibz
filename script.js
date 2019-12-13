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
    // If a keycode is detected and it is NOT the enter key
    if (e.keyCode && e.keyCode !== 13) {
        // return out of the function as we're only looking for a keydown event that is enter
        return;
    }
    userResponses.push(wordInput.val().trim());
    curIndex++;
    clearQuestions();
    loadWordQuestion();
}

function captureButtonInput() {
    userResponses.push($(this).val());
    curIndex++;
    clearQuestions();
    loadWordQuestion();
}

function endGame() {
    questionScreen.hide();
    renderStory();
}

function clearQuestions() {
    wordInput.val('');
    wordTypeContainer.empty();
    suggestionContainer.empty();
}

function renderStory() {
    var storyHtml = "";
    for (var i = 0; i < sentences.length; i++) {

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



// THESAURUS SUGGESTIONS ===============================================================================================

var mwApiKey = "de6eeece-778a-44b5-8d01-ceb552ac108d";
var mwBaseUrl = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/";
var word;
var suggestionDelay;
var synonyms;
var suggestionButtonClass = '.suggestionButton';

$(document).on('click',suggestionButtonClass,captureButtonInput);

// Query the thesaurus api with word supplied from user
function getSynonyms(userWord) {
    $.ajax({
        url: mwBaseUrl + userWord + "?key="+mwApiKey,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        // If there's a response, parse the response for the synonyms and run the renderSuggestions function
        if (response) {
            synonyms = response[0].meta.syns;
            renderSuggestions();
        }
    });
}

// This function is triggered on keyup of the user word input
function setSuggestionDelay() {
    // Clear existing timeout with each keyup
    clearTimeout(suggestionDelay);

    // After one second, run this function one time. Basically detect if a user has paused typing for one second, then show them suggestions.
    suggestionDelay = setTimeout(function() {
        // empty the current suggestions element and get new ones
        suggestionContainer.empty();
        getSynonyms(wordInput.val());
    }, 1000);
}

// Renders suggestions as buttons on the DOM
function renderSuggestions() {

    // There are several arrays within the synonyms array. let's choose a random one, and then choose a random synonym within that array.
    // Do that three times to get three random suggestions 
    for (var i = 0; i < 3; i++) {
        // Random indices and random subindices
       var randIndex = Math.floor(Math.random() * synonyms.length);
       var randSubIndex = Math.floor(Math.random() * synonyms[randIndex].length);
        
       // Parse the random synonym
       var word = synonyms[randIndex][randSubIndex];
       
       // Create a button with the suggestion class and set it's value and text content to the random synonym. Append it to the DOM.
       var newBtn = $('<button>').addClass(suggestionButtonClass.replace('.',''));
       newBtn.val(word);
       newBtn.text(word);
       suggestionContainer.append(newBtn);
    }
}
