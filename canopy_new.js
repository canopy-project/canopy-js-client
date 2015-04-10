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

function CanopyModule() {
    var selfModule = this;

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

        this.shutdown = function() {
            isShutdown = true;
        }

        this.initRemote = function(params) {
            if (isShutdown) {
                console.log("Cannot initRemote.  Context has been shutdown");
                return CANOPY_ERROR_SHUTDOWN;
            }

            return new CanopyRemote(params);
        }
    }

    function CanopyDevice(initParams) {
        var device_id = initParams.device_id;
        var nameDirty = false;
        var name = initParams.name;
        var locationNote = initParams.location_note;
        var locationNoteDirty = false;
        var selfDevice=this;

        this.id = function() {
            return initParams.device_id;
        }

        this.websocketConnected = function() {
            return initParams.status.ws_connected ? true : false;
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
            // TODO: implement
        }

        this.lastActivityTime = function() {
            if (initObj['status']) {
                return initObj['status'].last_activity_time;
            }
            /* TODO: Return NULL */
            return undefined;
        }

        this.lastActivitySecondsAgo = function() {
            if (initParams.status.last_activity_time) {
                var d = new Date().setRFC3339(initParams.status.last_activity_time);
                return (new Date() - d) / 1000;
            } else {
                return null;
            }
        }

        this.locationNote = function() {
            return initParams.location_note ? initParams.location_note : "";
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
            return payload;
        }

        function updateFromPayload(resp) {
            if (resp["friendly_name"]) {
                name = resp["friendly_name"];
            }
            if (resp["location_note"]) {
                locationNote = resp["location_note"];
            }
            if (resp["status"].last_activity_time) {
                lastActivityTime = resp["status"].last_activity_time;
            }
        }

        this.syncWithRemote = function() {
            payload = constructPayload();
            console.log(payload);

            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/device/" + this.id();

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
            var url = initParams.remote.baseUrl() + "/api/device/" + this.id();

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

        this.vars = function() {
            // TODO: implement
        }
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

            var url = initParams.remote.baseUrl() + "/api/device/" + indexOrId;

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
                        name: data.friendly_name,
                        device_id: data.device_id,
                        secret_key: data.secret_key,
                        location_note: data.location_note,
                        remote: initParams.remote
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
            var url = initParams.remote.baseUrl() + "/api/user/self/devices?limit=" + start + "," + count;

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
                        devices.push(new CanopyDevice(data['devices'][i]));
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
        
        this.baseUrl = function() {
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
                    name: data.friendly_name,
                    device_id: data.device_id,
                    location_note: data.location_note,
                    remote: selfRemote,
                    secret_key: data.secret_key
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
    }

    function CanopyUser(initParams) {
        var selfUser=this;
        var email;
        var emailDirty = false;

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
                        name: info.friendly_name,
                        device_id: info.device_id,
                        location_note: data.location_note,
                        remote: initParams.remote,
                        secret_key: info.secret_key
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

        this.username = function() {
            return initParams.username;
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

        /* 
         * Returns CanopyBarrier 
         */
        this.device = function(id) {
            // TODO
            return null;
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

        // TODO: docuement
        this.remote = function() {
            return initParams.remote;
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
