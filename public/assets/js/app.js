var isProd = true;
var eventId = 0;
var eventDetails;

// var email;
// var pwd;
var config;
var sessions = [];
var rooms = [];
var currentRoom;
var currentSession;

if (isProd) {
    // Initialize Firebase
    config = {
        apiKey: "AIzaSyCbRC8-Hi3fXzSUPOQ8ccQRKbX3BZRJ4j0",
        authDomain: "tpi-streaming-v2-default-rtdb.asia-southeast1.firebasedatabase.app",
        databaseURL: "https://tpi-streaming-v2-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "tpi-streaming-v2"
    };
} else {
    // Initialize Firebase
    config = {
        apiKey: 'AIzaSyCJTHsmXA521-dnlH0rRUmGNjX9iZyCbno',
        authDomain: 'tpi-streaming-dev-default-rtdb.firebaseio.com',
        databaseURL: 'https://tpi-streaming-dev-default-rtdb.firebaseio.com',
        projectId: 'tpi-streaming-dev'
    };
}

firebase.initializeApp(config);

// firebase.auth().signInWithEmailAndPassword(email, pwd).catch(function(error) {
//     // Handle Errors here.
//     var errorCode = error.code;
//     var errorMessage = error.message;
//     // ...
// });

const dbRef = firebase.database().ref();

function RegisterFirebaseListeners() {
    let subscriberId = localStorage.getItem("subscriberId");
    let eventId = localStorage.getItem("eventId");
    let roomId = GetQueryString("roomId");

    if (eventId) {
        if (subscriberId) {
            const subscriber = dbRef.child(
                "subscribers/" + eventId + "/" + subscriberId
            );

            subscriber.child("activeSessionId").on("value", (snap) => {
                const activeSessionId = localStorage.getItem("activeSessionId");

                if (snap.val() && activeSessionId != snap.val()) {
                    showMessage(
                        false,
                        "You are logged out because another user logged in using your login credentials."
                    );
                    setTimeout(() => {
                        $(".logout")[0].click();
                    }, 2000);
                }
            });
        }

        if (roomId) {
            const subscriber = dbRef.child(
                "analytics/" + eventId
            );

            subscriber.child("totalLiveSubscribers").on("value", (snap) => {
                UpdateLiveSubscriberCount(snap.val());
            });
        }

        const evtRooms = dbRef.child("events/" + eventId + "/rooms");

        evtRooms.on("child_added", (roomSnap) => {
            let roomKey = roomSnap.key;
            let roomVal = roomSnap.val();

            const room = dbRef.child("events/" + eventId + "/rooms/" + roomKey);

            if (
                roomId &&
                parseInt(roomId) > 0 &&
                roomId == roomKey &&
                roomVal.started &&
                !roomVal.completed
            ) {
                currentRoom = roomVal;
            }

            room.on("value", (snap) => {
                rooms[roomKey] = snap.val();

                if (currentRoom && currentRoom.id == parseInt(roomKey)) {
                    currentRoom = snap.val();
                    if (window["currentRoomUpdated"]) currentRoomUpdated();
                }
            });

            room.child("started").on("value", (snap) => {
                if (rooms[roomKey]) {
                    rooms[roomKey].started = snap.val();

                    let params = {
                        roomId: roomKey,
                        started: snap.val(),
                        completed: rooms[roomKey].completed,
                        roomDetails: rooms[roomKey],
                    };
                    roomStartedOrCompleted(params);
                }
            });

            room.child("completed").on("value", (snap) => {
                if (rooms[roomKey]) {
                    rooms[roomKey].completed = snap.val();

                    let params = {
                        roomId: roomKey,
                        started: rooms[roomKey].started,
                        completed: snap.val(),
                        roomDetails: rooms[roomKey],
                    };

                    roomStartedOrCompleted(params);
                }
            });

            const evtSessions = dbRef.child(
                "events/" + eventId + "/rooms/" + roomKey + "/sessions"
            );

            evtSessions.on("child_added", (snap) => {
                let key = snap.key;
                let val = snap.val();

                const session = dbRef.child(
                    "events/" + eventId + "/rooms/" + roomKey + "/sessions/" + key
                );

                if (
                    roomId &&
                    parseInt(roomId) > 0 &&
                    roomId == roomKey &&
                    val.eventRoomId == roomId &&
                    val.started &&
                    !val.completed
                ) {
                    currentSession = val;
                }

                session.on("value", (snap) => {
                    sessions[key] = snap.val();

                    if (currentSession && currentSession.id == parseInt(key)) {
                        currentSession = snap.val();
                        if (window["currentSessionUpdated"]) currentSessionUpdated();
                    }
                });

                session.child("started").on("value", (snap) => {
                    if (sessions[key]) {
                        sessions[key].started = snap.val();

                        let params = {
                            sessionId: key,
                            started: snap.val(),
                            completed: sessions[key].completed,
                            sessionDetails: sessions[key],
                        };
                        sessionStartedOrCompleted(params);
                    }
                });

                session.child("completed").on("value", (snap) => {
                    if (sessions[key]) {
                        sessions[key].completed = snap.val();

                        let params = {
                            sessionId: key,
                            started: sessions[key].started,
                            completed: snap.val(),
                            sessionDetails: sessions[key],
                        };
                        sessionStartedOrCompleted(params);
                    }
                });
            });
        });
    }
}