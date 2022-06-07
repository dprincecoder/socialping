const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const leaveRoomBtn = document.getElementById("leave-btn");
const chatFormInput = document.querySelector(".chat-form-input");

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
  botMessage(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

let allMessages = JSON.parse(localStorage.getItem(room));
outputMessage(allMessages);

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit("chatMessage", msg);
  if (allMessages.length == 0 || allMessages.length == undefined) {
    const newMessage = {
      username: username,
      text: msg,
      time: new Date().toLocaleTimeString(),
    };
    localStorage.setItem(room, JSON.stringify([newMessage]));
  } else {
    allMessages.push({
      username: username,
      text: msg,
      time: new Date().toLocaleTimeString(),
    });
    localStorage.setItem(room, JSON.stringify(allMessages));
  }

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
  window.location.reload();
});

//bot message to DOM
function botMessage(msg) {
  console.log(msg);
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = msg.username;
  p.innerHTML += `<span>${msg.time}</span>`;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = msg.text;
  div.appendChild(para);
  document.querySelector(".bot-message").appendChild(div);
}

// Output message to DOM
function outputMessage(message) {
  message.map((msg) => {
    const div = document.createElement("div");
    div.classList.add("message");
    const p = document.createElement("p");
    p.classList.add("meta");
    p.innerText = msg.username;
    p.innerHTML += `<span>${msg.time}</span>`;
    div.appendChild(p);
    const para = document.createElement("p");
    para.classList.add("text");
    para.innerText = msg.text;
    div.appendChild(para);
    document.querySelector(".all-message").appendChild(div);
  });
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
leaveRoomBtn.addEventListener("click", () => {
  const leaveRoom = confirm(
    "Are you sure you want to leave the chatroom?. Both you and the other users chat history will be lost."
  );
  if (leaveRoom) {
    window.location = "../index.html";
    localStorage.removeItem(room);
  } else {
  }
});

//logout user if inactive for more than 30 minutes
const timeout = 30 * 60 * 1000;

let counter = 0;
function timeDown(time) {
  counter = setInterval(timer, 1000);
  function timer() {
    time--;
    console.log(time);
    if (time < 1) {
      localStorage.removeItem(room);
      window.location = "../index.html";
    }
    if (time < 0) {
      clearInterval(counter);
    }
  }
  //cancele timeout if user is active and typing
  chatFormInput.addEventListener("keypress", (e) => {
    clearInterval(counter);
  });
}
window.onload = timeDown(timeout);
