var playBtn = $('#playBtn');
var wordTypeContainer = $('#wordTypeContainer');
var wordInput = $('#wordInput');
var userButton = $('#nextBtn');
var suggestionContainer = $('#wordSuggestion');
var introScreen = $('#intro');
var questionScreen = $('#question');
var endGameScreen = $('#endGame');
var prevBtn = $('#prevBtn');
var showStory = $("#showStory");
var voicePrompt =$("#voicePrompt");
var letsHearIt = $("#letsHearIt");

var madApi = "https://madlibz.herokuapp.com/api/random?minlength=5&maxlength=25";

var blanks;
var sentences;
var title;
var userResponses = [];

// Set the current index for the blanks array to 0
var curIndex = 0;


// INGAME FUNCTIONS ==============================================================

// This function starts the game by hiding the intro screen, 
// showing the question screen, and then querying the MadLibz API
function startGame() {
    introScreen.hide();
    questionScreen.show();
    $.ajax({
        url: madApi,
        method: "GET"
    }).then(function(response) {

        // Store the blank, the sentences and 
        // the title in separate variables
        blanks = response.blanks;
        sentences = response.value;
        title = response.title;

        // Load the current word blank
        loadWordQuestion();
    });
};
// Loads the suggested part of speech
function loadWordQuestion() {
    clearQuestions();
    // As long as we haven't entered all of the words, load the current word type for the user
    if (curIndex < blanks.length) {
        wordTypeContainer.text(blanks[curIndex]);
        // If there is something stored already in the userResponses array for this index
        if (userResponses[curIndex]) {
            // Load it into the input
            wordInput.val(userResponses[curIndex]);
            // And load some synonyms too
            getSynonyms(userResponses[curIndex]);
        }
        $('#counter').text(curIndex+1 + " of " + blanks.length);
        console.log(curIndex);
        console.log(userResponses);
    } else {
        // If our current index has reached the end of the blanks array, show the voice-select prompt
        showVoicePrompt();
    }
}
// Captures typed user input if "search" button is 
// clicked or enter is pressed
function captureUserInput(e) {
    // If a keycode is detected (we can assume this function was 
    // triggered by a keydown) and it is NOT the enter key
    if (e.keyCode && e.keyCode !== 13) {
        // return out of the function as we're only looking 
        // for a keydown event that is enter
        return;
    }
    // Don't allow user to proceed if the input is blank
    if (wordInput.val() !== "") {
        // Push whatever is in the input field to the userResponses array
        userResponses[curIndex] = wordInput.val().trim();
        // Increase the current Index so we can load the next word blank
        curIndex++;
        //Load the next word blank
        loadWordQuestion();
    }
}
// Captures the word from a suggestion button that is clicked by the user
function captureButtonInput() {
    // Add the value of the button to the userResponses array
    userResponses[curIndex] = $(this).val();
    // Move on to the next index, clear the play elements, load the next word blank
    curIndex++;
    loadWordQuestion();
}
// Displays the voice-select prompt after the last question is completed.
function showVoicePrompt() {
    questionScreen.hide();
    voicePrompt.show();
}

// Kicks off the end of the game
function endGame() {
    
    // Hide the voice-prompt
    voicePrompt.hide();
    // Show the endgame screen
    endGameScreen.show();
    // Render the story
    renderStory();
}
// Resets the playing fields in prep for loading a new word blank
function clearQuestions() {
    wordInput.val('');
    wordTypeContainer.empty();
    suggestionContainer.empty();
    // prevents synonyms from being loaded if user is speeding through questions
    clearTimeout(suggestionDelay);
}

// Takes the userResponses array and the sentences array and renders the story
function renderStory() {
    // Create an empty string variable to concatenate onto as we run through our arrays
    var storyHtml = "";
    // Displays the title of the story
    $("#storyTitle").text(title);
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
    showStory.html(storyHtml);
    // Read the story aloud
    speakText(showStory);
}

// Text-to-Speech ===============================================================
function speakText() {
    // Get text from textbox.
    var text = $('#showStory').text();
    // Get selected voice from dropdown
    var voice = $('#voiceselection').val()
    // Speak it
    responsiveVoice.speak(text, voice)
}

// The rest of this runs when the page opens


// Get voice selection drop down
var vselect = $("#voiceselection");

// Get list of voices
var voicelist = responsiveVoice.getVoices();
// Add an option for each voice to the drop down
$.each(voicelist, function() {
    vselect.append($("<option>").val(this.name).text(this.name));
});



//Cycles to the previous word blank
function prevQuestion() {
    // If the curIndex is not zero 
    // (no word blanks before the very first one)
    if (curIndex !== 0) {
        curIndex--;
        loadWordQuestion();
    }
}

// Event Listeners
playBtn.on('click',startGame);
suggestionContainer.on('click',captureButtonInput);
userButton.on('click',captureUserInput);
wordInput.on('keydown',captureUserInput);
prevBtn.on('click',prevQuestion);


// THIS TAKES THE USER FROM THE VOICE PROMPT PAGE TO THE END GAME SCREEN -IT
letsHearIt.on("click", endGame);

// THESAURUS SUGGESTIONS ===============================================================================================
suggestionContainer.on('click',captureButtonInput);
wordInput.on('keyup',setSuggestionDelay);

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
        // If there's a response, parse the response for the 
        // synonyms and run the renderSuggestions function
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

    // After one second, run this function one time. Basically detect if a user 
    // has paused typing for just under one second, then show them suggestions.
    suggestionDelay = setTimeout(function() {
        // empty the current suggestions element and get new ones
        suggestionContainer.empty();
        getSynonyms(wordInput.val());
    }, 800);
}

// Renders suggestions as buttons on the DOM
function renderSuggestions() {
    // Initalize an array to hold the thesaurus suggestions
    var suggestionArray = [];

    // There are several arrays within the synonyms array. Let's choose a random 
    // one, and then choose a random synonym within that array.
    // Do that three times to get three random suggestions
    while (suggestionArray.length < 3) {
        // Random indices and random subindices
        var randIndex = Math.floor(Math.random() * synonyms.length);
        var randSubIndex = Math.floor(Math.random() * synonyms[randIndex].length);

        // Parse the random synonym
        var word = synonyms[randIndex][randSubIndex];

        // To avoid duplicates, make sure the word isn't already in our suggestionArray. Add if it isn't.
        if (suggestionArray.indexOf(word) === -1) {
            suggestionArray.push(word);
        }
    }

    suggestionArray.forEach(function(suggest) {
        // Create a button with the suggestion class and set it's value and 
       // text content to the random synonym. Append it to the DOM.
        var newBtn = $('<button>').addClass(suggestionButtonClass.replace('.',''));
       newBtn.addClass('button');
       newBtn.val(suggest);
       newBtn.text(suggest);
       
       suggestionContainer.append(newBtn);
    });
}
