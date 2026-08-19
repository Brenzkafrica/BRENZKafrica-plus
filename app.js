const modal = document.getElementById('modal');
const title = document.getElementById('modalTitle');
const text = document.getElementById('modalText');

const VIDEO_URL =
  'https://fcddfmfpzbilagphpsxs.supabase.co/storage/v1/object/public/BRENZKafrica%20series%20episode%201/BRENZKafrica%20cinema%20ad%20.mov';

const THUMBNAIL_URL =
  'https://fcddfmfpzbilagphpsxs.supabase.co/storage/v1/object/public/BRENZKafrica%20series%20episode%201/BRENZKafrica%20cinema.jpeg';

let videoPlayer = null;

function openSubscribe() {
  title.textContent = 'Join BRENZKafrica Plus';
  text.textContent =
    'Subscribe to unlock premium episodes and exclusive content.';

  removeVideo();
  modal.style.display = 'flex';
}

function openLogin() {
  title.textContent = 'Sign in';
  text.textContent =
    'Account authentication will be connected in the next build.';

  removeVideo();
  modal.style.display = 'flex';
}

function watch(name) {
  title.textContent = name;
  text.textContent = 'Now playing on BRENZKafrica Plus.';

  if (!videoPlayer) {
    videoPlayer = document.createElement('video');

    videoPlayer.controls = true;
    videoPlayer.playsInline = true;

    videoPlayer.style.width = '100%';
    videoPlayer.style.maxHeight = '60vh';
    videoPlayer.style.borderRadius = '10px';
    videoPlayer.style.marginTop = '15px';
    videoPlayer.style.background = '#000';

    const card = document.querySelector('#modal .card');
    const price = document.querySelector('.price');

    card.insertBefore(videoPlayer, price);
  }

  videoPlayer.src = VIDEO_URL;
  videoPlayer.poster = THUMBNAIL_URL;
  videoPlayer.style.display = 'block';

  modal.style.display = 'flex';

  videoPlayer.load();

  videoPlayer.play().catch(() => {
    // Some browsers require the user to press Play manually.
  });
}

function removeVideo() {
  if (videoPlayer) {
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.removeAttribute('poster');
    videoPlayer.load();
    videoPlayer.style.display = 'none';
  }
}

function demoSubscribe() {
  alert(
    'Demo subscription activated. Real payment + account access will be connected before launch.'
  );

  closeModal();
}

function closeModal() {
  removeVideo();
  modal.style.display = 'none';
}

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});
