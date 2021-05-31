var eventRoomId = 0;

if (!IsAuthorized()) {
    location.href = "index.html";
}

$(document).ready(function() {
    const eventId = localStorage.getItem("eventId");
    const urlParams = new URLSearchParams(window.location.search);
    const parentRoomId = urlParams.get("parentRoomId");

    GetEventRooms(eventId, parentRoomId, (details) => {
        if (details) {
            eventRoomDetails = details[0];
            eventRoomId = eventRoomDetails.id;

            RegisterFirebaseListeners();
            InitPlayer(eventRoomDetails);

            let sessionHtml = "";
            eventRoomDetails.sessions.forEach((ses, idx) => {
                if (ses) {
                    sessionHtml += getSessionHtml(ses);
                }
            });

            if (sessionHtml) {
                $("#session-info").html(sessionHtml);
                $("#session-info").parent().show();
            } else $("#session-info").parent().hide();

            resizePlayer();
        }
    });
});

function getSessionHtml(sessionDetails) {
    let dt = new Date(sessionDetails.approxStartDate);
    let isLive = sessionDetails.started && !sessionDetails.completed;

    return `<p><strong>${("0" + (dt.getHours() % 24)).slice(-2)}:${(
    "0" + dt.getMinutes()
  ).slice(-2)}:${"00"}</strong> - ${sessionDetails.topic}&nbsp; <span>
  <button class="custom-btn" data-session-id="${sessionDetails.id}" ${
    isLive ? "" : 'style="display:none"'
  }>Live Now</button></span></p>`;
}

function setEmojis() {
    let emojiHtml = "";

    if (
        currentSession &&
        currentSession.showEmoji &&
        currentSession.emojis &&
        currentSession.emojis.length
    ) {
        let allEmojis = "";

        currentSession.emojis.forEach((em, idx) => {
            if (em.pictureUrl && em.isOnOff) {
                let poster = "";
                poster =
                    apiBaseUrl +
                    "Documents/Events/" +
                    currentSession.eventId +
                    "/rooms/" +
                    currentSession.eventRoomId +
                    "/Sessions/" +
                    currentSession.id +
                    "/Emojis/" +
                    em.pictureUrl;

                allEmojis += getEmojiReactionBox(em.id, em.emojiTitle, poster);
            }
        });

        let emjUrl =
            apiBaseUrl +
            "Documents/Events/" +
            currentSession.eventId +
            "/rooms/" +
            currentSession.eventRoomId +
            "/Sessions/" +
            currentSession.id +
            "/Emojis/" +
            currentSession.emojis[0].pictureUrl;

        emojiHtml = getEmojiBtn(
            currentSession.emojis[0].emojiTitle,
            emjUrl,
            allEmojis
        );
    }

    if (emojiHtml) {
        $("#lbl-emojis").html(emojiHtml);
        $("#lbl-emojis").show();
        setTimeout(() => {
            setEmojiEvents();
        }, 10);

        $(".reaction-box").width(56 * currentSession.emojis.length);
    } else $("#lbl-emojis").hide();
}

function getEmojiBtn(title, emjUrl, emojis) {
    return `<div class="like-btn">
              <img src='${emjUrl}'/>   
              <label>${title}</label>          
              <div class="reaction-box">
              ${emojis}
              </div>
            </div>`;
}

function getEmojiReactionBox(emojiId, title, url) {
    return `<div class="reaction-icon">
              <a class="emoji-btn" data-emoji-id="${emojiId}">
                <img src='${url}'>
              </a>
            </div>`; //<label>${title}</label>
}

function checkIfRoomAllowedOrNot(roomId, started, completed, roomDetails) {
    let catId = localStorage.getItem("categoryId");
    let categories = roomDetails.allowedSubscriberCategories;
    let parentRoomCategories;

    let parentRoomId = rooms[roomId].parentEventRoomId;

    if (parentRoomId && rooms[parentRoomId])
        parentRoomCategories = rooms[parentRoomId].allowedSubscriberCategories;

    let allowed =
        started &&
        !completed &&
        ((!categories && !parentRoomCategories) ||
            !catId ||
            (categories && catId && categories.split(",").indexOf(catId) >= 0) ||
            (!categories &&
                catId &&
                parentRoomCategories &&
                parentRoomCategories.split(",").indexOf(catId) >= 0));

    return allowed;
}

