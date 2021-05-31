const express = require("express")
const session = require("express-session")
const flash = require("connect-flash")
const mongodb = require("mongodb")
const MongoDBStore = require("connect-mongodb-session")(session)
const app = express()
var store = new MongoDBStore({
  uri: "mongodb+srv://todoAppUser:sharath@123@cluster0.hhfdm.mongodb.net/SecondTime?retryWrites=true&w=majority",
  collection: "sessions",
  unset: "destroy",
})

// Catch errors
store.on("error", function (error) {
  console.log(error)
})

let sessionOptions = session({
  secret: "Javascript is so cool",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
  store: store,
  unset: "destroy",
})
app.use(sessionOptions)
app.use(flash())
const router = require("./router")
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))
app.set("views", "views")
app.set("view engine", "ejs")
app.use("/", router)
module.exports = app
