const express = require('express');
const port = process.env.PORT || 3030;

const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send("Hi, from server");
})

require('./routes/routes')(app)

app.listen(port, () => {
    console.log("server is running");
})