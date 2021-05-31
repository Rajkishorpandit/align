var subDomain = 'alignsymposium2021';
var apiBaseUrl = 'https://api-v2.tpi.sg/';

function getOverflowBreakoutSessions(fnSuccess, fnError) {
    HttpGet(
        'api/Event/' + subDomain + '/overflowbreakoutsessions',
        (result) => {
            if (ValidateResponse(result)) {
                fnSuccess(result.data);
            }
        },
        (xhr, textStatus, errorThrown) => {}
    );
}

function GetEvent(eventId, fnSuccess, fnError) {
    HttpGet(
        'api/Event/' + eventId,
        (result) => {
            if (ValidateResponse(result)) {
                fnSuccess(result.data);
            }
        },
        (xhr, textStatus, errorThrown) => {}
    );
}

function GetEventBySubdomain(fnSuccess, fnError) {
    HttpGet(
        'api/Event/' + subDomain + '/details',
        (result) => {
            if (ValidateResponse(result)) {
                fnSuccess(result.data);
            }
        },
        (xhr, textStatus, errorThrown) => {}
    );
}

function GetEventRooms(eventId, parentRoomId, fnSuccess, fnError) {
    var url =
        'api/EventRoom/' +
        eventId +
        '/' +
        (parentRoomId ? parentRoomId : 0) +
        '/Rooms';

    HttpGet(
        url,
        (result) => {
            if (ValidateResponse(result)) {
                fnSuccess(result.data);
            }
        },
        (xhr, textStatus, errorThrown) => {}
    );
}

function GetEventRoom(roomId, fnSuccess, fnError) {
    var url = 'api/EventRoom/' + roomId;

    HttpGet(
        url,
        (result) => {
            if (ValidateResponse(result)) {
                fnSuccess(result.data);
            }
        },
        (xhr, textStatus, errorThrown) => {}
    );
}

function GetEventSessions(eventId, roomId, fnSuccess, fnError) {
    var url = 'api/EventSession/' + eventId + '/' + roomId + '/Sessions';

    HttpGet(
        url,
        (result) => {
            if (ValidateResponse(result)) {
                fnSuccess(result.data);
            }
        },
        (xhr, textStatus, errorThrown) => {}
    );
}

function GetTotalCommitments(sessionId, widgetId, fnSuccess, fnError) {
    var url =
        'api/EventSubscriberCommitment/' +
        sessionId +
        '/' +
        widgetId +
        '/Commitments';

    HttpGet(
        url,
        (result) => {
            if (ValidateResponse(result)) {
                fnSuccess(result.data);
            }
        },
        (xhr, textStatus, errorThrown) => {}
    );
}

function AddCommitment(sessionId, widgetId, subscriberId, fnSuccess, fnError) {
    if (currentSession) {
        var param = {
            sessionId: sessionId,
            widgetId: widgetId,
            subscriberId: parseInt(subscriberId),
            clusterCode: currentSession.widgetType == 'multiprogressbar' ?
                localStorage.getItem('clusterCode') : '',
            noOfCommitments: 1,
            id: 0,
        };

        HttpPost(
            'api/EventSubscriberCommitment',
            param,
            (result) => {
                if (ValidateResponse(result)) {
                    fnSuccess(result.data);
                }
            },
            (xhr, textStatus, errorThrown) => {}
        );
    }
}

function AddEventAyanlytics(params, fnSuccess, fnError) {
    if (currentSession) {
        HttpPost(
            'api/EventAnalytics',
            params,
            (result) => {
                if (ValidateResponse(result)) {
                    fnSuccess(result.data);
                }
            },
            (xhr, textStatus, errorThrown) => {}
        );
    }
}

function Register(params, fnSuccess, fnError) {
    // let params = 'username=' + username + '&accessCode=' + accessCode + '&phone=' + phone;

    HttpPost(
        'api/EventSubscriber/Register',
        params,
        (result) => {
            if (result != null) {
                if (result.responseType === 'SUCCESS') {
                    showMessage(true, 'Thank you for registering!');
                    fnSuccess(result.data);
                } else {
                    showMessage(false, result.message);
                }
            } else {
                showMessage(false, 'Something went wrong, Please try again.');
            }
        },
        (xhr, textStatus, errorThrown) => {
            showMessage(
                false,
                'You are not authorized, please contact your supervisor'
            );
        }
    );
}

