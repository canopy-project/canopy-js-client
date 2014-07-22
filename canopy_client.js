function SDDLParser() {

    /*
     * <decl> is a property declaration string, such as "sensor cpu[8]"
     * returns
     *  {
     *      "propertyType": "control" | "sensor" | "class" | "unknown",
     *      "compositeType": "single" | "array" | "map",
     *      "name": string
     *  }
     */
    function DeclInfo(decl) {
        var parts = decl.split(" ");
        if (parts.length != 2) {
            return {
                propertyType: "unknown",
                compositeType: "unknown",
                name: "",
            }
        }

        /* TODO: array & map handling */
        /* TODO: input validation */
        return {
            propertyType: parts[0],
            compositeType: "single",
            name: parts[1],
        }
    }

    function SDDLPropertyBase()
    {
        this.isClass = function() {
            return this.propertyType() == "class" && this.compositeType() == "single";
        }

        this.isControl = function() {
            return this.propertyType() == "control" && this.compositeType() == "single";
        }

        this.isSensor = function() {
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
     * <params>
     *      .authors : list of authors
     *      .children : list of SDDLProperty objects
     *      .description : text description
     *      .name : name of this property
     */
    function SDDLClass(params) {
        $.extend(this, new SDDLPropertyBase());

        this.authors = function() {
            return params.authors;
        }

        this.childClass = function(name) {
            return this.childClasses()[name];
        }

        this.childClasses = function() {
            var out = {};
            for (var i = 0; i < params.children.length; i++) {
                if (params.children[i].isClass()) {
                    out[params.children[i].name()] = params.children[i];
                }
            }
            return out;
        }

        this.childClassList = function() {
            var out = [];
            for (var i = 0; i < params.children.length; i++) {
                if (params.children[i].isClass()) {
                    out.push(params.children[i]);
                }
            }
            return out;
        }

        this.control = function(name) {
            return this.controls()[name];
        }

        this.controls = function() {
            var out = {};
            for (var i = 0; i < params.children.length; i++) {
                if (params.children[i].isControl()) {
                    out[params.children[i].name()] = params.children[i];
                }
            }
            return out;
        }

        this.controlList = function() {
            var out = [];
            for (var i = 0; i < params.children.length; i++) {
                if (params.children[i].isControl()) {
                    out.push(params.children[i]);
                }
            }
            return out;
        }

        this.compositeType = function() {
            return "single";
        }

        this.description = function() {
            return params.description;
        }

        this.name = function() {
            return propName;
        }

        this.property = function(name) {
            return this.properties()[name];
        }

        this.properties = function() {
            var out = {};
            for (var i = 0; i < params.children.length; i++) {
                out[params.children[i].name()] = params.children[i];
            }
            return out;
        }

        this.propertyList = function() {
            var out = [];
            for (var i = 0; i < params.children.length; i++) {
                out.push(params.children[i]);
            }
            return out;
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
                if (params.children[i].isSensor()) {
                    out[params.children[i].name()] = params.children[i];
                }
            }
            return out;
        }

        this.sensorList = function() {
            var out = [];
            for (var i = 0; i < params.children.length; i++) {
                if (params.children[i].isSensor()) {
                    out.push(params.children[i]);
                }
            }
            return out;
        }

    }

    /*
     * <params>
     *      .datatype
     *      .controlType
     *      .name
     *      .minValue
     *      .maxValue
     *      .numericDisplayHint
     *      .regex
     *      .units
     */
    function SDDLControl(params) {
        $.extend(this, new SDDLPropertyBase());

        this.name = function() {
            return params.name;
        }

        this.compositeType = function() {
            return "single";
        }

        this.controlType = function() {
            return params.controlType;
        }

        this.datatype = function() {
            return params.datatype;
        }

        this.minValue = function() {
            return params.minValue;
        }

        this.maxValue = function() {
            return params.maxValue;
        }

        this.numericDisplayHint = function() {
            return params.numericDisplayHint;
        }

        this.propertyType = function() {
            return "control";
        }

        this.regex = function() {
            return params.regex;
        }
        this.units = function() {
            return params.units;
        }
    }

    /*
     * <params>
     *      .datatype
     *      .name
     *      .minValue
     *      .maxValue
     *      .numericDisplayHint
     *      .regex
     *      .units
     */
    function SDDLSensor(params) {
        $.extend(this, new SDDLPropertyBase());

        this.name = function() {
            return params.name;
        }

        this.compositeType = function() {
            return "single";
        }

        this.datatype = function() {
            return params.datatype;
        }

        this.minValue = function() {
            return params.minValue;
        }

        this.maxValue = function() {
            return params.maxValue;
        }

        this.numericDisplayHint = function() {
            return params.numericDisplayHint;
        }

        this.propertyType = function() {
            return "sensor";
        }

        this.regex = function() {
            return params.regex;
        }

        this.units = function() {
            return params.units;
        }
    }

    function _IsValidDatatype(x) {
        var validDataypes = {
            "null" : 1,
            "void" : 1,
            "bool" : 1,
            "int8" : 1,
            "uint8" : 1,
            "int16" : 1,
            "uint16" : 1,
            "int32" : 1,
            "uint32" : 1,
            "float32" : 1,
            "float64" : 1,
            "datetime" : 1
        };
        return validDataypes[x] !== undefined;
    }

    function _IsValidNumericDisplayHint(x) {
        var validValues = {
            "normal" : 1,
            "percentage" : 1,
            "scientific" : 1,
            "hex" : 1
        };
        return validValues[x] !== undefined;
    }

    function _IsValidControlType(x) {
        var validValues = {
            "trigger" : 1,
            "parameter" : 1,
        };
        return validValues[x] !== undefined;
    }

    function _IsNumberOrNull(x) {
        return (typeof x === "number" || x === null);
    }

    function _IsString(x) {
        return typeof x === "string";
    }

    function ParseControl(decl, def) {
        var params = {
            controlType: "paramter",
            datatype: "float32",
            description: "",
            maxValue: null,
            minValue: null,
            numericDisplayHint: "normal",
            regex: null,
            units: "",
        }

        var info = DeclInfo(decl);

        if (info.propertyType != "control") {
            return {
                sddl: null, 
                error: "SDDLParser:ParseControl expected SDDL control declaration"
            };
        }

        if (info.compositeType != "single") {
            return {
                sddl: null, 
                error: "SDDLParser:ParseControl expected single control, not array or map"
            };
        }

        params.name = info.name;

        for (key in def) {
            if (def.hasOwnProperty(key)) {
                if (key == "control-type") {
                    if (!_IsValidControlType(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseControl: unsupported \"controlType\": " + def[key]
                        };
                    }
                    params.controlType = def[key];
                }
                else if (key == "datatype") {
                    if (!_IsValidDatatype(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseControl: unsupported \"controlType\": " + def[key]
                        };
                    }
                    params.datatype = def[key];
                }
                else if (key == "description") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseControl expected string for \"description\""
                        };
                    }
                    params.description = def[key];
                }
                else if (key == "max-value") {
                    if (!_IsNumberOrNull(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseControl exptected number or null for \"max-value\""
                        };
                    }
                    params.minValue = def[key];
                }
                else if (key == "min-value") {
                    if (!_IsNumberOrNull(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseControl exptected number or null for \"min-value\""
                        };
                    }
                    params.maxValue = def[key];
                }
                else if (key == "numeric-display-hint") {
                    if (!_IsValidNumericDisplayHint(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseControl: unsupported \"numeric-display-hint\"" + def[key]
                        };
                    }
                    params.numericDisplayHint = def[key];
                }
                else if (key == "regex") {
                    if (!_IsValidRegex(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseControl: invalid value for \"regex\""
                        };
                    }
                    params.regex = def[key];
                }
                else if (key == "units") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseControl: invalid value for \"units\""
                        };
                    }
                    params.units = def[key];
                }
            }
        }

        return {
            sddl: new SDDLControl(params),
            error: null
        };
    }

    function ParseSensor(decl, def) {
        var params = {
            datatype: "float32",
            description: "",
            maxValue: null,
            minValue: null,
            numericDisplayHint: "normal",
            regex: null,
            units: "",
        }

        var info = DeclInfo(decl);

        if (info.propertyType != "sensor") {
            return {
                sddl: null, 
                error: "SDDLParser:ParseSensor expected SDDL sensor declaration"
            };
        }

        if (info.compositeType != "single") {
            return {
                sddl: null, 
                error: "SDDLParser:ParseSensor expected single sensor, not array or map"
            };
        }

        params.name = info.name;

        for (key in def) {
            if (def.hasOwnProperty(key)) {
                if (key == "datatype") {
                    if (!_IsValidDatatype(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseSensor: unsupported \"controlType\": " + def[key]
                        };
                    }
                    params.datatype = def[key];
                }
                else if (key == "description") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseSensor expected string for \"description\""
                        };
                    }
                    params.description = def[key];
                }
                else if (key == "max-value") {
                    if (!_IsNumberOrNull(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseSensor exptected number or null for \"max-value\""
                        };
                    }
                    params.maxValue = def[key];
                }
                else if (key == "min-value") {
                    if (!_IsNumberOrNull(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseSensor exptected number or null for \"min-value\""
                        };
                    }
                    params.minValue = def[key];
                }
                else if (key == "numeric-display-hint") {
                    if (!_IsValidNumericDisplayHint(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseSensor: unsupported \"numeric-display-hint\"" + def[key]
                        };
                    }
                    params.numericDisplayHint = def[key];
                }
                else if (key == "regex") {
                    if (!_IsValidRegex(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseSensor: invalid value for \"regex\""
                        };
                    }
                    params.regex = def[key];
                }
                else if (key == "units") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseSensor: invalid value for \"units\""
                        };
                    }
                    params.units = def[key];
                }
            }
        }

        return {
            sddl: new SDDLSensor(params),
            error: null
        };
    }

    /*
     * Returns object 
     *  {
     *      sddl: SDDLClass or null
     *      error: string or null
     *  }
     */
    this.ParseClass = function(decl, def) {
        var params = {
            authors: [],
            children : [],
            description: ""
        }
        var info = DeclInfo(decl);
        var result;

        if (info.propertyType != "class") {
            return {
                sddl: null, 
                error: "SDDLParser:ParseClass expected SDDL class declaration"
            };
        }

        if (info.compositeType != "single") {
            return {
                sddl: null, 
                error: "SDDLParser:ParseClass expected single class, not array or map"
            };
        }

        params.name = info.name;

        for (key in def) {
            if (def.hasOwnProperty(key)) {
                if (key == "authors") {
                    if (!_IsListOfStrings(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseClass expected list of strings for \"authors\""
                        };
                    }
                    params.authors = authors;
                }
                else if (key == "description") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "SDDLParser:ParseClass expected string for \"description\""
                        }
                    }
                    params.description = description;
                }
                else {
                    var propDeclInfo = DeclInfo(key);
                    if (propDeclInfo.propertyType == "class") {
                        result = ParseClass(key, def[key]);
                        if (result.error != null) {
                            return result;
                        }
                        params.children.push(result.sddl);
                    }
                    else if (propDeclInfo.propertyType == "control") {
                        result = ParseControl(key, def[key]);
                        if (result.error != null) {
                            return result;
                        }
                        params.children.push(result.sddl);
                    }
                    else if (propDeclInfo.propertyType == "sensor") {
                        result = ParseSensor(key, def[key]);
                        if (result.error != null) {
                            return result;
                        }
                        params.children.push(result.sddl);
                    }
                }
            }
        }

        return {
            sddl: new SDDLClass(params),
            error: null
        };
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
                    "property_values" : {
                        "cpu" : 43,
                        "gps" : {
                            "latitude" : 423.433,
                            "longitude" : 543.235,
                        }
                    }
                }
            ]
        }
    */

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
        cloudUseHTTPS : false,
        cloudUrlPrefix : ""
    }, origSettings);

    var self = this;
    this._fnReady = [];
    this._fnLogin = [];
    this._fnLogout = [];
    this._ready = false;
    this.account = null;
    this.devices = null;

    var sddlParser = new SDDLParser();

    this.apiBaseUrl = function() {
        return (settings.cloudUseHTTPS ? "https://" : "http://") +
            settings.cloudHost + ":" +
            (settings.cloudUseHTTPS ? settings.cloudHTTPSPort : settings.cloudHTTPPort) +
            settings.cloudUrlPrefix;
    }

    this.onLogin = function(callback) {
        this._fnLogin.push(callback);
    }

    this.onLogout = function(callback) {
        this._fnLogout.push(callback);
    }

    this.onDeviceAdded = function(callback) {
        this._fnDeviceAdded.push(callback);
    }

    this.onRefresh = function(callback) {
        this._fnRefresh.push(callback);
    }

    this.onReady = function(callback) {
        this._fnReady = callback;
        if (self._ready === true) {
            callback();
        }
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
            if (data['result'] == "ok") {
                var acct = new CanopyAccount({
                    username: data['username'],
                    email: data['email']
                });
                if (params.onSuccess)
                    params.onSuccess(acct);
            } else {
                if (data['error_type']) {
                    if (params.onError)
                        params.onError(data['error_type']);
                }
                else {
                    if (params.onError)
                        params.onError("unknown");
                }
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            /* TODO: determine error */
            if (params.onError)
                params.onError("unknown");
        });
    }

    /* Initialize */
    this.fetchAccount({
        onSuccess: function(account) {
            account.fetchDevices({
                onSuccess: function(deviceList) {
                    self.devices = deviceList;
                    self._ready = true;
                    self._fnReady();
                }
            });
            self.account = account;
        },
        onError: function() {
            self.account = null;
            self._ready = true;
            self._fnReady();
        },
    });

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
            if (data['result'] == "ok") {
                var acct = new CanopyAccount({
                    username: data['username'],
                    email: data['email']
                });
                acct.fetchDevices({
                    onSuccess: function(deviceList) {
                        self.devices = deviceList;
                        if (params.onSuccess)
                            params.onSuccess(acct);
                    },
                    onError: function() {
                        if (params.onError)
                            params.onError("unknown");
                    }
                });
                self.account = acct;
            }
            else {
                if (params.onError)
                    params.onError("unknown");
            }
        })
        .fail(function(XMLHttpRequest, textStatus, errorThrown) {
            if (!XMLHttpRequest.responseText) {
                if (params.onError)
                    params.onError("unknown");
                return;
            }
            var data = JSON.parse(XMLHttpRequest.responseText);
            console.log(data);
            console.log(data['result']);
            console.log(data['error_type']);
            if (data['result'] == "error") {
                if (params.onError)
                    params.onError(data['error_type']);
            }
            else {
                if (params.onError)
                    params.onError("unknown");
            }
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

    this.share = function(params) {
        $.ajax({
            type: "POST",
            dataType : "json",
            url: self.apiBaseUrl() + "/share",
            data: JSON.stringify( {
                device_id : params.deviceId, 
                email: params.recipient,
                access_level: params.accessLevel,
                sharing_level: params.shareLevel}),
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

    this.createAccount = function(params) {
        $.ajax({
            type: "POST",
            dataType : "json",
            url: self.apiBaseUrl() + "/create_account",
            data: JSON.stringify({
                username : params.username, 
                email: params.email, 
                password : params.password, 
                password_confirm: params.passwordConfirm
            }),
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function(data) {
            /* Initialize canopyClient object */
            self.devices = new CanopyDeviceList([]);
            self.account = new CanopyAccount({
                username: params.username,
                email: params.email
            });
            if (params.onSuccess != null)
                params.onSuccess(self.account);
        })
        .fail(function() {
            if (params.onError != null)
                params.onError();
        });
    }


    /*
     * <devices> is list of CanopyDevice objects.
     */
    function CanopyDeviceList(devices) {

        this.filter = function(options) {
            filteredDevices = [];
            if (options['connected'] === true) {
                for (i = 0; i < devices.length; i++) {
                    if (devices[i].isConnected()) {
                        filteredDevices.push(devices[i]);
                    }
                }
                return new CanopyDeviceList(filteredDevices);
            }
            else if (options['connected'] === false) {
                for (i = 0; i < devices.length; i++) {
                    if (!devices[i].isConnected()) {
                        filteredDevices.push(devices[i]);
                    }
                }
                return new CanopyDeviceList(filteredDevices);
            }
        }

        this.connected = function() {
            return this.filter({connected: true});
        }

        this.disconnected = function() {
            return this.filter({connected: false});
        }

        this.count = function(options) {
            return this.filter(options).length;
        }

        /* simulate array */
        this.length = devices.length;
        for (var i = 0; i < devices.length; i++) {
            this[i] = devices[i];
        }

        /* simulate map */
        for (var i = 0; i < devices.length; i++) {
            this[devices[i].id()] = devices[i];
        }
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
                for (var i = 0; i < data.devices.length; i++) {
                    devices.push(new CanopyDevice(data.devices[i]));
                }
                if (params.onSuccess)
                    params.onSuccess(new CanopyDeviceList(devices));
            })
            .fail(function() {
                if (params.onError)
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
        var self=this;
        var result = ParseResponse(self, initObj.sddl_class, initObj.property_values);
        if (result.error != null) {
            console.log(result.error);
        }
        var classInstance = result.instance;

        this.properties = classInstance.properties;

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

        /* Lists accounts who have permission to access this */
        this.permissions = function() {
        }

        this.share = function(params) {
        }

        this.setPermissions = function(params) {
        }

        this.isConnected = function() {
            return initObj.connected;
        }
    }

    /*
     * Properties is list of CanopyPropertyInstance objects
     */
    function CanopyPropertyList(properties) {
        /* simulate array */
        this.__length = properties.length;
        for (var i = 0; i < properties.length; i++) {
            this[i] = properties[i];
        }

        /* simulate map */
        for (var i = 0; i < properties.length; i++) {
            this[properties[i].name()] = properties[i];
        }
    }

    function CanopyPropertyInstanceBase()
    {
        this.isClass = function() {
            return this.propertyType() == "class" && this.compositeType() == "single";
        }

        this.isControl = function() {
            return this.propertyType() == "control" && this.compositeType() == "single";
        }

        this.isSensor = function() {
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
     * CanopyClassInstance
     *
     * <params>
     *  .sddl -- SDDLClass object
     *  .children -- List of CanopyPropertyInstance obects
     */
    function CanopyClassInstance(params) {
        $.extend(this, new CanopyPropertyInstanceBase());

        this.authors = params.sddl.authors;
        this.description = params.sddl.description;
        this.name = params.sddl.name;

        this.compositeType = function() {
            return "single";
        }

        this.propertyType = function() {
            return "class";
        }

        this.properties = new CanopyPropertyList(params.children);
    }

    /*
     * CanopyControlInstance
     *
     * This is a private "class" of CanopyClient to prevent the caller from
     * calling the constructor.
     */
    function CanopyControlInstance(device, sddlControl, propValue) {
        $.extend(this, new CanopyPropertyInstanceBase());

        this.name = sddlControl.name;
        this.compositeType = sddlControl.compositeType;
        this.controlType = sddlControl.controlType;
        this.datatype = sddlControl.datatype;
        this.minValue = sddlControl.minValue;
        this.maxValue = sddlControl.maxValue;
        this.numericDisplayHint = sddlControl.numericDisplayHint;
        this.propertyType = sddlControl.propertyType;
        this.regex = sddlControl.regex;
        this.units = sddlControl.units;

        this.value = function(){
            return propValue;
        };

        this.sddl = function() {
            return sddlSensor;
        }

        this.setTargetValue = function() {
            /* TODO: implement */
        }
    }
    /*
     * CanopySensorInstance
     *
     * This is a private "class" of CanopyClient to prevent the caller from
     * calling the constructor.
     */
    function CanopySensorInstance(device, sddlSensor, propValue) {
        $.extend(this, new CanopyPropertyInstanceBase());

        this.device = device;
        this.name = sddlSensor.name;
        this.compositeType = sddlSensor.compositeType;
        this.datatype = sddlSensor.datatype;
        this.minValue = sddlSensor.minValue;
        this.maxValue = sddlSensor.maxValue;
        this.numericDisplayHint = sddlSensor.numericDisplayHint;
        this.propertyType = sddlSensor.propertyType;
        this.regex = sddlSensor.regex;
        this.units = sddlSensor.units;

        this.value = function(){
            return propValue;
        };

        this.fetchHistoricData = function(params) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: self.apiBaseUrl() + "/device/" + this.device.id() + "/" + this.name(),
                xhrFields: {
                     withCredentials: true
                },
                crossDomain: true
            })
            .done(function(data, textStatus, jqXHR) {
                console.log("Done fetching");
                console.log(params.onSuccess);
                if (params.onSuccess)
                    params.onSuccess(data);
            })
            .fail(function() {
                if (params.onError)
                    params.onError();
            });
        }

        this.sddl = function() {
            return sddlSensor;
        }
    }

    /*
     *  CreateClassInstance
     *
     *  <sddl> -- SDDLClass object
     *  <values> -- Object containing values of some or all children, for example:
     *  {
     *      "gps" : {
     *          "latitude" : 1.3242,
     *          "longitude" : 34.29543
     *      },
     *      "speed" : 4
     *  }
     */
    function CreateClassInstance(device, sddl, values) {
        var props = sddl.propertyList();
        var children = [];
        for (i = 0; i < props.length; i++) {

            var v = null;
            var result;

            if (props[i].isClass()) {
                result = CreateClassInstance(device, props[i], v);
                if (result.error != null) {
                    return result;
                }
                children.push(result.instance);
            }
            else if (props[i].isSensor()) {
                if (values != null && values["sensor " + props[i].name()])
                    v = values["sensor " + props[i].name()];

                result = CreateSensorInstance(device, props[i], v);
                if (result.error != null) {
                    return result;
                }
                children.push(result.instance);
            }
            else if (props[i].isControl()) {
                if (values != null && values["control " + props[i].name()])
                    v = values["control " + props[i].name()];
                result = CreateControlInstance(device, props[i], v);
                if (result.error != null) {
                    return result;
                }
                children.push(result.instance);
            }
        }

        return {
            instance: new CanopyClassInstance( {
                sddl: sddl,
                children: children
            }),
            error: null
        }
    }

    /*
     * CreateControlInstance
     *
     *  <sddl> -- SDDLControl object
     *  <value> -- Last known control value, or null
     */
    function CreateControlInstance(device, sddl, value) {
        /* TODO: verify validity of value */
        return {
            instance: new CanopyControlInstance(device, sddl, value),
            error: null
        }
    }

    /*
     * CreateSensorInstance
     *
     *  <sddl> -- SDDLControl object
     *  <value> -- Last known control value, or null
     */
    function CreateSensorInstance(device, sddl, value) {
        /* TODO: verify validity of value */
        return {
            instance: new CanopySensorInstance(device, sddl, value),
            error: null
        }
    }

    /*
     * ParseResponse
     * Returns {instance: CanopyClassInstance or null, error: null or string}
     */
    function ParseResponse(device, sddlJsonObj, valuesJsonObj) {
        var i = 0;
        var result = null;

        result = sddlParser.ParseClass("class anon", sddlJsonObj);
        if (result.error != null) {
            return result;
        }

        result = CreateClassInstance(device, result.sddl, valuesJsonObj);
        return result;
    }

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
Callbacks:

    canopy.onLogin()
    canopy.onLogout()

    account.onDeviceAdded()
    account.onDeviceRemoved()
    account.onDeviceCountChange()

    device.onConnect()
    device.onDisconnect()
    device.onUpdate()



canopy - CanopyClient

canopy.accounts -- CanopyAccountList
canopy.accounts["greg"] -- Specific CanopyAccount
canopy.me -- Currently-signed in CanopyAccount

canopy.devices, canopy.me.devices -- CanopyDeviceList
canopy.devices["abf98a0d8f0a-d7f08a-d78f9s0"]
canopy.devices.filter({connected:true});
canopy.devices[0]

canopy.devices[0].properties.darkness.value()
device.properties.gps  <-- CanopyClassInstance
for (i = 0; i < device.properties.gps.__sensors().__length(); i++) {
    device.properties.gps[i].name();
}
canopy.devices[0].


Callbacks:

    canopy.onReady(function() {
    })

    canopy.onRefresh(function() {
        if (!canopy.isLoggedIn()) {
        }
    })

    canopy.onDeviceAdded(function() {
    })

    canopy.onLogout(function(reason)) {
    }

    canopy.onLogin(function(reason)) {
    }

    var device = canopy.devices.connected()[0];
    device.onConnectionStatusChange();
    device.onRefresh();
    device.onRemoved();
*/
