function CanopyClient() {
    this.getLoggedInUsername = function(onSuccess, onError) {
        $.ajax({
            type: "GET",
            dataType : "json",
            url: "http://canopy.link:8080/me",
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function(data, textStatus, jqXHR) {
            if (onSuccess != null)
                onSuccess(data['username']);
        })
        .fail(function() {
            if (onError != null)
                onError();
        });
        
    }

    this.login = function(username, password, onSuccess, onError) {
        $.ajax({
            type: "POST",
            dataType : "json",
            url: "http://canopy.link:8080/login",
            data: JSON.stringify({username : username, password : password}),
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function(data, textStatus, jqXHR) {
            if (data['success'] === true) {
                onSuccess();
            }
            else {
                onError();
            }
        })
        .fail(function() {
            onError();
        });
    }

    this.logout = function(onSuccess, onError) {
        $.ajax({
            type: "POST",
            dataType : "json",
            url: "http://canopy.link:8080/logout",
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function() {
            if (onSuccess != null)
                onSuccess();
        })
        .fail(function() {
            if (onError != null)
                onError();
        });
    }

    this.createAccount = function(username, email, password, password_confirm, onSuccess, onError) {
        $.ajax({
            type: "POST",
            dataType : "json",
            url: "http://canopy.link:8080/create_account",
            data: JSON.stringify({username : username, email: email, password : password, password_confirm: password_confirm}),
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function() {
            if (onSuccess != null)
                onSuccess();
        })
        .fail(function() {
            if (onError != null)
                onError();
        });
    }

    this.fetchDevices = function(onSuccess, onError) {
        $.ajax({
            type: "GET",
            dataType : "json",
            url: "http://canopy.link:8080/devices",
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function(data, textStatus, jqXHR) {
            if (onSuccess != null)
                onSuccess(data.devices);
        })
        .fail(function() {
            if (onError != null)
                onError();
        });
    }

    this.fetchSensorData = function(deviceId, sensorName, onSuccess, onError) {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://canopy.link:8080/device/" + deviceId + "/" + sensorName,
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function(data, textStatus, jqXHR) {
            if (onSuccess != null)
                onSuccess(data);
        })
        .fail(function() {
            if (onError != null)
                onError();
        });
    }

    this.setControlValue = function(deviceId, controlName, value, onSuccess, onError) {
        obj = {}
        obj[controlName] = value
        $.ajax({
            type: "POST",
            dataType : "json",
            url: "http://canopy.link:8080/device/" + deviceId,
            data: JSON.stringify(obj),
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function() {
            onSuccess();
        })
        .fail(function() {
            onError();
        });
    }

    this.share = function(deviceId, recipientEmail, accessLevel, shareLevel, onSuccess, onError) {
        $.ajax({
            type: "POST",
            dataType : "json",
            url: "http://canopy.link:8080/share",
            data: JSON.stringify( {
                device_id : deviceId, 
                email: recipientEmail,
                access_level: accessLevel,
                sharing_level: shareLevel}),
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function() {
            onSuccess();
        })
        .fail(function() {
            onError();
        });
    }

    this.finishShareTransaction = function(deviceId, onSuccess, onError) {
        $.ajax({
            type: "POST",
            dataType : "json",
            url: "http://canopy.link:8080/finish_share_transaction",
            data: JSON.stringify( {
                device_id : deviceId
            }),
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function(data, textStatus, jqXHR) {
            if (onSuccess != null)
                onSuccess(data);
        })
        .fail(function() {
            onError();
        });
    }
}

/*
    {
        "devices" : [
            {
                "device_id" : UUID,
                "friendly_name" : "mydevice",
                "device_class" : {
                    "canopy.tutorial.sample_device_1" : {
                        "cpu" : {
                            "category" : "sensor",
                            "datatype" : "float32",
                            "min_value" : 0.0,
                            "max_value" : 1.0,
                            "description" : "CPU usage percentage"
                        },
                        "reboot" : {
                            "category" : "control",
                            "control_type" : "trigger",
                            "datatype" : "boolean",
                            "description" : "Reboots the device"
                        }
                    }
                }
            }
        ]
    }
*/

/* 
 * returns list: [#TOTAL, #CONNECTED, #OFFLINE]
 */
function CanopyUtil_DeviceCounts(deviceObjs) {
    var numDevices = deviceObjs.length;
    var out = [numDevices, 0, 0];
    for (var i = 0; i < numDevices; i++) {
        if (deviceObjs[i].connected) {
            out[1]++;
        }
        else {
            out[2]++;
        }
    }
    return out;
}

/*
 * Returns object: {<control_name> : <definition>}
 */
function CanopyUtil_GetDeviceControls(deviceObj) {
    var cls = deviceObj.sddl_class;
    var out = {};
    for (var propDecl in cls) {
        if (propDecl.substring(0, 8) == "control ") {
            var controlName = propDecl.substring(8);
            out[controlName] = cls[propDecl];
            out[controlName]._value = deviceObj.property_values["control " + controlName].v;
        }
    }
    return out;
}

/*
 * Returns object: {<sensor_name> : <definition>}
 */
function CanopyUtil_GetDeviceSensors(deviceObj) {
    var cls = deviceObj.sddl_class;
    var out = {};
    for (var propDecl in cls) {
        if (propDecl.substring(0, 7) == "sensor ") {
            var sensorName = propDecl.substring(7);
            out[sensorName] = cls[propDecl];
            out[sensorName]._value = deviceObj.property_values["sensor " + sensorName].v;
        }
    }
    return out;
}

function CanopyUtil_GetURLParams() {
    var params = [];
    var query = location.search.slice(1).split('&');
    $.each(query, function(i, value) {
        var token = value.split('=');
        params[decodeURIComponent(token[0])] = decodeURIComponent(token[1]);
    });
    return params;
}

function CanopyUtil_Compose(segments) {
    var i;
    var numSegments = segments.length;
    var out = [];
    var $out;
    var placeholderCnt = 0;
    for (i = 0; i < numSegments; i++) {
        if (typeof segments[i] === "string") {
            /* regular string, just append to output */
            out.push(segments[i]);
        }
        else if (typeof segments[i] === "object") {
            if (segments[i] instanceof CanoNode) {
                /* canopy node object.  Create placeholder */
                var placeholderId = "_tmpid_" + placeholderCnt;
                out.push("<div id=" + placeholderId + "/>");
                placeholders.push({
                    id: placeholderId,
                    $segment: segments[i].get$()
                });
                placeholderCnt++;
            }
            else if (segments[i] instanceof jQuery) {
                /* jquery object.  Create placeholder */
                var placeholderId = "_tmpid_" + placeholderCnt;
                out.push("<div id=" + placeholderId + "/>");
                placeholders.push({
                    id: placeholderId,
                    $segment: segments[i]
                });
                placeholderCnt++;
            }
        }
    }

    $out = $(out.join(""));

    /* replace placeholders with actual content */
    for (i = 0; i < placeholderCnt; i++) {
        var id = placeholders[i].id;
        var $segment = placeholders[i].$segment;
        $out.find("#" + id).replaceWith($segment);
    }

    return $out;
}
