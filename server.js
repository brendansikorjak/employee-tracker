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

// Function to start the application
function startApp() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "Select an action:",
      choices: [
        "View all employees",
        "Add an employee",
        "Update an employee role",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all employees":
          viewEmployees();
          break;

        case "Add an employee":
          addEmployee();
          break;

        case "Update an employee role":
          updateEmployeeRole();
          break;

        case "Exit":
          db.end();
          console.log("Connection closed.");
          process.exit(0);

        default:
          console.log("Invalid choice.");
          startApp();
          break;
      }
    });
}
// Function to view all employees
function viewEmployees() {
  db.query("SELECT * FROM employees", (err, res) => {
    if (err) throw err;

    // Display the employee data
    console.table(res);

    // Go back to the main menu
    startApp();
  });
}

// Function to add an employee
function addEmployee() {
  inquirer
    .prompt([
      {
        name: "first_name",
        type: "input",
        message: "Enter the employee's first name:",
      },
      {
        name: "last_name",
        type: "input",
        message: "Enter the employee's last name:",
      },
      {
        name: "department",
        type: "input",
        message: "Enter the employee's department:",
      },
      {
        name: "role",
        type: "input",
        message: "Enter the employee's role:",
      },
      {
        name: "salary",
        type: "input",
        message: "Enter the employee's salary:",
      },
    ])
    .then((answers) => {
      // Insert the new employee into the database
      db.query(
        "INSERT INTO employees SET ?",
        {
          first_name: answers.first_name,
          last_name: answers.last_name,
          department: answers.department,
          role: answers.role,
          salary: answers.salary,
        },
        (err, res) => {
          if (err) throw err;
          console.log("Employee added successfully!");
          startApp();
        }
      );
    });
}
