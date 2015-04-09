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

        this.name = function() {
            return initParams.friendly_name;
        }

        this.secretKey = function() {
            return initObj.secret_key ? initObj.secret_key : "hidden";
        }

        this.syncWithRemote = function() {
            // TODO: implement
        }

        this.updateToRemote = function() {
            // TODO: implement
        }

        this.updateFromRemote = function() {
            // TODO: implement
        }

        this.vars = function() {
            // TODO: implement
        }
    }

    function CanopyDeviceQuery(initParams) {

        /*
         * Returns CanopyBarrier
         */ 
        this.count = function() {
            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/user/self/devices?limit=0,0"

            httpJsonGet(url).done(
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
            // TODO implement
        }

        /*
         * Returns CanopyBarrier
         */ 
        this.getMany = function(start, count) {
            var barrier = new CanopyBarrier();
            var url = initParams.remote.baseUrl() + "/api/user/self/devices?limit=" + start + "," + count;

            httpJsonGet(url).done(
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
        //
        // ex: remote.getSelfDevice().onDone(function(device) { alert("hi");})
        this.getSelfUser = function() {
            var barrier = new CanopyBarrier();
            var url = selfRemote.baseUrl() + "/api/user/self";

            httpJsonGet(url
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
        var barrier = remote.getSelfUser();
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

Canopy = new CanopyModule()
