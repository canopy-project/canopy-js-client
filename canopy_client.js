
function CanopyPropertyList() {
}

CanopyPropertyList.prototype.length = function()
{
    return this.numItems;
}

CanopyPropertyList.prototype.keys = function()
{
    /* TODO */
}

CanopyPropertyList.prototype.keys = function()
{
    /* TODO */
}

function SDDLClass(initObj) {

    this.name = function() {
        return initObj.name;
    }

    this.authors = function() {
        /* TODO: copy? */
        return initObj.authors;
    }

    this.description = function() {
        return initObj.description;
    }

    this.properties = function() {
    }

    this.sensorProperties = function() {
    }

    this.controlProperties = function() {
    }
}

function SDDLSensorProperty(initObj) {

    /* 
     * .name()
     *
     *  Obtain name of this property.
     */
    this.name = function() {
        return initObj.name;
    }

    /* 
     * .datatype()
     *
     *  Obtain datatype of this property.
     *  Return value will be one of:
     *      "void",
     *      "string",
     *      "bool",
     *      "int8",
     *      "uint8",
     *      "int16",
     *      "uint16",
     *      "int32",
     *      "uint32",
     *      "float32",
     *      "float64",
     *      "datetime",
     */
    this.datatype = function() {
        return initObj.datatype;
    }

    /* 
     * .minValue()
     *
     *  Obtain minimum value of this property, if any, otherwise undefined.
     */
    this.minValue = function() {
        return initObj.minValue;
    }

    /* 
     * .maxValue()
     *
     *  Obtain minimum value of this property, if any, otherwise undefined.
     */
    this.maxValue = function() {
        return initObj.maxValue;
    }

    /* 
     * .numericDisplayHint()
     *
     *  Obtain numeric display hint.  Return value will be one of:
     *      "normal",
     *      "percentage",
     *      "scientific",
     *      "hex"
     */
    this.numericDisplayHint = function() {
        return initObj.numericDisplayHint;
    }

    /* 
     * .regex()
     *
     *  Obtain regular expression criteria, if any, otherwise null.
     */
    this.regex = function() {
        return initObj.regex;
    }

    /* 
     * .units()
     *
     *  Obtain units string.
     */
    this.units = function() {
        return initObj.units;
    }
}

function SDDLControlProperty(initObj) {

    /* 
     * .name()
     *
     *  Obtain name of this property.
     */
    this.name = function() {
        return initObj.name;
    }

    /* 
     * .controlType()
     *
     *  Obtain control type of this property.
     *  Return value will be one of:
     *      "parameter",
     *      "trigger",
     */
    this.name = function() {
        return initObj.controlType;
    }

    /* 
     * .datatype()
     *
     *  Obtain datatype of this property.
     *  Return value will be one of:
     *      "void",
     *      "string",
     *      "bool",
     *      "int8",
     *      "uint8",
     *      "int16",
     *      "uint16",
     *      "int32",
     *      "uint32",
     *      "float32",
     *      "float64",
     *      "datetime",
     */
    this.datatype = function() {
        return initObj.datatype;
    }

    /* 
     * .minValue()
     *
     *  Obtain minimum value of this property, if any, otherwise undefined.
     */
    this.minValue = function() {
        return initObj.minValue;
    }

    /* 
     * .maxValue()
     *
     *  Obtain minimum value of this property, if any, otherwise undefined.
     */
    this.maxValue = function() {
        return initObj.maxValue;
    }

    /* 
     * .numericDisplayHint()
     *
     *  Obtain numeric display hint.  Return value will be one of:
     *      "normal",
     *      "percentage",
     *      "scientific",
     *      "hex"
     */
    this.numericDisplayHint = function() {
        return initObj.numericDisplayHint;
    }

    /* 
     * .regex()
     *
     *  Obtain regular expression criteria, if any, otherwise null.
     */
    this.regex = function() {
        return initObj.regex;
    }

    /* 
     * .units()
     *
     *  Obtain units string.
     */
    this.units = function() {
        return initObj.units;
    }
}

function CanopyAccount() {
    this.username = function() {
        return initObj.username;
    }

    this.email = function() {
        return initObj.email;
    }
}

/*device.beginControlTransaction()
    .setControlValue("speed", 4)
    .commit();
    .onSuccess(function() {
    })
    .onFailure(function() {
    })
*/

/*
var trans = device.beginControlTransaction()
    .setTargetValue(device.controls.darkness, 2)
    .commit({
        onSuccess: {
            alert("success!");
        }
        onFailed: {
            alert("oops! something went wrong!");
        }
    });
*/
function CanopyDevice(initObj) {
    this.id = function() {
        return initObj.id;
    }

    this.friendlyName = function() {
        return initObj.friendly_name;
    }

    this.sddlClass = function() {
        return new SDDLClass(initObj.sddl_class);
    }

    this.beginControlTransaction = function() {
    }

    this.fetchHistoricData = function() {
    }

    /* Lists accounts who have permission to access this */
    this.permissions = function() {
    }

    this.share = function(params) {
    }

    this.setPermissions = function(params) {
    }
}

function CanopyClient(settings) {
    var params = $.extend({}, {
        cloudHost : "canopy.link",
        cloudHTTPPort : 80,
        cloudHTTPSPort : 433,
        cloudUseHTTPS : false
    }, settings);

    var self = this;

    this.apiBaseUrl = function() {
        return (params.cloudUseHTTPS ? "https://" : "http://") +
            params.cloudHost + ":" +
            (params.cloudUseHTTPS ? params.cloudHTTPSPort : params.cloudHTTPPort)
    }

    this.getLoggedInUsername = function(onSuccess, onError) {
        $.ajax({
            type: "GET",
            dataType : "json",
            url: self.apiBaseUrl() + "/me",
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
            url: self.apiBaseUrl() + "/login",
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
            url: self.apiBaseUrl() + "/logout",
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
            url: self.apiBaseUrl() + "/create_account",
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
            url: self.apiBaseUrl() + "/devices",
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
            url: self.apiBaseUrl() + "/device" + deviceId + "/" + sensorName,
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
            url: self.apiBaseUrl() + "/device" + deviceId,
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
            url: self.apiBaseUrl() + "/share",
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
            url: self.apiBaseUrl() + "/finish_share_transaction",
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
