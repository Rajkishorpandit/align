var player;

var sessionTimer = 0;
var sessionLogInterval = 120;
var threadId = 0;
var noOfCommits = 0;

if (!IsAuthorized()) {
    location.href = 'index.html';
}

if (!GetQueryString('roomId')) {
    location.href = "symposium_hall.html";
}

$(document).ready(function() {
    eventId = localStorage.getItem('eventId');
    let roomId = GetQueryString('roomId');

    GetEvent(eventId, (result) => {
        eventDetails = result;
        document.title = result.title;

        if (result.logoUrl) {
            let logoUrl =
                apiBaseUrl + 'Documents/Events/' + eventId + '/' + result.logoUrl;
            $('#img-event-logo').attr('src', logoUrl).attr('alt', result.title);
        } else {
            $('#img-event-logo').parent().hide();
        }
    });

    RegisterFirebaseListeners();

    GetEventRoom(roomId, (result) => {
        if (!result.started) {
            location.href = 'symposium_hall.html';
        }

        let categories = result.subscriberAllowedCategories;
        let catId = localStorage.getItem('categoryId');

        if (categories && !categories.split(',').indexOf(catId)) {
            location.href = 'home.html';
        }

        $('#room-title').html(result.title);
        $('#room-subtitle').html(result.overview);
        $('#room-description').html(result.description);

        InitPlayer(result);
    });
});

function InitPlayer(roomDetails) {
    let playerUrl = '';
    let player = roomDetails.playerType ?
        roomDetails.playerType.toLowerCase() :
        '';

    let poster = '';
    if (roomDetails && roomDetails.posterUrl) {
        poster =
            apiBaseUrl +
            'Documents/Events/' +
            roomDetails.eventId +
            '/' +
            roomDetails.posterUrl;
    }

    if (player == 'videojs') {
        playerUrl = `videojs-player.html?url=${roomDetails.sourceUrl}&type=${roomDetails.sourceType}&poster=${poster}`;
    } else if (player == 'bitmovin') {
        playerUrl = `bitmovin-player.html?url=${roomDetails.sourceUrl}&type=${roomDetails.sourceType}&poster=${poster}`;
    } else if (player == 'zoom') {
        playerUrl = `zoom-player.html?meetingId=${roomDetails.zoomMeetingId}&pwd=${roomDetails.zoomMeetingPassword}`;
    }

    $('.player-frame').attr('src', playerUrl);

    //window.open(playerUrl, "_blank");
    console.log(playerUrl);
}