function Login(email, password, fnSuccess, fnError) {
    var param = {
        email: email,
        password: password,
        subdomain: subDomain,
        grantType: 'AUTHORIZATION_CODE',
    };

    HttpPost(
        'api/login/authenticate',
        param,
        (result) => {
            if (result != null) {
                if (result.responseType === 'SUCCESS') {
                    localStorage.setItem('accessToken', result.data.accessToken);
                    localStorage.setItem('eventId', result.data.eventId);
                    localStorage.setItem('subscriberId', result.data.subscriberId);
                    localStorage.setItem('clusterCode', result.data.clusterCode);
                    localStorage.setItem('activeSessionId', result.data.activeSessionId);
                    localStorage.setItem('firstName', result.data.firstName);
                    localStorage.setItem('lastName', result.data.lastName);
		    localStorage.setItem("companyName", result.data.companyName);
                    localStorage.setItem("email", result.data.email);
                    localStorage.setItem('expires', result.data.expires);
                    if (result.data.categoryId) {
                        localStorage.setItem('categoryId', result.data.categoryId);
                    }

                    fnSuccess(result.data);
                } else {
                    showMessage(false, 'Invalid Credentials');
                }
            } else {
                showMessage(false, 'Something went wrong, Please try again.');
            }
        },
        (xhr, textStatus, errorThrown) => {
            showMessage(
                false,
                'You are not authorized, please contact your supervisor'
            );
        }
    );
}

function Logout(fnSuccess, fnError) {
    HttpPost(
        'api/Logout', {},
        (result) => {
            if (result && result.responseType === 'SUCCESS') {}
            ClearStorage();
            fnSuccess(result);
        },
        () => {
            ClearStorage();
        }
    );
}

// Messages
function showMessage(isSuccess, message) {
    toastr.options = {
        closeButton: false,
        debug: false,
        newestOnTop: false,
        progressBar: false,
        positionClass: 'toast-top-center',
        preventDuplicates: false,
        onclick: null,
        showDuration: '300',
        hideDuration: '1000',
        timeOut: '5000',
        extendedTimeOut: '1000',
        showEasing: 'swing',
        hideEasing: 'linear',
        showMethod: 'fadeIn',
        hideMethod: 'fadeOut',
    };
    if (isSuccess === true) {
        toastr['success'](message);
    } else {
        toastr['error'](message);
    }
}

function IsAuthorized() {
    let expr = localStorage.getItem('expires');
    let tkn = localStorage.getItem('accessToken');
    let subscriber = localStorage.getItem('subscriberId');

    let dt = expr ? new Date(expr) : null;
    return dt && new Date() < dt && tkn && subscriber && parseInt(subscriber) > 0;
}

function ClearStorage() {
    localStorage.clear();
}

