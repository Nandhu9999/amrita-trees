const zipperOpenSnd0 = new Audio(
  "https://cdn.discordapp.com/attachments/1055426492659675167/1055434142420054016/zipper_open.mp3"
);
const zipperCloseSnd0 = new Audio(
  "https://cdn.discordapp.com/attachments/1055426492659675167/1055434191090761798/zipper_close.mp3"
);

function addMarkerTag() {
  console.log("add new marker");
  $("#marker_prompt").classList.add("active");
  if ($("#soundCB").checked) zipperOpenSnd0.play();

  if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
    console.log("camera exists");
  } else {
    console.log("camera does not exists");
    return;
  }

  const videoElement = document.getElementById("camera-feed");
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Access the user's camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(function (stream) {
        // Attach the camera stream to the video element
        videoElement.srcObject = stream;
      })
      .catch(function (error) {
        console.error("Error accessing camera:", error);
      });
  } else {
    console.error("WebRTC is not supported in this browser.");
  }
}

function closeMarkerPrompt() {
  $("#marker_prompt").classList.remove("active");
  if ($("#soundCB").checked) zipperCloseSnd0.play();

  const videoElement = document.getElementById("camera-feed");
  const mediaStream = videoElement.srcObject;

  if (mediaStream) {
    // Stop all tracks in the media stream
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });

    // Clear the video element's srcObject to stop displaying the stream
    videoElement.srcObject = null;
  } else {
    console.error("No media stream to stop.");
  }
}
