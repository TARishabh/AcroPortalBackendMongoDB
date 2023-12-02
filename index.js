const connectToMongo = require("./db");
const express = require("express");
const cors = require('cors');
require('dotenv').config()
connectToMongo();
const app = express();
const port = process.env.port || 3000

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use(cors())
app.use(express.json())
app.use('/user',require('./routes/routesUser'))
app.use('/attendance',require('./routes/routesAttendance'))


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
