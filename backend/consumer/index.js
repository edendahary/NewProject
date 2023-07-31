const Kafka = require("node-rdkafka");
const eventType = require("../eventType.js");
const axios = require("axios");

var consumer = new Kafka.KafkaConsumer(
  {
    "group.id": "kafka",
    "metadata.broker.list": "localhost:9092",
  },
  {}
);

consumer.connect();

consumer
  .on("ready", () => {
    console.log("consumer ready..");
    consumer.subscribe(["test"]);
    consumer.consume();
  })
  .on("data", function (data) {
    const message = eventType.fromBuffer(data.value);
    console.log(`received message: ${message}`);

    // Send the message to Elasticsearch
    axios
      .post("http://localhost:9200/logs/_doc", message)
      .then((response) => {
        console.log(
          "Message successfully sent to Elasticsearch:",
          response.data
        );
      })
      .catch((error) => {
        console.error("Error sending message to Elasticsearch:", error.message);
      });
  });
