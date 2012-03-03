$(document).ready(function(){
  //init buttons
  $('button').button();
  
  //reset the fields here
  $('#reset').click(function(){
    $('input#username').val('your_email@juniper.net');
    $('span.ui-icon').fadeOut('slow');
    return false;
  });
  
  $('#recover').click(function(){
    $('span.ui-icon').fadeOut('slow');
    if ($('input#email').val().split('@')[1] != 'juniper.net') {
      displayInfo('#divemail','You must use a @junper.net email address!');
    } else {
      if ($('input#email').val() == 'your_email@juniper.net') {
        displayInfo('#divemail','Please enter your own email address!');
      } else if (!!$('input#email').val()) {
          //submit to API
          var request = $.ajax({
              url: "/ruser",
              type: "POST",
              data: {
                email: $('input#email').val(),
              },
              dataType: "json"
            });
      };
    };
    return false;
  });
  
});