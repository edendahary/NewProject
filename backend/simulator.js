const fs = require("fs");
const path = require("path");
const queueRandomMessage = require("./producer/index");
const cheerio = require("cheerio");
const axios = require("axios");

// -------------------- for web-scraping --------------------
const url = "https://theskylive.com/sun-info";

// Function to fetch the HTML content of the URL
async function fetchHTML(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching HTML:", error);
    return null;
  }
}

// Function to clean up the extracted data
function cleanUpText(text) {
  return text.replace(/\t+/g, "\t").replace(/\n+/g, "\n").trim();
}

// Function to parse the HTML and extract relevant data
async function parseHTML(html) {
  const $ = cheerio.load(html);
    const sunData = {
      rise: cleanUpText($(".rise").text()),
      transit: cleanUpText($(".transit").text()),
      set: cleanUpText($(".set").text()),
      currentState: cleanUpText($(".currentstate").text()),
    };
    
    let arr =[]
  const tableRows = $(".objectdata tbody tr");

  tableRows.each((index, row) => {
    const columns = $(row).find("td");
    const rowData = [];

    columns.each((index, column) => {
      rowData.push($(column).text().trim());
    });

    arr.push(rowData.join(" | "))
  });
  arr.splice(0, 8);
  sunData.Sun_15_Days = arr;
  // Extracting data from the classes "rise", "transit", "set", and "currentstate"
  var headlineText ="";
   $(".object_headline_text").each((index, element) => {
    headlineText = $(element).text();
  });

  sunData.headline = headlineText;

  // Add web scraping logic to extract images from the class "content"
  const images = [];
  $(".content img").each((index, element) => {
    const src = $(element).attr("src");
    if (src) {
      if (!src.includes("https")) {
        images.push("https://theskylive.com/" + src);
      }
    }
  });
  images.pop();

  sunData.images = images;
var Sun_Physical_Data = []
  const objectdataElement = $('.objectdata');

  // Split the text content into lines and process each line

  const textContent = objectdataElement.text();
  const data =cleanUpText(textContent)

  const lines = data.split('\n\t\n\t\n\t');

// Process each group of data
lines.forEach(group => {
  const groupLines = group.split('\n\t');
  const parameter = groupLines[0];
  const value = groupLines[1];
  const relativeToEarth = groupLines[2];
  let sun_obj={parameter:parameter,value:value,relativeToEarth:relativeToEarth}
  if(Sun_Physical_Data.length < 7 ){
  Sun_Physical_Data.push(sun_obj)
}

});
sunData.Sun_Physical_Data= Sun_Physical_Data;



  return sunData;
}

// Main function to execute the web scraping
async function getSunDetails() {
  const html = await fetchHTML(url);
  if (html) {
    const sunData = parseHTML(html);
    return sunData;
  }
}

// -------------------- nasa API for Asteroids that are near to Earth --------------------

const nasa_url = "https://api.nasa.gov/neo/rest/v1/feed";
const apiKey = "rUa8liI9NS6MNV6uuiEmUbJRoMdOSQHHbOHLubVB";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function fetchNeoData() {
  const currentDate = new Date();
  const nextDay = new Date(currentDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const startDate = formatDate(currentDate);
  const endDate = formatDate(nextDay);

  try {
    const response = await axios.get(nasa_url, {
      params: {
        start_date: startDate,
        end_date: endDate,
        api_key: apiKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Main function to execute the web scraping
async function getAsteroidsNearEarth() {
  const neoData = await fetchNeoData();
  if (neoData ) {
    // Extracting the names of the asteroids
    const asteroids = neoData.near_earth_objects;
    // const asteroidNames = [];

    // Loop through each date in the near_earth_objects object
    // for (const date in asteroids) {
    //   if (Object.hasOwnProperty.call(asteroids, date)) {
    //     const asteroidsOnDate = asteroids[date];

    //     // Loop through each asteroid on the date and get its name
    //     for (const asteroid of asteroidsOnDate) {
    //       asteroidNames.push(asteroid.name);
    //     }
    //   }
    // }

    return asteroids;
  }
  return null;
}


async function writeToKafka(randomObject) {
  try {
    const { DEC, RA, "Title HD": TitleHD } = randomObject;
    const arrayTelescopes = [
      "MMT",
      "Gemini Observatory Telescopes",
      "Very Large Telescope",
      "Subaru Telescope",
      "Large Binocular Telescope",
      "Southern African Large Telescope",
      "Keck 1 and 2",
      "Hobby-Eberly Telescope",
      "Gran Telescopio Canarias",
      "The Giant Magellan Telescope",
      "Thirty Meter Telescope",
      "European Extremely Large Telescope",
    ];
    const eventArray = [
      "GRB",
      "Apparent Brightness Rise",
      "UV Rise",
      "X-Ray Rise",
      "Comet",
    ];
    const randomEvent = await getRandomItemFromArray(eventArray);
    // Create a new JSON object with the extracted properties
    const randomTelescope = await getRandomItemFromArray(arrayTelescopes);
    const randomDate = await getRandomDateBetween(1980, 2023);
    const randomPriority = await getRandomPriority();
    // const sunDetails = await getSunDetails();
    // const AsteroidsNearEarth = await getAsteroidsNearEarth();
    const extractedData = {
      DEC,
      RA,
      Title_HD: TitleHD,
      date: randomDate,
      priority: randomPriority,
      telescope: randomTelescope,
      event: randomEvent,
    };
    // Write the JSON object to a file
    const filePath = path.join(__dirname, "extracted_data.json");
    fs.writeFileSync(filePath, JSON.stringify(extractedData, null, 2));
    await queueRandomMessage(filePath);
    console.log("JSON file created successfully!");
  } catch (error) {
    console.error("Error while creating JSON file:", error);
  }
}

function getRandomDateBetween(startYear, endYear) {
  const startTimestamp = new Date(`${startYear}-01-01`).getTime();
  const endTimestamp = new Date(`${endYear + 1}-01-01`).getTime(); // Add 1 year to the end date

  const randomTimestamp =
    startTimestamp + Math.random() * (endTimestamp - startTimestamp);
  return new Date(randomTimestamp);
}

function getRandomPriority() {
  // Generate a random number between 1 and 5 (both inclusive)
  return Math.floor(Math.random() * 5) + 1;
}
function getRandomItemFromArray(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

module.exports = {
  getSunDetails,
  getAsteroidsNearEarth,
  writeToKafka,
};
