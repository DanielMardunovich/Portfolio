import React from "react";

export default function SpeechBubble({ visible, x, y, text, onDismiss }) {
  if (!visible || x == null || y == null) return null;

  const style = {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    transform: "translate(-50%, -100%)",
    pointerEvents: "auto",
    zIndex: 1000
  };

  return (
    <div style={style} className="speech-bubble" onClick={onDismiss}>
      {text}
    </div>
  );
}
