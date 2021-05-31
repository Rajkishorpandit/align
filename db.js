const mongodb = require("mongodb")
// Connection URL
const url = "mongodb+srv://todoAppUser:sharath@123@cluster0.hhfdm.mongodb.net/SecondTime?retryWrites=true&w=majority"

let port = process.env.PORT
if (port == null || port == "") {
  port = 7000
}

// Use connect method to connect to the server
mongodb.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  console.log("Connected successfully to server")
  module.exports = client.db("SecondTime")
  const app = require("./app")
  app.listen(port)
})
