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
  
  $('#login').click(function(){
    $('span.ui-icon').fadeOut('slow');
    if ($('input#username').val().split('@')[1] != 'juniper.net') {
      displayInfo('#divusername','You must use a @junper.net email address!');
    } else {
      if ($('input#username').val() == 'your_email@juniper.net') {
        displayInfo('#divusername','Please enter your own email address!');
      } else if (!$('input#password').val()) {
        displayInfo('#divpassword','Please enter your password!');
      } else if (!!$('input#username').val()) {
          //submit to API
          console.log('working');
      };
    };
    return false;
  });
  
});