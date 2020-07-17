class Caffeine {
    credential = {};
    signed = "";
    connected = false;
    loggedIn = false;
    viewers = [];

    login() {
        if (checkCookie("refresh_token")) {
            this.refresh();
        } else {
            this.loggedIn = false;
            togglePage();

            let instance = this;

            document.querySelector("#loginbutton").addEventListener("click", () => {
                let username = document.getElementById("username").value;
                let password = document.getElementById("password").value;
                let mfa = document.getElementById("2fa").value;
                let loginPayload = {
                    "account": {
                        "username": username,
                        "password": password
                    },
                    "mfa": {
                        "otp": mfa
                    }
                }

                httpPost(CORS_PROXY + "https://api.caffeine.tv/v1/account/signin", loginPayload).then((text) => {
                    let response = JSON.parse(text);

                    if (response.hasOwnProperty("next")) {
                        document.getElementById("2fadiv").classList.remove("hide");
                    } else if (!response.hasOwnProperty("errors")) {
                        setCookie("refresh_token", response.refresh_token);
                        instance.refresh();
                    }
                });
            });
        }
    }

    upvoteMessage(id) {

    }

    sendMessage(message) {
        let messagePayload = {
            "publisher": this.signed,
            "type": "reaction",
            "body": {
                "text": message
            }
        };

        httpPost(CORS_PROXY + "https://realtime.caffeine.tv/v2/reaper/stages/" + caid.substring(4) + "/messages", messagePayload, this.credential.access_token);
    }

    refresh() {
        if (checkCookie("refresh_token")) {
            let instance = this;
            let refreshPayload = {
                "refresh_token": getCookie("refresh_token")
            };

            httpPost(CORS_PROXY + "https://api.caffeine.tv/v1/account/token", refreshPayload).then((response) => {
                instance.credential = JSON.parse(response);

                if (!instance.credential.hasOwnProperty("errors")) {
                    httpGet(CORS_PROXY + "https://api.caffeine.tv/v1/users/" + instance.credential.caid + "/signed", instance.credential.access_token).then((signed) => {
                        instance.signed = signed.token;

                        setInterval(() => {
                            instance.refresh();
                        }, (10 * 60) * 1000);

                        instance.loggedIn = true;
                        togglePage();
                    });
                } else {
                    deleteCookie("refresh_token");
                    instance.login();
                }
            });
        }
    }

    connectViewers() {
        if (!this.connected) {
            this.connected = true;
            let instance = this;

            getUser(user).then((watching) => {
                if (watching.caid == instance.credential.caid) {
                    let payload = {
                        "Headers": {
                            "Authorization": "Bearer " + instance.credential.credentials.access_token,
                            "X-Client-Type": "external"
                        },
                        "Body": "{\"user\":\"" + instance.signed + "\"}"
                    };
                    let ws = new WebSocket("wss://realtime.caffeine.tv/v2/reaper/stages/" + instance.credential.caid.substring(4) + "/viewers");

                    document.querySelector("#stats").classList.remove("hide");
                    stats.enabled = true;

                    ws.onopen = function () {
                        ws.send(JSON.stringify(payload));
                        setInterval(function () {
                            ws.send('"HEALZ"');
                        }, 20000);
                    }

                    ws.onmessage = function (message) {
                        let message_raw = message.data;
                        if (message_raw != ("\"THANKS\"")) {
                            let json = JSON.parse(message_raw);

                            if (json.hasOwnProperty("total_user_count")) {
                                document.querySelector("#viewers").innerText = json.total_user_count - 1; // Sub 1 for Koi
                            } else if (json.hasOwnProperty("user_event")) {
                                let status = json.user_event.is_viewing;
                                let viewing = instance.viewers.includes(json.user_event.caid);

                                if (status && !viewing) {
                                    instance.addViewer(json.user_event.caid);
                                } else if (!status && viewing) {
                                    instance.removeViewer(json.user_event.caid);
                                }
                            }
                        }
                    }
                }
            });
        };
    }

    addViewer(caid) {
        this.viewers.push(caid);

        getUser(caid).then((user) => {
            addStatus(user.username, "https://images.caffeine.tv" + user.avatar_image_path, "join");
        });
    }

    removeViewer(caid) {
        let index = this.viewers.indexOf(caid);

        if (index > -1) {
            this.viewers.splice(index, 1);
        }

        getUser(caid).then((user) => {
            addStatus(user.username, "https://images.caffeine.tv" + user.avatar_image_path, "leave");
        });
    }

}

function getUser(id) {
    return new Promise((resolve) => {
        httpGet("https://api.casterlabs.co/caffeine/user.php?user=" + id).then((userdata) => {
            resolve(userdata.user);
        });
    });
}

function httpGet(url, credential) {
    return new Promise((resolve) => {
        let headers = {};

        if (credential) {
            headers.authorization = "Bearer " + credential;
        }

        const options = {
            method: "GET",
            headers: new Headers(headers),
        };

        fetch(url, options).then((response) => {
            response.text().then((text) => {
                resolve(JSON.parse(text));
            });
        });
    });
}

function httpPost(url, body, credential) {
    return new Promise((resolve) => {
        let headers = {
            "Content-Type": "application/json"
        };

        if (credential) {
            headers.authorization = "Bearer " + credential;
        }

        const options = {
            method: "POST",
            body: JSON.stringify(body),
            headers: new Headers(headers),
        };

        fetch(url, options).then((response) => {
            response.text().then((text) => {
                resolve(text);
            });
        });
    });
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(" ");

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length).replace(";", "");
        }
    }

    return null;
}

function setCookie(name, value) {
    document.cookie = name + "=" + value + "; path=/";
}

function deleteCookie(name) {
    setCookie(name, "");
}

function checkCookie(cname) {
    let cookie = getCookie(cname);

    return (cookie != null) ? (cookie.length != 0) : false;
}
