export default class CustomPeer {
    peer = null
    conn = null
    canvas = null

    constructor(canvas) {
        this.canvas = canvas;
    }

    setNewPeerId(newId) {
        if (this.peer != null) {
            this.peer.destroy();
        }
        this.peer = new Peer(newId, {
            host: '/',
            path: 'peerServer',
            port: 9000
        });

        this.peer.on('open', (id) => {
            const event = new CustomEvent('peer-open', {detail: id});
            window.dispatchEvent(event);
        });

        this.peer.on('connection', (_conn) => this.handleIncomingConnection(_conn));
    }

    handleIncomingConnection(_conn) {
        this.conn = _conn;

        if (this.peer.connections[_conn.peer].length === 1) {
            this.conn = this.peer.connect(_conn.peer);
        }

        let connForm = document.getElementById('connect-form');
        connForm.style.visibility = 'hidden';

        this.conn.on('data', (data) => this.handleData(data));
        this.conn.on('close', function () {
            const event = new CustomEvent('peer-close', {detail: 'connection closed'});
            window.dispatchEvent(event);
        });
    }

    handleData(data) {
        if (data.acc === "stroke") {
            this.canvas.handleStroke(data.x, data.y, data.color, data.lineWidth);
        } else if (data.acc === "press") {
            this.canvas.handlePress(data.x, data.y, data.color);
        } else if (data.acc === "reset") {
            this.canvas.reset();
        }
    }

    send(data) {
        if (typeof (this.conn) == 'object' && this.conn.open) {
            this.conn.send(data);
        }
    }

    connect(remoteId) {
        this.conn = this.peer.connect(remoteId);
        console.log('connecting...');
    }
}