function roomStartedOrCompleted(params) {
    let rId = GetQueryString('roomId');
    if (params.roomId == rId) {
        currentRoom = params.roomDetails;

        if (!params.started || params.completed) {
            currentRoom = null;
            location.href = 'symposium_hall.html';
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

        sessionTimer = localStorage.getItem('sessionTimer') ?
            parseInt(localStorage.getItem('sessionTimer')) :
            0;

        SessionStart();
        LogSession('SESSION_START');
        clearInterval(threadId);

        threadId = setInterval(() => {
            sessionTimer += sessionLogInterval;
            localStorage.setItem('sessionTimer', sessionTimer);
            LogSession('SESSION_LOG');
        }, sessionLogInterval * 1000);
    }
    // else if (
    //   sessions[key] &&
    //   currentSession &&
    //   sessions[key].id == currentSession.id
    // ) {
    //   clearInterval(threadId);
    //   LogSession("SESSION_COMPLETE");
    //   SessionComplete();
    //   sessionTimer = 0;
    //   localStorage.setItem("sessionTimer", sessionTimer);
    // }

    //Completed
    if (
        currentSession &&
        currentSession.id == parseInt(params.sessionId) &&
        params.completed
    ) {
        clearInterval(threadId);
        LogSession('SESSION_COMPLETE');
        SessionComplete();
        sessionTimer = 0;
        localStorage.setItem('sessionTimer', sessionTimer);
    } else if (currentSession &&
        currentSession.id == parseInt(params.sessionId) &&
        !params.started) {
        SessionComplete();
    }
}

function currentSessionUpdated() {
    HideShowWidgets();
    //SetCommitmentProgressBar();
}

function SessionStart() {
    if (currentSession) {
        noOfCommits = localStorage.getItem('noOfCommits') ?
            parseInt(localStorage.getItem('noOfCommits')) :
            0;
        //$("#detailTab").html(currentSession.description);
        //SetNoOfCommits();
        HideShowWidgets(true);
    }
}

function SetSpeakers() {
    let speakers = '';
    if (currentSession && currentSession.speakers) {
        currentSession.speakers.forEach((spk, idx) => {
            if (spk.speakerName) {
                speakers += (speakers ? ' | ' : '') + spk.speakerName;
            }
        });
    }

    if (speakers) {
        $('#lbl-speakers').html(speakers);
        $('#lbl-speakers').parent().show();
    } else $('#lbl-speakers').parent().hide();
}

function SetEmojis() {
    let emojiHtml = '';

    if (currentSession && currentSession.emojis) {
        let allEmojis = '';

        currentSession.emojis.forEach((em, idx) => {
            if (em.pictureUrl) {
                let poster = '';
                poster =
                    apiBaseUrl +
                    'Documents/Events/' +
                    currentSession.eventId +
                    '/rooms/' +
                    currentSession.eventRoomId +
                    '/Sessions/' +
                    currentSession.id +
                    '/Emojis/' +
                    em.pictureUrl;

                allEmojis += getEmojiReactionBox(em.emojiTitle, poster);
            }
        });

        let emjUrl =
            apiBaseUrl +
            'Documents/Events/' +
            currentSession.eventId +
            '/rooms/' +
            currentSession.eventRoomId +
            '/Sessions/' +
            currentSession.id +
            '/Emojis/' +
            currentSession.emojis[0].pictureUrl;

        emojiHtml = getEmojiBtn(emjUrl, allEmojis);
    }

    if (emojiHtml) {
        $('#lbl-emojis').html(emojiHtml);
        $('#lbl-emojis').parent().show();
        setTimeout(() => {
            setEmojiEvents();
        }, 10);
    } else $('#lbl-emojis').parent().hide();
}

function getEmojiBtn(emjUrl, emojis) {
    return `<div class="like-btn">
            <img src='${emjUrl}'/>
            <div class="reaction-box">
            ${emojis}
            </div>
          </div>`;

    // return `<span class="emoji-btn" style="margin-right: 10px;"><img src='${url}'/></span>`;
}

function getEmojiReactionBox(title, url) {
    return `<div class="reaction-icon">
            <a class="emoji-btn">
              <img src='${url}'>
            </a>                     
            <label>${title}</label>
          </div>`;
}

function SessionComplete() {
    noOfCommits = 0;
    currentSession = null;

    //SetNoOfCommits();
    HideShowWidgets(true);
    $('#detailTab').html('');
}

function LogSession(action) {
    let subscriberId = localStorage.getItem('subscriberId');

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

function UpdateLiveSubscriberCount(val) {
    $('#lbl-live-viewers').text(val > 0 ? val : '0');
}

function SaveAnalytics(action, data) {
    let subscriberId = localStorage.getItem('subscriberId');
    let roomId = GetQueryString('roomId');

    if (subscriberId) {
        let params = {
            action: action,
            eventRoomSessionId: currentSession ? currentSession.id : 0,
            eventRoomId: parseInt(roomId),
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

function HideShowWidgets(setDefaultTab) {
    //let selected = $('input[name="tabs"]:checked').val();
    let tabHeader = $('#widget-tab-header');
    let tabContent = $('#widget-tab-content');
    $(tabHeader).html('');
    $(tabContent).html('');

    if (currentSession && currentSession.showWidget) {
        //Add Tabs
        currentSession.widgets.forEach((wgt, idx) => {
            $(tabHeader).append($(getWidgetTabHeaderHtml(wgt)));
            $(tabContent).append($(getWidgetTabContentHtml(wgt)));
        });

        $('li:first', tabHeader).addClass('active');
        $('div.tab-pane:first', tabContent).addClass('in show active');

        $('#widget-tabs').parent().show();
        ResizeWidgets();
    } else {
        $('#widget-tabs').parent().hide();
    }

    if (currentSession) {
        $('#lbl-sessions').html(currentSession.topic);
        $('#lbl-sessions').parent().show();
    } else {
        $('#lbl-sessions').parent().hide();
    }

    SetSpeakers();
    SetEmojis();
    //emojiEvents();
}

function getWidgetTabHeaderHtml(widgetDetails) {
    let id = widgetDetails.id;
    let title = widgetDetails.widgetTitle;
    return `<li>
    <a data-toggle="pill" href="#widget-${id}">
        <h5>${title}</h5>
    </a>
</li>`;
}

function getWidgetTabContentHtml(widgetDetails) {
    let id = widgetDetails.id;
    let contentHtml = '';

    if (widgetDetails.widgetType == 'sessiondescription') {
        contentHtml = getWidgetSessionDescriptionHtml(widgetDetails);
    } else if (widgetDetails.widgetType == 'pigeon') {
        contentHtml = getWidgetPigeonHoleHtml(widgetDetails);
    } else if (widgetDetails.widgetType == 'slido') {
        contentHtml = getWidgetSlidoHtml(widgetDetails);
    } else if (
        wgt.widgetType == 'progressbar' ||
        wgt.widgetType == 'multiprogressbar'
    ) {
        contentHtml = '';
    }

    return ` <div id="widget-${id}" class="tab-pane fade">
    <div class="panel-group" role="tablist" aria-multiselectable="true">
        <div class="panel panel-default lgx-panel no-border-radius">
            ${contentHtml}
        </div>
    </div>
</div>`;
}

function getWidgetSessionDescriptionHtml(widgetDetails) {
    return `<div style="padding:10px">${currentSession.description}</div>`;
}

function getWidgetPigeonHoleHtml(widgetDetails) {
    let name = localStorage.getItem("firstName") + (localStorage.getItem("lastName") ? " " + localStorage.getItem("lastName") : "");
    let company = localStorage.getItem("companyName");
    let email = localStorage.getItem("email");

    let url =
        'https://pigeonhole.at/' +
        widgetDetails.sessionCode +
        '/i/' +
        widgetDetails.sessionId +
        "?phName=" + encodeURIComponent(name) + "&phEmail=" + encodeURIComponent(email) + "&phCompany=" + encodeURIComponent((company ? company : ""));

    return getWidgetIframeHtml(url);
}

function getWidgetSlidoHtml(widgetDetails) {
    let url = 'https://app.sli.do/event/' + widgetDetails.sessionId;

    return getWidgetIframeHtml(url);
}

function getWidgetIframeHtml(url) {
    return `<iframe class="frame widget-frame" width="100%" border="0" src="${url}"></iframe>`;
}

function ResizeWidgets() {
    let hgt = $('#widget-tab-content').height();
    $('.widget-frame').height(hgt - 20);
}

window.addEventListener('resize', function(event) {
    ResizeWidgets();
});

window.addEventListener(
    'orientationchange',
    function() {
        ResizeWidgets();
    },
    false
);

$('.logoutLink').click(function() {
    Logout((result) => {
        location.href = 'index.html';
    });
});

function random(num) {
    return Math.floor(Math.random() * num);
}

var getRandomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function getRandomStyles(url) {
    var r = random(255);
    var g = random(255);
    var b = random(255);
    var mt = random(200);
    var ml = random(50);
    var dur = random(5) + 5;
    return `
background-image:url(${url});  
margin: ${mt}px 0 0 ${ml}px;
animation: float ${dur}s ease-in infinite;`;
}

function createBalloons(url, num) {
    var balloonContainer = document.getElementById('balloon-container');
    for (var i = num; i > 0; i--) {
        var balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.cssText = getRandomStyles(url);
        balloonContainer.append(balloon);
    }
}

function removeBalloons() {
    $('.balloon').remove();
}

function setEmojiEvents() {
    $('.like-btn').hover(
        function() {
            $('.reaction-icon').each(function(i, e) {
                setTimeout(function() {
                    $(e).addClass('show-icon');
                }, i * 100);
            });
        },
        function() {
            $('.reaction-icon').removeClass('show-icon');
        }
    );

    $('.emoji-btn').click(function(e) {
        let url = $('img', this).attr('src');
        createBalloons(url, 20);
        setTimeout(removeBalloons, 500000);
    });
}