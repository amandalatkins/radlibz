suggestionContainer.on('click',captureButtonInput);
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
