const path = require("path");
require("dotenv").config({
   path: path.resolve(__dirname, "./.env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
let collection;
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const router = express.Router();

(async () => {
    try {
        await client.connect();
        const databaseName = client.db("animalDB");
        collection = databaseName.collection("animals");
        await collection.deleteMany({});
        console.log("MongoDB connnected");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}) ();

app.get("/style.css", (request, response) => {
    response.sendFile(path.join(__dirname, "style.css"));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.get("/", (request, response) => {
	response.render("index");
})

router.post("/randomAdd", async (request, response) => {
    const nickname = request.body.nickname;
    const res = await fetch("https://random-animal-api.p.rapidapi.com/api/random-animal", 
        {method: "GET", 
        headers: { "x-rapidapi-key": process.env.RAPIDAPI_KEY, 
            "x-rapidapi-host": "random-animal-api.p.rapidapi.com"}});
    const data = await res.json();
    console.log("API response:", data);
    await collection.insertOne({animal: data.city, nickname: nickname})
    response.redirect("/all")
})

router.get("/all", async (request, response) => {
    const animals = await collection.find({}).toArray();
    let answer = "";
    animals.forEach((item) => {
        answer += `<li>Animal: ${item.animal}, Nickname: ${item.nickname}</li>`;
    });
    response.render("all", { items: answer });
})

app.use("/", router);

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});