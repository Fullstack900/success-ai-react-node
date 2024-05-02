import { useEffect, useState } from "react";

function useWindowOpener({ onMessage, width = 500, height = 600 }) {
  const [popupWindow, setPopupWindow] = useState(null);

  useEffect(() => {
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });

  const openWindow = (url) => {
    if (popupWindow && !popupWindow.closed) {
      return popupWindow.focus();
    }
    const popup = window.open(url, "_blank", `height=${height},width=${width}`);
    setPopupWindow(popup);
  };

  const closeWindow = () => {
    popupWindow?.close();
    setPopupWindow(null);
  };

  return { openWindow, closeWindow };
}

export default useWindowOpener;
