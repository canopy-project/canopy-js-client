/*
 * Copyright 2014-2015 Canopy Services, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* 
 * New Javascript (Browser) Client for Canopy.
 */

var CANOPY_SUCCESS = 0;
var CANOPY_ERROR_UNKNOWN = 1;
var CANOPY_ERROR_BAD_CREDENTIALS = 2;
var CANOPY_ERROR_FATAL = 3;
var CANOPY_ERROR_INCOMPATIBLE_LIBRARY_VERSION = 4;
var CANOPY_ERROR_NOT_IMPLEMENTED = 5;
var CANOPY_ERROR_BAD_PARAM = 6;
var CANOPY_ERROR_WRONG_TYPE = 7;
var CANOPY_ERROR_AGAIN = 8;
var CANOPY_ERROR_CANCELLED = 9;
var CANOPY_ERROR_VAR_IN_USE = 10;
var CANOPY_ERROR_VAR_NOT_FOUND = 11;
var CANOPY_ERROR_VAR_NOT_SET = 12;
var CANOPY_ERROR_OUT_OF_MEMORY = 13;
var CANOPY_ERROR_BUFFER_TOO_SMALL = 14;
var CANOPY_ERROR_JSON = 15;
var CANOPY_ERROR_NETWORK = 16;
var CANOPY_ERROR_SHUTDOWN = 17;
var CANOPY_ERROR_NOT_FOUND = 18;
var CANOPY_ERROR_BAD_INPUT = 19;
var CANOPY_ERROR_USERNAME_NOT_AVAILABLE = 20;
var CANOPY_ERROR_EMAIL_TAKEN = 21;

var CANOPY_VAR_OUT = "out";
var CANOPY_VAR_IN = "in";
var CANOPY_VAR_INOUT = "inout";

