const $ = s=>document.querySelector(s); let chart;
function initChart() {
    chart = new Chart($('#chart'), {
        type: 'line', data: {
            labels: [], datasets: [{
                label: 'Linear m/s', data: [], tension: .3
            }, {
                label: 'Angular rad/s', data: [], tension: .3
            }]}, options: {
            responsive: true, animation: false, scales: {
                y: {
                    beginAtZero: false
                }}}})}
async function api(url, opt) {
    const r = await fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        }, ...opt
    }); return r.json()}
function updateChart(v) {
    const labels = chart.data.labels; labels.push(new Date().toLocaleTimeString()); chart.data.datasets[0].data.push(v.linear); chart.data.datasets[1].data.push(v.angular); if (labels.length > 20) {
        labels.shift(); chart.data.datasets.forEach(d => d.data.shift())}chart.update()}
function renderTopics(ts) {
    $('#topics').innerHTML = ts.map(t => `<tr><td><code>${t.name}</code></td><td class="small">${t.type}</td><td>${t.rate} Hz</td><td><span class="badge text-bg-success">active</span></td></tr>`).join('')}
function renderNodes(ns) {
    $('#nodes').innerHTML = ns.map(n => `<tr><td><code>${n.name}</code></td><td><span class="badge text-bg-success">${n.status}</span></td></tr>`).join('')}
function renderLogs(ls) {
    $('#logs').innerHTML = ls.map(l => `<div class="log"><span class="time">${new Date(l.time).toLocaleTimeString()}</span> <b>${l.level}</b> ${l.message}</div>`).join('')}
async function refresh() {
    const s = await api('/api/status'); $('#battery').textContent = s.battery.toFixed(0)+'%'; $('#cpu').textContent = s.cpu.toFixed(0)+'%'; $('#memory').textContent = s.memory.toFixed(0)+'%'; $('#position').textContent = `${s.position.x.toFixed(1)}, ${s.position.y.toFixed(1)}`; const r = $('#robot'); r.style.left = `${10+s.position.x*8}%`; r.style.top = `${55-s.position.y*8}%`; r.style.transform = `rotate(${s.position.theta}rad)`; document.querySelectorAll('.mode').forEach(b => {
        b.classList.toggle('btn-success', b.dataset.mode === s.mode); b.classList.toggle('btn-outline-primary', b.dataset.mode !== s.mode && b.dataset.mode === 'MANUAL'); b.classList.toggle('btn-outline-secondary', b.dataset.mode !== s.mode && b.dataset.mode === 'STOP')}); updateChart(s.velocity); renderLogs(s.logs)}
async function setMode(mode) {
    await api('/api/mode', {
        method: 'POST', body: JSON.stringify({
            mode
        })}); refresh()}
document.querySelectorAll('.mode').forEach(b => b.onclick = ()=>setMode(b.dataset.mode)); $('#sendVel').onclick = async()=> {
    await api('/api/cmd-vel', {
        method: 'POST', body: JSON.stringify({
            linear: +$('#linear').value, angular: +$('#angular').value
        })}); refresh()}; $('#estop').onclick = async()=> {
    await api('/api/action', {
        method: 'POST', body: JSON.stringify({
            action: 'estop'
        })}); refresh()}; $('#resume').onclick = async()=> {
    await api('/api/action', {
        method: 'POST', body: JSON.stringify({
            action: 'resume'
        })}); refresh()}; $('#home').onclick = async()=> {
    await api('/api/action', {
        method: 'POST', body: JSON.stringify({
            action: 'home'
        })}); refresh()};
(async()=> {
    initChart(); const [t, n] = await Promise.all([api('/api/topics'), api('/api/nodes')]); renderTopics(t); renderNodes(n); await refresh(); setInterval(refresh, 1000); setInterval(async()=>renderLogs(await api('/api/logs')), 2000)})();