"use strict";window.AudioContext=window.AudioContext||window.webkitAudioContext,navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia;var Recorder=function(e){var t=this;if(!Recorder.isRecordingSupported())throw"Recording is not supported in this browser";this.config=e=e||{},this.config.command="init",this.config.bufferLength=e.bufferLength||4096,this.config.monitorGain=e.monitorGain||0,this.config.numberOfChannels=e.numberOfChannels||1,this.config.originalSampleRate=this.audioContext.sampleRate,this.config.encoderSampleRate=e.encoderSampleRate||48e3,this.config.encoderPath=e.encoderPath||"encoderWorker.min.js",this.config.streamPages=e.streamPages||!1,this.config.leaveStreamOpen=e.leaveStreamOpen||!1,this.config.maxBuffersPerPage=e.maxBuffersPerPage||40,this.config.encoderApplication=e.encoderApplication||2049,this.config.encoderFrameSize=e.encoderFrameSize||20,this.config.resampleQuality=e.resampleQuality||3,this.config.streamOptions=e.streamOptions||{optional:[],mandatory:{googEchoCancellation:!1,googAutoGainControl:!1,googNoiseSuppression:!1,googHighpassFilter:!1}},this.state="inactive",this.eventTarget=document.createDocumentFragment(),this.monitorNode=this.audioContext.createGain(),this.setMonitorGain(this.config.monitorGain),this.scriptProcessorNode=this.audioContext.createScriptProcessor(this.config.bufferLength,this.config.numberOfChannels,this.config.numberOfChannels),this.scriptProcessorNode.onaudioprocess=function(e){t.encodeBuffers(e.inputBuffer)}};Recorder.isRecordingSupported=function(){return window.AudioContext&&navigator.getUserMedia},Recorder.prototype.addEventListener=function(e,t,o){this.eventTarget.addEventListener(e,t,o)},Recorder.prototype.audioContext=new window.AudioContext,Recorder.prototype.clearStream=function(){this.stream&&(this.stream.getTracks?this.stream.getTracks().forEach(function(e){e.stop()}):this.stream.stop(),delete this.stream)},Recorder.prototype.encodeBuffers=function(e){if("recording"===this.state){for(var t=[],o=0;o<e.numberOfChannels;o++)t[o]=e.getChannelData(o);this.encoder.postMessage({command:"encode",buffers:t})}},Recorder.prototype.initStream=function(){if(this.stream)return void this.eventTarget.dispatchEvent(new Event("streamReady"));var e=this;navigator.getUserMedia({audio:this.config.streamOptions},function(t){e.stream=t,e.sourceNode=e.audioContext.createMediaStreamSource(t),e.sourceNode.connect(e.scriptProcessorNode),e.sourceNode.connect(e.monitorNode),e.eventTarget.dispatchEvent(new Event("streamReady"))},function(t){e.eventTarget.dispatchEvent(new ErrorEvent("streamError",{error:t}))})},Recorder.prototype.pause=function(){"recording"===this.state&&(this.state="paused",this.eventTarget.dispatchEvent(new Event("pause")))},Recorder.prototype.removeEventListener=function(e,t,o){this.eventTarget.removeEventListener(e,t,o)},Recorder.prototype.resume=function(){"paused"===this.state&&(this.state="recording",this.eventTarget.dispatchEvent(new Event("resume")))},Recorder.prototype.setMonitorGain=function(e){this.monitorNode.gain.value=e},Recorder.prototype.start=function(){if("inactive"===this.state&&this.stream){var e=this;this.encoder=new Worker(this.config.encoderPath),this.config.streamPages?this.encoder.addEventListener("message",function(t){e.streamPage(t.data)}):(this.recordedPages=[],this.totalLength=0,this.encoder.addEventListener("message",function(t){e.storePage(t.data)})),this.encodeBuffers=function(){delete this.encodeBuffers},this.state="recording",this.monitorNode.connect(this.audioContext.destination),this.scriptProcessorNode.connect(this.audioContext.destination),this.eventTarget.dispatchEvent(new Event("start")),this.encoder.postMessage(this.config)}},Recorder.prototype.stop=function(){"inactive"!==this.state&&(this.state="inactive",this.monitorNode.disconnect(),this.scriptProcessorNode.disconnect(),this.config.leaveStreamOpen||this.clearStream(),this.encoder.postMessage({command:"done"}))},Recorder.prototype.storePage=function(e){if(this.recordedPages.push(e),this.totalLength+=e.length,4&e[5]){for(var t=new Uint8Array(this.totalLength),o=0,n=0;n<this.recordedPages.length;n++)t.set(this.recordedPages[n],o),o+=this.recordedPages[n].length;this.eventTarget.dispatchEvent(new CustomEvent("dataAvailable",{detail:t})),this.recordedPages=[],this.eventTarget.dispatchEvent(new Event("stop"))}},Recorder.prototype.streamPage=function(e){this.eventTarget.dispatchEvent(new CustomEvent("dataAvailable",{detail:e})),4&e[5]&&this.eventTarget.dispatchEvent(new Event("stop"))};

    var recorder;

    start.addEventListener( "click", function(){
      App.recorder.perform("receive", {command: 'start'});
    });
    stopButton.addEventListener( "click", function(){
      App.recorder.perform("receive", {command: 'stop'});
    });
    init.addEventListener( "click", function(){
      App.recorder.perform("receive", {command: 'init'});
    });

    pause.addEventListener( "click", function(){ recorder.pause(); });
    resume.addEventListener( "click", function(){ recorder.resume(); });

    var startEvent = new Event('startRecording');
    var stopEvent = new Event('stopRecording');
    var initEvent = new Event('initRecording');
    document.addEventListener('startRecording', function(e) {
      recorder.start();
    });
    document.addEventListener('stopRecording', function(e) {
      recorder.stop();
    });
    document.addEventListener('initRecording', function(e) {
      initRecording();
    });


    function initRecording() {

      if (!Recorder.isRecordingSupported()) {
        return screenLogger("Recording features are not supported in your browser.");
      }

      recorder = new Recorder({
        // Settings like bitrate or sampleRate would go here
        encoderPath: "/encoderWorker.min.js"
      });

      recorder.addEventListener( "start", function(e){
        screenLogger('Recorder is started');
        init.disabled = start.disabled = resume.disabled = true;
        pause.disabled = stopButton.disabled = false;
      });

      recorder.addEventListener( "stop", function(e){
        screenLogger('Recorder is stopped');
        init.disabled = false;
        pause.disabled = resume.disabled = stopButton.disabled = start.disabled = true;
      });

      recorder.addEventListener( "pause", function(e){
        screenLogger('Recorder is paused');
        init.disabled = pause.disabled = start.disabled = true;
        resume.disabled = stopButton.disabled = false;
      });

      recorder.addEventListener( "resume", function(e){
        screenLogger('Recorder is resuming');
        init.disabled = start.disabled = resume.disabled = true;
        pause.disabled = stopButton.disabled = false;
      });

      recorder.addEventListener( "streamError", function(e){
        screenLogger('Error encountered: ' + e.error.name );
      });

      recorder.addEventListener( "streamReady", function(e){
        init.disabled = pause.disabled = resume.disabled = stopButton.disabled = true;
        start.disabled = false;
        screenLogger('Audio stream is ready.');
      });

      recorder.addEventListener( "dataAvailable", function(e){
        var dataBlob = new Blob( [e.detail], { type: 'audio/ogg' } );
        dataBlob.name = "__" + $('#current_user').text() + '__' + new Date().toISOString() + ".ogg";
        var fileName = dataBlob.name;
        var url = URL.createObjectURL( dataBlob );
        var blobUrl = url
        var audio = document.createElement('audio');
        audio.controls = true;
        audio.src = url;

        var link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.innerHTML = link.download;

        var li = document.createElement('li');
        li.appendChild(link);
        li.appendChild(audio);

        recordingslist.appendChild(li);

        $('#episode_track').fileupload({
          url: $('.directUpload').data('url'),
          type:            'POST',
          autoUpload:       true,
          formData: $('.directUpload').data('form-data'),
          paramName: 'file',
          dataType: 'XML',
          replaceFileInput: false
        });
        $('#episode_track').fileupload('send', {
          files: [dataBlob],
        })
        .done(function(response){
          var buckObjectUrl = $($(response).children().children()[0]).text();
          buckObjectUrl = buckObjectUrl.match(/\wavecastr(.*)/)[1]
          console.log(buckObjectUrl);
          console.log(episodeId);

          var newTrackData = {episode_id: episodeId, s3_string: buckObjectUrl };
          console.log(newTrackData);
          $.ajax({
            url: "/tracks",
            method: "POST",
            data: newTrackData
          })
          .done(function(response){
            console.log("success");
          })
          .fail(function(response){
            console.log("fail");
          })
        })
      });
      recorder.initStream();
    }

    function screenLogger(text, data) {
      log.innerHTML += "\n" + text + " " + (data || '');
    }
