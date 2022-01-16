// https://svelte.dev/tutorial/adding-parameters-to-actions
const hasTouchScreen = 'ontouchstart' in window;

export function longpress(node, duration: number) {
  let timer;
  let pressing = false;
  let isLong = false;

  function resetState() {
    isLong = false;
    pressing = false;
    clearTimeout(timer);
  }

  const handlePressdown = e => {
    if (pressing) { return } else { pressing = true }

    timer = setTimeout(() => {
      isLong = true;
      node.dispatchEvent(
        new CustomEvent('longpress')
      );
      resetState();
    }, duration);
  };

  const handlePressup = e => {
    if (pressing) {
      // This is necessary, or it may caused the newly-opened
      // smui-dialog closed immediately.
      e.preventDefault();
    }

    if (!pressing) { return }

    if (!isLong) {
      node.dispatchEvent(
        new CustomEvent('shortpress')
      );
    }
    resetState();
  };

  node.addEventListener('mousedown', handlePressdown);
  node.addEventListener('mouseup', handlePressup);
  if (hasTouchScreen) {
    node.addEventListener('touchstart', handlePressdown);
    node.addEventListener('touchend', handlePressup);
    node.addEventListener('touchmove', resetState);
    node.addEventListener('touchcancel', resetState);
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
