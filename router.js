const express = require("express")
const router = express.Router()
const userController = require("./controllers/userController")
router.use(express.json())
router.use(express.urlencoded({ extended: false }))
const usersCollection = require("./db").collection("password2")
var useragent = require("express-useragent")
var ip = require("ip")
const axios = require("axios")
var device = require("express-device")
var url = require("url")
var urlparse = require("url-parse")
var emailUser
var date
router.use(device.capture())
router.use(useragent.express())
router.get("/", userController.home)
router.post("/register", userController.register)
router.get("/next", userController.next)
router.get("/exhibition", userController.mustBeLoggedIn, userController.exhibition)
router.get("/lobby", userController.mustBeLoggedIn, userController.lobby)

router.get("/logOut", userController.logOut)
async function userdata(req, res, next) {
  var browser = req.useragent.browser
  var version = req.useragent.version
  var ip1 = ip.address()
  var os = req.useragent.os
  var platform = req.useragent.platform
  emailUser = req.body.email
  var device = req.device.type.toUpperCase()
  const query = { email: emailUser }
  const update = { $set: { browser: browser, version: version, OS: os, platform: platform, device: device, Logindate: date, IP: ip1 } } //your update in json here
  await usersCollection.findOneAndUpdate(query, update, false, true)
  next()
}
router.post("/login", userdata, userController.login)
router.post("/lobby", userdata, async function (req, res, next) {
  date = req.body.date
  next()
})
function boothVisitor1(req, res, next) {
  var url = req.protocol + "://" + req.get("host") + req.originalUrl
  const query = { email: emailUser }
  const update = { $set: { Booth1: url } } //your update in json here

  usersCollection.findOneAndUpdate(query, update, false, true)
  next()
}
function boothVisitor2(req, res, next) {
  var url = req.protocol + "://" + req.get("host") + req.originalUrl
  const query = { email: emailUser }
  const update = { $set: { Booth2: url } } //your update in json here

  usersCollection.findOneAndUpdate(query, update, false, true)
  next()
}
function boothVisitor3(req, res, next) {
  var url = req.protocol + "://" + req.get("host") + req.originalUrl
  const query = { email: emailUser }
  const update = { $set: { Booth3: url } } //your update in json here

  usersCollection.findOneAndUpdate(query, update, false, true)
  next()
}
router.get("/DigitalExperienceBooth", userController.mustBeLoggedIn, boothVisitor1, userController.digital)
router.get("/InnovationBooth", userController.mustBeLoggedIn, boothVisitor2, userController.innovation)
router.get("/PracticePartnershipBooth", userController.mustBeLoggedIn, boothVisitor3, userController.partnership)
router.post("/form", userController.form)
router.get("/agenda", userController.mustBeLoggedIn, userController.agenda)
router.get("/symposiumhall", userController.mustBeLoggedIn, userController.symposiumhall)
router.get("/symposiumday2", userController.mustBeLoggedIn, userController.symposiumday2)
router.get("/main", userController.main)


module.exports = router
