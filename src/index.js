const NewsAPI = require("newsapi");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3030;
const newsapi = new NewsAPI(`${process.env.SECRET_API}`);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.disable("x-powered-by");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const news = {
  requisitionDate: "",
  result: [],
};

const date = (decreaseDays = 0) => {
  let date = new Date();
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate() - decreaseDays).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

app.get("/", async (req, res) => {
  if (news.requisitionDate !== date(1) || news.result.length === 0) {
    await newsapi.v2
      .everything({
        q: "Tecnologia",
        language: "pt",
        sortBy: "publishedAt",
        page: 1,
      })
      .then((response) => {
        news.requisitionDate = date(1);
        news.result = [];
        news.result = response.articles;
      });

    return res.json({ news });
  }

  return res.json({ news });
});

app.listen(port, () =>
  console.log(`server running in http://localhost:${port}`)
);
