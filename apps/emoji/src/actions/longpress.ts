// https://svelte.dev/tutorial/adding-parameters-to-actions
const isTouchScreen = 'ontouchstart' in window;

export function longpress(node, duration: number) {
  let timer;
  let isLong = false;

  function resetState() {
    isLong = false;
    clearTimeout(timer);
  }

  const handlePressdown = () => {
    timer = setTimeout(() => {
      isLong = true;
      node.dispatchEvent(
        new CustomEvent('longpress')
      );
    }, duration);
  };

  const handlePressup = () => {
    // Mouse "click" envet always fires regardless of the duration,
    // so I emulates a "shortpress" event.
    if (!isLong && !isTouchScreen) {
      node.dispatchEvent(
        new CustomEvent('shortpress')
      );
    }
    resetState();
  };

  if (isTouchScreen) {
    // Touch devices can emulate "click" event well
    node.addEventListener('click', () => node.dispatchEvent(new CustomEvent('shortpress')));
    node.addEventListener('touchstart', handlePressdown);
    node.addEventListener('touchend', handlePressup);
  } else {
    node.addEventListener('mousedown', handlePressdown);
    node.addEventListener('mouseup', handlePressup);
  }

  return {
    destroy() {
      node.removeEventListener('mousedown', handlePressdown);
      node.removeEventListener('mouseup', handlePressup);
      node.addEventListener('touchstart', handlePressdown);
      node.addEventListener('touchend', handlePressup);
    }
  };
}
