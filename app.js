// ========================================
// BRENZKAFRICA PLUS
// VIDEO PLAYER
// ========================================
const VIDEO_URL =
  "https://fcddfmfpzbilagphpsxs.supabase.co/storage/v1/object/sign/BRENZKafrica%20series%20episode%201/BRENZKafrica%20cinema%20ad%20.mov?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjAxZGNkNy0wZjI0LTQzOGEtYTA4Zi03ZWIzN2VhNzllZjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJCUkVOWkthZnJpY2Egc2VyaWVzIGVwaXNvZGUgMS9CUkVOWkthZnJpY2EgY2luZW1hIGFkIC5tb3YiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg3MDQzMzgxLCJleHAiOjE5NDQ3MjMzODF9.sWkXlv9zgQkH86rGdbilyhfvU28mMFt-6tgPXG3z1T0";
// ========================================
// ELEMENTS
// ========================================
const video = document.querySelector("video");
const modal = document.querySelector(".modal");
const title = document.querySelector(".modal h2");
const text = document.querySelector(".modal p");
// ========================================
// WATCH
// ========================================
function watch(name = "BRENZKafrica Cinema") {
  if (!video) {
    console.error("Video element was not found.");
    return;
  }
  // Set the actual video
  video.src = VIDEO_URL;
  // Make sure browser reloads the source
  video.load();
  // Show player
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
  // Start playback after user interaction
  video.play()
    .then(() => {
      console.log("BRENZKafrica Plus video is playing.");
    })
    .catch((error) => {
      console.log("Browser requires Play button:", error);
    });
}
// ========================================
// CLOSE PLAYER
// ========================================
function closePlayer() {
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
  if (modal) {
    modal.style.display = "none";
  }
}
// ========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ========================================
if (modal) {
  modal.addEventListener("click", function(event) {
    if (event.target === modal) {
      closePlayer();
    }
  });
}
// ========================================
// ESC KEY
// ========================================
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    closePlayer();
  }
});
// ========================================
// GLOBAL FUNCTIONS
// ========================================
window.watch = watch;
window.closePlayer = closePlayer;
