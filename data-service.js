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
const Sequelize = require('sequelize');

var sequelize = new Sequelize(
  'oebxwhhb',
  'oebxwhhb',
  'S-sFehXjP_vARVn3Mf5NDUt5iV59DER_',
  {
    host: 'lucky.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: true,
    },
    query: { raw: true },
  }
);

sequelize
  .authenticate()
  .then(() => console.log('Connection success.'))
  .catch((err) => {
    console.log('Unable to connect to DB.');
    console.log(err);
  });

var Employee_data = sequelize.define('Employee', {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.STRING,
});

var Department = sequelize.define('Department', {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  departmentName: Sequelize.STRING,
});

exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(() => resolve()).catch(() => reject('unable to sync the database'));
  });
};

exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    Employee_data.findAll().then((data) => resolve(data)).catch(() => reject('no results returned'));
  });
};

exports.getDepartments = function () {
  return new Promise((resolve, reject) => {
    Department.findAll().then((data) => resolve(data)).catch(() => reject('no results returned'));
  });
};
exports.getManagers = function () {
  return new Promise((resolve, reject) => {
    Employee_data.findAll({
      where: {
        employeeManagerNum: manager,
      },
    }).then((data) => {
        resolve(data);
      }).catch((err) => {
        reject('no results returned');
      });
  });
};

exports.addEmployee = function (employeeData) {
  return new Promise(function (resolve, reject) {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (let i in employeeData) {
      if (employeeData[i] === '') {
        employeeData[i] = null;
      }
    }
    Employee_data.create(employeeData).then(() => {
        console.log(employeeData);
        resolve();
      }).catch(() => {
        reject('unable to create employee');
      });
  });
};

exports.getEmployeesByStatus = function (status) {
  return new Promise(function (resolve, reject) {
    Employee_data.findAll({
      where: {
        status: status,
      },
    }).then((data) => {
        resolve(data);
      }).catch((err) => {
        reject('no results returned');
      });
  });
};

exports.getEmployeesByDepartment = function (department) {
  return new Promise(function (resolve, reject) {
    Employee_data.findAll({
      where: {
        department: department,
      },
    }).then((data) => {
        resolve(data);
      }).catch((err) => {
        reject('no results returned');
      });
  });
};

exports.getEmployeesByManager = function (manager) {
  return new Promise(function (resolve, reject) {
    Employee_data.findAll({
      where: {
        employeeManagerNum: manager,
      },
    }).then((data) => {
        resolve(data);
      }).catch((err) => {
        reject('no results returned');
      });
  });
};

exports.getEmployeeByNum = function (num) {
  return new Promise(function (resolve, reject) {
    Employee_data.findAll({
      where: {
        employeeNum: num,
      },
    }).then((data) => {
        resolve(data[0]);
      }).catch((err) => {
        reject('no results returned');
      });
  });
};
exports.getDepartmentById = function (id) {
  return new Promise((resolve, reject) => {
    Department.findAll({
      where: {
        departmentId: id,
      },
    }).then((data) => resolve(data))
      .catch(() => reject('no results returned'));
  });
};

exports.addDepartment = function (departmentData) {
  return new Promise(function (resolve, reject) {
    for (var i in departmentData) {
      if (departmentData[i] === '') {
        departmentData[i] = null;
      }
    }
    Department.create(departmentData).then(function () {
        console.log(departmentData);
        resolve();
      })
      .catch(() => {
        reject('unable to create department');
      });
  });
};

exports.updateEmployee = function (employeeData) {
  return new Promise(function (resolve, reject) {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (var i in employeeData) {
      if (employeeData[i] == '') {
        employeeData[i] = null;
      }
    }
    Employee_data.update(employeeData, {
      where: { employeeNum: employeeData.employeeNum },
    }).then((data) => {
        resolve(data);
      }).catch(() => {
        reject('unable to update employee');
      });
  });
};

exports.updateDepartment = function (departmentData) {
  return new Promise(function (resolve, reject) {
    for (var i in departmentData) {
      if (departmentData[i] == '') {
        departmentData[i] = null;
      }
    }

    Department.update(departmentData, {
      where: { departmentId: departmentData.departmentId },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject('unable to update department');
      });
  });
};

exports.deleteEmployeeByNum = function (empNum) {
  return new Promise((resolve, reject) => {
    Employee_data.destroy({
      where: {
        employeeNum: empNum,
      },
    })
      .then(() => resolve())
      .catch(() => reject('unable to delete employee'));
  });
};
