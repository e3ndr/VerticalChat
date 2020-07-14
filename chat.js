const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const koi = new Koi("wss://live.casterlabs.co/koi");
const caffeine = new Caffeine();

let colors = ["#E6194B", "#3CB44B", "#FFE119", "#4363D8", "#F58231", "#911EB4", "#46F0F0", "#F032E6", "#BCF60C", "#FABEBE", "#008080", "#E6BEFF", "#9A6324", "#800000", "#AAFFC3", "#808000", "#000075"];
let userColors = {
    "Casterlabs": "red",
    "ItzLcyx": "deeppink",
    "Helvijs": "paleturquoise"
};
let user = getCookie("watching");
let caid;

function postLogin() {
    if (!user) {
        user = document.querySelector("#target").value;

        if (user.length == 0) {
            user = document.querySelector("#username").value;
        }

        setCookie("watching", user);
    }

    getUser(user).then((user) => {
        caid = user.caid;
    });
}

console.log("Vertical chat v1.1.0 https://github.com/e3ndr/VerticalChat");
console.log(" - Supports chat messages");
console.log(" - Supports shares");
console.log(" - Supports donations");
console.log(" - Supports viewers");
console.log(" - Supports sending messages");

window.addEventListener("scroll", checkScroll);

caffeine.login();

koi.addEventListener("close", () => {
    koi.reconnect();
})

koi.addEventListener("open", () => {
    koi.addUser(user);
})

koi.addEventListener("chat", (event) => {
    addMessage(event.sender.username, event.message, event.id);
});

koi.addEventListener("share", (event) => {
    addMessage(event.sender.username, event.message, event.id);
});

koi.addEventListener("donation", (event) => {
    addMessage(event.sender.username, event.message, event.id, event.image);
});

koi.addEventListener("follow", (event) => {
    addStatus(event.follower.username, "follow");
});

function submitMessage() {
    caffeine.sendMessage(document.querySelector("#message").value);

    document.querySelector("#message").value = "";
}

document.querySelector("#sendbutton").addEventListener("click", submitMessage);
document.querySelector("#message").addEventListener("keyup", (e) => {
    if (e.key == "Enter") {
        submitMessage();
    }
});

document.querySelector("#loginanon").addEventListener("click", () => {
    postLogin();
    document.querySelector("#send").classList.add("hide");
    document.querySelector("#login").classList.add("hide");
    document.querySelector("#page").classList.remove("hide");
});

document.querySelector("#signout").addEventListener("click", () => {
    deleteCookie("refresh_token");
    window.location.reload();
});

function getColor(username) {
    if (userColors[username]) {
        return userColors[username];
    } else {
        let random = colors[Math.floor(Math.random() * colors.length)];

        userColors[username] = random;

        return random;
    }
}

function addMessage(sender, message, id, imageLink) {
    let div = document.createElement("div");
    let username = document.createElement("span");
    let text = document.createElement("span");

    username.classList.add("username");
    username.style = "color: " + getColor(sender) + ";";
    username.innerText = sender;

    text.classList.add("text");
    text.innerText = message;

    div.classList.add("chatmessage");
    div.setAttribute("id", id);
    div.appendChild(username);
    div.appendChild(text);

    if (imageLink) {
        let image = document.createElement("img");

        image.classList.add("chatimage");
        image.src = imageLink;

        div.appendChild(image);
    }

    document.querySelector("#chatbox").appendChild(div);

    checkScroll();

    if (isAtBottom()) {
        jumpbottom();
    }
}

function addStatus(user, type) {
    let div = document.createElement("div");
    let username = document.createElement("span");
    let text = document.createElement("span");

    username.classList.add("username");
    username.style = "color: " + getColor(user) + ";";
    username.innerText = user;

    text.classList.add("text");
    switch (type.toLowerCase()) {
        case "leave": text.innerText = "left the stream."; break;
        case "join": text.innerText = "joined the stream."; break;
        case "follow": text.innerText = "started following."; break;
    }

    div.classList.add("chatmessage");
    div.classList.add("status");
    div.appendChild(username);
    div.appendChild(text);

    document.querySelector("#chatbox").appendChild(div);

    checkScroll();

    if (isAtBottom()) {
        jumpbottom();
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    });
}

function getUrlVars() {
    let vars = {};

    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        vars[key] = value;
    });

    return vars;
}

function isAtBottom() {
    return (document.body.scrollHeight - window.scrollY) < 1000;
}

function checkScroll() {
    if (!isAtBottom()) {
        document.querySelector("#jump").classList.remove("hide");
    } else {
        document.querySelector("#jump").classList.add("hide");
    }
}

function jumpbottom() {
    window.scrollTo(0, document.body.scrollHeight + 1000);
}
