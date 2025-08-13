# AlumConnect

AlumConnect is a platform designed to connect alumni, allowing them to share updates, find old classmates, and network with each other.

## Features

- User registration and authentication
- Alumni search by name, batch, branch
- User profiles with education and career details
- Post and feed system for sharing updates
- Admin dashboard for user and content management

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository

```
git clone <repository-url>
cd AlumConnect
```

2. Install dependencies

```
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost/alumconnect
SECRET=your_jwt_secret_key
```

4. Start the server

```
npm start
```

5. Set up the first admin user (make sure the server is running)

```
npm run setup
```

Follow the prompts to create your first admin account.

## Admin Dashboard

The admin dashboard provides powerful tools for managing the AlumConnect platform:

### User Management

- View all registered users
- Add new users (alumni or admin)
- Edit user details
- Delete users

### Feed Management

- View all posts
- Create new posts
- Edit existing posts
- Delete posts

### Admin Levels

- Super Admin: Full access to all features, can create/delete other admins
- Content Admin: Manage posts and content, can manage regular users
- User Admin: Manage regular user accounts

### Access Controls

- The Admin Dashboard is only visible to users with admin privileges
- Only Super Admins can create new admin accounts
- Only Super Admins can delete existing admin accounts
- All admins can add and remove regular alumni users
- Admins cannot delete their own accounts

## Usage

1. After setting up the first admin, log in with your admin credentials
2. Access the admin dashboard by clicking "Admin Dashboard" in the navigation bar
3. Use the sidebar to navigate between user management and feed management
4. Use the search and filter functions to find specific users or posts
5. Click the edit or delete buttons to modify or remove users/posts

## License

This project is licensed under the ISC License.
