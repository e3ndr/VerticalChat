
class Stats {

    constructor() {
        this.enabled = false;
        this.chatMessages = 0;
        this.averageViewers = 0;
        this.moneyMade = 0;
        this.newFollowers = 0;
        this.isLive = false;

        let instance = this;

        koi.addEventListener("chat", () => {
            if (instance.enabled) {
                instance.chatMessages++;
            }
        });

        koi.addEventListener("streamstatus", (event) => {
            if (instance.isLive != event.is_live) {
                instance.isLive = event.is_live;

                if (instance.isLive) {
                    document.querySelector("#wrap").classList.add("hide");
                } else {
                    document.querySelector("#wrapaverage").innerText = instance.averageViewers.toFixed(0);
                    document.querySelector("#wrapfollowers").innerText = instance.newFollowers.toFixed(0);
                    document.querySelector("#wrapmoney").innerText = "$" + (Math.round(instance.moneyMade * 100) / 100).toFixed(2);
                    document.querySelector("#wrapmessages").innerText = instance.chatMessages;

                    document.querySelector("#wrap").classList.remove("hide");
                }
            }
        });

        koi.addEventListener("donation", (event) => {
            if (instance.enabled) {
                instance.moneyMade += event.usd_equivalent;
                document.querySelector("#moneyMade").innerText = (Math.round(instance.moneyMade * 100) / 100).toFixed(2);
            }
        });

        koi.addEventListener("share", () => {
            if (instance.enabled) {
                instance.chatMessages++;
            }
        });

        koi.addEventListener("follow", () => {
            if (instance.enabled) {
                instance.newFollowers++;
                document.querySelector("#followersGained").innerText = "+" + instance.newFollowers;
            }
        });

        setInterval(() => {
            if (instance.enabled && instance.isLive) {
                instance.averageViewers = (instance.averageViewers + caffeine.viewers.length) / 2;
            }
        }, 60 * 1000); // Every minute
    }

}