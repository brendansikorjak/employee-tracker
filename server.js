const inquirer = require("inquirer");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "employee_db",
});

// Connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database.");
  startApp();
});
