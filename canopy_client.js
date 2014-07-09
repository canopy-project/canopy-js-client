function SDDLParser() {
    function SDDLPropertyBase()
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
     * <params>
     *      .authors : list of authors
     *      .children : list of SDDLProperty objects
     *      .description : text description
     *      .name : name of this property
     */
    function SDDLClass(params) {
        $.extend(this, new CanopyPropertyBase());

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
        this.name = function() {
            return params.name;
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
            return "control";
        }

        this.regex = function() {
            return params.regex;
        }

        this.units = function() {
            return params.units;
        }
    }

    this.ParseControl(decl, def) {
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

        var info = _DeclInfo(decl);

        if (info.propertyType != "control") {
            return {
                sddl: null, 
                error: "_SDDLParseControl expected SDDL control declaration"
            };
        }

        if (info.compositeType != "single") {
            return {
                sddl: null, 
                error: "_SDDLParseControl expected single control, not array or map"
            };
        }

        for (key in def) {
            if (def.hasOwnProperty[key]) {
                if (key == "control-type") {
                    if (!_IsValidControlType(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseControl: unsupported \"controlType\": " + def[key]
                        };
                    }
                    params.controlType = def[key];
                }
                else if (key == "datatype") {
                    if (!_IsValidDatatype(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseControl: unsupported \"controlType\": " + def[key]
                        };
                    }
                    params.datatype = def[key];
                }
                else if (key == "description") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseControl expected string for \"description\""
                        };
                    }
                    params.description = def[key];
                }
                else if (key == "max-value") {
                    if (!_IsNumberOrNull(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseControl exptected number or null for \"max-value\""
                        };
                    }
                    params.minValue = def[key];
                }
                else if (key == "min-value") {
                    if (!_IsNumberOrNull(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseControl exptected number or null for \"min-value\""
                        };
                    }
                    params.maxValue = def[key];
                }
                else if (key == "numeric-display-hint") {
                    if (!_IsValidNumericDisplayHint(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseControl: unsupported \"numeric-display-hint\"" + def[key]
                        };
                    }
                    params.numericDisplayHint = def[key];
                }
                else if (key == "regex") {
                    if (!_IsValidRegex(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseControl: invalid value for \"regex\""
                        };
                    }
                    params.regex = def[key];
                }
                else if (key == "units") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseControl: invalid value for \"units\""
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

        var info = _DeclInfo(decl);

        if (info.propertyType != "sensor") {
            return {
                sddl: null, 
                error: "_SDDLParseSensor expected SDDL sensor declaration"
            };
        }

        if (info.compositeType != "single") {
            return {
                sddl: null, 
                error: "_SDDLParseSensor expected single sensor, not array or map"
            };
        }

        for (key in def) {
            if (def.hasOwnProperty[key]) {
                if (key == "control-type") {
                    if (!_IsValidControlType(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseSensor: unsupported \"controlType\": " + def[key]
                        };
                    }
                }
                else if (key == "datatype") {
                    if (!_IsValidDatatype(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseSensor: unsupported \"controlType\": " + def[key]
                        };
                    }
                }
                else if (key == "description") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseSensor expected string for \"description\""
                        };
                    }
                }
                else if (key == "max-value") {
                    if (!_IsNumberOrNull(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseSensor exptected number or null for \"max-value\""
                        };
                    }
                }
                else if (key == "min-value") {
                    if (!_IsNumberOrNull(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseSensor exptected number or null for \"min-value\""
                        };
                    }
                }
                else if (key == "numeric-display-hint") {
                    if (!_IsValidNumericDisplayHint(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseSensor: unsupported \"numeric-display-hint\"" + def[key]
                        };
                    }
                }
                else if (key == "regex") {
                    if (!_IsValidRegex(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseSensor: invalid value for \"regex\""
                        };
                    }
                }
                else if (key == "units") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseSensor: invalid value for \"units\""
                        };
                    }
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
    function ParseClass(decl, def) {
        var params = {
            authors: [],
            children : []
            description: ""
        }
        var info = _DeclInfo(decl);
        var result;

        if (info.propertyType != "class") {
            return {
                sddl: null, 
                error: "_SDDLParseClass expected SDDL class declaration"
            };
        }

        if (info.compositeType != "single") {
            return {
                sddl: null, 
                error: "_SDDLParseClass expected single class, not array or map");
            };
        }

        for (key in def) {
            if (def.hasOwnProperty[key]) {
                if (key == "authors") {
                    if (!_IsListOfStrings(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseClass expected list of strings for \"authors\"");
                        };
                    }
                    params.authors = authors;
                }
                else if (key == "description") {
                    if (!_IsString(def[key])) {
                        return {
                            sddl: null, 
                            error: "_SDDLParseClass expected string for \"description\"");
                        }
                    }
                    params.description = description;
                }
                else {
                    var propDeclInfo = _DeclInfo(key);
                    if (propDeclInfo.propertyType == "class") {
                        result = _SDDLParseClass(key, def[key]);
                        if (result.error != null) {
                            return result;
                        }
                        params.children.push(result.sddl);
                    }
                    else if (propDeclInfo.propertyType == "control") {
                        result = _SDDLParseControl(key, def[key]);
                        if (result.error != null) {
                            return result;
                        }
                        params.children.push(result.sddl);
                    }
                    else if (propDeclInfo.propertyType == "sensor") {
                        result = _SDDLParseSensor(key, def[key]);
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

    var sddlParser = new SDDLParser();

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
     * CanopyControlInstance
     *
     * This is a private "class" of CanopyClient to prevent the caller from
     * calling the constructor.
     */
    function CanopyControlInstance(sddlControl, propValue) {
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
    function CanopySensorInstance(sddlSensor, propValue) {
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
    function CreateClassInstance(sddl, values) {
        var props = sddl.propertyList();
        var children = [];
        for (i = 0; i < props.length; i++) {

            var v = null;
            if (values != null && values[props[i].name()])
                v = values[props[i].name()];
            if (props[i].isClass()) {
                result = _CreateClassInstance(props[i], v);
                if (result.error != null) {
                    return result;
                }
                children.push(result.instance);
            }
            else if (props[i].isSensor()) {
                _CreateSensorInstance(props[i], v);
                if (result.error != null) {
                    return result;
                }
                children.push(result.instance);
            }
            else if (props[i].isControl()) {
                _CreateControlInstance(props[i], v);
                if (result.error != null) {
                    return result;
                }
                children.push(result.instance);
            }
        }

        return {
            instance: new CanopyClassInstance(sddl, children),
            error: null
        }
    }

    /*
     * CreateControlInstance
     *
     *  <sddl> -- SDDLControl object
     *  <value> -- Last known control value, or null
     */
    function CreateControlInstance(sddl, value) {
        /* TODO: verify validity of value */
        return {
            instance: new CanopyControlInstance(sddl, value),
            error: null
        }
    }

    /*
     * CreateSensorInstance
     *
     *  <sddl> -- SDDLControl object
     *  <value> -- Last known control value, or null
     */
    function CreateSensorInstance(sddl, value) {
        /* TODO: verify validity of value */
        return {
            instance: new CanopySensorInstance(sddl, value),
            error: null
        }
    }

    /*
     * ParseResponse
     * Returns {instance: CanopyClassInstance or null, error: null or string}
     */
    function ParseResponse(sddlJsonObj, valuesJsonObj)
    {
        var i = 0;
        var result = null;
        for (key in sddl) {
            if (sddl.hasOwnProperty(key)) {
                if (i == 0) {
                    result = _SDDLParseClass(def, decl);
                    if (result.error != null) {
                        return result;
                    }
                }
                else {
                    return {
                        instance: null,
                        error: "_ParseResponse expected single class declaration";
                    }
                }
                i++;
            }
        }

        result = _CreateClassInstance(result.sddl, values);
        return result;
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
