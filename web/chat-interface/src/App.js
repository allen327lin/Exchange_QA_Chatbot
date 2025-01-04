import React, { useState, useEffect, useRef } from "react";
import Chat from "./Chat"; // 你的聊天組件
import "./App.css";

function App() {
  const [iframeSrc, setIframeSrc] = useState("/proxy/p/412-1032-9071.php?Lang=zh-tw");
  const [clickedLink, setClickedLink] = useState("");
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

          setClickedLink(newHref); // 更新狀態，顯示點擊的連結
          setIframeSrc(newHref);   // 更新 iframe 的 src，顯示該頁面
        }
      });
    }
  };

  return (
    <div className="app-container">
      {/* 左側聊天介面 */}
      <div className="left-panel">
        <Chat />
      </div>
      {/* 右側嵌入網頁 */}
      <div className="right-panel">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title="NTUT OIA Website"
          frameBorder="0"
          className="web-frame"
          style={{ width: "100%", height: "100%" }}
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}

export default App;