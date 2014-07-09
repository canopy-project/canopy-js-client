function CanopyPropertyBase()
{
    this.isBasicClass = function() {
        return this.propertyType() == "class" && this.compositeType() == "single";
    }

    this.isBasicControl = function() {
        return this.propertyType() == "control" && this.compositeType() == "single";
    }

    this.isBasicSensor = function() {
        return this.propertyType() == "sensor" && this.compositeType() == "single";
    }

    this.isClassArray = function() {
        return this.propertyType() == "class" && this.compositeType() == "fixed-array";
    }

    this.isControlArray = function() {
        return this.propertyType() == "control" && this.compositeType() == "fixed-array";
    }

    this.isSensorArray = function() {
        return this.propertyType() == "sensor" && this.compositeType() == "fixed-array";
    }

    this.isClassMap = function() {
        return this.propertyType() == "class" && this.compositeType() == "map";
    }

    this.isControlMap = function() {
        return this.propertyType() == "control" && this.compositeType() == "map";
    }

    this.isSensorMap = function() {
        return this.propertyType() == "sensor" && this.compositeType() == "map";
    }
}

/*
 * <name> is string
 * <decl> is object
 */
function CanopyClass(propName, decl) {
    var self=this,
        /* TODO: validation */
        _authors = decl.authors, /* TODO: deep copy? */
        _description = decl.description,
        _properties = [],
    ;
    
    $.extend(this, new CanopyPropertyBase());

    for (var prop in decl) {
        if (decl.hasOwnProperty(prop)) {
            var info = _DeclInfo(decl);
            var newProperty = null;
            if (info.propertyType == "control") {
                newProperty = CanopyControl(info.name, info.propertyType);
            }
            else if (info.propertyType == "sensor") {
                newProperty = CanopySensor(info.name, info.propertyType);
            }
            else if (info.propertyType == "class") {
                newProperty = CanopyClass(info.name, info.propertyType);
            }

            if (newProperty != null) {
                _properties.push(newProperty);
            }
        }
    }

    this.authors = function() {
        return _authors;
    }

    this.childClass = function(name) {
        return this.childClasses()[name];
    }

    this.childClasses = function() {
        var out = {};
        for (var i = 0; i < _properties.length; i++) {
            if (_properties[i].isClass()) {
                out[_properties[i].name()] = _properties[i];
            }
        }
        return out;
    }

    this.childClassList = function() {
        var out = [];
        for (var i = 0; i < _properties.length; i++) {
            if (_properties[i].isClass()) {
                out.push(_properties[i]);
            }
        }
        return out;
    }

    this.control = function(name) {
        return this.controls()[name];
    }

    this.controls = function() {
        var out = {};
        for (var i = 0; i < _properties.length; i++) {
            if (_properties[i].isControl()) {
                out[_properties[i].name()] = _properties[i];
            }
        }
        return out;
    }

    this.controlList = function() {
        var out = [];
        for (var i = 0; i < _properties.length; i++) {
            if (_properties[i].isControl()) {
                out.push(_properties[i]);
            }
        }
        return out;
    }

    this.compositeType = function() {
        return "single";
    }

    this.description = function() {
        return _description;
    }

    this.name = function() {
        return propName;
    }

    this.propertyType = function() {
        return "class";
    }

    this.sensor = function(name) {
        return this.sensors()[name];
    }

    this.sensors = function() {
        var out = {};
        for (var i = 0; i < _properties.length; i++) {
            if (_properties[i].isSensor()) {
                out[_properties[i].name()] = _properties[i];
            }
        }
        return out;
    }

    this.sensorList = function() {
        var out = [];
        for (var i = 0; i < _properties.length; i++) {
            if (_properties[i].isSensor()) {
                out.push(_properties[i]);
            }
        }
        return out;
    }

}

function CanopySensor(propName, decl) {
    var self=this,
        /* TODO: validation */
        _datatype = decl.datatype,
        _minValue = decl.minValue,
        _maxValue = decl.maxValue,
        _numericDisplayHint = decl.numericDisplayHint,
        _regex = decl.regex,
        _units = decl.units,
        _value = decl.value
    ;

    this.name = function() {
        return _name;
    }

    this.compositeType = function() {
        return "single";
    }

    this.datatype = function() {
        return _dataytpe;
    }

    this.minValue = function() {
        return _minValue;
    }

    this.maxValue = function() {
        return _maxValue;
    }
    this.numericDisplayHint = function() {
        return _numericDisplayHint;
    }

    this.propertyType = function() {
        return "control";
    }

    this.regex = function() {
        return _regex;
    }

    this.units = function() {
        return _units;
    }

    this.value = function() {
        return _value;
    }
}

