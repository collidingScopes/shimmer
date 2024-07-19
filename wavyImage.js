/*
To do list:
Floating options menu -- sticky at bottom of page / can be hidden?
Site OG properties
File README / github description
New font for site
Name -- "Woven Waves" instead?
*/

var originalImg = document.getElementById("originalImg");

//image upload variables
var animation = document.getElementById("animation");
var imageInput = document.getElementById('imageInput');
imageInput.addEventListener('change', readSourceImage);
var isImageLoaded = false;
var imageContainer = document.getElementById('imageContainer');

var actualWidth = 800; //dimensions of default image
var actualHeight = 900;

var scaledWidth = 800;
var scaledHeight = 900;
var widthScalingRatio = 1;
var maxImageWidth = 1000; //can be tweaked
animation.width = scaledWidth;
animation.height = scaledHeight;

var animationInterval;
var playAnimationToggle = false;

//user inputs
var speedInput = document.getElementById("speedInput");
speedInput.addEventListener('change',getUserInputs);
var speedInputValue;

var xFreqInput = document.getElementById("xFreqInput");
xFreqInput.addEventListener('change',setOscSpeed);
var xFreqInputValue;

var yFreqInput = document.getElementById("yFreqInput");
yFreqInput.addEventListener('change',setOscSpeed);
var yFreqInputValue;

var xAmpInput = document.getElementById("xAmpInput");
xAmpInput.addEventListener('change',getUserInputs);
var xAmpInputValue;

var yAmpInput = document.getElementById("yAmpInput");
yAmpInput.addEventListener('change',getUserInputs);
var yAmpInputValue;

var xFreqValue;
var yFreqValue;


//detect user browser
var ua = navigator.userAgent;
var isSafari = false;
var isIOS = false;
var isAndroid = false;
if(ua.includes("Safari")){
    isSafari = true;
}
if(ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iPod")){
    isIOS = true;
}
if(ua.includes("Android")){
    isAndroid = true;
}
console.log("isSafari: "+isSafari+", isIOS: "+isIOS+", isAndroid: "+isAndroid);

//video recording function
var recordBtn = document.getElementById("recordVideoButton");
var recording = false;
var mediaRecorder;
var recordedChunks;
recordBtn.addEventListener('click', chooseRecordingFunction);
var finishedBlob;
var recordingMessageDiv = document.getElementById("videoRecordingMessageDiv");
var fps = 15;

//video duration input
var videoDurationInput = document.getElementById("videoDurationInput");
videoDurationInput.addEventListener('change', getUserInputs);
var videoDuration = Math.max(1,Math.min(120,Number(videoDurationInput.value)));

//main method
getUserInputs();
setOscSpeed();
setTimeout(createAnimation, 2000);

function getUserInputs(){
    console.log("get user inputs");
    speedInputValue = Number(speedInput.value) /15000;
    videoDuration = Math.max(1,Math.min(120,Number(videoDurationInput.value)));
    xAmpInputValue = Number(xAmpInput.value);
    yAmpInputValue = Number(yAmpInput.value);
}

function setOscSpeed(){
    xFreqValue = Number(xFreqInput.value) / 200;
    yFreqValue = Number(yFreqInput.value) / 200;
    
    // osc. for vert
    o1 = new Osc(yFreqValue);
    o2 = new Osc(yFreqValue);
    o3 = new Osc(yFreqValue);
    
    // osc. for hori
    o4 = new Osc(xFreqValue);
    o5 = new Osc(xFreqValue);
    o6 = new Osc(xFreqValue);
    
}

