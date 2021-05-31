if (!IsAuthorized()) {
    location.href = "index.html";
}
var speakers = [];

$(document).ready(function() {
    const eventId = localStorage.getItem("eventId");
    const urlParams = new URLSearchParams(window.location.search);
    const parentRoomId = urlParams.get("parentRoomId");

    GetEvent(eventId, (result) => {
        eventDetails = result;

        document.title = result.title;
        $("#event-title").html(result.title);
        $("#event-overview").html(result.overview);

        if (result.logoUrl) {
            let logoUrl =
                apiBaseUrl + "Documents/Events/" + eventId + "/" + result.logoUrl;
            $("#img-event-logo").attr("src", logoUrl).attr("alt", result.title);
        } else {
            $("#img-event-logo").parent().hide();
        }
    });

    RegisterFirebaseListeners();

    GetEventRooms(eventId, parentRoomId, (result) => {
        if (result) {
            //setRooms(result);
        }
    });
});

function setRooms(rooms) {
    let tabHeader = $("#schedule-tab-header");
    let tabContent = $("#schedule-tab-content");
    const eventId = localStorage.getItem("eventId");

    rooms.forEach((e, i) => {
        $(tabHeader).append($(getRoomHtmlForTabHeader(e)));
        $(tabContent).append($(getRoomHtmlForTabBody(e)));

        if (e.hasBreakoutRooms) {
            GetEventRooms(eventId, e.id, (result) => {
                if (result) {
                    setBreakoutRooms(e.id, result);
                }
            });
        } else {
            setBreakoutRooms(e.id, [e]);
        }
    });

    $("li:first", tabHeader).addClass("active");
    $("div.tab-pane:first", tabContent).addClass("in active");
}

