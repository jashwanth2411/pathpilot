const graphArea = document.getElementById('graphArea');
const edgeLayer = document.getElementById('edgeLayer');
const status = document.getElementById('status');
const result = document.getElementById('result');

const btnNode = document.getElementById('btnNode');
const btnEdge = document.getElementById('btnEdge');
const btnStart = document.getElementById('btnStart');
const btnEnd = document.getElementById('btnEnd');
const btnRun = document.getElementById('btnRun');
const btnReset = document.getElementById('btnReset');

const modalBackdrop = document.getElementById('modalBackdrop');
const weightInput = document.getElementById('weightInput');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

let nodes = [];   
let edges = [];  
let mode = 'node';
let locked = false;
let edgeFirst = null;
let pendingEdgePair = null;
let startId = null;
let endId = null;
let nextLetter = 0;

function letterFor(i) {
  let s = '';
  i++;
  while (i > 0) {
    let rem = (i - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

function setMode(m) {
  if (locked) return;
  mode = m;
  edgeFirst = null;
  [btnNode, btnEdge, btnStart, btnEnd].forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.node.selected').forEach(n => n.classList.remove('selected'));

  if (m === 'node') { btnNode.classList.add('active'); status.textContent = 'Click on the map to add a node.'; }
  if (m === 'edge') { btnEdge.classList.add('active'); status.textContent = 'Click a node, then click another node to connect them.'; }
  if (m === 'start') { btnStart.classList.add('active'); status.textContent = 'Click a node to set it as the start.'; }
  if (m === 'end') { btnEnd.classList.add('active'); status.textContent = 'Click a node to set it as the end.'; }
}

function addNode(x, y) {
  const id = nodes.length;
  const label = letterFor(nextLetter++);
  const el = document.createElement('div');
  el.className = 'node';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.textContent = label;
  graphArea.appendChild(el);

  const node = { id, label, x, y, el };
  nodes.push(node);

  el.addEventListener('click', (e) => { e.stopPropagation(); handleNodeClick(node); });
  el.addEventListener('dblclick', (e) => { e.stopPropagation(); removeNode(node); });
}

function removeNode(node) {
  if (locked) return;
  node.el.remove();
  edges = edges.filter(e => {
    if (e.a === node.id || e.b === node.id) {
      e.lineEl.remove();
      e.labelEl.remove();
      return false;
    }
    return true;
  });
  nodes = nodes.filter(n => n.id !== node.id);
  if (startId === node.id) startId = null;
  if (endId === node.id) endId = null;
  result.classList.remove('show');
}

function handleNodeClick(node) {
  if (locked) return;

  if (mode === 'edge') {
    if (!edgeFirst) {
      edgeFirst = node;
      node.el.classList.add('selected');
      status.textContent = 'Now click a second node to connect to ' + node.label + '.';
    } else if (edgeFirst.id !== node.id) {
      pendingEdgePair = [edgeFirst, node];
      const dx = node.x - edgeFirst.x, dy = node.y - edgeFirst.y;
      const dist = Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy) / 8));
      weightInput.value = dist;
      modalBackdrop.classList.add('show');
      edgeFirst.el.classList.remove('selected');
      edgeFirst = null;
    }
  } else if (mode === 'start') {
    if (startId !== null) {
      const prev = nodes.find(n => n.id === startId);
      if (prev) prev.el.classList.remove('start');
    }
    startId = node.id;
    node.el.classList.add('start');
    status.textContent = 'Start set to ' + node.label + '.';
  } else if (mode === 'end') {
    if (endId !== null) {
      const prev = nodes.find(n => n.id === endId);
      if (prev) prev.el.classList.remove('end');
    }
    endId = node.id;
    node.el.classList.add('end');
    status.textContent = 'End set to ' + node.label + '.';
  }
}

function addEdge(a, b, w) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', a.x);
  line.setAttribute('y1', a.y);
  line.setAttribute('x2', b.x);
  line.setAttribute('y2', b.y);
  line.setAttribute('stroke', '#bbb');
  line.setAttribute('stroke-width', '2');
  edgeLayer.appendChild(line);

  const label = document.createElement('div');
  label.className = 'edge-label';
  label.style.left = ((a.x + b.x) / 2) + 'px';
  label.style.top = ((a.y + b.y) / 2) + 'px';
  label.textContent = w;
  graphArea.appendChild(label);

  edges.push({ a: a.id, b: b.id, w, lineEl: line, labelEl: label });
}

