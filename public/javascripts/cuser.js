//validate username is @juniper.net
//validate passwords match

//submit registration to API
//pop up a dialog to the user to show them that everything worked out
//use reset to reset the form
$(document).ready(function(){
  //init buttons
  $('button').button();
  
  //reset the fields here
  $('#reset').click(function(){
    $('form input').val('');
    $('form select').val(0);
    $('span.ui-icon').fadeOut('slow');
    $('input#username').val('your_email@juniper.net');
    return false;
  });
  
  //use this to submit the data to the user creation API
  $('#register').click(function(){
    $('span.ui-icon').fadeOut('slow');
    if ($('input#pass').val() != $('input#passcon').val()) {
      displayInfo('#divpassword','Your passwords must match!');
      } else {
        console.log('to username');
        if ($('input#email').val().split('@')[1] != 'juniper.net') {
          //check this server side as well
          displayInfo('#divemail','You must use a @junper.net email address!');
        } else if ( $('input#email').val() == 'your_email@juniper.net') { 
            //hey use your own username
            displayInfo('#divemail','Please enter your own email address!');
        } else {
          if (!$('input#firstname').val()) {
            displayInfo('#divfirstname','Please enter your first name!');
          };
          if (!$('input#lastname').val()) {
            displayInfo('#divlastname','Please enter your first name!');
          };
          if (!!$('input#email').val() || !!$('input#username').val() || !!$('input#pass').val() || !!$('input#passcon').val() || !!$('input#firstname').val() || !!$('input#lastname').val()) {
            console.log('workin');
            //send data to API
            var request = $.ajax({
              url: "/cuser",
              type: "POST",
              data: {
                username: $('input#username').val(),
                email:  $('input#email').val(),
                password: $('input#pass').val(),
                passcon: $('input#passcon').val(),
                firstname: $('input#firstname').val(),
                lastname: $('input#lastname').val(),
                region: $('select#region').val(),
                position: $('select#position').val()
              },
              dataType: "json"
            });
          
            request.done(function(msg) {
              console.log(msg);
            });
          };
        };
    };
      
    return false;  
  });

});