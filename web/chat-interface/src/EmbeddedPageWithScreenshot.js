import React, { useRef } from "react";
import PropTypes from "prop-types";
import html2canvas from "html2canvas";

const EmbeddedPageWithScreenshot = ({ url, title, className, style }) => {
  const contentRef = useRef(null);

  const handleScreenshot = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current);
      const imgData = canvas.toDataURL("image/png");

      // 複製截圖到剪貼板
      const blob = await (await fetch(imgData)).blob();
      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);

      alert("截圖已複製到剪貼板！");
    } catch (error) {
      console.error("截圖失敗:", error);
      alert("截圖失敗，請檢查控制台日誌！");
    }
  };

  return (
    <div className={`embedded-page ${className}`} style={style}>
      <div className="toolbar">
        <button onClick={handleScreenshot}>截圖並複製</button>
      </div>
      <div ref={contentRef} className="embedded-content">
        <iframe
          src={url}
          title={title}
          frameBorder="0"
          className="web-frame"
          style={{ width: "100%", height: "100%" }}
        ></iframe>
      </div>
    </div>
  );
};

EmbeddedPageWithScreenshot.propTypes = {
  url: PropTypes.string.isRequired, // 要嵌入的網頁 URL
  title: PropTypes.string, // iframe 的標題
  className: PropTypes.string, // 自定義樣式 class
  style: PropTypes.object, // 自定義樣式
};

EmbeddedPageWithScreenshot.defaultProps = {
  title: "Embedded Page",
  className: "",
  style: { width: "100%", height: "100%" },
};

export default EmbeddedPageWithScreenshot;