Dropzone.options.myDropzone = {

  // Prevents Dropzone from uploading dropped files immediately
  autoProcessQueue: false,

  init: function() {

    var submitButton = document.querySelector("#submit-all")
    myDropzone = this; // closure
    $("#submit-all").hide();

    submitButton.addEventListener("click", function() {
      myDropzone.processQueue(); // Tell Dropzone to process all queued files.
    });

    // You might want to show the submit button only when 
    // files are dropped here:
    this.on("addedfile", function() {
      $("#submit-all").show();
    });

    this.on("removedfile", function() {
      $("#submit-all").hide();
    });

  },

  addRemoveLinks: true
};