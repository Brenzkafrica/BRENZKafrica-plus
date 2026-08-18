const modal=document.getElementById('modal'), title=document.getElementById('modalTitle'), text=document.getElementById('modalText');
function openSubscribe(){title.textContent='Join BRENZKafrica Plus';text.textContent='Subscribe to unlock premium episodes and exclusive content.';modal.style.display='flex'}
function openLogin(){title.textContent='Sign in';text.textContent='Account authentication will be connected in the next build.';modal.style.display='flex'}
function watch(name){title.textContent=name;text.textContent='This is a premium title. Subscribe to BRENZKafrica Plus to watch the full episode.';modal.style.display='flex'}
function demoSubscribe(){alert('Demo subscription activated. Real payment + account access will be connected before launch.');closeModal()}
function closeModal(){modal.style.display='none'}
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
