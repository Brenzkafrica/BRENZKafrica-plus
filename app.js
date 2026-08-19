const modal = document.getElementById('modal');
const title = document.getElementById('modalTitle');
const text = document.getElementById('modalText');
const video = document.getElementById('videoPlayer');

const VIDEO_URL = 'https://fcddfmfpzbilagphpsxs.supabase.co/storage/v1/object/public/BRENZKafrica%20series%20episode%201/BRENZKafrica%20cinema%20ad%20.mov';

function openSubscribe() {
  title.textContent = 'Join BRENZKafrica Plus';
  text.textContent = 'Subscribe to unlock premium episodes and exclusive content.';
  video.style.display = 'none';
  video.pause();
  modal.style.display = 'flex';
}

function openLogin() {
  title.textContent = 'Sign in';
  text.textContent = 'Account authentication will be connected in the next build.';
  video.style.display = 'none';
  video.pause();
  modal.style.display = 'flex';
}

function watch(name) {
  title.textContent = name;
  text.textContent = 'Now playing on BRENZKafrica Plus.';
  video.src = VIDEO_URL;
  video.style.display = 'block';
  modal.style.display = 'flex';
}

function demoSubscribe() {
  alert('Demo subscription activated. Real payment + account access will be connected before launch.');
  closeModal();
}

function closeModal() {
  video.pause();
  video.removeAttribute('src');
  video.load();
  modal.style.display = 'none';
}

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});
