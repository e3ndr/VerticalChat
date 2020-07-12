const koi = new Koi("wss://live.casterlabs.co/koi");

let colors = ["#E6194B", "#3CB44B", "#FFE119", "#4363D8", "#F58231", "#911EB4", "#46F0F0", "#F032E6", "#BCF60C", "#FABEBE", "#008080", "#E6BEFF", "#9A6324", "#800000", "#AAFFC3", "#808000", "#000075"];
let userColors = {
    "Casterlabs": "red",
    "ItzLcyx": "deeppink",
    "Helvijs": "paleturquoise"
};
let user = getUrlVars()["username"];

console.log("Vertical chat v1.0.0 https://github.com/e3ndr/VerticalChat");
console.log(" - Supports chat messages");

window.addEventListener("scroll", checkScroll);

koi.addEventListener("close", () => {
    koi.reconnect();
})

koi.addEventListener("open", () => {
    koi.addUser(user);
});

koi.addEventListener("chat", (event) => {
    addMessage(event.sender.username, event.message);
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

function addMessage(sender, message) {
    let div = document.createElement("div");
    let username = document.createElement("span");
    let text = document.createElement("span");

    username.classList.add("username");
    username.style = "color: " + getColor(sender) + ";";
    username.innerText = sender;

    text.classList.add("text");
    text.innerText = message;

    div.classList.add("message");
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
