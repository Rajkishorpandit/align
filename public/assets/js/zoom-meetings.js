window.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    websdkready();
});
var API_KEY = "7FFGLR65QP6eJ1XZ1BURKA";

/**
 * NEVER PUT YOUR ACTUAL API SECRET IN CLIENT SIDE CODE, THIS IS JUST FOR QUICK PROTOTYPING
 * The below generateSignature should be done server side as not to expose your api secret in public
 * You can find an eaxmple in here: https://marketplace.zoom.us/docs/sdk/native-sdks/web/essential/signature
 */
var API_SECRET = "EP2spLeD42RGaDMEJCxq0DR8UmRjTpquIq4D";

function websdkready() {
    var testTool = window.testTool;
    if (testTool.isMobileDevice()) {
        vConsole = new VConsole();
    }
    console.log("checkSystemRequirements");
    console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

    // it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
    // if (!china) ZoomMtg.setZoomJSLib('https://source.zoom.us/1.8.6/lib', '/av'); // CDN version default
    // else ZoomMtg.setZoomJSLib('https://jssdk.zoomus.cn/1.8.6/lib', '/av'); // china cdn option
    // ZoomMtg.setZoomJSLib('http://localhost:9999/node_modules/@zoomus/websdk/dist/lib', '/av'); // Local version default, Angular Project change to use cdn version
    ZoomMtg.preLoadWasm(); // pre download wasm file to save time.

    function copyToClipboard(elementId) {
        var aux = document.createElement("input");
        aux.setAttribute(
            "value",
            document.getElementById(elementId).getAttribute("link")
        );
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
    }

    // click copy jon link button
    window.copyJoinLink = function(element) {
        var meetingConfig = testTool.getMeetingConfig();
        if (!meetingConfig.mn || !meetingConfig.name) {
            alert("Meeting number or username is empty");
            return false;
        }
        var signature = ZoomMtg.generateSignature({
            meetingNumber: meetingConfig.mn,
            apiKey: API_KEY,
            apiSecret: API_SECRET,
            role: meetingConfig.role,
            success: function(res) {
                console.log(res.result);
                meetingConfig.signature = res.result;
                meetingConfig.apiKey = API_KEY;
                var joinUrl =
                    testTool.getCurrentDomain() +
                    "/meeting.html?" +
                    testTool.serialize(meetingConfig);
                document
                    .getElementById("copy_link_value")
                    .setAttribute("link", joinUrl);
                copyToClipboard("copy_link_value");
            },
        });
    };
}

function joinMeeting() {
    var meetingConfig = getMeetingConfig();
    if (!meetingConfig.mn || !meetingConfig.name) {
        alert("Meeting number or username is empty");
        return false;
    }

    testTool.setCookie("meeting_number", meetingConfig.mn);
    testTool.setCookie("meeting_pwd", meetingConfig.pwd);

    var signature = ZoomMtg.generateSignature({
        meetingNumber: meetingConfig.mn,
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        role: meetingConfig.role,
        success: function(res) {
            console.log(res.result);
            meetingConfig.signature = res.result;
            meetingConfig.apiKey = API_KEY;
            var joinUrl =
                window.location.origin +
                "/zoom-meeting.html?" +
                testTool.serialize(meetingConfig);
            console.log(joinUrl);

            document.getElementById("iframe-zoom").src = joinUrl;
            //window.open(joinUrl, "_blank");
        },
    });
}

function getMeetingConfig() {
    //https://zoom.us/j/2492512314?pwd=bFBRUTcvZzNmVE9NT3RyUG9tVVhJQT09
    //Join Zoom Meeting
    let mId = GetQueryString("meetingId");
    let pwd = GetQueryString("pwd");

    return {
        mn: parseInt(mId),
        name: testTool.b64EncodeUnicode(
            window.localStorage["firstName"] + " " + window.localStorage["lastName"]
        ),
        pwd: pwd ? pwd : '',
        role: parseInt(0, 10), //0- Attendee, 1- Host, 5- Assistant
        email: testTool.b64EncodeUnicode(""),
        lang: "en-US",
        signature: "",
    };
}

function GetQueryString(key) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
}