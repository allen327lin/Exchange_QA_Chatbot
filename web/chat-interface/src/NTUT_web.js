import React, { useState, useRef } from "react";
import "./NTUT_web.css"; // 可選，根據需要新增樣式

function NTUT_web() {
  const [iframeSrc, setIframeSrc] = useState("/proxy/p/412-1032-9071.php?Lang=zh-tw");
  const iframeRef = useRef(null);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (link && link.href) {
          event.preventDefault(); // 阻止默認行為

          // 替換鏈接中的前綴
          const newHref = link.href.replace("http://localhost:3000/", "/proxy/");
          console.log("Clicked link:", newHref);

          setIframeSrc(newHref); // 更新 iframe 的 src，顯示該頁面
        }
      });
    }
  };

  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      title="NTUT OIA Website"
      frameBorder="0"
      className="web-frame"
      style={{ width: "100%", height: "100%" }}
      onLoad={handleIframeLoad}
    />
  );
}

export default NTUT_web;