function roomStartedOrCompleted(params) {
    let btn = $("#btn-watch-now-" + params.roomId);

    let allowed = checkIfRoomAllowedOrNot(
        params.roomId,
        params.started,
        params.completed,
        params.roomDetails
    );

    if (allowed) {
        $(btn)
            .removeClass("lgx-btn-black btn-disabled")
            .attr("href", "mainsession.html?roomId=" + params.roomId);
    } else if (params.completed) {
        $(btn).addClass("lgx-btn-black btn-disabled").removeAttr('src');
    } else {
        $(btn).addClass("lgx-btn-black btn-disabled").removeAttr('src');
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
    let allowed = false;

    let roomId = params.sessionDetails.eventRoomId;
    let roomDetails = rooms[roomId];

    if (roomDetails) {
        allowed = checkIfRoomAllowedOrNot(
            roomId,
            roomDetails.started,
            roomDetails.completed,
            roomDetails
        );
    }

    if (params.sessionDetails && params.sessionDetails.speakers) {
        params.sessionDetails.speakers.forEach((sp) => {
            if (allowed && params.started && !params.completed) {
                $("#live-spk-" + sp.id).show();
                $("#live-spk-btn-" + sp.id).show();
            } else {
                $("#live-spk-" + sp.id).hide();
                $("#live-spk-btn-" + sp.id).hide();
            }
        });
    }
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

function currentRoomUpdated() {}

function getRoomHtmlForTabHeader(roomDetails) {
    let id = roomDetails.id;
    let title = roomDetails.title;
    var dt = new Date(roomDetails.approxStartDate);
    return `
<li>
    <a data-toggle="pill" href="#room-${id}">
        <h3>${title}</h3>
        <p><span>${("0" + dt.getDate()).slice(
          -2
        )} </span>${dt.getShortMonthName()}, ${dt.getFullYear()}</p>
    </a>
</li>`;
}

function getRoomHtmlForTabBody(roomDetails) {
    const eventId = localStorage.getItem("eventId");
    let id = roomDetails.id;
    let title = roomDetails.title;
    let overview = roomDetails.overview;
    let description = roomDetails.description;
    let bannerUrl =
        apiBaseUrl +
        "Documents/Events/" +
        eventId +
        "/rooms/" +
        id +
        "/" +
        roomDetails.bannerUrl;

    let live = roomDetails.started && !roomDetails.completed;

    let categories = roomDetails.allowedSubscriberCategories;
    let catId = localStorage.getItem("categoryId");

    let allowed =
        live &&
        (!categories ||
            !catId ||
            (categories && categories.split(",").indexOf(catId) >= 0));

    return `
<div id="room-${id}" class="tab-pane fade">
    <div class="row">
      <div class="col-xs-12">       
          <figure>
              <img src="${bannerUrl}" alt="${title}" width="100%" height="250" />
          </figure>
      </div>
      <div class="col-xs-12">
          <article>
              <header>
                  <div class="text-area">                        
                      <h2 class="title">${title}
                      </h2>
                      <h4 class="author-info">
                      ${overview ? overview : ""}
                      </h4>
                  </div>
              </header>
              <section>               
              <div class="p-t-10 p-b-10 room-description">
                ${description ? description : ""}
              </div>
              </section>                                    
          </article>
      </div>      
    </div>
    <div class="panel-group" id="accordion-${id}" role="tablist" aria-multiselectable="true">
        
    </div>
</div>`;
}

function setBreakoutRooms(parentRoomId, rooms) {
    let element = $("#accordion-" + parentRoomId);
    const eventId = localStorage.getItem("eventId");

    rooms.forEach((e, i) => {
        $(element).append($(getBreakoutRoomHtml(parentRoomId, e)));
        setSessions(e.id, e.sessions);
    });
}

function getBreakoutRoomHtml(parentRoomId, roomDetails) {
    const eventId = localStorage.getItem("eventId");
    let id = roomDetails.id;
    let title = roomDetails.title;
    let overview = roomDetails.overview;
    let description = roomDetails.description;
    let bannerUrl =
        apiBaseUrl +
        "Documents/Events/" +
        eventId +
        "/rooms/" +
        id +
        "/" +
        roomDetails.bannerUrl;
    let live = roomDetails.started && !roomDetails.completed;
    let dt = new Date(roomDetails.approxStartDate);

    let categories = roomDetails.allowedSubscriberCategories;
    let catId = localStorage.getItem("categoryId");

    let allowed =
        live &&
        (!categories ||
            !catId ||
            (categories && categories.split(",").indexOf(catId) >= 0));

    return `
  <div class="panel panel-default lgx-panel">
  <div class="panel-heading" role="tab" id="headingOne-${id}">
      <div class="panel-title">
          <div class="lgx-single-schedule row">
              <div class="col-lg-3 col-sm-12 m-b-10">
                  <img src="${bannerUrl}" alt="${title}" />
              </div>
              <div class="col-lg-7 col-sm-12 m-b-10">
                  <div class="schedule-info">
                      <a class="room-heading" role="button" data-toggle="collapse" data-parent="#accordion-${id}" href="#collapseOne-${id}" aria-expanded="true" aria-controls="collapseOne-${id}">
                          <h4 class="time"><i class="fa fa-clock-o"></i> ${(
                            "0" +
                            (dt.getHours() % 12)
                          ).slice(-2)}:${("0" + dt.getMinutes()).slice(-2)}
                              <span>${dt.getHours() > 12 ? "PM" : "AM"}</span>
                          </h4>
                          <h3 class="title">${title}</h3>
                      </a>
                      <h4 class="author-info">${overview ? overview : ""}
                      </h4>                  
                      <div class="room-description p-t-10">
                          ${description ? description : ""}
                      </div>
                  </div>
              </div>
              <div class="col-lg-2 col-sm-12">
                  <div class="room-toolbar">
                      <a id="btn-watch-now-${id}" class="lgx-btn lgx-btn-sm ${
    allowed ? " " : "lgx-btn-black btn-disabled "
  }" ${allowed ? "href=event.html?roomId=" + id : ""}>
                          <span>${
                            roomDetails.completed ? "Completed" : "Watch Now"
                          }</span>
                      </a>
                  </div>
              </div>
          </div>
      </div>
  </div>
  <div id="collapseOne-${id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne-${id}">
      <div class="panel-body">
          <div class="row">

          </div>
      </div>
  </div>
</div>
`;
}

function setSessions(roomId, sessions) {
    let element = $("#collapseOne-" + roomId + " .row");

    sessions.forEach((e, i) => {
        $(element).append($(getSessionHtml(roomId, e)));
        setSessionSpeakers(e.sessions);
    });
}

function getSessionHtml(roomId, sessionDetails) {
    const eventId = localStorage.getItem("eventId");
    let id = sessionDetails.id;
    let topic = sessionDetails.topic;
    let overview = sessionDetails.description;
    let dt = new Date(sessionDetails.approxStartDate);
    let duration = sessionDetails.duration;
    let spekersHtml = "";

    if (sessionDetails.speakers) {
        let spkImg =
            apiBaseUrl +
            "Documents/Events/" +
            eventId +
            "/rooms/" +
            sessionDetails.eventRoomId +
            "/Sessions/" +
            id +
            "/Speakers/";

        sessionDetails.speakers.forEach((spk, i) => {
            if (spk.pictureUrl) {
                spekersHtml += ` <div class="author-icon"><img src="${
          spkImg + spk.pictureUrl
        }" alt="${spk.speakerName}"><span>${spk.speakerName}</span></div>`;
            }
        });
    }

    return `
<div class="col-xs-12 col-sm-6 col-md-4">
    <div class="lgx-single-news"> 
    <h3 class="title">${topic}</h3>
        <div class="single-news-info pad-0">
            <div class="meta-wrapper">
                 <span>${("0" + (dt.getHours() % 12)).slice(-2)}:${(
    "0" + dt.getMinutes()
  ).slice(-2)} ${dt.getHours() > 12 ? "PM" : "AM"}</span>
                <span>${duration} Mins</span>
            </div>           
        </div>
        <div class="author author-multi">            
              ${spekersHtml}  
        </div>
    </div>
</div>`;
}

function setSessionSpeakers(sessionDetails) {
    let tabContent = $("#speaker-tab-content");
    if (sessionDetails && sessionDetails.speakers) {
        s.speakers.forEach((spk, i) => {
            if (spk.pictureUrl) {
                let p = speakers.filter(
                    (t) =>
                    t.speakerName == spk.speakerName &&
                    t.organization == spk.organization &&
                    t.designation == spk.designation
                );
                if (p.length == 0) {
                    speakers.push(spk);
                    $(tabContent).append(
                        $(getsessionSpeakersHtml(s.eventRoomId, spk, s))
                    );
                }
            }
        });
    }
}

function getsessionSpeakersHtml(eventRoomId, spk, session) {
    const eventId = localStorage.getItem("eventId");
    let spkid = spk.id;
    let speakerName = spk.speakerName;
    let designation = spk.designation;
    let organization = spk.organization;
    let spkImg =
        apiBaseUrl +
        "Documents/Events/" +
        eventId +
        "/rooms/" +
        eventRoomId +
        "/Sessions/" +
        spk.eventRoomSessionId +
        "/Speakers/" +
        spk.pictureUrl;

    let allowed = false;
    let roomDetails = rooms[eventRoomId];

    if (roomDetails) {
        allowed = checkIfRoomAllowedOrNot(
            eventRoomId,
            roomDetails.started,
            roomDetails.completed,
            roomDetails
        );
    }

    let isLive = allowed && session.started && !session.completed;

    return `<div class="col-xs-12 col-sm-6 col-md-4">
      <div class="lgx-single-speaker">
          <figure> 
          <a id="live-spk-${spkid}" class="sp-tw ab-t-r-5 float-r" ${
    isLive ? "" : 'style="display:none"'
  }>
            <i class="fa fa-circle fa-2x"></i>
          </a>
          <a class="profile-img">
            <img src="${spkImg}" alt="${speakerName}" />
          </a>
          <figcaption>
            <div class="social-group">
              <button id="live-spk-btn-${spkid}" class="lgx-btn-white lgx-btn-sm sp-tw ab-t-r-5 float-r" onclick="ViewSession(${eventRoomId})" ${
    isLive ? "" : 'style="display:none"'
  }>
              <i class="fa fa-circle fa-lg"></i> <b>Live</b>
              </button>
            </div>               
            <div class="speaker-info">
                <h3 class="title">${speakerName}</h3>
                <h4 class="subtitle">${designation} , ${organization}</h4>
            </div>
          </figcaption>
          </figure>
      </div>
  </div>`;
}

function ViewSession(roomId) {
    location.href = "mainsession.html?roomId=" + roomId;
}

$(".logoutLink").click(function() {
    Logout((result) => {
        location.href = "index.html";
    });
});