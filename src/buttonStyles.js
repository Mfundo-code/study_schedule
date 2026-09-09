
const STYLE_TAG_ID = "studybell-button-states";

export function ensureButtonStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_TAG_ID)) return;

  const tag = document.createElement("style");
  tag.id = STYLE_TAG_ID;
  tag.textContent = `
    .sb-btn {
      transition: filter 0.15s ease, transform 0.08s ease, opacity 0.15s ease;
    }
    .sb-btn:hover:not(:disabled) {
      filter: brightness(1.12);
    }
    .sb-btn:active:not(:disabled) {
      transform: translateY(1px);
      filter: brightness(0.95);
    }
    .sb-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed !important;
      filter: grayscale(0.5);
    }
    .sb-btn:focus-visible {
      outline: 2px solid #c9a15c;
      outline-offset: 2px;
    }
    .sb-spin {
      animation: sb-spin-rotate 0.8s linear infinite;
    }
    @keyframes sb-spin-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(tag);
}