function roomStartedOrCompleted(params) {
    // let rId = getRoomId();

    let allowed = checkIfRoomAllowedOrNot(
        params.roomId,
        params.started,
        params.completed,
        params.roomDetails
    );

    if (params.roomId == eventRoomId) {
        if (!params.started || params.completed) {
            currentRoom = null;
        } else {
            currentRoom = params.roomDetails;
        }

        if (allowed) {
            $("#main").hide();
        } else {
            $("#main").show();
        }
    }

    for (const key in sessions) {
        if (Object.hasOwnProperty.call(sessions, key)) {
            const session = sessions[key];

            sessionStartedOrCompleted({
                sessionId: session.id,
                started: session.started,
                completed: session.completed,
                sessionDetails: session,
            });
        }
    }
}

function sessionStartedOrCompleted(params) {
    //Started
    if (
        params.started &&
        !params.completed &&
        currentRoom &&
        currentRoom.id == parseInt(params.sessionDetails.eventRoomId)
    ) {
        currentSession = params.sessionDetails;

        sessionTimer = localStorage.getItem("sessionTimer") ?
            parseInt(localStorage.getItem("sessionTimer")) :
            0;

        SessionStart();
        LogSession("SESSION_START");
        clearInterval(threadId);

        threadId = setInterval(() => {
            sessionTimer += sessionLogInterval;
            localStorage.setItem("sessionTimer", sessionTimer);
            LogSession("SESSION_LOG");
        }, sessionLogInterval * 1000);
    }

    //Completed
    if (
        currentSession &&
        currentSession.id == parseInt(params.sessionId) &&
        params.completed
    ) {
        clearInterval(threadId);
        LogSession("SESSION_COMPLETE");
        SessionComplete();
        sessionTimer = 0;
        localStorage.setItem("sessionTimer", sessionTimer);
    }

    if (
        currentSession &&
        currentSession.id == parseInt(params.sessionId) &&
        !params.started
    ) {
        SessionComplete();
    }
}

function SessionStart() {
    if (currentSession) {
        $(".custom-btn[data-session-id=" + currentSession.id + "]").show();
        currentSessionEmojis(true);
    }
}

function SessionComplete() {
    let sessionId = currentSession ? currentSession.id : 0;
    if (sessionId > 0) {
        $(".custom-btn[data-session-id=" + sessionId + "]").hide();
    }
    currentSession = null;

    currentSessionEmojis();
}

function UpdateLiveSubscriberCount(val) {
    $("#lbl-live-viewers").text(val > 0 ? val : "0");
}

function currentSessionUpdated() {
    currentSessionEmojis();
}

function currentSessionEmojis() {
    if (currentSession) {
        $("#lbl-sessions").html(currentSession.topic);
        $("#lbl-sessions").parent().show();
    } else {
        $("#lbl-sessions").parent().hide();
    }

    setEmojis();
}

function createEmojis(emojiId, url, num) {
    var container = $("#emoji-container");
    for (var i = num; i > 0; i--) {
        var balloon = document.createElement("div");
        balloon.className = "emoji emoji-" + emojiId;
        balloon.style.cssText = getRandomStyles(url);
        container.append(balloon);
    }
}

function removeEmojis(emojiId) {
    $("#emoji-container .emoji-" + emojiId).remove();
}

function setEmojiEvents() {
    $(".like-btn").hover(
        function() {
            $(".reaction-icon").each(function(i, e) {
                setTimeout(function() {
                    $(e).addClass("show-icon");
                }, i * 100);
            });
        },
        function() {
            $(".reaction-icon").removeClass("show-icon");
        }
    );

    $(".emoji-btn")
        .off("click")
        .on("click", function(e) {
            let emojiId = $(this).data("emoji-id");
            let url = $("img", this).attr("src");

            createEmojis(emojiId, url, 20);
            setTimeout(() => {
                removeEmojis(emojiId);
            }, 5000);
            saveSessionEmojiAnalytics(emojiId);
        });
}

