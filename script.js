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

// Set the current index for the blanks array to 0
var curIndex = 0;

// This function starts the game by hiding the intro screen, showing the question screen, and then querying the MadLibz API
function startGame() {
    introScreen.hide();
    questionScreen.show();
    $.ajax({
        url: madApi,
        method: "GET"
    }).then(function(response) {

        // Store the blanks and the sentences and the title in separate variables
        blanks = response.blanks;
        sentences = response.value;
        title = response.title;

        // Load the current word blank
        loadWordQuestion();
    });
};

// Loads the suggested part of speech
function loadWordQuestion() {
    // As long as we haven't entered all of the words, load the current word type for the user
    if (curIndex < blanks.length) {
        wordTypeContainer.text(blanks[curIndex]);
    } else {
        // If our current index has reached the end of the blanks array, end the game
        endGame();
    }
}

// Captures typed user input if "search" button is clicked or enter is pressed
function captureUserInput(e) {
    // If a keycode is detected (we can assume this function was triggered by a keydown) and it is NOT the enter key
    if (e.keyCode && e.keyCode !== 13) {
        // return out of the function as we're only looking for a keydown event that is enter
        return;
    }
    // Push whatever is in the input field to the userResponses array
    userResponses.push(wordInput.val().trim());
    // Increase the current Index so we can load the next word blank
    curIndex++;
    // Clear the word blank, input, and thesaurus suggestions
    clearQuestions();
    //Load the next word blank
    loadWordQuestion();
}

// Captures the word from a suggestion button that is clicked by the user
function captureButtonInput() {
    // Add the value of the button to the userResponses array
    userResponses.push($(this).val());
    // Move on to the next index, clear the play elements, load the next word blank
    curIndex++;
    clearQuestions();
    loadWordQuestion();
}

// Kicks off the end of the game
function endGame() {
    // HIde the question screen
    questionScreen.hide();
    // Render the story
    renderStory();
}

// Resets the playing fields in prep for loading a new word blank
function clearQuestions() {
    wordInput.val('');
    wordTypeContainer.empty();
    suggestionContainer.empty();
}

// Takes the userResponses array and the sentences array and renders the story
function renderStory() {
    // Create an empty string variable to concatenate onto as we run through our arrays
    var storyHtml = "";
    // Loop through all the sentences
    for (var i = 0; i < sentences.length; i++) {
        // As long as the sentences have content and aren't set to 0 (the api returns one 0)
        if (sentences[i] !== "" && sentences[i] !== 0) {

            // Replace this chracter combo with line breaks
            var sentence = sentences[i].replace('\n','<br><br>');

            // Replace this character with bullet point
            sentence = sentence.replace('*','&bull;');

            // add sentence to story
            storyHtml += sentence;
        }
        // Make sure there is a user response for this index
        if (userResponses[i]) {
            storyHtml += "<span class='user-word'>"+userResponses[i]+"</span>";
        }
    }
    // append the story to the DOM
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
