(() => {
  const nextButton = document.querySelector('.hidden-scene-btn');
  if (!nextButton) return;

  nextButton.addEventListener('click', () => {
    const nextScene = nextButton.dataset.nextScene;
    if (nextScene) window.location.href = nextScene;
  });
})();
