var displayInfo = function(selector,message) {
  $(selector).append($('<span/>',{class: "ui-state-error ui-icon ui-icon-info icons"})).fadeIn('fast');
  $(selector + ' span.ui-icon').qtip({
    content:message,
    style:{ 
      classes: 'ui-tooltip-rounded ui-tooltip-shadow qtip'
    }
  });
};