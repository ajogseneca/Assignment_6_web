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