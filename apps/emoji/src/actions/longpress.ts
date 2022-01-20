// https://svelte.dev/tutorial/adding-parameters-to-actions
const hasTouchScreen = 'ontouchstart' in window;

export function longpress(node: HTMLElement, duration: number) {
  let timer;
  let pressing = false;
  let isLong = false;

  function resetState(e?: Event) {
    isLong = false;
    pressing = false;
    clearTimeout(timer);
  }

  function handlePressdown(e?: Event) {
    if (pressing) { return } else { pressing = true }

    timer = setTimeout(() => {
      isLong = true;
      node.dispatchEvent(
        new CustomEvent('longpress')
      );
      resetState();
    }, duration);
  };

  function handlePressup(e?: Event) {
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
  node.addEventListener('mousemove', resetState);
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
      node.removeEventListener('mousemove', resetState);
      if (hasTouchScreen) {
        node.removeEventListener('touchstart', handlePressdown);
        node.removeEventListener('touchend', handlePressup);
        node.removeEventListener('touchmove', resetState);
        node.removeEventListener('touchcancel', resetState);
      }
    }
  };
}
