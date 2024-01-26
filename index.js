const express = require("express");
const routes = require("./src/routes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.send("Hello World!");
});

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
