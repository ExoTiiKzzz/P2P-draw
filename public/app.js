let peer = null;
const ourPeerEl = document.getElementById('self-id');
const remotePeerEl = document.getElementById('remote-id');
const connectButton = document.getElementById('connect');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let prevX = null;
let prevY = null;

function _init() {
    _initCanvas();
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
        port: location.port
    });

    peer.on('open', function (id) {
        ourPeerEl.value = id;
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
    connectButton.onclick = function (ev) {
        ev.preventDefault();
        if (remotePeerEl.value != null) {
            let conn = peer.connect(remotePeerEl.value);
            console.log('connecting...');
            let connForm = document.getElementById('connect-form');
            connForm.style.visibility = 'hidden';
        }
        return false;
    };
}


function _initCanvas() {
    canvas.onmousedown = press;
    ctx.mozImageSmoothingEnabled = true;
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = 1;
    prevx = 0, prevy = 0;

}

function press(ev) {
    var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
    var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
    ev.target.onmousemove = drag;
    document.onmouseup = release;

    ctx.beginPath();
    prevx = x;
    prevy = y;
    // ctx.moveTo(x,y);
    // ctx.lineTo(x, y);
    // ctx.stroke();
    if (typeof (conn) == 'object' && conn.open) {
        conn.send({acc: 'press', x: x, y: y});
    }

    function drag(ev) {
        var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
        var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
        if (x != prevx || y != prevy) {
            ctx.beginPath();
            ctx.moveTo(prevx, prevy);
            ctx.lineTo(x, y);
            //console.log(x, y);
            ctx.stroke();
            // ctx.putImageData(brush, 0, 0, x-ctx.lineWidth/2, y-ctx.lineWidth/2, ctx.lineWidth, ctx.lineWidth);
            // console.log(x, y, prevx, prevy);
            prevx = x;
            prevy = y;
            if (typeof (conn) == 'object' && conn.open) {
                conn.send({acc: 'stroke', x: x, y: y});
            }
        }
    }

    function release(ev) {
        ev.target.onmousemove = null;
        document.onmouseup = null;
    }
}


_init();