function getRandomStyles(url) {
    var width = $("#emoji-container").width();
    var r = random(255);
    var g = random(255);
    var b = random(255);
    var mt = random(200);
    var ml = random(width - 25);
    var dur = random(5) + 5;
    return `
  background-image:url(${url});  
  top:${mt}px;
  left:${ml}px;
  animation: float ${dur}s ease-in infinite;`;
}
// margin: ${mt}px 0 0 ${ml}px;
function random(num) {
    return Math.floor(Math.random() * num);
}

function LogSession(action) {
    let subscriberId = localStorage.getItem("subscriberId");

    if (subscriberId) {
        let params = {
            action: action,
            sessionId: currentSession ? currentSession.id : 0,
            subscriberId: parseInt(subscriberId),
            currentTime: sessionLogInterval,
            duration: sessionTimer,
        };

        AddEventAyanlytics(params, (result) => {});
    }
}

function saveSessionEmojiAnalytics(emojiId) {
    let subscriberId = localStorage.getItem("subscriberId");
    if (subscriberId && emojiId) {
        let params = {
            eventSubscriberId: parseInt(subscriberId),
            eventRoomSessionEmojiId: emojiId,
        };
        AddEventRoomSessionEmojiAnalytics(params, (result) => {});
    }
}

function InitPlayer(roomDetails) {
    let playerUrl = "";
    let player = roomDetails.playerType ?
        roomDetails.playerType.toLowerCase() :
        "";

    let poster = "";
    if (roomDetails && roomDetails.posterUrl) {
        poster =
            apiBaseUrl +
            "Documents/Events/" +
            roomDetails.eventId +
            "/" +
            roomDetails.posterUrl;
    }

    if (player == "videojs") {
        playerUrl = `/videojs-player.html?url=${roomDetails.sourceUrl}&type=${roomDetails.sourceType}&poster=${poster}`;
    } else if (player == "bitmovin") {
        playerUrl = `/bitmovin-player.html?url=${roomDetails.sourceUrl}&type=${roomDetails.sourceType}&poster=${poster}`;
    } else if (player == "zoom") {
        playerUrl = `/zoom-player.html?meetingId=${roomDetails.zoomMeetingId}&pwd=${roomDetails.zoomMeetingPassword}`;
    }

    $(".player-frame").attr("src", playerUrl);

    //window.open(playerUrl, "_blank");
    console.log(playerUrl);
}

function SaveAnalytics(action, data) {
    let subscriberId = localStorage.getItem("subscriberId");
    if (subscriberId) {
        let params = {
            action: action,
            eventSessionId: currentSession ? currentSession.id : 0,
            subscriberId: parseInt(subscriberId),
            seekFrom: 0,
            seekTo: data.seekTo ? data.seekTo : 0,
            seekCount: data.seekCount ? data.seekCount : 0,
            pauseCount: data.pauseCount ? data.pauseCount : 0,
            bufferCount: data.bufferCount ? data.bufferCount : 0,
            currentTime: data.currentTime ? data.currentTime : 0,
            duration: data.duration ? data.duration : 0,
            secondsToLoad: data.secondsToLoad ? data.secondsToLoad : 0,
        };
        AddEventAyanlytics(params, (result) => {});
    }
}

function ResetPlayer(src) {
    if (player && src) {
        player.reset();
        player.src(src);
        player.load();
        player.play();
    }
}

function resizePlayer() {
    let width = $(".player-frame").width();
    $(".player-frame").height(width * 0.57);
}

window.addEventListener("resize", function(event) {
    resizePlayer();
});

window.addEventListener(
    "orientationchange",
    function() {
        resizePlayer();
    },
    false
);