

# Real-Time Chat Application

This is a full-stack, real-time chat application featuring user authentication, group chat functionalities, and role-based permissions. The project is built with the modern MERN stack (MongoDB, Express, React, Node.js) and utilizes WebSockets for instant messaging.

## Features

* **User Authentication**: Secure user registration and login system using JWT (JSON Web Tokens).
* **Real-Time Messaging**: Instantaneous message delivery and updates powered by Socket.IO.
* **Group Chat**: Users can engage in group conversations.
* **Image Uploads**: Functionality to upload and share images, handled by Multer and Cloudinary.
* **Role-Based Access**: Differentiates user roles and permissions for better security and control.
* **Responsive Design**: A modern, responsive user interface built with React and Tailwind CSS.

## Tech Stack

### Frontend

* **React**: A JavaScript library for building user interfaces.
* **Vite**: A fast build tool and development server for modern web projects.
* **React Router**: For declarative routing in the React application.
* **Zustand**: Lightweight state management for React.
* **Socket.IO Client**: To establish real-time, bidirectional communication.
* **Tailwind CSS & DaisyUI**: For styling the user interface.
* **Axios**: For making HTTP requests to the backend API.

### Backend

* **Node.js**: A JavaScript runtime environment.
* **Express.js**: A web application framework for Node.js.
* **MongoDB**: A NoSQL database for storing user and message data.
* **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
* **Socket.IO**: Enables real-time, event-based communication.
* **JSON Web Token (JWT)**: For securing user authentication.
* **Bcrypt**: For hashing passwords before storing them.
* **Cloudinary**: For cloud-based image storage.
* **Multer**: For handling `multipart/form-data`, used for file uploads.

## Project Structure

```text
Chat-App/
├── backend/       # Express.js backend
├── frontend/      # React + Vite frontend
├── package.json   # Root config and scripts
└── README.md
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18.x or later recommended)
* [npm](https://www.npmjs.com/)
* [MongoDB](https://www.mongodb.com/try/download/community): Make sure you have a MongoDB server running or a connection string to a cloud instance (e.g., MongoDB Atlas).

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/hassan-khan07/Chat-App.git
   cd Chat-App
   ```

2. **Install backend dependencies:**

   ```sh
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**

   ```sh
   cd ../frontend
   npm install
   ```

### Environment Configuration

The backend requires a set of environment variables to connect to the database and manage security settings.

1. Navigate to the `backend` directory.
2. Create a `.env` file by copying the example file:

   ```sh
   cp .env.sample .env
   ```
3. Open the `.env` file and add the necessary values for the following variables:

   * `PORT`: The port for the backend server (e.g., 8000).
   * `CORS_ORIGIN`: The URL of your frontend application (e.g., `http://localhost:5173`).
   * `MONGO_URI`: Your MongoDB connection string.
   * `DB_NAME`: The name of your database.
   * `JWT_SECRET`: A strong, secret string for signing JWTs.
   * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary credentials for image uploads.

## Usage

The application can be run in development or production mode.

### Development Mode

For the best development experience with hot-reloading, run the frontend and backend servers in separate terminals.

* **To run the backend server:**

  ```sh
  cd backend
  npm run dev
  ```

  The server will start on the port specified in your `.env` file.

* **To run the frontend development server:**

  ```sh
  cd frontend
  npm run dev
  ```

  The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Production Mode

The root `package.json` provides scripts to build and run the application for production.

1. **Build the application:**
   This command installs all dependencies and creates a production-ready build of the frontend.

   ```sh
   npm run build
   ```

2. **Start the production server:**
   This command starts only the backend server, which should be configured to serve the static frontend files.

   ```sh
   npm run start
   ```

## Author

👤 **Hassan Khan**

* GitHub: [@hassan-khan07](https://github.com/hassan-khan07)
