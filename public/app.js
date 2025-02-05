function _init() {
    _initCanvas();
    setupPeer();
    setupConnectionForm();
}

function setupPeer() {
    let id = document.getElementById("peer-id-in");
    let peer = new Peer({
        host: '10.148.106.161',
        path: 'peerServer',
        port: location.port
    });

    peer.on('open', function (id) {
        let idel = document.getElementById('peer-id');
        idel.value = id;
    });

    peer.on('connection', handleIncomingConnection);
}

function handleIncomingConnection(_conn) {
    let conn = _conn;
    console.log('incoming connection from %s', _conn.peer);

    if (peer.connections[_conn.peer].length == 1) {
        conn = peer.connect(_conn.peer);
    }

    let connForm = document.getElementById('connect-form');
    connForm.style.visibility = 'hidden';

    conn.on('data', handleData);
}

function handleData(data) {
    if (data.acc == "stroke") {
        let x = data.x;
        let y = data.y;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        prevX = x;
        prevY = y;
    } else if (data.acc == "press") {
        let x = data.x;
        let y = data.y;
        ctx.beginPath();
        prevX = x;
        prevY = y;
    }
}

function setupConnectionForm() {
    let remote = document.getElementById("remotePeer");
    let button = document.getElementById("connect");

    button.onclick = function (ev) {
        ev.preventDefault();
        if (remote.value != null) {
            let conn = peer.connect(remote.value);
            console.log('connecting...');
            let connForm = document.getElementById('connect-form');
            connForm.style.visibility = 'hidden';
        }
        return false;
    };
}

let prevX = null;
let prevY = null;
let peer;

_init();