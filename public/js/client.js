const socket = io();

const form = document.querySelector("form");
const messageInp = document.querySelector("#messageInp");
const file = document.querySelector("#messageFile");
const messageContainer = document.querySelector(".container");
var fileType;
var loaded = false;

file.onchange = evt => {
    loaded = true;
    fileType = evt.target.files[0];
}

const append = (message, position, name) => {
    const messageElm = document.createElement("div");
    const date = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const newLine = "\r\n";
    const time = document.createElement("span");
    const sender = document.createElement("span");
    if (name) {
        if (position === "left") {
            sender.classList.add("nameLeft");
        } else {
            sender.classList.add("nameRight");
        }
        sender.innerText = name;
    }
    time.innerText = days[date.getDay()] + " " + date.toLocaleTimeString()
    messageElm.innerText = message + newLine;
    messageElm.classList.add("message");
    messageElm.classList.add(position);
    messageElm.append(time);
    messageContainer.append(sender);
    messageContainer.append(messageElm);
}

const name = prompt("Enter your name");

form.addEventListener("submit", e => {
    e.preventDefault();
    if (loaded) {
        const imageElm = document.createElement("img");
        const sender = document.createElement("span");
        sender.innerText = "You";
        sender.classList.add("nameRight");
        imageElm.src = URL.createObjectURL(fileType);
        imageElm.classList.add("message");
        imageElm.classList.add("right");
        messageContainer.append(sender);
        messageContainer.append(imageElm);
        var reader = new FileReader();
        reader.onload = event => {
            socket.emit("image", { "name": name, "file": event.target.result });
        }
        reader.readAsDataURL(fileType);
        loaded = false;
        form.reset();
    }
    const message = messageInp.value;
    if (messageInp.value !== "") {
        append(`${message}`, "right", "You");
        socket.emit("send", { "name": name, "message": message });
        form.reset();
    }
});

socket.emit("new-user-joined", name);

socket.on("load", history => {
    for (let i = 0; i < history.length; i++) {
        if (history[i].message !== "image") {
            if (history[i].class !== "center") {
                append(`${history[i].message}`, `${history[i].class}`, `${history[i].name}`);
            } else {
                append(`${history[i].name} ${history[i].message}`, `${history[i].class}`);
            }
        } else {
            const imageElm = document.createElement("img");
            const sender = document.createElement("span");
            sender.classList.add("nameLeft");
            sender.innerText = history[i].name;
            imageElm.src = history[i].file;
            imageElm.classList.add("message");
            imageElm.classList.add("left");
            messageContainer.append(sender);
            messageContainer.append(imageElm);
        }
    }
});

socket.on("user-joined", name => {
    append(`${name} has joined the chat.`, "center");
}
);

socket.on("receive", data => {
    append(`${data.message}`, "left", `${data.name}`);
}
);

socket.on("image-send", image => {
    const sender = document.createElement("span");
    sender.classList.add("nameLeft");
    sender.innerText = image.name;
    const receivedImg = document.createElement("img");
    receivedImg.src = image.file;
    receivedImg.classList.add("message");
    receivedImg.classList.add("left");
    messageContainer.append(sender);
    messageContainer.append(receivedImg);
});

socket.on("left", name => {
    append(`${name} has left the chat.`, "center");
}
);
