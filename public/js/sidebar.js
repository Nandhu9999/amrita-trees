const swingSound = new Audio(
  "https://cdn.discordapp.com/attachments/1055426492659675167/1055608624623403029/swing.wav"
);
const buttonSound = new Audio(
  "https://cdn.discordapp.com/attachments/1055426492659675167/1055607882982375504/button.wav"
);

function toggleSidebar() {
  $("#sidebar").classList.toggle("active");
  if ($("#soundCB").checked) swingSound.play();
  if ($("#sidebar").classList.contains("active")) {
    $("#overlay").style.display = "block";
  } else {
    $("#overlay").style.display = "none";
  }
}

function clickedOverlay(e) {
  $("#overlay").style.display = "none";
  $("#sidebar").classList.remove("active");
  // $('#invbar').classList.remove('active');
}

function toggleSwitchClicked() {
  if ($("#soundCB").checked) buttonSound.play();
}