//Source: https://stackoverflow.com/questions/29586754/how-can-i-recreate-this-wavy-image-effect
function createAnimation() {
    playAnimationToggle = true;

    var ctx = animation.getContext("2d");
    var w = scaledWidth;
    var h = scaledHeight;

    //ctx.drawImage(this, 0, 0);
    //ctx.drawImage(originalImg, 0, 0);

    // source grid lines
    x0 = 0, x1 = w * 0.25, x2 = w * 0.5, x3 = w * 0.75, x4 = w,
    y0 = 0, y1 = h * 0.25, y2 = h * 0.5, y3 = h * 0.75, y4 = h;
    
    var maxXShift = scaledHeight*0.25;
    var maxYShift = scaledWidth*0.25;

    // cache source widths/heights
    sw0 = x1, sw1 = x2 - x1, sw2 = x3 - x2, sw3 = x4 - x3,
    sh0 = y1, sh1 = y2 - y1, sh2 = y3 - y2, sh3 = y4 - y3,

    vcanvas = document.createElement("canvas"),  // off-screen canvas for 2. pass
    vctx = vcanvas.getContext("2d");

    vcanvas.width = w; vcanvas.height = h;           // set to same size as main canvas
    
    function loop() {
        ctx.clearRect(0, 0, w, h);
        
        for (var y = 0; y < h; y++) {

            // segment positions for Y-waves
            var lx1 = x1 + o1.current(y * 0.2) * maxYShift * yAmpInputValue/300,
                lx2 = x2 + o2.current(y * 0.26) * maxYShift * yAmpInputValue/300,
                lx3 = x3 + o3.current(y * 0.22) * maxYShift * yAmpInputValue/300,

                // segment widths
                w0 = lx1,
                w1 = lx2 - lx1,
                w2 = lx3 - lx2,
                w3 =  x4 - lx3;

            // draw image lines
            ctx.drawImage(originalImg, x0, y, sw0, 1, 0        , y, w0      , 1);
            ctx.drawImage(originalImg, x1, y, sw1, 1, lx1 - 0.5, y, w1 + 0.5, 1);
            ctx.drawImage(originalImg, x2, y, sw2, 1, lx2 - 0.5, y, w2 + 0.5, 1);
            ctx.drawImage(originalImg, x3, y, sw3, 1, lx3 - 0.5, y, w3 + 0.5, 1);

        }

        // pass 1 done, copy to off-screen canvas:
        vctx.clearRect(0, 0, w, h);    // clear off-screen canvas (only if alpha)
        vctx.drawImage(animation, 0, 0);
        ctx.clearRect(0, 0, w, h);     // clear main (onlyif alpha)
        
        for (var x = 0; x < w; x++) {
            // segment positions for X-waves
            var ly1 = y1 + o4.current(x * 0.32)  * maxXShift * xAmpInputValue/300,
                ly2 = y2 + o5.current(x * 0.3)  * maxXShift * xAmpInputValue/300,
                ly3 = y3 + o6.current(x * 0.4) *  maxXShift * xAmpInputValue/300;

            ctx.drawImage(vcanvas, x, y0, 1, sh0, x, 0        , 1, ly1);
            ctx.drawImage(vcanvas, x, y1, 1, sh1, x, ly1 - 0.5, 1, ly2 - ly1 + 0.5);
            ctx.drawImage(vcanvas, x, y2, 1, sh2, x, ly2 - 0.5, 1, ly3 - ly2 + 0.5);
            ctx.drawImage(vcanvas, x, y3, 1, sh3, x, ly3 - 0.5, 1,  y4 - ly3 + 0.5);
        }
        
        //requestAnimationFrame(loop);
    }

    animationInterval = setInterval(loop,1000/fps);

}

function Osc(speed) {

  var frame = 0;

  this.current = function(x) {
    frame += speedInputValue * speed;
    return Math.sin(frame + x * speed * 10);
  };
}


//read and accept user input image
function readSourceImage(){

    //remove any existing images
    while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
    }

    if(playAnimationToggle == true){
        clearInterval(animationInterval);
    }
        
    //read image file      
    var file = imageInput.files[0];
    var reader = new FileReader();
    reader.onload = (event) => {
        var imageData = event.target.result;
        var image = new Image();
        image.src = imageData;
        image.onload = () => {
          
            actualWidth = image.width;
            actualHeight = image.height;

            //image scaling
            if(actualWidth > maxImageWidth){
                scaledWidth = maxImageWidth;
                widthScalingRatio = scaledWidth / actualWidth;
                scaledHeight = actualHeight * widthScalingRatio;
            } else{
                scaledWidth = actualWidth;
                widthScalingRatio = 1;
                scaledHeight = actualHeight;
            }

            animation.width = scaledWidth;
            animation.height = scaledHeight;

            //resize the src variable of the original image
            var newCanvas = document.createElement('canvas');
            newCanvas.width = Math.floor(scaledWidth/2)*2; //video encoder doesn't accept odd numbers
            newCanvas.height = Math.floor(scaledHeight/8)*8; //video encoder wants a multiple of 8
            var ctx = newCanvas.getContext('2d');
            ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
        
            var resizedImgSrc = newCanvas.toDataURL();
    
            //draw the resized image onto the page
            originalImg = document.createElement('img');
            originalImg.setAttribute("id", "originalImg");
            originalImg.src = resizedImgSrc;
            originalImg.width = scaledWidth;
            originalImg.height = scaledHeight;
            imageContainer.appendChild(originalImg);

            createAnimation();
            animation.scrollIntoView({ behavior: "smooth" });
   
        };
    };
      
    reader.readAsDataURL(file);
    isImageLoaded = true;
    
}

//HELPER FUNCTIONS BELOW
//take screenshot of canvas at current position, export as png

//start or stop animation
function pausePlayAnimation(){
    if(playAnimationToggle == true){
        playAnimationToggle = false;
        clearInterval(animationInterval);
    } else {
        playAnimationToggle = true;
        createAnimation();
    }
}

function saveImage(){
    const link = document.createElement('a');
    link.href = animation.toDataURL();

    const date = new Date();
    const filename = `shimmer_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.png`;
    link.download = filename;
    link.click();
}

//shortcut hotkey presses
document.addEventListener('keydown', function(event) {
    if (event.key === 'p') {
        pausePlayAnimation();
    } else if (event.key === 's') {
        saveImage();
    }  else if (event.key === 'r') {
        recordVideoMuxer();
    }
});

function chooseRecordingFunction(){
    if(isIOS || isAndroid){
        startMobileRecording();
    }else {
        recordVideoMuxer();
    }
}

