# Event Management System

## Overview

This project is an Event Management System that allows users to create and manage events, attendees, and tasks associated with those events. The application is built using Node.js and Express for the backend, with a MySQL database for data storage.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- MySQL (local installation)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-name>/backend
   ```

2. **Install dependencies**:
   Run the following command to install the required libraries:
   ```bash
   npm install
   ```

3. **Configure the database**:
   - Open your MySQL client and create a new database:
     ```sql
     CREATE DATABASE event_management;
     ```
   - Use the provided `schema` file to create the necessary tables. You can find the schema details in the `schema` text file included in the project. Run the SQL commands in the schema file to set up the tables.

### Running the Application

To start the application, navigate to the `backend` directory and run:
npx nodemon index.js

Alternatively, you can run:
node index.js

This will start the server on `http://localhost:3000`.

### Project Structure

- **controllers/**: Contains the logic for handling requests and responses for events, attendees, and tasks.
- **routes/**: Defines the API endpoints for events, attendees, and tasks.
- **public/**: Contains the frontend HTML, CSS, and JavaScript files.
- **config/**: Contains the database configuration.
- **schema**: A text file that includes the SQL commands to create the necessary tables in the MySQL database.

### Features

- Create, read, update, and delete events.
- Manage attendees associated with events.
- Create and manage tasks for each event.
- View event progress and statistics.

### Notes

- Ensure that your MySQL server is running before starting the application.
- There are no migrations included; the schema file must be used to set up the database tables.