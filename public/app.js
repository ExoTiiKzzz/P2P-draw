function _init() {
    _initCanvas();
    let id = document.getElementById("peer-id-in");
    let remote = document.getElementById("remotePeer");
    let button = document.getElementById("connect");
    let prevX = null;
    let prevY = null;
    let peer;

    peer = new Peer({host: 'http://10.148.106.161/', path: 'peerServer', port: location.port});

    peer.on('open', function (id) {
        let idel = document.getElementById('peer-id');
        idel.value = id;
    });

    peer.on('connection', function (_conn) {

        conn = _conn;
        console.log('incoming connection from %s', _conn.peer);

        if (peer.connections[_conn.peer].length == 1) {
            conn = peer.connect(_conn.peer);
        }


        let connForm = document.getElementById('connect-form');
        connForm.style.visibility = 'hidden';

        conn.on('data', function (data) {
            if (data.acc == "stroke") {
                let x = data.x;
                let y = data.y;

                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.stroke();
                // console.log(x, y, prevX, prevY);
                prevX = x;
                prevY = y;
            } else if (data.acc == "press") {
                let x = data.x;
                let y = data.y;
                ctx.beginPath();
                prevX = x;
                prevY = y;
            }
        });
    });

    button.onclick = function (ev) {
        ev.preventDefault();
        if (remote.value != null) {
            conn = peer.connect(remote.value);
            console.log('connecting...');
            let connForm = document.getElementById('connect-form');
            connForm.style.visibility = 'hidden';
        }
        return false;
    };
}

_init();