import React, {useState} from "react";
import "./Chat.css";

// 定义 fetch 请求函数
const sendFetchRequest = async (input, imageData) => {
    const body = JSON.stringify({prompt: input, file: imageData ? await getBase64Image(imageData.file) : null});
    return fetch("http://localhost:5002/api/agent", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: body,
    });
};

// 获取图片的 Base64 编码
const getBase64Image = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result.split(',')[1]); // 確保只返回 Base64 主體部分
        };
        reader.readAsDataURL(file);
    });
};

const Chat = () => {
    const [messages, setMessages] = useState([]); // 儲存訊息
    const [input, setInput] = useState(""); // 儲存輸入框內容
    const [isLoading, setIsLoading] = useState(false); // 儲存是否正在載入
    const [imageData, setImageData] = useState(null); // 儲存圖片本地路徑

    // 送出訊息
    const sendMessage = async () => {
        if (!input.trim()) {
            alert("Prompt cannot be empty!");
            return;
        }

        // 顯示用戶輸入
        setMessages((prevMessages) => [
            ...prevMessages,
            {text: input, file: imageData, sender: "You"},
        ]);

        console.log(imageData)

        setInput(""); // 清空輸入框
        setImageData(null); // 清空圖片
        setIsLoading(true); // 開始載入
        if (imageData?.previewURL) {
            URL.revokeObjectURL(imageData.previewURL); // 釋放 Blob URL
        }
        document.querySelector(".image-upload").value = null;

        try {
            const response = await sendFetchRequest(input, imageData);

            if (response.ok) {
                const data = await response.json();
                const fullResponse = data.response;

                // 匹配 Final response 部分
                const finalResponse = fullResponse.match(/Final response:\s*(.*)/s);

                // 取得 final response
                const botMessage = finalResponse
                    ? finalResponse[1].trim()
                    : "No final response found.";

                // 將換行符號 (\n) 轉換為 <br> 標籤，以便顯示空行
                const messageWithBreaks = botMessage.replace(/\n/g, "<br/>");

                // 更新狀態，將處理過的訊息顯示到聊天界面
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {text: messageWithBreaks, sender: "Bot"},
                ]);
            } else {
                console.error("Server error:", response.status);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {text: "Something went wrong. Please try again later.", sender: "Bot"},
                ]);
            }
        } catch (error) {
            console.error("Error connecting to server:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                {text: "Unable to reach the server.", sender: "Bot"},
            ]);
        } finally {
            setIsLoading(false); // 完成載入
        }
    };

    // 處理圖片上傳
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) {  // 限制為 10MB
                alert("The file is too large. Please upload a smaller image.");
                return;
            }
            setImageData({
                file: file,
                previewURL: URL.createObjectURL(file),
            });
        }
    };

    // 刪除圖片預覽
    const handleRemoveImagePreview = () => {
        if (imageData?.previewURL) {
            URL.revokeObjectURL(imageData.previewURL); // 清理 Blob URL
            document.querySelector(".image-upload").value = null;
        }
        setImageData(null); // 清空圖片資料
    };

    // 處理貼圖事件
    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                setImageData({
                    file: file, // 原始文件
                    previewURL: URL.createObjectURL(file), // 預覽用 Blob URL
                });

                break; // 只處理第一個圖片
            }
        }
    };

    // 處理按下 Enter 鍵
    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    const formatMessage = (message) => {
        return message.replace(/\n/g, "<br/>");
    };

    return (
        <div className="chat-container">
            <div className="chat-header">Chat Room</div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender === "You" ? "self" : "other"}`}>
                        <div className="sender">{msg.sender}</div>
                        {/* Move this outside for independent styling */}
                        <div className="message-content">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: formatMessage(msg.text),
                                }}
                            />
                            {/*<div>{msg.text}</div>*/}
                            {msg.file && (
                                <img
                                    src={msg.file.previewURL || `data:image/png;base64,${msg.file}`}
                                    alt="Uploaded"
                                    className="chat-image"
                                />
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-message-bot">
                        正在處理中...
                    </div>
                )}
            </div>
            <div className="chat-input">
                <div className={"image"}>
                    {imageData?.previewURL && (
                        <div className="image-preview">
                            <img src={imageData.previewURL} alt="Preview" className="preview-image"/>
                            <button className="remove-image" onClick={handleRemoveImagePreview}>
                                ×
                            </button>
                        </div>
                    )}
                </div>
                <div className={"prompt"}>
                    <input
                        className={"prompt-input"}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onPaste={handlePaste}
                        placeholder="Type a message..."
                    />
                    <button className={"send-button"}
                            onClick={sendMessage}>Send
                    </button>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-upload"
                />
            </div>
        </div>
    );
};

export default Chat;