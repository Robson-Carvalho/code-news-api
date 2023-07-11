const NewsAPI = require("newsapi");
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require('sqlite3').verbose();
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3030;
const newsapi = new NewsAPI(`${process.env.SECRET_API}`);
const db = new sqlite3.Database('./data/database.db');

db.run('PRAGMA foreign_keys=ON');
db.run('PRAGMA journal_mode=WAL');
db.run('CREATE TABLE IF NOT EXISTS news (data JSON)');


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
        news.result = response.articles;
        const document = response.articles;
        db.run('INSERT INTO news (data) VALUES (?)', [JSON.stringify(document)], function (err) {
          if (err) {
            return console.error(err.message);
          }
          console.log('A new document has been inserted with ID', this.lastID);
        });
      });

    return res.json({ news });
  }

  return res.json({ news });
});

app.get("/news", async (req, res) => {
  db.all('SELECT data FROM news', function (err, rows) {
    if (err) {
      return console.error(err.message);
    }
    return res.json({ rows });
  });
})




app.listen(port, () =>
  console.log(`server running in http://localhost:${port}`)
);
