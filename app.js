const videoUrl = "https://fcddfmfpzbilagphpsxs.supabase.co/storage/v1/object/sign/BRENZKafrica%20series%20episode%201/BRENZKafrica%20cinema%20ad%20.mov?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjAxZGNkNy0wZjI0LTQzOGEtYTA4Zi03ZWIzN2VhNzllZjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJCUkVOWkthZnJpY2Egc2VyaWVzIGVwaXNvZGUgMS9CUkVOWkthZnJpY2EgY2luZW1hIGFkIC5tb3YiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg3MDQzMzgxLCJleHAiOjE5NDQ3MjMzODF9.sWkXlv9zgQkH86rGdbilyhfvU28mMFt-6tgPXG3z1T0";

function watch(name) {
  title.textContent = name;
  text.textContent = "Now playing on BRENZKafrica Plus.";

  video.src = videoUrl;
  video.style.display = "block";
  video.controls = true;
  video.load();
  video.play();
}
