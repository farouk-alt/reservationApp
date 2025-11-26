import { onCLS, onLCP, onINP, onTTFB } from "web-vitals";

export const reportWebVitals = (onPerfEntry) => {
  if (!onPerfEntry || typeof onPerfEntry !== "function") return;

  onCLS(onPerfEntry);
  onLCP(onPerfEntry);
  onINP(onPerfEntry);  // replaces FID in v4
  onTTFB(onPerfEntry);
};