//record html canvas element and export as mp4 video
//source: https://devtails.xyz/adam/how-to-save-html-canvas-to-mp4-using-web-codecs-api
async function recordVideoMuxer() {
    console.log("start muxer video recording");
    var videoWidth = Math.floor(animation.width/2)*2;
    var videoHeight = Math.floor(animation.height/8)*8; //force a number which is divisible by 8
    console.log("Video dimensions: "+videoWidth+", "+videoHeight);

    //display user message
    recordingMessageCountdown(videoDuration);
    recordingMessageDiv.classList.remove("hidden");
    
    var recordVideoState = true;
    const ctx = animation.getContext("2d", {
      // This forces the use of a software (instead of hardware accelerated) 2D canvas
      // This isn't necessary, but produces quicker results
      willReadFrequently: true,
      // Desynchronizes the canvas paint cycle from the event loop
      // Should be less necessary with OffscreenCanvas, but with a real canvas you will want this
      desynchronized: true,
    });
  
    let muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
  
      video: {
        // If you change this, make sure to change the VideoEncoder codec as well
        codec: "avc",
        width: videoWidth,
        height: videoHeight,
      },
  
      // mp4-muxer docs claim you should always use this with ArrayBufferTarget
      fastStart: "in-memory",
    });
  
    let videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => console.error(e),
    });
  
    // This codec should work in most browsers
    // See https://dmnsgn.github.io/media-codecs for list of codecs and see if your browser supports
    videoEncoder.configure({
      codec: "avc1.42003e",
      width: videoWidth,
      height: videoHeight,
      bitrate: 7_000_000,
      bitrateMode: "constant",
    });
    //NEW codec: "avc1.42003e",
    //ORIGINAL codec: "avc1.42001f",

    var recordVideoState = true;
    var frameNumber = 0;
    setTimeout(finalizeVideo,1000*videoDuration+200); //finish and export video after x seconds
    
    //take a snapshot of the canvas every x miliseconds and encode to video
    var videoRecordInterval = setInterval(
        function(){
            if(recordVideoState == true){
                renderCanvasToVideoFrameAndEncode({
                    animation,
                    videoEncoder,
                    frameNumber,
                    fps
                })
                frameNumber++;
            }
        } , 1000/fps);

    //finish and export video after x seconds
    async function finalizeVideo(){
        console.log("finalize muxer video");
        recordVideoState = false;
        clearInterval(videoRecordInterval);
        // Forces all pending encodes to complete
        await videoEncoder.flush();
        muxer.finalize();
        let buffer = muxer.target.buffer;
        finishedBlob = new Blob([buffer]); 
        downloadBlob(new Blob([buffer]));

        //hide user message
        recordingMessageDiv.classList.add("hidden");

    }
}
  
async function renderCanvasToVideoFrameAndEncode({
    canvas,
    videoEncoder,
    frameNumber,
    fps,
}) {
    let frame = new VideoFrame(animation, {
        // Equally spaces frames out depending on frames per second
        timestamp: (frameNumber * 1e6) / fps,
    });

    // The encode() method of the VideoEncoder interface asynchronously encodes a VideoFrame
    videoEncoder.encode(frame);

    // The close() method of the VideoFrame interface clears all states and releases the reference to the media resource.
    frame.close();
}

function downloadBlob() {
    console.log("download video");
    let url = window.URL.createObjectURL(finishedBlob);
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    const date = new Date();
    const filename = `shimmer_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.mp4`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}

//record and download videos on mobile devices
function startMobileRecording(){
    
    var stream = animation.captureStream(fps);
    var recorder = new MediaRecorder(stream, { 'type': 'video/mp4' });
    recorder.addEventListener('dataavailable', finishMobileRecording);

    console.log("start simple video recording");
    console.log("Video dimensions: "+animation.width+", "+animation.height);

    //display user message
    recordingMessageCountdown(videoDuration);
    recordingMessageDiv.classList.remove("hidden");
    
    recorder.start();

    setTimeout(function() {
        recorder.stop();
    }, 1000*videoDuration+200);
}

function finishMobileRecording(e) {
    setTimeout(function(){
        console.log("finish simple video recording");
        var videoData = [ e.data ];
        finishedBlob = new Blob(videoData, { 'type': 'video/mp4' });
        downloadBlob(finishedBlob);
        
        //hide user message
        recordingMessageDiv.classList.add("hidden");

    },500);

}

function recordingMessageCountdown(duration){

    var secondsLeft = Math.ceil(duration);

    var countdownInterval = setInterval(function(){
        secondsLeft--;
        recordingMessageDiv.innerHTML = 
        "Video recording underway. The video will be saved to your downloads folder in <span id=\"secondsLeft\">"+secondsLeft+"</span> seconds.<br><br>This feature can be a bit buggy on Mobile -- if it doesn't work, please try on Desktop instead.";  
        
        if(secondsLeft <= 0){
            console.log("clear countdown interval");
            clearInterval(countdownInterval);
        }
    },1000);
    
}