function CanopyModule() {
    var selfModule = this;

    function restErrorToResultValue(e) {
        var out = {
            "bad_input" : CANOPY_ERROR_BAD_INPUT,
            "username_not_available" : CANOPY_ERROR_USERNAME_NOT_AVAILABLE,
            "email_taken" : CANOPY_ERROR_EMAIL_TAKEN,
        }[e];

        if (out === undefined) {
            return CANOPY_ERROR_UNKNOWN;
        }
        return out;
    }

    function httpJsonGet(url) {
        // TODO: provide BASIC AUTH if necessary
        return $.ajax({
            type: "GET",
            dataType : "json",
            url: url,
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        });
    }

    function httpJsonPost(url, data) {
        // TODO: provide BASIC AUTH if necessary
        return $.ajax({
            contentType: 'text/plain; charset=utf-8', /* Needed for safari */
            type: "POST",
            dataType : "json",
            url: url,
            data: JSON.stringify(data),
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        });
    }

    function CanopyBarrier() {
        var cb = null;
        var selfBarrier = this;
        this._data = {};

        this.onDone = function(_cb) {
            cb = _cb;
            return self;
        }

        this._signal = function() {
            if (!cb) {
                return;
            }
            cb(selfBarrier._result, selfBarrier._data);
        }
    }

    function CanopyContext() {
        var selfContext = this;
        var isShutdown = false;

        this.initRemote = function(params) {
            if (isShutdown) {
                console.log("Cannot initRemote.  Context has been shutdown");
                return CANOPY_ERROR_SHUTDOWN;
            }

            return new CanopyRemote(params);
        }

        this.shutdown = function() {
            isShutdown = true;
        }
    }

    function CanopyDevice(initParams) {
        var device_id = initParams.device_id;
        var nameDirty = false;
        var name = initParams.name;
        var locationNote = initParams.location_note;
        var locationNoteDirty = false;
        var selfDevice = this;
        var varList = [];

        // Returns list of CanopyVariables, or null on error
        function parseAndMergeVarDecls(varDecls, varValues) {
            for (key in varDecls) {
                if (varDecls.hasOwnProperty(key)) {
                    var parts = key.split(" ");
                    if (parts.length != 3) {
                        console.log("Error parsing var decl " + key);
                        return null;
                    }
                    var direction = parts[0];
                    var datatype = parts[1];
                    var name = parts[2];

                    // TODO: validate input
                   
                    var cloudVar = selfDevice.varByName(name);
                    if (cloudVar !== null) {
                        // Device already has this cloud variable.  Skip it.
                        if (cloudVar.datatype() != datatype) {
                            // TODO: What to do here?
                            alert("Variable Datatype changed!");
                        }
                        if (cloudVar.direction() != direction) {
                            // TODO: What to do here?
                            alert("Variable Datatype changed!");
                        }
                        continue;
                    }

                    // create the cloud variable
                    cloudVar = new CanopyVariable({
                        direction: direction,
                        datatype: datatype,
                        device: selfDevice,
                        remote: initParams.remote,
                        name: name
                    });
                    if (varValues !== undefined) {
                        var timestampAndValue = varValues[cloudVar.name()];
                        if (timestampAndValue !== undefined) {
                            cloudVar._updateFromRemote(
                                timestampAndValue.t,
                                timestampAndValue.v
                            );
                        }
                    }

                    // add it to the list:
                    varList.push(cloudVar);
                }
            }
        }

        function updateFromPayload(resp) {
            if (resp["friendly_name"]) {
                name = resp["friendly_name"];
            }
            if (resp["location_note"]) {
                locationNote = resp["location_note"];
            }
            if (resp["status"] && resp["status"].last_activity_time) {
                lastActivityTime = resp["status"].last_activity_time;
            }
            if (resp["var_decls"]) {
                parseAndMergeVarDecls(resp["var_decls"], resp["vars"]);
            }
            if (resp["vars"]) {
                updateVarValues(resp["vars"]);
            }
        }

        this.id = function() {
            return initParams.device_id;
        }

        this.isActive = function() {
            // TODO: Keep this function?
            return (this.lastActivitySecondsAgo() != null && this.lastActivitySecondsAgo() < 60);
        }

        this.isInactive = function() {
            // TODO: Keep this function?
            return (this.lastActivitySecondsAgo() >= 60);
        }

        this.isNewlyCreated = function() {
            return (this.lastActivityTime() == null);
        }

        this.lastActivitySecondsAgo = function() {
            if (initParams.status.last_activity_time) {
                var d = new Date().setRFC3339(initParams.status.last_activity_time);
                return (new Date() - d) / 1000;
            } else {
                return null;
            }
        }

        this.lastActivityTime = function() {
            if (initParams['status']) {
                return initParams['status'].last_activity_time;
            }
            /* TODO: Return NULL */
            return null;
        }

        this.locationNote = function(newLocationNote) {
            if (newLocationNote !== undefined) {
                locationNote = newLocationNote;
                locationNoteDirty = true;
            }
            return locationNote;
        }

        this.name = function(newName) {
            if (newName !== undefined) {
                name = newName;
                nameDirty = true;
            }
            return name;
        }

        this.secretKey = function() {
            return initParams.secret_key ? initParams.secret_key : "hidden";
        }


        function constructPayload() {
            var payload = {}
            console.log("nameDirty" + nameDirty);
            if (nameDirty) {
                payload["friendly_name"] = name;
                nameDirty = false; /* TODO: only clear on success */
            }
            if (locationNoteDirty) {
                payload["location_note"] = locationNote;
                locationNoteDirty = false;
            }
            // TODO: Send any newly declared Cloud Variables
            // TODO: Send any modified var values.
            payload["vars"] = {};
            var cloudVars = selfDevice.vars();
            for (var i = 0; i < cloudVars.length; i++) {
                var cloudVar = cloudVars[i];
                if (cloudVar.isModified()) {
                    payload["vars"][cloudVar.name()] = cloudVar.value();
                }
            }
            return payload;
        }

        function updateVarValues(varsPayload) {
            for (key in varsPayload) {
                if (varsPayload.hasOwnProperty(key)) {
                    var cloudVar = selfDevice.varByName(key);
                    var varPayload = varsPayload[key];
                    cloudVar._updateFromRemote(varPayload.t, varPayload.v);
                }
            }
        }

        this.syncWithRemote = function() {
            payload = constructPayload();
            console.log(payload);

            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/device/" + this.id() + "?timestamps=rfc3339";

            initParams.remote._httpJsonPost(url, payload).done(
                function(data, textStatus, jqXHR) {
                    if (data['result'] != "ok") {
                        // TODO: proper error handling
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                        barrier._signal();
                        return;
                    }
                    var devices = [];
                    updateFromPayload(data);
                    barrier._result = CANOPY_SUCCESS;
                    barrier._signal();
                }
            );

            return barrier;
        }

        this.updateToRemote = function() {
            payload = constructPayload();

            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/device/" + this.id();

            console.log("posting payload");
            console.log(payload);
            initParams.remote._httpJsonPost(url, payload).done(
                function(data, textStatus, jqXHR) {
                    if (data['result'] != "ok") {
                        // TODO: proper error handling
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                        barrier._signal();
                        return;
                    }
                    var devices = [];
                    barrier._result = CANOPY_SUCCESS;
                    barrier._signal();
                }
            );

            return barrier;
        }

        this.updateFromRemote = function() {
            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/device/" + this.id() + "?timestamps=rfc3339";

            initParams.remote._httpJsonGet(url).done(
                function(data, textStatus, jqXHR) {
                    if (data['result'] != "ok") {
                        // TODO: proper error handling
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                        barrier._signal();
                        return;
                    }
                    var devices = [];
                    updateFromPayload(data);
                    barrier._result = CANOPY_SUCCESS;
                    barrier._signal();
                }
            );

            return barrier;
        }

        this.varByName = function(varName) {
            for (var i = 0; i < varList.length; i++) {
                if (varList[i].name() == varName) {
                    return varList[i];
                }
            }
            return null;
        }

        /* TODO: returns list of top-level vars */
        this.vars = function() {
            return varList;
        }

        this.websocketConnected = function() {
            return initParams.status.ws_connected ? true : false;
        }

        // Initialize
        updateFromPayload(initParams);
    }

    function CanopyDeviceQuery(initParams) {
        var selfDQ = this;

        /*
         * Returns CanopyBarrier
         */ 
        this.count = function() {
            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/user/self/devices?limit=0,0"

            initParams.remote._httpJsonGet(url).done(
                function(data, textStatus, jqXHR) {
                    if (data['result'] != "ok") {
                        // TODO: proper error handling
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                        barrier._signal();
                        return;
                    }
                    var devices = [];
                    var i;
                    barrier._data["count"] = data.paging.total_count;
                    barrier._result = CANOPY_SUCCESS;
                    barrier._signal();
                }
            );

            return barrier;
        }

        /* 
         * Returns new DeviceQuery.  Does not affect the DQ that this was
         * called on.
         */
        this.filter = function(expr) {
            var newFilters = [];
            for (var i = 0; i < initParams.filters.length; i++) {
                newFilters.push(initParams.filters[i]);
            }
            newFilters.push(expr);

            /*return new CanopyDeviceQuery(
                remote: initParams.remote,
                filter: newFilters
            );*/
        }

        /*
         * Returns CanopyBarrier
         */ 
        this.get = function(indexOrId) {
            var barrier = new CanopyBarrier();

            function isInteger(n) {
                return n === +n && n === (n|0);
            }

            if (isInteger(indexOrId)) {
                selfDQ.getMany(indexOrId, 1).onDone(function(result, data) {
                    if (result != CANOPY_SUCCESS) {
                        barrier._result = result;
                        barrier._data = data; /* is this correct? */
                        barrier._signal();
                        return;
                    }

                    if (data.devices.length == 0) {
                        barrier._result = CANOPY_ERROR_NOT_FOUND;
                        barrier._signal();
                        return;
                    } else if (data.devices.length > 1) {
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                        barrier._signal();
                        return;
                    }

                    barrier._result = CANOPY_SUCCESS;
                    barrier._data["device"] = data.devices[0];
                    barrier._signal();
                });
                return barrier;
            }

            var url = initParams.remote.baseUrl() + "/api/device/" + indexOrId + "?timestamps=rfc3339";

            /* TODO: make sure filters are satisfied as well */
            initParams.remote._httpJsonGet(url).done(
                function(data, textStatus, jqXHR) {
                    if (data['result'] != "ok") {
                        // TODO: proper error handling
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                        barrier._signal();
                        return;
                    }

                    var device = new CanopyDevice({
                        device_id: data.device_id,
                        location_note: data.location_note,
                        name: data.friendly_name,
                        remote: initParams.remote,
                        secret_key: data.secret_key,
                        status: data.status,
                        var_decls: data.var_decls,
                        vars: data.vars,
                    });

                    barrier._data["device"] = device;
                    barrier._result = CANOPY_SUCCESS;
                    barrier._signal();
                }
            );

            return barrier;
        }

        /*
         * Returns CanopyBarrier
         */ 
        this.getMany = function(start, count) {
            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/user/self/devices?limit=" + start + "," + count + "&timestamps=rfc3339";

            initParams.remote._httpJsonGet(url).done(
                function(data, textStatus, jqXHR) {
                    if (data['result'] != "ok") {
                        // TODO: proper error handling
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                        barrier._signal();
                        return;
                    }
                    var devices = [];
                    var i;
                    for (i = 0; i < data['devices'].length; i++) {
                        devices.push(new CanopyDevice({
                            device_id: data['devices'][i].device_id,
                            location_note: data['devices'][i].location_note,
                            name: data['devices'][i].friendly_name,
                            remote: initParams.remote,
                            secret_key: data['devices'][i].secret_key,
                            status: data['devices'][i].status,
                            var_decls: data['devices'][i].var_decls,
                            vars: data['devices'][i].vars
                        }));
                    }

                    barrier._data["devices"] = devices;
                    barrier._result = CANOPY_SUCCESS;
                    barrier._signal();
                }
            );

            return barrier;
        }
    }

    function CanopyRemote(initParams) {
        var selfRemote = this;

        this._httpJsonGet = function(url) {
            var options = {
                type: "GET",
                dataType : "json",
                url: url,
                xhrFields: {
                     withCredentials: true
                },
                crossDomain: true
            };
            if (initParams.auth_type == "basic") {
                options["headers"] = {
                    "Authorization": "Basic " + btoa(initParams.auth_username + ":" + initParams.auth_password)
                }
            }
            return $.ajax(options);
        }

        this._httpJsonPost = function(url, data) {
            var options = {
                contentType: 'text/plain; charset=utf-8', /* Needed for safari */
                type: "POST",
                dataType : "json",
                url: url,
                data: JSON.stringify(data),
                xhrFields: {
                     withCredentials: true
                },
                crossDomain: true
            };
            if (initParams.auth_type == "basic") {
                options["headers"] = {
                    "Authorization": "Basic " + btoa(initParams.auth_username + ":" + initParams.auth_password)
                }
            }
            return $.ajax(options);
        }

        this.apiBaseUrl = function() {
            // TODO: fixme
            return "https://" + initParams.host + "/api";
        }
        
        this.baseUrl = function() {
            // TODO: fixme
            return "https://" + initParams.host;
        }

        /* Returns CanopyBarrier */
        // TODO: Document
        this.createUser = function(params) {
            var barrier = new CanopyBarrier();
            var url = selfRemote.baseUrl() + "/api/create_user";

            // TODO: error out if passwords don't match

            httpJsonPost(url, {
                username: params.username, 
                email: params.email, 
                password : params.password
            }).done(function(data) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                var user = new CanopyUser({
                    validated: data['validated'],
                    username: data['username'],
                    email: data['email'],
                    remote: selfRemote
                });
                barrier._data["user"] = user;
                barrier._result = CANOPY_SUCCESS;
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                var json = $.parseJSON(jqXHR.responseText);
                if (!json) {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                barrier._result = restErrorToResultValue(json.error_type);
                barrier._data["error_msg"] = json.error_msg;
                barrier._signal();
            });

            return barrier;
        }

        // Returns CanopyBarrier
        this.getSelfDevice = function() {
            var barrier = new CanopyBarrier();
            var url = selfRemote.baseUrl() + "/api/device/self";

            selfRemote._httpJsonGet(url
            ).done(function(data, textStatus, jqXHR) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                console.log("FETCH");
                console.log(data);
                var device = new CanopyDevice({
                    device_id: data.device_id,
                    location_note: data.location_note,
                    name: data.friendly_name,
                    remote: selfRemote,
                    secret_key: data.secret_key,
                    status: data.status,
                    var_decls: data.var_decls,
                    vars: data.vars,
                });
                barrier._data["device"] = device;
                barrier._result = CANOPY_SUCCESS;
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                /* TODO: determine error */
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
            });

            return barrier;
        }

        // Returns CanopyBarrier
        this.getSelfUser = function() {
            var barrier = new CanopyBarrier();
            var url = selfRemote.baseUrl() + "/api/user/self";

            selfRemote._httpJsonGet(url
            ).done(function(data, textStatus, jqXHR) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                var user = new CanopyUser({
                    validated: data['validated'],
                    username: data['username'],
                    email: data['email'],
                    remote: selfRemote
                });
                barrier._data["user"] = user;
                barrier._result = CANOPY_SUCCESS;
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                /* TODO: determine error */
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
            });

            return barrier;
        }


        /* Returns CanopyBarrier */
        this.login = function(params) {
            // TODO: Update doc now that we take username, password as params.
            // TODO: error if auth_type == BASIC //
            var barrier = new CanopyBarrier();
            var url = selfRemote.baseUrl() + "/api/login";

            httpJsonPost(url, {
                username: params.username,
                password: params.password,
            }).done(function(data, textStatus, jqXHR) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                var user = new CanopyUser({
                    validated: data['validated'],
                    username: data['username'],
                    email: data['email'],
                    remote: selfRemote
                });
                barrier._data["user"] = user;
                barrier._result = CANOPY_SUCCESS;
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                /* TODO: determine error */
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
            });

            return barrier;
        }

        /* Returns CanopyBarrier */
        this.logout = function() {
            // TODO: error if auth_type == BASIC //
            var barrier = new CanopyBarrier();
            var url = selfRemote.baseUrl() + "/api/logout";

            httpJsonPost(url, {
            }).done(function(data, textStatus, jqXHR) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                barrier._result = CANOPY_SUCCESS;
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                /* TODO: determine error */
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
            });

            return barrier;
        }

        // Returns CanopyBarrier
        this.requestPasswordReset = function(params) {
            var barrier = new CanopyBarrier();
            var url = selfRemote.baseUrl() + "/api/reset_password";

            selfRemote._httpJsonPost(url, {
                "username" : params.username
            }).done(function(data, textStatus, jqXHR) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                barrier._result = CANOPY_SUCCESS;
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                /* TODO: determine error */
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
            });

            return barrier;
        }

        this.resetPassword = function(params) {
            var barrier = new CanopyBarrier();
            var url = selfRemote.baseUrl() + "/api/reset_password";

            if (!params.password || (params.password != params.confirmPassword)) {
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
                return;
            }

            var payload = {
                "username" : params.username,
                "password" : params.password,
                "code" : params.code
            };
            selfRemote._httpJsonPost(url, payload)
                .done(function(data, textStatus, jqXHR) {
                    if (data.result != "ok") {
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                        barrier._signal();
                        return;
                    }
                    barrier._result = CANOPY_SUCCESS;
                    barrier._signal();
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    /* TODO: determine error */
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                })
            ;

            return barrier;
        }
    }

    function CanopyUser(initParams) {
        var selfUser=this;
        var email = initParams.email;
        var emailDirty = false;

        this.changePassword = function(params) {
            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/user/self";

            if (params.newPassword != params.confirmPassword) {
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
                return;
            }

            httpJsonPost(url, {
                old_password: params.oldPassword,
                new_password: params.newPassword,
            }).done(function(data, textStatus, jqXHR) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                barrier._result = CANOPY_SUCCESS;
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                /* TODO: determine error */
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
            });

            return barrier;
        }

        /*
         * TODO: Server code & API needs to change.  We shouldn't return the
         * whole list of devices, because there might be 1M+ of them.  Instead,
         * we should assign all of the newly created devices a "batch #" and
         * return a DeviceQuery object that uses that batch as a filter.
         */
        this.createDevices = function(params) {
            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/create_devices";

            httpJsonPost(url, {
                quantity: params.quantity,
                friendly_names: params.names
            }).done(function(data, textStatus, jqXHR) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                barrier._result = CANOPY_SUCCESS;
                barrier._data["devices"] = [];
                for (var i = 0; i < data.devices.length; i++) {
                    var info = data.devices[i];
                    var device = new CanopyDevice({
                        device_id: data.device_id,
                        location_note: data.location_note,
                        name: data.friendly_name,
                        remote: initParams.remote,
                        secret_key: data.secret_key,
                        status: data.status,
                        var_decls: data.var_decls,
                        vars: data.vars,
                    });
                    barrier._data["devices"].push(device);
                }
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                /* TODO: determine error */
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
            });

            return barrier;
        }

        /* 
         * Returns DeviceQuery
         */
        this.devices = function() {
            // TODO
            return new CanopyDeviceQuery({
                user: selfUser.username(),
                remote: initParams.remote
            });
        }

        this.email = function(newEmail) {
            if (newEmail !== undefined) {
                email = newEmail;
                emailDirty = true;
            }
            return email;
        }

        this.isValidated = function() {
            return initParams.validated;
        }

        // TODO: docuement
        this.remote = function() {
            return initParams.remote;
        }

        this.syncWithRemote = function(params) {
            alert("Not implemented");
        }

        this.updateFromRemote = function(params) {
            alert("Not implemented");
        }

        this.updateToRemote = function(params) {
            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/user/self";

            payload = {};
            if (emailDirty) {
                payload["email"] = email;
            }

            httpJsonPost(url, payload).done(function(data, textStatus, jqXHR) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                barrier._result = CANOPY_SUCCESS;
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                /* TODO: determine error */
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
            });

            return barrier;
        }

        this.username = function() {
            return initParams.username;
        }

        /* 
         * Returns CanopyBarrier
         */
        this.validate = function(params) {
            // TODO: Document both REST API and JS Client
            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/activate";

            console.log(params.username);
            httpJsonPost(url, {
                username: params.username,
                code: params.code
            }).done(function(data, textStatus, jqXHR) {
                if (data.result != "ok") {
                    barrier._result = CANOPY_ERROR_UNKNOWN;
                    barrier._signal();
                    return;
                }
                barrier._result = CANOPY_SUCCESS;
                barrier._signal();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                /* TODO: determine error */
                barrier._result = CANOPY_ERROR_UNKNOWN;
                barrier._signal();
            });

            return barrier;
        }
    }

    function CanopyVariable(initDeclParams) {
        var val;
        var lastRemoteValue = null;
        var lastRemoteUpdateTime = null;
        var dirty = false;

        this._updateFromRemote = function(t, v) {
            lastRemoteValue = v;
            lastRemoteUpdateTime = t;
            val = v; /* TODO: always override? */
            dirty = false /* TODO: always override? */
        };

        this.datatype = function() {
            return initDeclParams.datatype;
        }

        this.direction = function() {
            return initDeclParams.direction;
        }

        this.device = function() {
            return initDeclParams.device;
        }

        // Returns barrier
        this.historicData = function(startTime, endTime) {
            var barrier = new CanopyBarrier();
            var url = initDeclParams.remote.baseUrl() + "/api/device/" + this.device().id() + "/" + this.name();

            initDeclParams.remote._httpJsonGet(url).done(
                function(data, textStatus, jqXHR) {
                    if (data['result'] != "ok") {
                        // TODO: proper error handling
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                        barrier._signal();
                        return;
                    }
                    var devices = [];
                    // TODO: Return result somehow
                    barrier._data["samples"] = data.samples;
                    barrier._result = CANOPY_SUCCESS;
                    barrier._signal();
                }
            );

            return barrier;
        }

        this.isModified = function() {
            return dirty;
        }

        // returns null if never set
        this.lastRemoteValue = function() {
            return lastRemoteValue;
        }

        // Returns null if never updated
        this.lastRemoteUpdateTime = function() {
            return lastRemoteUpdateTime;
        }

        this.lastRemoteUpdateSecondsAgo = function() {
            var t = this.lastRemoteUpdateTime();
            if (!t) {
                return null;
            }
            var d = new Date().setRFC3339(t);
            return (new Date() - d) / 1000;
        }

        this.name = function() {
            return initDeclParams.name;
        }

        this.value = function(newValue) {
            if (newValue !== undefined) {
                val = newValue;
                dirty = true;
            }
            return val;
        }
    }

    this.initContext = function() {
        return new CanopyContext();
    }

    this.initDeviceClient = function(settings) {
        var ctx = selfModule.initContext();
        var remote = ctx.initRemote(settings);
        var barrier = remote.getSelfDevice();
        barrier._data["ctx"] = ctx;
        barrier._data["remote"] = remote;
        return barrier;
    }

    this.initUserClient = function(settings) {
        var ctx = selfModule.initContext();
        var remote = ctx.initRemote(settings);
        var barrier = remote.getSelfUser();
        barrier._data["ctx"] = ctx;
        barrier._data["remote"] = remote;
        return barrier;
    }
}

