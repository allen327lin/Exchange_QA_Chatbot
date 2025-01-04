const express = require('express');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());

app.post('/api/agent', (req, res) => {
    const prompt = req.body.prompt; // 取得前端傳過來的 prompt

    const pythonProcess = spawn('python3', ['/Users/ting/MEGA/作業/113-1/人工智慧/期末專題/Exchange_QA_Chatbot/agent.py', prompt]);

    let response = '';

    pythonProcess.stdout.on('data', (data) => {
        response += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.json({ response: response.trim() }); // 返回回應給前端
        } else {
            res.status(500).send('Error executing Python script');
        }
    });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});