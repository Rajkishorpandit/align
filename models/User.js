const usersCollection = require("../db").collection("password2")
const validator = require("validator")
var emailExists
const formsCollection = require("../db").collection("form")
let User = function (data) {
  this.data = data
  this.errors = []
}
User.prototype.cleanUp = function () {
  this.data = {
    firstname: this.data.firstname.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
  }
}
User.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    if (!validator.isEmail(this.data.email)) {
      this.errors.push("you must provide a  valid email-id")
    }
    if (validator.isEmail(this.data.email)) {
      emailExists = await usersCollection.findOne({ email: this.data.email })
    }
    if (!emailExists) {
      this.errors.push("Emai-id is not registered")
    }
    resolve()
  })
}
User.prototype.validated = function () {
  return new Promise(async (resolve, reject) => {
    if (this.data.firstname == "") {
      this.errors.push("you must provide a firstname")
    }
    if (this.data.lastname == "") {
      this.errors.push("you must provide a lastname")
    }

    if (this.data.password == "") {
      this.errors.push("you must provide a password")
    }

    if (this.data.firstname != "" && !validator.isAlphanumeric(this.data.firstname)) {
      this.errors.push("first name cannot be other characters")
    }

    if (!validator.isEmail(this.data.email)) {
      this.errors.push("you must provide a  valid email-id")
    }

    if (this.data.password.length > 0 && this.data.password.length < 3) {
      this.errors.push("password  must be 10 characters")
    }

    if (this.data.firstname.length > 0 && this.data.firstname.length < 3) {
      this.errors.push("firstName must be atleast 3 characters")
    }

    if (this.data.firstname.length > 30) {
      this.errors.push("firstName cannot be morethan 30 characters")
    }
    if (this.data.firstname.length > 2 && this.data.firstname.length < 31 && validator.isAlphanumeric(this.data.firstname)) {
      let usernameExists = await usersCollection.findOne({ firstname: this.data.firstname })
      if (usernameExists) {
        this.errors.push("That firstName is already taken")
      }
    }

    if (validator.isEmail(this.data.email)) {
      let emailTaken = await usersCollection.findOne({ email: this.data.email })
      //console.log(JSON.stringify(emailTaken, null, 2))

      if (emailTaken) {
        this.errors.push("That email-id is already taken")
      }
    }

    resolve()
  })
}

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    await this.validated()
    if (!this.errors.length) {
      await usersCollection.insertOne(this.data)
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

User.prototype.login = function () {
  return new Promise((resolve, reject) => {
    this.validate()
    usersCollection
      .findOne({ email: this.data.email })
      .then((attemptedUser) => {
        if (attemptedUser && attemptedUser.password == this.data.password && attemptedUser.email == this.data.email) {
          this.data = attemptedUser
          resolve(this.data)
        } else {
          this.errors.push("Invalid Password")
          reject(this.errors)
        }
      })
      .catch(function () {
        reject("Please try again later")
      })
  })
}
User.prototype.validateForm = function () {
  return new Promise(async (resolve, reject) => {
    if (!validator.isEmail(this.data.email)) {
      this.errors.push("you must provide a  valid email-id")
    }
    if (this.data.name == "") {
      this.errors.push("you must provide a name")
    }
    if (!validator.isEmail(this.data.email)) {
      this.errors.push("you must provide a  valid email-id")
    }

    resolve()
  }).catch(function (e) {
    reject(this.errors)
  })
}
User.prototype.registerForm = function () {
  return new Promise(async (resolve, reject) => {
    await this.validateForm()
    if (!this.errors.length) {
      await formsCollection.insertOne(this.data)
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

module.exports = User