function CanopyControlArray(propName, size, decl)
{
    var _items;

    for (var i = 0; i < size; i++) {
        var control = new CanopyControl(propName + "[" + i + "]", decl)
    }

    this.compositeType = function() {
        return "fixed-array";
    }

    this.propertyType = function() {
        return "control";
    }

    this.item = function(index) {
        return this.items()[index];
    }

    this.items = function() {
    }

    this.numItems = function() {
        return this.items().length();
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
function CanopyClient(origSettings) {
    var settings = $.extend({}, {
        cloudHost : "canopy.link",
        cloudHTTPPort : 80,
        cloudHTTPSPort : 433,
        cloudUseHTTPS : false
    }, origSettings);

    var self = this;

    this.apiBaseUrl = function() {
        return (settings.cloudUseHTTPS ? "https://" : "http://") +
            settings.cloudHost + ":" +
            (settings.cloudUseHTTPS ? settings.cloudHTTPSPort : settings.cloudHTTPPort)
    }

    this.fetchAccount = function(params) {
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
            if (params.onSuccess) {
                var acct = new CanopyAccount({
                    username: data['username'],
                    email: data['email']
                });
                params.onSuccess(acct);
            }
        })
        .fail(function() {
            /* TODO: not_logged_in error */
            if (onError != null)
                onError("unknown");
        });
    }

    this.login = function(params) {
        /* TODO: proper error handlilng */
        /* TODO: response needs to include username & email */
        $.ajax({
            type: "POST",
            dataType : "json",
            url: self.apiBaseUrl() + "/login",
            data: JSON.stringify({username : params.username, password : params.password}),
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function(data, textStatus, jqXHR) {
            var acct = new CanopyAccount({
                username: data['username'],
                email: data['email']
            });
            if (data['success'] === true) {
                if (params.onSuccess)
                    params.onSuccess(acct);
            }
            else {
                if (params.onError)
                    params.onError("unknown");
            }
        })
        .fail(function() {
            if (params.onError)
                params.onError("unknown");
        });
    }

    this.logout = function(params) {
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
            if (params.onSuccess)
                params.onSuccess();
        })
        .fail(function() {
            if (params.onError)
                params.onError();
        });
    }

    /* 
     * CanopyAccount
     *
     * This is a private "class" of CanopyClient to prevent the caller from
     * calling the constructor.
     */
    function CanopyAccount(initObj) {
        this.email = function() {
            return initObj.email;
        }

        this.username = function() {
            return initObj.username;
        }

        this.fetchDevices = function(params) {
            /* TODO: Filter to only show devices for this account */
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
                /* construct CanopyDevice objects */
                var devices = [];
                for (var i = 0; i < data.devices.length(); i++) {
                    devices.push(new Device(data.devices[i]));
                }
                if (params.onSuccess != null)
                    params.onSuccess(devices);
            })
            .fail(function() {
                if (params.onError != null)
                    params.onError("unknown");
            });
        }
    }

    /*
     * CanopyDevice
     *
     * This is a private "class" of CanopyClient to prevent the caller from
     * calling the constructor.
     */
    function CanopyDevice(initObj) {
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

        this.childClass = this.sddlClass.childClass;
        this.control = this.sddlClass.control;
        this.sensor = this.sddlClass.sensor;
        this.property = this.sddlClass.property;

        this.childClasses = this.sddlClass.childClasses;
        this.control = this.sddlClass.control;
        this.sensor = this.sddlClass.sensor;
        this.property = this.sddlClass.property;

        this.id = function() {
            return initObj.device_id;
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

    /*this.createAccount = function(username, email, password, password_confirm, onSuccess, onError) {
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
    }*/

    /*this.fetchDevices = function(onSuccess, onError) {
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
    }*/

    /*this.fetchSensorData = function(deviceId, sensorName, onSuccess, onError) {
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
    }*/

    /*this.setControlValue = function(deviceId, controlName, value, onSuccess, onError) {
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
    }*/

    /*this.share = function(deviceId, recipientEmail, accessLevel, shareLevel, onSuccess, onError) {
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
    }*/

    /*this.finishShareTransaction = function(deviceId, onSuccess, onError) {
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
    }*/
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
/*function CanopyUtil_DeviceCounts(deviceObjs) {
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
}*/

/*
 * Returns object: {<control_name> : <definition>}
 */
/*function CanopyUtil_GetDeviceControls(deviceObj) {
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
}*/

/*
 * Returns object: {<sensor_name> : <definition>}
 */
/*function CanopyUtil_GetDeviceSensors(deviceObj) {
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
}*/
