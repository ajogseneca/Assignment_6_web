/*************************************************************************
* BTI325– Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*https://www.javascripttutorial.net/javascript-array-filter/ reffered this webiste for filter functions.
https://expressjs.com/en/starter/static-files.html reffered this website for showing the images 

I have took help from yunseok Choi for completion of this assignment 5(The previous one 
  A6 is build upon A5 so his help is also mentioned).
  Assignment 6(All the given requirments) is soley my work. Hope this wont affect any Acadmic Inegrity Issues
* Name: AJO GEORGE  Student ID: 157845215  Date: 11-12-2022
*
* Your app’s URL (from Cyclic) :https://scary-hare-kit.cyclic.app/
*
*************************************************************************/ 
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');


var userSchema = new mongoose.Schema({
    "userName" : {
        "type" : String,
        "unique" : true 
    },
    "password" : String,
    "email" : String,
    "loginHistory" : [{
        "dateTime" : Date,
        "userAgent" : String
    }]
});

let User;
module.exports = {
    initialize: function () {
        return new Promise(function (resolve, reject) {
            let db = mongoose.createConnection("mongodb+srv://ajopcs:Ipcs%40123456789@senecaweb.ndrnu9u.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
            db.on('error', (err) => {
                reject(err); 
            });
            db.once('open', () => {
               User = db.model("users", userSchema);
               resolve("Successfully connected to database!");
            });
        });
    },
    //• This function will validate user’s input and return meaningful errors if the data is invalid, or save userData to the database if no errors occurred.
    registerUser: function(userData) {
        return new Promise(function (resolve, reject) { 
            if (userData.password == userData.password2) {
                
                bcrypt.hash(userData.password, 10, function(err, hash) {
                    if (err) {
                        reject("There was an error encrypting the password!");
                    }
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser.save(function(err) {
                        if (err) {
                            if (err.code == 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: " + err);
                            }
                        } else {
                            resolve();
                        }
                    });
                })
            } else {
                reject("Passwords do not match");
            }
        });
    },
    //This function does the “authentication”.
    checkUser: function(userData) {
        return new Promise(function (resolve, reject) {
            User.find({ userName: userData.userName }).exec()
            .then((users) => {
                if (users.length == 0) {
                    reject("Unable to find username: " + userData.userName);
                } else {
                    bcrypt.compare(userData.password, users[0].password, function (err, res) {
                        if (res === true) {
                            if (users[0].loginHistory == null)
                                users[0].loginHistory = []; 
                            users[0].loginHistory.push({ 
                                dateTime: (new Date()).toString(),
                                userAgent: userData.userAgent
                            });                           
                            User.updateOne({ userName: users[0].userName },
                                { $set: { loginHistory: users[0].loginHistory } }
                            ).exec()
                            .then(function() { 
                                resolve(users[0]);
                            })
                            .catch(function(err) { 
                                reject("There was an error verifying the username: " + err);
                            });
                        } else if (res === false) {
                            reject("Unable to find username: " + userData.userName);
                        }
                    });
                }
            })
            .catch(function() {
                reject("Unable to find user: " + userData.userName);
            }); 
        })
    }
}