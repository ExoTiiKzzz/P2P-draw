let peer = null;
let conn = null;
const ourPeerEl = document.getElementById('self-id');
const remotePeerEl = document.getElementById('remote-id');
const updateSelfIdButton = document.getElementById('update-self-id');
const connectButton = document.getElementById('connect');
const connectForm = document.getElementById('connect-form');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let prevX = null;
let prevY = null;
let selfColor = 'black';

document.querySelectorAll('.tool-color').forEach(function (el) {
    el.addEventListener('click', function () {
        selfColor = el.dataset.color;
        ctx.strokeStyle = selfColor;
    })
})

document.querySelector('#tool-reset').addEventListener('click', function (e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log('reset');
    conn.send({acc: 'reset'});
})

function _init() {
    _initCanvas();
    let selfStoredId = localStorage.getItem('self-id');
    if (selfStoredId != null) {
        ourPeerEl.value = selfStoredId;
    }
    let remoteStoredId = localStorage.getItem('remote-id');
    if (remoteStoredId != null) {
        remotePeerEl.value = remoteStoredId;
    }
    setNewPeerId(ourPeerEl.value);
    setupConnectionForm();
}

function setNewPeerId(newId) {
    if (peer != null) {
        peer.destroy();
    }
    peer = new Peer(newId, {
        host: '10.148.106.161',
        path: 'peerServer',
        port: 9000
    });

    peer.on('open', function (id) {
        ourPeerEl.value = id;
    });

    peer.on('connection', handleIncomingConnection);
}

function handleIncomingConnection(_conn) {
    conn = _conn;
    console.log('incoming connection from %s', _conn.peer);

    if (peer.connections[_conn.peer].length === 1) {
        conn = peer.connect(_conn.peer);
    }

    let connForm = document.getElementById('connect-form');
    connForm.style.visibility = 'hidden';

    conn.on('data', handleData);
    conn.on('close', function () {
        connectForm.style.visibility = 'visible';
        alert('connection closed');
    });
}

function handleData(data) {
    if (data.acc === "stroke") {
        let x = data.x;
        let y = data.y;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = data.color;
        ctx.stroke();
        prevX = x;
        prevY = y;
        ctx.strokeStyle = selfColor;
    } else if (data.acc === "press") {
        let x = data.x;
        let y = data.y;
        ctx.strokeStyle = data.color;
        ctx.beginPath();
        prevX = x;
        prevY = y;
        ctx.strokeStyle = selfColor;
    } else if (data.acc === "reset") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function setupConnectionForm() {


    connectButton.onclick = function (ev) {
        ev.preventDefault();
        if (remotePeerEl.value != null) {
            localStorage.setItem('remote-id', remotePeerEl.value);
            conn = peer.connect(remotePeerEl.value);
            console.log('connecting...');
            connectForm.style.visibility = 'hidden';
        }
        return false;
    };

    updateSelfIdButton.onclick = function (ev) {
        ev.preventDefault();
        localStorage.setItem('self-id', ourPeerEl.value);
        setNewPeerId(ourPeerEl.value);
        return false;
    }
}


function _initCanvas() {
    canvas.onmousedown = press;
    ctx.mozImageSmoothingEnabled = true;
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = 1;
    prevX = 0;
    prevY = 0;

}

function press(ev) {
    let x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
    let y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
    ev.target.onmousemove = drag;
    document.onmouseup = release;

    ctx.beginPath();
    prevX = x;
    prevY = y;
    // ctx.moveTo(x,y);
    // ctx.lineTo(x, y);
    // ctx.stroke();
    if (typeof (conn) == 'object' && conn.open) {
        conn.send({acc: 'press', x: x, y: y, color: selfColor});
    }

    function drag(ev) {
        let x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
        let y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
        if (x !== prevX || y !== prevY) {
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            //console.log(x, y);
            ctx.stroke();
            // ctx.putImageData(brush, 0, 0, x-ctx.lineWidth/2, y-ctx.lineWidth/2, ctx.lineWidth, ctx.lineWidth);
            // console.log(x, y, prevX, prevY);
            prevX = x;
            prevY = y;
            if (typeof (conn) == 'object' && conn.open) {
                conn.send({acc: 'stroke', x: x, y: y, color: selfColor});
            }
        }
    }

    function release(ev) {
        ev.target.onmousemove = null;
        document.onmouseup = null;
    }
}


_init();