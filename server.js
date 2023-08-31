const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  database: 'employee_db',
});

// Connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database.');
  startApp();
});

// Function to start the application
function startApp() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'Select an action:',
      choices: [
        'View all employees',
        'Add an employee',
        'Update an employee role',
        'View all roles',
        'Add a role',
        'View all departments',
        'Exit',
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View all employees':
          viewEmployees();
          break;

        case 'Add an employee':
          addEmployee();
          break;

        case 'Update an employee role':
          updateEmployeeRole();
          break;

        case 'View all roles':
          viewRoles();
          break;

        case 'Add a role':
          addRole();
          break;

        case 'View all departments':
          viewDepartments();
          break;

        case 'Exit':
          db.end();
          console.log('Connection closed.');
          process.exit(0);

        default:
          console.log('Invalid choice.');
          startApp();
          break;
      }
    });
}
// Function to view all employees
function viewEmployees() {
  db.query(
    // "SELECT * FROM employees JOIN roles ON employees.role_id = roles.id JOIN departments ON roles.department_id = departments.id",
    // "SELECT first_name AS [First Name], last_name AS [Last Name] FROM employees",
    'SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.department, roles.salary FROM employees JOIN roles ON employees.role_id = roles.id JOIN departments ON roles.department_id = departments.id',
    (err, res) => {
      if (err) throw err;

      // Display the employee data
      console.table(res);

      // Go back to the main menu
      startApp();
    }
  );
}

// Function to view all departments
function viewDepartments() {
  db.query('SELECT * FROM departments', (err, res) => {
    if (err) throw err;

    // Display the department data
    console.table(res);

    // Go back to the main menu
    startApp();
  });
}

// Function to view all roles
function viewRoles() {
  db.query(
    'SELECT roles.id, roles.title, roles.salary, departments.department FROM roles JOIN departments ON roles.department_id = departments.id',
    (err, res) => {
      if (err) throw err;

      // Display the department data
      console.table(res);

      // Go back to the main menu
      startApp();
    }
  );
}

// Function to add an employee
function addEmployee() {
  inquirer
    .prompt([
      {
        name: 'first_name',
        type: 'input',
        message: "Enter the employee's first name:",
      },
      {
        name: 'last_name',
        type: 'input',
        message: "Enter the employee's last name:",
      },
      {
        name: 'department',
        type: 'input',
        message: "Enter the employee's department:",
      },
      {
        name: 'role',
        type: 'input',
        message: "Enter the employee's role:",
      },
      {
        name: 'salary',
        type: 'input',
        message: "Enter the employee's salary:",
        validate: (value) => {
          const isValid = !isNaN(parseFloat(value));
          return isValid || 'Please enter a valid number';
        },
      },
    ])
    .then((answers) => {
      // Insert the new employee into the database
      db.query(
        'INSERT INTO employees SET ?',
        {
          first_name: answers.first_name,
          last_name: answers.last_name,
          department_id: answers.department,
          role: answers.role,
          salary: answers.salary,
        },
        (err, res) => {
          if (err) throw err;
          console.log('Employee added successfully!');
          startApp();
        }
      );
    });
}
// Function to update an employee's role
function updateEmployeeRole() {
  inquirer
    .prompt([
      {
        name: 'employee_id',
        type: 'input',
        message: 'Enter the ID of the employee whose role you want to update:',
      },
      {
        name: 'new_role',
        type: 'input',
        message: 'Enter the new role for the employee:',
      },
    ])
    .then((answers) => {
      // Update the employee's role in the database
      db.query(
        'UPDATE employees SET ? WHERE ?',
        [
          {
            role_id: answers.new_role,
          },
          {
            id: answers.employee_id,
          },
        ],
        (err, res) => {
          if (err) throw err;
          console.log('Employee role updated successfully!');
          startApp();
        }
      );
    });
}
// Function to add a role
function addRole() {
  inquirer
    .prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Enter the new role:',
      },
      {
        name: 'department',
        type: 'input',
        message: "Enter the role's department:",
      },
      {
        name: 'salary',
        type: 'input',
        message: "Enter the role's salary:",
        validate: (value) => {
          const isValid = !isNaN(parseFloat(value));
          return isValid || 'Please enter a valid number';
        },
      },
    ])
    .then((answers) => {
      // Insert the new role into the database
      db.query(
        'INSERT INTO roles SET ?',
        {
          title: answers.title,
          department_id: answers.department,
          salary: answers.salary,
        },
        (err, res) => {
          if (err) throw err;
          console.log('Role added successfully!');
          startApp();
        }
      );
    });
}
