function speakText() {
    // Get text from textbox.
    var text = $('#text').val();

    // Get selected voice from dropdown
    var voice = $('#voiceselection').val()

    // Speak it
    responsiveVoice.speak(text, voice)
}

// The rest of this runs when the page opens

// Get list of voices
var voicelist = responsiveVoice.getVoices();

// Get voice selection drop down
var vselect = $("#voiceselection");

// Add an option for each voice to the drop down
$.each(voicelist, function() {
    vselect.append($("<option />").val(this.name).text(this.name));
});