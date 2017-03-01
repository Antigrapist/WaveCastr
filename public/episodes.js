// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

  var addToChatBox = function(string){
    box.innerHTML = box.innerHTML + '<br>'+ ("SYSTEM: " + string).replace( /[<>]/g, '' )
  }

$(document).ready(function(){
  // function $(id) { return document.getElementById(id); }
  $(".btn-group button").click(function(){
    var choice = this.innerHTML;
    $(".show-options").children().hide();
    switchDiv(choice);
  })

  var box = document.getElementById('chat-container');
  var input = document.getElementById('input');
  var channel = window.location.pathname.replace(/\/episodes\//, "");
  var username = $('#current_user').text();
  startChat();


  function startChat(){
    var pubnub = new PubNub({
    subscribeKey: subscribeKey,
    publishKey: publishKey,
    uuid: username
    });
    pubnub.subscribe({channels:[channel]});



    pubnub.addListener({
      message: function(obj) {
          box.innerHTML = box.innerHTML + '<br>'+ (obj.publisher + ": " +obj.message).replace( /[<>]/g, '' )
      }});

      var $chatBox = $('#chat-container');
      $chatBox[0].scrollTop = $chatBox[0].scrollHeight;

    $("#input").keyup(function(e) {
      if (e.which === 13) {
        pubnub.publish({channel : channel, message : input.value, x: (input.value='')});
        console.log( "box",$chatBox)
        console.log("befor", $chatBox[0].scrollTop)
        $chatBox[0].scrollTop = $chatBox[0].scrollHeight;
        console.log("after", $chatBox[0].scrollTop)
      }
    }).focus();

    $("#send").on('click', function() {
      pubnub.publish({channel : channel, message : input.value, x: (input.value='')});
    })
  }
})





