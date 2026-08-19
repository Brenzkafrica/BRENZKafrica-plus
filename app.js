// ========================================
// BRENZKAFRICA PLUS
// VIDEO PLAYER
// ========================================
const VIDEO_URL =
  "https://fcddfmfpzbilagphpsxs.supabase.co/storage/v1/object/public/BRENZKafrica%20series%20episode%201/BRENZKafrica%20cinema.jpeg";
// Find player elements
const video = document.querySelector("video");
const modal = document.querySelector(".modal");
const title = document.querySelector(".modal h2");
const text = document.querySelector(".modal p");
// ========================================
// WATCH VIDEO
// ========================================
function watch(name = "BRENZKafrica Cinema") {
  if (!video) {
    console.error("Video element not found.");
    return;
  }
  // Set video source
  video.src = VIDEO_URL;
  // Load the new source
  video.load();
  // Open modal if available
  if (modal) {
    modal.style.display = "flex";
  }
  // Update title
  if (title) {
    title.textContent = name;
  }
  // Update description
  if (text) {
    text.textContent = "Now playing on BRENZKafrica Plus.";
  }
  // Try to start playback
  video
    .play()
    .then(() => {
      console.log("BRENZKafrica Plus video started.");
    })
    .catch((error) => {
      console.log(
        "Playback requires the user to press Play.",
        error
      );
    });
}
// ========================================
// CLOSE PLAYER
// ========================================
function closePlayer() {
  if (!video) return;
  video.pause();
  video.removeAttribute("src");
  video.load();
  if (modal) {
    modal.style.display = "none";
  }
}
// ========================================
// CLOSE WHEN CLICKING OUTSIDE CARD
// ========================================
if (modal) {
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closePlayer();
    }
  });
}
// ========================================
// ESCAPE KEY
// ========================================
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closePlayer();
  }
});
// ========================================
// GLOBAL FUNCTIONS
// ========================================
window.watch = watch;
window.closePlayer = closePlayer;
