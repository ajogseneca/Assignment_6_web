/*************************************************************************
* BTI325– Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*https://www.javascripttutorial.net/javascript-array-filter/ reffered this webiste for filter functions.
https://expressjs.com/en/starter/static-files.html reffered this website for showing the images 

I have took help from yunseok Choi for completion of this assignment 5(The previous one 
  A6 is build upon A5 so his help is also mentioned).
Assignment 6 is soley my work. Hope this wont affect any Acadmic Inegrity Issues
* Name: AJO GEORGE  Student ID: 157845215  Date: 11-12-2022
*
* Your app’s URL (from Cyclic) :
*
*************************************************************************/ 
const data_services = require("./data-service.js")
const dataServiceAuth = require('./data-service-auth.js')

const HTTP_PORT = process.env.PORT || 8080; 
const fs =require('fs');
const clientSessions = require("client-sessions");

var express = require("express"); 
var app = express();
var path = require("path"); 
var exphbs = require('express-handlebars');
var multer =  require('multer');
var storage = multer.diskStorage({

    destination : "./public/images/uploaded", 
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
  
});

const upload = multer({storage : storage});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.engine('.hbs',exphbs.engine({
    extname:'.hbs', 
    defaultLayout:'main',
    helpers:{
        navLink:function(url, options){
            return '<li' + ((url==app.locals.activeRoute)? ' class="active"':'')
                +'><a href="'+url+'">'+options.fn(this)+'</a></li>'
        },
        equal:function(lvalue, rvalue, options){
            if(arguments.length<3)
                throw new Error("Handlerbars Helper equal needs 2 parameters");
            if(lvalue != rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine','.hbs');





app.set('view engine','.hbs');
app.use(function(req,res,next){
    let route=req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/")? "/":route.replace(/\/$/,"");
    next();
});


app.get('/', (req, res) => {
  res.render('home', { layout: 'main' });
});

app.get('/about', (req, res) => {
  res.render('about', { layout: 'main' });
});

app.use(clientSessions({
  cookieName: "session", 
  secret: "How_are_you_doing_?_this_is_a_secret_meeting", 
  duration: 2 * 60 * 1000, 
  activeDuration: 1000 * 60 
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


function ensureLogin(req, res, next) {
  if (!req.session.user) {
      res.redirect("/login");
  } else {
      next();
  }
}




// Updated  Employees Routes with ensureLogin
app.get('/employees/add',ensureLogin, (req, res) => {
  data_services
    .getDepartments()
    .then(function (data_services) {
      res.render('addEmployee', { departments: data_services });
    })
    .catch(() => res.render('addEmployee', { departments: [] }));
});

app.get('/employees',ensureLogin, (req, res) => {
  if (req.query.status) {
    data_services.getEmployeesByStatus(req.query.status).then((data_services) => {
        res.render('employees', { employee: data_services });
      }).catch((err) => {
        res.render({ message: 'no results' });
      });
  }

  if (req.query.department) {
    data_services.getEmployeesByDepartment(req.query.department).then((data_services) => {
        res.render('employees', { employee: data_services });
      }).catch((err) => {
        res.render({ message: 'no results' });
      });
  }

  if (req.query.manager) {
    data_services.getEmployeesByManager(req.query.manager).then((data_services) => {
        res.render('employees', { employee: data_services });
      }).catch((err) => {
        res.render({ message: 'no results' });
      });
  } else {
    data_services.getAllEmployees().then((data_services) => {
        res.render('employees', { employee: data_services, layout: 'main' });
      }).catch((err) => {
        res.render({ message: 'no results' });
      });
  }
});


app.get('/employee/:empNum',ensureLogin, (req, res) => {
  let viewData = {};
  data_services.getEmployeeByNum(req.params.empNum).then((data_services) => {
      if (data_services) {
        viewData.employee = data_services;
      } else {
        viewData.employee = null;
      }
    }).catch(() => {
      viewData.employee = null;
    }).then(data_services.getDepartments).then((data_services) => {
      viewData.departments = data_services;
      for (let i = 0; i < viewData.departments.length; i++) {
        if (viewData.departments[i].departmentId == viewData.employee.department) {
          viewData.departments[i].selected = true;
        }
      }
    }).catch(() => {
      viewData.departments = [];
    }).then(() => {
      if (viewData.employee == null) {
        res.status(404).send('Employee Not Found');
      } else {
        res.render('employee', { viewData: viewData });
      }
    });
});


app.get('/employees/delete/:empNum',ensureLogin, (req, res) => {
  data_services.deleteEmployeeByNum(req.params.empNum).then(() => res.redirect('/employees')).catch(() =>
      res.status(500).send('Unable to Remove Employee / Employee not found')
    );
});


//Updated  Department Routes with ensureLogin
app.get('/departments',ensureLogin, (req, res) => {
  data_services.getDepartments().then((data_services) => {
      res.render('departments', {
        departments: data_services,
      });
    }).catch((err) => {
      res.render({ message: 'no results' });
    });
});

app.get('/departments/add',ensureLogin, (req, res) => {
  res.render('addDepartment');
});

app.get('/department/:departmentId',ensureLogin, (req, res) => {
  data_services.getDepartmentById(req.params.departmentId).then((data_services) => {
      if (data_services.length > 0) res.render('department', { department: data_services });
      else {
        res.status(404).send('Department Not Found');
      }
    }).catch(() => {
      res.status(404).send('Department Not Found');
    });
});
//Updated Image Routes  with ensureLogin
app.get('/images/add',ensureLogin, (req, res) => {
  res.render('addImage');
});

app.get("/images",ensureLogin, (req, res) => {
  fs.readdir("./public/images/uploaded", function(err, imageFile){
      res.render("images",  { data: imageFile, title: "Images" });
  })

})

// App posting methods  with ensureLogin
app.post('/images/add',ensureLogin, upload.single('imageFile'), (req, res) => {
  res.render('addImage', { layout: 'main' });
});

app.post('/employees/add',ensureLogin, (req, res) => {
  data_services
    .addEmployee(req.body).then(() => res.redirect('/employees')).catch((err) => res.json({ message: err }));
});

app.post('/employee/update',ensureLogin, (req, res) => {
  data_services.updateEmployee(req.body).then((data_services) => {
    res.redirect('/employees/');
  });
});

app.post('/departments/add',ensureLogin, (req, res) => {
  data_services.addDepartment(req.body).then(() => res.redirect('/departments')).catch((err) => res.json({ message: err }));
});

app.post('/departments/update',ensureLogin, (req, res) => {
  data_services.updateDepartment(req.body).then(res.redirect('/departments')).catch((err) => res.json({ message: err }));
});

// login page route
app.get("/login", function(req, res) {
  res.render('login');
});

//registration page route
app.get("/register", function(req, res) { 
  res.render('register');
});

// register post method
app.post("/register", function(req, res) {
  dataServiceAuth.registerUser(req.body)
  .then(() => res.render('register', { successMsg: "User created!"}))
  .catch((err) => res.render('register', { errorMsg: err, userName: req.body.userName }));
});

// login post method
app.post("/login", function(req, res) {
  req.body.userAgent = req.get('User-Agent');

  dataServiceAuth.checkUser(req.body)
  .then(function(user) { 
      req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory
      }

      res.redirect('/employees');
  })
  .catch(function(err) {
      console.log(err);
      res.render('login', { errorMsg: err, userName: req.body.userName });
  });
});

// logging out the user route
app.get("/logout", function(req, res) {
  req.session.reset();
  res.redirect('/');
});

// user history route
app.get("/userHistory", ensureLogin, function (req, res) {
  res.render('userHistory');
}); 

app.get('*', (req, res) => {
  res.status(404).send('Page Not Found');
});

data_services.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
 app.listen(HTTP_PORT, function(){
 console.log("app listening on: " + HTTP_PORT)
 });
}).catch(function(err){
 console.log("unable to start server: " + err);
});

