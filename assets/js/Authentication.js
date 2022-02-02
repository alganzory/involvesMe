
  


(function () {
  "use strict";
  window.addEventListener(
    "load",
    function () {
      // Fetch all the forms we want to apply custom validation styles
      var inputs = document.getElementsByClassName("form-control");

      var forms = document.getElementsByClassName('needs-validation');
      // Loop over each input and watch blue event
      var validation = Array.prototype.filter.call(
        inputs,
        function (input) {
          input.addEventListener(
            "blur",
            function (event) {
              // reset
              input.classList.remove("is-invalid");
              input.classList.remove("is-valid");
              

              if (input.checkValidity() === false) {
                input.classList.add("is-invalid");
              } else {
                input.classList.add("is-valid");
              }
            },
            false

        
            );
        }
      );
      var validation2 = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    },
    false
  );
})();


$(document).ready(function () {
  $("#confirmPassword").on('keyup', function(){
   var password = $("#passcode").val();
   var confirmPassword = $("#confirmPassword").val();
   if (password != confirmPassword)
       $("#CheckPasswordMatch").html("Password does not match !").css("color","red");
   else
       $("#CheckPasswordMatch").html("Password match !").css("color","green");
  });
});


function __attachValidationHandler(input) {
  var rule = input.data("rule");
  if (typeof rule !== 'undefined' && rule.length > 0) {
      input.on("blur",
          function () {
              var current = __getCurrentValue($(this));
              var code = rule.replace("{val}", "'" +
                         current + "'");
              var result = __eval(code);
              if (result)
                  $(this).removeClass("is-invalid");
              else
                  $(this).addClass("is-invalid");
          });
  }
}


function showPassword() {
 var x = document.getElementById("passcode");
 if (x.type === "password") {
   x.type = "text";
 } else {
   x.type = "password";
 }
}
