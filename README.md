# WiChat 2.0

WiChat 2.0 is a feature-rich MERN stack real-time chat application, designed for seamless communication with a modern and intuitive user experience. It supports individual, media sharing, and advanced messaging features.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Folder Structure](#folder-structure)
- [Features in Detail](#features-in-detail)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure login and registration using JWT.
- **Real-time Messaging**: Send and receive messages instantly.
- **Reply to Messages**: Double-tap a message to reply and view contextual replies.
- **Media Sharing**: Share images and files within chats.
- **Online Status**: Real-time status indicators for users.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend**:
  - React.js
  - Tailwind CSS
  - Socket.io-client
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB (Mongoose for schema management)
  - Socket.io
- **Others**:
  - JWT for authentication
  - Multer for file uploads

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js Latest for .env file support
- MongoDB

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/thekiranmahajan/witchat2.o.git
   cd witchat2.o
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Run the development servers:

   ```bash
   # Start backend
   cd backend
   npm start

   # Start frontend
   cd ../frontend
   npm start
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
PORT=5001
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret-key>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
NODE_ENV=development || production
```

## Folder Structure

### Backend

```
backend/
├── src/
│   ├── controllers/
│   ├── lib/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── store/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
```

## Features in Detail

### User Authentication

- Secure registration and login.
- JWT-based session management.

### Real-time Messaging

- Socket.io integration for instantaneous communication.

### Reply to Messages

- Double-tap a message to set it as a reply.
- Display the original message when viewing a reply.
- Auto-scroll and highlight the referenced message when clicked.


### Media Sharing

- Upload and share images directly in chats.
- Preview shared media.

### Online Status

- View real-time online/offline status of users.


### Responsive Design

- Fully optimized for desktops, tablets, and mobile devices.

## Screenshots

...

## Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes and commit them (`git commit -m 'Add feature-name'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

For any queries or suggestions, feel free to reach out!
