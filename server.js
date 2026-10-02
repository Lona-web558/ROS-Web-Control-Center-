const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const state = {
  connected: true,
  mode: 'AUTO',
  rosVersion: 'ROS 2 Jazzy',
  uptime: 0,
  battery: 82,
  cpu: 31,
  memory: 54,
  position: { x: 4.2, y: 3.7, theta: 0.8 },
  velocity: { linear: 0.35, angular: 0.02 },
  topics: [
    {name:'/cmd_vel', type:'geometry_msgs/msg/Twist', rate:10, active:true},
    {name:'/odom', type:'nav_msgs/msg/Odometry', rate:20, active:true},
    {name:'/scan', type:'sensor_msgs/msg/LaserScan', rate:8, active:true},
    {name:'/camera/image_raw', type:'sensor_msgs/msg/Image', rate:15, active:true},
    {name:'/battery_state', type:'sensor_msgs/msg/BatteryState', rate:1, active:true}
  ],
  nodes: [
    {name:'/web_bridge', status:'running'},
    {name:'/navigation', status:'running'},
    {name:'/laser_scan', status:'running'},
    {name:'/camera_driver', status:'running'},
    {name:'/motor_controller', status:'running'}
  ],
  logs: []
};

function log(message, level='INFO') {
  state.logs.unshift({time:new Date().toISOString(), level, message});
  state.logs = state.logs.slice(0, 40);
}
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
log('ROS Web Control Center connected to simulated ROS graph.');

setInterval(() => {
  state.uptime += 1;
  if (state.mode === 'AUTO') {
    state.position.x += state.velocity.linear * 0.05;
    state.position.y += Math.sin(state.position.x) * 0.002;
    state.position.theta += state.velocity.angular * 0.05;
    state.battery = clamp(state.battery - 0.003, 0, 100);
  }
  state.cpu = clamp(28 + Math.random()*12 + state.velocity.linear*8, 0, 100);
  state.memory = clamp(48 + Math.random()*12, 0, 100);
}, 1000);

app.get('/api/status', (req,res)=>res.json({ok:true, ...state}));
app.get('/api/topics', (req,res)=>res.json(state.topics));
app.get('/api/nodes', (req,res)=>res.json(state.nodes));
app.get('/api/logs', (req,res)=>res.json(state.logs));
app.post('/api/mode', (req,res)=>{
  const mode = String(req.body.mode || '').toUpperCase();
  if (!['AUTO','MANUAL','STOP'].includes(mode)) return res.status(400).json({error:'Invalid mode'});
  state.mode = mode;
  if(mode==='STOP') state.velocity={linear:0,angular:0};
  log(`Control mode changed to ${mode}`,'ACTION');
  res.json({ok:true,mode:state.mode});
});
app.post('/api/cmd-vel', (req,res)=>{
  if(state.mode!=='MANUAL') return res.status(409).json({error:'Switch to MANUAL mode first'});
  const linear=clamp(Number(req.body.linear)||0,-1,1);
  const angular=clamp(Number(req.body.angular)||0,-2,2);
  state.velocity={linear,angular};
  log(`cmd_vel published: linear=${linear.toFixed(2)}, angular=${angular.toFixed(2)}`,'CMD');
  res.json({ok:true,velocity:state.velocity});
});
app.post('/api/action',(req,res)=>{
  const action=req.body.action;
  if(action==='estop'){ state.mode='STOP'; state.velocity={linear:0,angular:0}; log('EMERGENCY STOP activated','ERROR'); return res.json({ok:true}); }
  if(action==='resume'){ state.mode='MANUAL'; log('Robot control resumed in MANUAL mode','ACTION'); return res.json({ok:true}); }
  if(action==='home'){ state.position={x:0,y:0,theta:0}; log('Navigation goal: HOME','ACTION'); return res.json({ok:true}); }
  return res.status(400).json({error:'Unknown action'});
});
app.post('/api/log',(req,res)=>{log(String(req.body.message||'Operator event'),'OPERATOR');res.json({ok:true});});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.listen(PORT,()=>console.log(`ROS Web Control Center: http://localhost:${PORT}`));
