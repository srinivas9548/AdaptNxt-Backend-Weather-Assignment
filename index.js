const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'database.db');

let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        app.listen(3000, () => {
            console.log("Server is running on http://localhost:3000");
        });

    } catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();


app.get('/', async (request, response) => {
    try {
        response.send("Welcome! This is a AdaptNXT Technology Solutions Company backend domain. Please access any path to get this data.");
    } catch (e) {
        console.log(e.message);
        response.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/weather', async (request, response) => {
    const {city} = request.query;

    if (!city) {
        response.status(400).json({"error": "City name is required"});
    }

    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=81f3f71261ed07e873d9ce63cb67fd0d&units=metric`;

        const responseData = await axios.get(apiUrl);

        const weatherData = responseData.data;

        response.json(weatherData);

    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                response.status(400).json({"error": "City not found"});
            } else if (error.response.status === 401) {
                response.status(401).json({"error": "Invalid API KEY" });
            } else {
                response.status(error.response.status).json({"error": error.response.data.message});
            }
        } else if (error.request) {
            response.status(500).json({"error": "No response from weather service"});
        } else {
            response.status(500).json({"error": "Failed to fetch weather data"});
        }
    }
});

module.exports = app;