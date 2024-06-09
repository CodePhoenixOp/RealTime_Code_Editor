# Real-time Online Code Editor

A collaborative coding platform that allows multiple users to write and edit code in real-time. It supports multiple programming languages and features real-time chat.

## Features

- Real-time Collaboration
- Syntax IntelliSense
- Notifications features
- Responsive design

## Technologies Used

- Frontend: HTML, CSS, JavaScript, React.js
- Backend: Node.js, Next.js
- API: Integrated API for editor intelliSense
- Technoloogies: CodeMirror, Socket.io, Toaster

## Getting Started

### Prerequisites

- Node.js installed and running

### Installation

1. Clone the repository:

```bash
$ git clone https://github.com/MadPhoenixOp/RealTime_Code_Editor.git
```

2. Install frontend dependencies:

```bash
$ npm install
```

3. Set up environment variables for the frontend:

```bash
$ REACT_APP_BACKEND_URL=http://localhost:5000
```

4. Create a production build:

```bash
$ npm run build
```

5. Start the server using script defined in package.json. Server will server the static file from build folder:

```bash
$ npm run server:dev
```

5. Visit [http://localhost:5000](http://localhost:5000)
