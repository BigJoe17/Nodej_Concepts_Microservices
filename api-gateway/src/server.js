const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Welcome Home!');
});

app.listen(3001, () => {
    console.log('API Gateway listening on port 3001');
});