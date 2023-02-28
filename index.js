const express = require("express");
const cors = require("cors");
const sequelize = require("./db");
const router = require("./routes");
const { Product } = require("./models/product.model");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => res.json("ok"));

app.use("/api", router);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server has been started on PORT: ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