Canopy = new CanopyModule();

/*
 * FROM http://blog.toppingdesign.com/2009/08/13/fast-rfc-3339-date-processing-in-javascript/
 */
Date.prototype.setRFC3339 = function(dString){ 
    var utcOffset, offsetSplitChar;
    var offsetMultiplier = 1;
    var dateTime = dString.split("T");
    var date = dateTime[0].split("-");
    var time = dateTime[1].split(":");
    var offsetField = time[time.length - 1];
    var offsetString;
    offsetFieldIdentifier = offsetField.charAt(offsetField.length - 1);
    if (offsetFieldIdentifier == "Z") {
        utcOffset = 0;
        time[time.length - 1] = offsetField.substr(0, offsetField.length - 2);
    } else {
        if (offsetField[offsetField.length - 1].indexOf("+") != -1) {
            offsetSplitChar = "+";
            offsetMultiplier = 1;
        } else {
            offsetSplitChar = "-";
            offsetMultiplier = -1;
        }
        offsetString = offsetField.split(offsetSplitChar);
        time[time.length - 1] == offsetString[0];
        offsetString = offsetString[1].split(":");
        utcOffset = (offsetString[0] * 60) + offsetString[1];
        utcOffset = utcOffset * 60 * 1000;
    }

    this.setTime(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2]) + (utcOffset * offsetMultiplier ));
    return this;
};
