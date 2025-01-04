import React, { useState } from "react";
import "./Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState([]); // 儲存訊息
  const [input, setInput] = useState(""); // 儲存輸入框內容
  const [isLoading, setIsLoading] = useState(false); // 儲存是否正在載入

  // 送出訊息
  const sendMessage = async () => {
    if (input.trim()) {
      // 顯示用戶輸入
      setMessages([...messages, { text: input, sender: "You" }]);

      try {
        setIsLoading(true); // 開始載入
        const response = await fetch("http://localhost:5002/api/agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: input }), // 用戶的 prompt
        });

        if (response.ok) {
          const data = await response.json();
          const fullResponse = data.response;

          // 使用正則表達式或 substring 提取 "Final response:" 之後的部分
          const finalResponse = fullResponse.match(/Final response:\s*(.*)/s);

          // 如果找到了 Final response 的部分
          if (finalResponse && finalResponse[1]) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: finalResponse[1].trim(), sender: "Bot" },
            ]);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: "No final response found.", sender: "Bot" },
            ]);
          }
        } else {
          console.error("Server error:", response.status);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: "Something went wrong. Please try again later.", sender: "Bot" },
          ]);
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Unable to reach the server.", sender: "Bot" },
        ]);
      } finally {
        setIsLoading(false); // 完成載入
      }

      setInput(""); // 清空輸入框
    }
  };

  // 處理按下 Enter 鍵
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Chat Room</div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender === "You" ? "self" : "other"}`}>
            <span>{msg.sender}: </span>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="chat-message bot">
            <span>Bot: </span>正在處理中...
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;