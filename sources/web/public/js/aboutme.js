document.addEventListener('mousemove', (event) => {
  const { clientX, clientY } = event;
  const { innerWidth, innerHeight } = window;

  const posX = (clientX / innerWidth) * 100;
  const posY = (clientY / innerHeight) * 100;

  document.querySelector('.banner').style.backgroundPosition = `${posX}% ${posY}%`;
});

window.addEventListener('load', function () {
  const loadingScreen = document.getElementById('loader');

  setTimeout(() => {
    loadingScreen.style.display = 'none';
    loadingScreen.style.zIndex = -1000
  }, 2100);
});