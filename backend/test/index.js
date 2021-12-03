
const ws = new WebSocket('ws://127.0.0.1:3000/ws');
ws.binaryType = "blob";
ws.onopen = function open() {
    const array = new Uint8Array(1);
    array[0]=1;
    ws.send(array);
};