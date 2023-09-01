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
  fetchData();
});

let departmentChoices = [];
let roleChoices = [];
let employeeChoices = [];

async function fetchData() {
  try {
    // Fetch role data
    const roleRes = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM roles', (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    roleChoices = roleRes.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    // Fetch employee data
    const employeeRes = await new Promise((resolve, reject) => {
      db.query(
        "SELECT CONCAT(first_name, ' ', last_name) AS full_name, id FROM employees",
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    employeeChoices = employeeRes.map((employee) => ({
      name: employee.full_name,
      value: employee.id,
    }));

    // Fetch department data
    const departmentRes = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM departments', (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    departmentChoices = departmentRes.map((department) => ({
      name: department.department,
      value: department.id,
    }));

    // Now that data is fetched, it will start the application
    startApp();
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

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
        "Update an employee' role",
        'View all roles',
        'Add a role',
        'View all departments',
        'Add a department',
        'Update a department',
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

        case "Update an employee' role":
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

        case 'Add a department':
          addDepartment();
          break;

        case 'Update a department':
          updateDepartment();
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

      // Display the role data
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
        name: 'role_id',
        type: 'list',
        message: "Select the employee's role:",
        choices: roleChoices,
      },
    ])
    .then((answers) => {
      // Insert the new employee into the database
      db.query(
        'INSERT INTO employees SET ?',
        {
          first_name: answers.first_name,
          last_name: answers.last_name,
          role_id: answers.role_id,
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
        type: 'list',
        message: 'Select the employee whose role you want to update:',
        choices: employeeChoices,
      },
      {
        name: 'new_role',
        type: 'list',
        message: 'Select the new role for the employee:',
        choices: roleChoices,
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
        type: 'list',
        message: "Select the role's department:",
        choices: departmentChoices,
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

// Function to add a department
function addDepartment() {
  inquirer
    .prompt([
      {
        name: 'department',
        type: 'input',
        message: 'Enter the name of the new department:',
      },
    ])
    .then((answers) => {
      // Insert the new department into the database
      db.query(
        'INSERT INTO departments SET ?',
        {
          department: answers.department,
        },
        (err, res) => {
          if (err) throw err;
          console.log('Department added successfully!');
          startApp();
        }
      );
    });
}

// Function to rename a department
function updateDepartment() {
  inquirer
    .prompt([
      {
        name: 'department_id',
        type: 'list',
        message: 'Select the department you would like to rename:',
        choices: departmentChoices,
      },

      {
        name: 'new_name',
        type: 'input',
        message: 'Enter the new name:',
      },
    ])
    .then((answers) => {
      db.query('INSERT INTO departments SET ? WHERE ?')[
        ({
          department_id: answers.department_id,
        },
        {
          department: answers.new_name,
        })
      ],
        (err, res) => {
          if (err) throw err;
          console.log('Department updated successfully!');
          startApp();
        };
    });
}
