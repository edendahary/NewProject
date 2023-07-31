const fs = require("fs");
const Kafka = require("node-rdkafka");
const eventType = require("../eventType.js");
const stream = Kafka.Producer.createWriteStream(
  {
    "metadata.broker.list": "localhost:9092",
  },
  {},
  {
    topic: "test",
  }
);

stream.on("error", (err) => {
  console.error("Error in our kafka stream");
  console.error(err);
});

function queueRandomMessage(file) {
  if(file){
    const jsonData = fs.readFileSync(file, "utf8");

    // Parse the JSON data into an object
    const jsonObject = JSON.parse(jsonData);

    // Send the JSON data as a message to a Kafka topic
    // const message = { value: JSON.stringify(jsonObject) };
    const event = {
      Title_HD: jsonObject.Title_HD,
      RA: jsonObject.RA,
      DEC: jsonObject.DEC,
    };

    const success = stream.write(eventType.toBuffer(event));

    if (success) {
      console.log(`message queued (${JSON.stringify(event)})`);
    } else {
      console.log("Too many messages in the queue already..");
    }
  }
}


// setInterval(() => {
//   queueRandomMessage();
// }, 3000);

module.exports = queueRandomMessage;
