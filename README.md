# ROS Web Control Center

A full-stack browser dashboard for controlling and monitoring a simulated ROS 2 robot using HTML5, CSS3, Bootstrap, JavaScript, Node.js and Express.js.

## Features
- ROS-style node and topic monitoring
- AUTO, MANUAL and STOP modes
- Emergency stop and resume controls
- `/cmd_vel` publishing simulation
- Live robot position and velocity telemetry
- Battery, CPU and memory indicators
- ROS event log
- Topic rates and node status
- Responsive Bootstrap UI
- REST API suitable for replacing the simulator with a real ROS bridge

## Run
```bash
npm install
npm start
```
Open `http://localhost:3000`.

For development:
```bash
npm run dev
```

## API
- `GET /api/status`
- `GET /api/topics`
- `GET /api/nodes`
- `GET /api/logs`
- `POST /api/mode` with `{ "mode": "AUTO|MANUAL|STOP" }`
- `POST /api/cmd-vel` with `{ "linear": 0.3, "angular": 0 }`
- `POST /api/action` with `{ "action": "estop|resume|home" }`

## Connecting to real ROS 2
This project intentionally runs without ROS hardware. For a production deployment, replace the simulated state in `server.js` with a ROS bridge such as `rosbridge_suite`/WebSocket integration, or connect Node.js to an appropriate ROS 2 service layer. Add authentication and authorization before exposing robot controls beyond a trusted network.
