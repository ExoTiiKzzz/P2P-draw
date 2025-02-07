import Canvas from "./canvas.js";
import CustomPeer from "./peer.js";

const ourPeerEl = document.getElementById('self-id');
const remotePeerEl = document.getElementById('remote-id');
const updateSelfIdButton = document.getElementById('update-self-id');
const connectButton = document.getElementById('connect');
const connectForm = document.getElementById('connect-form');

const canvas = new Canvas('#canvas');
const peer = new CustomPeer(canvas);

document.querySelectorAll('.tool-brush').forEach(function (el) {
    el.addEventListener('click', function () {
        canvas.setStroke(el.dataset.stroke);
    })
})

document.querySelectorAll('.tool-color').forEach(function (el) {
    el.addEventListener('click', function () {
        canvas.setColor(el.dataset.color);
    })
})

document.querySelector('#tool-reset').addEventListener('click', function (e) {
    canvas.reset();
    peer.send({acc: 'reset'});
})

function _init() {
    let selfStoredId = localStorage.getItem('self-id');
    if (selfStoredId != null) {
        ourPeerEl.value = selfStoredId;
    }
    let remoteStoredId = localStorage.getItem('remote-id');
    if (remoteStoredId != null) {
        remotePeerEl.value = remoteStoredId;
    }
    peer.setNewPeerId(ourPeerEl.value);
    setupConnectionForm();
}

function setupConnectionForm() {

    connectButton.onclick = function (ev) {
        ev.preventDefault();
        if (remotePeerEl.value != null) {
            localStorage.setItem('remote-id', remotePeerEl.value);
            peer.connect(remotePeerEl.value);
            connectForm.style.visibility = 'hidden';
        }
        return false;
    };

    updateSelfIdButton.onclick = function (ev) {
        ev.preventDefault();
        localStorage.setItem('self-id', ourPeerEl.value);
        peer.setNewPeerId(ourPeerEl.value);
        return false;
    }
}

window.addEventListener('peer-open', function (ev) {
    ourPeerEl.value = ev.detail;
})

window.addEventListener('peer-close', function (ev) {
    connectForm.style.visibility = 'visible';
    alert('connection closed');
})


_init();