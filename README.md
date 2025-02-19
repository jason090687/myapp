# E-Library Management System

A desktop application built with Electron, React, and Redux for managing library resources.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jason090687/myapp.git
cd myapp
```

2. Install dependencies:
```bash
npm install
```

## Project Setup

1. Initialize a new Electron project with Vite:
```bash
npm create @quick-start/electron
```

2. Install required dependencies:
```bash
# Core dependencies
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install react-icons
npm install axios
npm install redux-persist

# Development dependencies
npm install -D tailwindcss postcss autoprefixer
```

3. Configure Tailwind CSS:
```bash
npx tailwindcss init -p
```

4. Configure Electron Builder (electron-builder.json):
```json
{
  "appId": "com.elibrary.app",
  "productName": "E-Library",
  "directories": {
    "output": "dist"
  },
  "win": {
    "target": ["nsis"]
  },
  "mac": {
    "target": ["dmg"]
  },
  "linux": {
    "target": ["AppImage"]
  }
}
```

## Project Structure

```
myapp/
├── src/
│   ├── main/              # Electron main process
│   └── renderer/          # React application
│       ├── src/
│       │   ├── components/  # Reusable components
│       │   ├── pages/       # Page components
│       │   ├── features/    # Redux slices
│       │   └── store/       # Redux store
│       └── index.html
├── electron-builder.json
└── package.json
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
```

## Features

- User Authentication
- Book Management
- Borrowing System
- History Tracking
- Dashboard Analytics
- Settings Management
- Help Documentation

## Main Components

1. Sidebar Navigation
2. Top Navigation Bar
3. Dashboard
4. Books Management
5. Borrowing System
6. History Tracking
7. Settings Panel
8. Help System

## Technologies Used

- Electron
- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- SQLite/IndexedDB

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
