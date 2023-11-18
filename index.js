const connectToMongo = require("./db");
const express = require("express");
connectToMongo();
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use(express.json())
app.use('/user',require('./routes/routesUser'))
app.use('/attendance',require('./routes/routesAttendance'))


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