graphArea.addEventListener('click', (e) => {
  if (locked || mode !== 'node') return;
  if (e.target !== graphArea && e.target !== edgeLayer) return;
  const rect = graphArea.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (x < 25 || y < 25 || x > rect.width - 25 || y > rect.height - 25) return;
  addNode(x, y);
});

modalConfirm.addEventListener('click', () => {
  const w = parseFloat(weightInput.value) || 1;
  if (pendingEdgePair) addEdge(pendingEdgePair[0], pendingEdgePair[1], w);
  pendingEdgePair = null;
  modalBackdrop.classList.remove('show');
});

modalCancel.addEventListener('click', () => {
  pendingEdgePair = null;
  modalBackdrop.classList.remove('show');
});

btnNode.addEventListener('click', () => setMode('node'));
btnEdge.addEventListener('click', () => setMode('edge'));
btnStart.addEventListener('click', () => setMode('start'));
btnEnd.addEventListener('click', () => setMode('end'));

btnReset.addEventListener('click', () => {
  nodes.forEach(n => n.el.remove());
  edges.forEach(e => { e.lineEl.remove(); e.labelEl.remove(); });
  nodes = [];
  edges = [];
  startId = null;
  endId = null;
  nextLetter = 0;
  locked = false;
  btnRun.disabled = false;
  result.classList.remove('show');
  setMode('node');
});

function buildAdjacency() {
  const adj = {};
  nodes.forEach(n => adj[n.id] = []);
  edges.forEach(e => {
    adj[e.a].push({ to: e.b, w: e.w });
    adj[e.b].push({ to: e.a, w: e.w });
  });
  return adj;
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runDijkstra() {
  if (startId === null || endId === null) {
    status.textContent = 'Please set both a start and end node first.';
    return;
  }
  if (nodes.length < 2 || edges.length === 0) {
    status.textContent = 'Add at least two nodes and one edge first.';
    return;
  }

  locked = true;
  btnRun.disabled = true;
  status.textContent = 'Finding shortest path...';
  result.classList.remove('show');
  nodes.forEach(n => n.el.classList.remove('onpath'));
  edges.forEach(e => e.lineEl.setAttribute('stroke', '#bbb'));

  const adj = buildAdjacency();
  const dist = {}, prev = {}, visited = {};
  nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null; visited[n.id] = false; });
  dist[startId] = 0;

  for (let iter = 0; iter < nodes.length; iter++) {
    let u = null, best = Infinity;
    nodes.forEach(n => { if (!visited[n.id] && dist[n.id] < best) { best = dist[n.id]; u = n.id; } });
    if (u === null) break;

    const nodeU = nodes.find(n => n.id === u);
    nodeU.el.classList.add('visiting');
    await sleep(400);
    nodeU.el.classList.remove('visiting');

    visited[u] = true;

    (adj[u] || []).forEach(edgeInfo => {
      const alt = dist[u] + edgeInfo.w;
      if (alt < dist[edgeInfo.to]) {
        dist[edgeInfo.to] = alt;
        prev[edgeInfo.to] = u;
      }
    });

    if (u === endId) break;
  }

  if (dist[endId] === Infinity) {
    result.innerHTML = '<b>No path found</b> between the selected nodes.';
  } else {
    const path = [];
    let cur = endId;
    while (cur !== null && cur !== undefined) {
      path.unshift(cur);
      cur = prev[cur];
    }
    path.forEach((id, i) => {
      const n = nodes.find(x => x.id === id);
      n.el.classList.add('onpath');
      if (i < path.length - 1) {
        const nextId = path[i + 1];
        const e = edges.find(ed => (ed.a === id && ed.b === nextId) || (ed.b === id && ed.a === nextId));
        if (e) e.lineEl.setAttribute('stroke', '#27ae60');
      }
    });
    const labels = path.map(id => nodes.find(n => n.id === id).label).join(' → ');
    result.innerHTML = '<b>Shortest Path:</b> ' + labels + '<br><b>Total Distance:</b> ' + dist[endId];
  }

  result.classList.add('show');
  status.textContent = 'Done. Click Reset to try again, or add more nodes.';
  btnRun.disabled = false;
  locked = false;
}

btnRun.addEventListener('click', runDijkstra);
