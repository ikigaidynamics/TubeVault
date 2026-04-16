"use client";

import { useEffect } from "react";

export function DebugOverflow() {
  useEffect(() => {
    if (window.innerWidth > 640) return;

    const b = document.createElement("div");
    b.style.cssText =
      "position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#222;color:#0f0;font:bold 10px monospace;padding:6px;max-height:35vh;overflow:auto;border-top:2px solid #0f0;";
    b.textContent = "Debug v2 loading...";
    document.body.appendChild(b);

    function chk() {
      const vw = document.documentElement.clientWidth;
      const dw = document.documentElement.scrollWidth;
      const bw = document.body.scrollWidth;
      const bad: string[] = [];

      document.querySelectorAll("*").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 2) {
          const tag = el.tagName.toLowerCase();
          const cls =
            el.className && typeof el.className === "string"
              ? "." + el.className.split(" ").slice(0, 4).join(".")
              : "";
          bad.push(
            tag + cls + " right:" + Math.round(r.right) + " w:" + Math.round(r.width)
          );
        }
      });

      const info = "vw=" + vw + " docSW=" + dw + " bodySW=" + bw;
      if (bad.length) {
        b.style.borderColor = "red";
        b.style.color = "#f88";
        b.innerHTML =
          "<b>OVERFLOW (" + bad.length + ") " + info + "</b><br>" +
          bad.slice(0, 15).join("<br>");
      } else {
        b.style.borderColor = "#0f0";
        b.style.color = "#0f0";
        b.textContent = "OK no overflow | " + info;
      }
    }

    const obs = new MutationObserver(() => setTimeout(chk, 150));
    obs.observe(document.body, { childList: true, subtree: true, attributes: true });
    setInterval(chk, 3000);
    setTimeout(chk, 500);
    setTimeout(chk, 2000);

    return () => {
      obs.disconnect();
      b.remove();
    };
  }, []);

  return null;
}
