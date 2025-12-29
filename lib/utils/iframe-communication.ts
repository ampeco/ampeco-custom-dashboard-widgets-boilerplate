/**
 * iframe Communication Utilities
 *
 * Handles communication between the widget and AMPECO parent frame
 * for auto-height adjustment and theme changes
 */

/**
 * Sends height update to parent frame
 * @param height Height in pixels
 * @param origin Allowed origin (AMPECO tenant URL)
 */
export function sendHeightUpdate(height: number, origin: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.parent.postMessage(
    {
      type: "resize",
      height: height,
    },
    origin
  );
}

/**
 * Automatically adjusts iframe height based on content
 * @param origin Allowed origin (AMPECO tenant URL)
 */
export function autoAdjustHeight(origin: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const updateHeight = () => {
    const height = document.body.scrollHeight;
    sendHeightUpdate(height, origin);
  };

  // Update on load
  if (document.readyState === "complete") {
    updateHeight();
  } else {
    window.addEventListener("load", updateHeight);
  }

  // Update on resize
  window.addEventListener("resize", updateHeight);

  // Update on content changes (MutationObserver)
  const observer = new MutationObserver(updateHeight);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });
}

/**
 * Listens for messages from parent frame
 * @param callback Callback function for received messages
 * @param origin Allowed origin (AMPECO tenant URL)
 */
export function listenForParentMessages(
  callback: (data: unknown) => void,
  origin: string
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (event.origin !== origin) {
      return;
    }

    callback(event.data);
  };

  window.addEventListener("message", handler);

  // Return cleanup function
  return () => {
    window.removeEventListener("message", handler);
  };
}

/**
 * Sends action message to parent frame
 * @param action Action type
 * @param payload Action payload
 * @param origin Allowed origin (AMPECO tenant URL)
 */
export function sendActionToParent(
  action: string,
  payload: unknown,
  origin: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.parent.postMessage(
    {
      type: "action",
      action: action,
      payload: payload,
    },
    origin
  );
}

