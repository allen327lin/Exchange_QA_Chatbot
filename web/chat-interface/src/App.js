import React from "react";
import Chat from "./Chat"; // 聊天組件
import NTUT_web from "./NTUT_web"; // 新增的右側面板組件
import "./App.css";

function App() {
  return (
    <div className="app-container">
      {/* 左側聊天介面 */}
      <div className="left-panel">
        <Chat />
      </div>
      {/* 右側嵌入網頁 */}
      <div className="right-panel">
        <NTUT_web />
      </div>
    </div>
  );
}

export default App;