function GetDeviceDetails() {
    let unknown = '-';

    // screen
    let screenSize = '';
    if (screen.width) {
        let width = screen.width ? screen.width : '';
        let height = screen.height ? screen.height : '';
        screenSize += '' + width + ' x ' + height;
    }

    // browser
    let nVer = navigator.appVersion;
    let nAgt = navigator.userAgent;
    let browser = navigator.appName;
    let version = '' + parseFloat(navigator.appVersion);
    let majorVersion = parseInt(navigator.appVersion, 10);
    let nameOffset, verOffset, ix;

    // Opera
    if ((verOffset = nAgt.indexOf('Opera')) != -1) {
        browser = 'Opera';
        version = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf('Version')) != -1) {
            version = nAgt.substring(verOffset + 8);
        }
    }
    // Opera Next
    if ((verOffset = nAgt.indexOf('OPR')) != -1) {
        browser = 'Opera';
        version = nAgt.substring(verOffset + 4);
    }
    // Edge
    else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
        browser = 'Microsoft Edge';
        version = nAgt.substring(verOffset + 5);
    }
    // MSIE
    else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
        browser = 'Microsoft Internet Explorer';
        version = nAgt.substring(verOffset + 5);
    }
    // Chrome
    else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
        browser = 'Chrome';
        version = nAgt.substring(verOffset + 7);
    }
    // Safari
    else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
        browser = 'Safari';
        version = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf('Version')) != -1) {
            version = nAgt.substring(verOffset + 8);
        }
    }
    // Firefox
    else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
        browser = 'Firefox';
        version = nAgt.substring(verOffset + 8);
    }
    // MSIE 11+
    else if (nAgt.indexOf('Trident/') != -1) {
        browser = 'Microsoft Internet Explorer';
        version = nAgt.substring(nAgt.indexOf('rv:') + 3);
    }
    // Other browsers
    else if (
        (nameOffset = nAgt.lastIndexOf(' ') + 1) <
        (verOffset = nAgt.lastIndexOf('/'))
    ) {
        browser = nAgt.substring(nameOffset, verOffset);
        version = nAgt.substring(verOffset + 1);
        if (browser.toLowerCase() == browser.toUpperCase()) {
            browser = navigator.appName;
        }
    }
    // trim the version string
    if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

    majorVersion = parseInt('' + version, 10);
    if (isNaN(majorVersion)) {
        version = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }

    // mobile version
    let mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

    // cookie
    let cookieEnabled = navigator.cookieEnabled ? true : false;

    if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
        document.cookie = 'testcookie';
        cookieEnabled = document.cookie.indexOf('testcookie') != -1 ? true : false;
    }

    // system
    let os = unknown;
    let clientStrings = [
        { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
        { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
        { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
        { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
        { s: 'Windows Vista', r: /Windows NT 6.0/ },
        { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
        { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
        { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
        { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
        { s: 'Windows 98', r: /(Windows 98|Win98)/ },
        { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
        { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
        { s: 'Windows CE', r: /Windows CE/ },
        { s: 'Windows 3.11', r: /Win16/ },
        { s: 'Android', r: /Android/ },
        { s: 'Open BSD', r: /OpenBSD/ },
        { s: 'Sun OS', r: /SunOS/ },
        { s: 'Chrome OS', r: /CrOS/ },
        { s: 'Linux', r: /(Linux|X11(?!.*CrOS))/ },
        { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
        { s: 'Mac OS X', r: /Mac OS X/ },
        { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
        { s: 'QNX', r: /QNX/ },
        { s: 'UNIX', r: /UNIX/ },
        { s: 'BeOS', r: /BeOS/ },
        { s: 'OS/2', r: /OS\/2/ },
        {
            s: 'Search Bot',
            r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/,
        },
    ];
    for (let id in clientStrings) {
        let cs = clientStrings[id];
        if (cs.r.test(nAgt)) {
            os = cs.s;
            break;
        }
    }

    let osVersion = 'unknown';

    if (/Windows/.test(os)) {
        osVersion = /Windows (.*)/.exec(os)[1];
        os = 'Windows';
    }

    switch (os) {
        case 'Mac OS X':
            osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
            break;

        case 'Android':
            osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
            break;

        case 'iOS':
            osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
            osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
            break;
    }

    return {
        screen: screenSize,
        browser: browser,
        browserVersion: version,
        browserMajorVersion: majorVersion,
        mobile: mobile,
        os: os,
        osVersion: osVersion,
        cookies: cookieEnabled,
    };
}

function HttpGet(url, fnSuccess, fnError) {
    $.ajax({
        url: apiBaseUrl + url,
        type: 'GET',
        headers: {
            authorization: 'Bearer ' + localStorage.getItem('accessToken'),
        },
        success: function(result) {
            fnSuccess(result);
        },
        error: function(xhr, textStatus, errorThrown) {
            fnError(xhr, textStatus, errorThrown);
        },
    });
}

function HttpPost(url, param, fnSuccess, fnError) {
    $.ajax({
        url: apiBaseUrl + url,
        type: 'POST',
        data: JSON.stringify(param),
        contentType: 'application/json',
        headers: GetHttpHeaders(),
        cache: false,
        processData: false,
        success: function(result) {
            fnSuccess(result);
        },
        error: function(xhr, textStatus, errorThrown) {
            fnError(xhr, textStatus, errorThrown);
        },
    });
}

function GetHttpHeaders() {
    const deviceDetails = GetDeviceDetails();
    const token = localStorage.getItem('accessToken');

    let headers = {
        'X-DeviceType': deviceDetails.mobile ? 'Mobile' : 'Web',
        'X-Device': navigator.userAgent,
        'X-Browser': deviceDetails.browser + ' ' + deviceDetails.browserVersion,
        'X-OS': deviceDetails.os + ' ' + deviceDetails.osVersion,
        'X-Screen': deviceDetails.screen,
    };

    if (token) {
        headers['authorization'] = 'Bearer ' + token;
    }
    return headers;
}

function ValidateResponse(result) {
    return (
        result != null && result.responseType === 'SUCCESS' && result.data != null
    );
}

function GetQueryString(key) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
}

Date.prototype.monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

Date.prototype.getMonthName = function() {
    return this.monthNames[this.getMonth()];
};
Date.prototype.getShortMonthName = function() {
    return this.getMonthName().substr(0, 3);
};