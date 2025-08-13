import fetch from "node-fetch";
import readline from "readline";
import * as dotenv from "dotenv";
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt for input
const prompt = (question) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });

async function setupAdmin() {
  console.log("AlumConnect - First Admin Setup");
  console.log("===============================");

  try {
    const name = await prompt("Enter admin name: ");
    const email = await prompt("Enter admin email: ");
    const username = await prompt("Enter admin username: ");
    const password = await prompt("Enter admin password: ");

    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/admin/createFirstAdmin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, username, password }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Admin setup successful!");
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Username: ${username}`);
      console.log(
        "\nYou can now login with these credentials to access the admin dashboard."
      );
    } else {
      console.error("Error setting up admin:", data.message);
    }
  } catch (error) {
    console.error("Error:", error.message);
    console.log("Make sure the server is running on the correct port.");
  } finally {
    rl.close();
  }
}

setupAdmin();
