const avro = require("avsc");

module.exports = avro.Type.forSchema({
  type: "record",
  fields: [
    {
      name: "Title_HD",
      type: "string",
    },
    {
      name: "RA",
      type: "string",
    },
    {
      name: "DEC",
      type: "string",
    },
  ],
});
