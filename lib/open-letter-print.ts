/** חלון הדפסה עם תוכן מכתב (RTL) — נפתח print אוטומטית */
export function openLetterPrintWindow(title: string, body: string): void {
  const w = typeof window !== "undefined" ? window.open("", "_blank") : null;
  if (!w) return;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const html = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="utf-8"/><title>${esc(title)}</title><style>body{font-family:system-ui,sans-serif;padding:24px;max-width:720px;margin:0 auto;color:#111}h1{font-size:18px;color:#581c87}pre{white-space:pre-wrap;font-size:13px;text-align:right;line-height:1.5}@media print{body{padding:12px}}</style></head><body><h1>${esc(title)}</h1><pre>${esc(body || "")}</pre><script>addEventListener("load",function(){setTimeout(function(){print();},300);});</script></body></html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
