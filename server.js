const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({ name: "Pak ka Hoe" });
});

app.listen(4000, err => {
  if (err) throw err;
  console.log("Server is running @ port 4000");
});
