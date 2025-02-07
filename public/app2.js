import Canvas from "./canvas.js";
import CustomPeer from "./peer.js";

const ourPeerEl = document.getElementById('self-id');
const remotePeerEl = document.getElementById('remote-id');
const updateSelfIdButton = document.getElementById('update-self-id');
const connectButton = document.getElementById('connect');
const connectForm = document.getElementById('connect-form');

const canvas = new Canvas('#canvas');
const peer = new CustomPeer(canvas);

let currentColor = '#000000';

document.querySelectorAll('.tool').forEach(function (el) {
    el.addEventListener('click', function () {
        removeActiveClass();
        el.classList.add('active');
    })
})

document.querySelectorAll('.tool-brush').forEach(function (el) {
    el.addEventListener('click', function () {
        canvas.setStroke(el.dataset.stroke);
        canvas.setColor(currentColor);
        canvas.setShowArea(false);
    })
})

document.querySelectorAll('.tool-color').forEach(function (el) {
    el.addEventListener('click', function () {
        currentColor = el.dataset.color;
        canvas.setColor(currentColor);
    })
})

document.querySelector('#tool-eraser').addEventListener('click', function (e) {
    canvas.setColor('#ffffff');
    canvas.setStroke(25);
    canvas.setShowArea(true);
})

document.querySelector('#tool-reset').addEventListener('click', function (e) {
    canvas.reset();
    peer.send({acc: 'reset'});
})

function removeActiveClass() {
    document.querySelectorAll('.tool').forEach(function (el) {
        el.classList.remove('active');
    })
}

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

window.addEventListener('canvas-press', function (ev) {
    peer.send({acc: 'press', x: ev.detail.x, y: ev.detail.y, color: ev.detail.color});
})

window.addEventListener('canvas-drag', function (ev) {
    peer.send({acc: 'stroke', x: ev.detail.x, y: ev.detail.y, color: ev.detail.color, lineWidth: ev.detail.lineWidth});
})


_init();