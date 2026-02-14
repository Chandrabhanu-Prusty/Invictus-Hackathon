const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");   // 👈 this connects database

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PCB Inventory API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
