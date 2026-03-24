const express = require('express');
const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/other', (req, res) => {
    res.send('Hello, again!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});