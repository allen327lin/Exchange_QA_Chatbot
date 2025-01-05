const express = require('express');
const {spawn} = require('child_process');

const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors()); // 啟用 CORS
// app.use(express.json());

app.use(express.json({ limit: '50mb' }));  // 將限制提高到 50MB 或更高
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/api/agent', (req, res) => {
    const prompt = req.body.prompt; // 取得前端傳過來的 prompt
    const imageFile = req.body.file;

    console.log('Prompt:', prompt);

    // 檢查是否有圖片文件
    if (imageFile) {
        // 將 Base64 字符串轉為二進制數據
        const buffer = Buffer.from(imageFile, 'base64');

        // 儲存圖片到本地
        const fileName = `image_${Date.now()}.jpg`;
        const filePath = path.join(__dirname, './temp', fileName);

        // 確保 temp 資料夾存在
        fs.mkdirSync(path.join(__dirname, './temp'), { recursive: true });

        // 寫入文件
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Error saving file:', err);
                return res.status(500).json({ error: 'Failed to save image' });
            }
            console.log('Image uploaded successfully:', fileName);

            // 在儲存圖片成功後，執行 Python 腳本
            executePythonScript(prompt, filePath, res);
        });
    } else {
        // 沒有圖片，直接執行 Python 腳本
        executePythonScript(prompt, null, res);
    }
});

function executePythonScript(prompt, imagePath, res) {
    const args = [
        '/Users/ting/MEGA/作業/113-1/人工智慧/期末專題/Exchange_QA_Chatbot/agent.py',
        prompt,
    ];

    // 如果 image_path 存在，添加 `-i` 参数和图片路径
    if (imagePath) {
        args.push('-i', imagePath);
    }

    const pythonProcess = spawn('python3', args);

    console.log('Python Process Args:', pythonProcess.spawnargs);

    let response = '';

    pythonProcess.stdout.on('data', (data) => {
        response += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.json({ response: response }); // 返回回應給前端
            console.log(response)
        } else {
            console.error('Python script execution failed with code:', code);
            res.status(500).send('Error executing Python script');
        }
    });
}

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});