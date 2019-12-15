var playBtn = $('#playBtn');
var wordTypeContainer = $('#wordTypeContainer');
var wordInput = $('#wordInput');
var userButton = $('#nextBtn');
var suggestionContainer = $('#wordSuggestion');
var introScreen = $('#intro');
var questionScreen = $('#question');
var endGameScreen = $('#endGame');

var prevBtn = $('#prevBtn');


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
    clearQuestions();
    // As long as we haven't entered all of the words, load the current word type for the user
    if (curIndex < blanks.length) {
        wordTypeContainer.text(blanks[curIndex]);
        console.log(curIndex + ": "+ blanks[curIndex]);
        if (userResponses[curIndex]) {
            wordInput.val(userResponses[curIndex]);
        }
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

    // Don't allow user to proceed if the input is blank
    if (wordInput.val() !== "") {
        // Push whatever is in the input field to the userResponses array
        userResponses[curIndex] = wordInput.val().trim();
        // Increase the current Index so we can load the next word blank
        curIndex++;
        // Clear the word blank, input, and thesaurus suggestions
        clearQuestions();
        //Load the next word blank
        loadWordQuestion();
    }
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

//Cycles to the next or previous word blank
function prevQuestion() {

    // If the curIndex is not zero (no word blanks before the very first one)
    if (curIndex !== 0) {
        curIndex--;
        loadWordQuestion();
    }
    // // If our type is next and the curIndex is less than the length of user responses, i.e. users can't cycle forward until they've filled out existing blanks
    // else if (type === "next" && curIndex < userResponses.length) {
    //     // curIndex++;
    //     //Let's also use the next button as a submit button, so capture user input
    //     captureUserInput();
    // }
}

// Event Listeners
playBtn.on('click',startGame);
suggestionContainer.on('click',captureButtonInput);
userButton.on('click',captureUserInput);
wordInput.on('keydown',captureUserInput);
prevBtn.on('click',prevQuestion);