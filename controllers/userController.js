const User = require("../models/User")
var username
exports.register = function (req, res) {
  let user = new User(req.body)
  user
    .register()
    .then(() => {
      req.session.user = { firstname: user.data.firstname }
      req.session.save(() => {
        res.redirect("/")
      })
    })
    .catch((regErrors) => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/")
      })
    })
}
exports.next = function (req, res) {
  res.render("login")
}

exports.login = function (req, res) {
  let user = new User(req.body)
  username = typeof req.body.email != "undefined" ? req.body.email : username
  user
    .login()
    .then(function (data) {
      username=data.firstname
      req.session.user = { username: username }
      req.session.save(function () {
        res.render("lobby", { username: username })
      })
    })
    .catch((logErrors) => {
      logErrors.forEach(function (error) {
        req.flash("logErrors", error)
      })
      res.redirect("/")
    })
}
exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash("errors", "you must be logged in to perform that action")
    res.redirect("/")
  }
}

exports.logOut = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/")
  })
}

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("login", { username: req.session.user.username })
  } else {
    res.render("login", { logErrors: req.flash("logErrors"), errors: req.flash("errors") })
  }
}
exports.form = function (req, res) {
  let user = new User(req.body)
  user
    .registerForm()
    .then(function () {
      res.render("partnership_b", { username: username })
    })

    .catch((formErrors) => {
      formErrors.forEach(function (error) {
        req.flash("formErrors", error)
      })
    })
}
exports.exhibition = function (req, res) {
  // username = typeof req.body.email != "undefined" ? req.body.email : username
  // console.log(typeof username)
  res.render("exhibition_lobby", { username: username })
}

exports.digital = function (req, res) {
  // username = typeof req.body.email != "undefined" ? req.body.email : username
  res.render("digital", { username: username })
}
exports.lobby = function (req, res) {
  // username = typeof req.body.email != "undefined" ? req.body.email : username
  res.render("lobby", { username: username })
}
exports.innovation = function (req, res) {
  // username = typeof req.body.email != "undefined" ? req.body.email : username
  res.render("innovation_b", { username: username })
}
exports.partnership = function (req, res) {
  // username = typeof req.body.email != "undefined" ? req.body.email : username
  res.render("partnership_b", { username: username })
}
exports.agenda = function (req, res) {
  // username = typeof req.body.email != "undefined" ? req.body.email : username
  res.render("agenda", { username: username })
}
exports.symposiumhall = function (req, res) {
  // username = typeof req.body.email != "undefined" ? req.body.email : username
  res.render("symposium_hall", { username: username })
}
exports.symposiumday2 = function (req, res) {
  username = typeof req.body.email != "undefined" ? req.body.email : username
  res.render("sympday2", { username: username })
}
exports.main = function (req, res) {
  // username = typeof req.body.email != "undefined" ? req.body.email : username
  res.render("mainsession", { username: username })
}
