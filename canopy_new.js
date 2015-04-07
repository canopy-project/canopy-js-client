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
        return $.ajax({
            type: "GET",
            dataType : "json",
            url: selfModule.apiBaseUrl() + "/user/self",
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        });
    }

    function CanopyBarrier(type) {
        var cb = null;
        var selfBarrier = this;
        this.onDone = function(_cb) {
            cb = _cb;
            return self;
        }

        this._signal = function() {
            if (!cb) {
                return;
            }
            if (type == "user") {
                cb(selfBarrier._result, selfBarrier._user);
            } else {
                cb(selfBarrier._result);
            }
        }
    }

    function CanopyContext() {
        var selfContext = this;
        var isShutdown = false;

        this.shutdown = function() {
            isShutdown = true;
        }

        this.initRemote = function() {
            if (isShutdown) {
                console.log("Cannot initRemote.  Context has been shutdown");
                return CANOPY_ERROR_SHUTDOWN;
            }
        }
    }

    function CanopyRemote() {
        // Returns CanopyBarrier
        //
        // ex: remote.getSelfDevice().onDone(function(device) { alert("hi");})
        this.getSelfUser() {
            var barrier = new CanopyBarrier("user");
            httpJsonGet("/api/user/self").done(
                function(data, textStatus, jqXHR) {
                    if (data['result'] == "ok") {
                        var user = new CanopyUser({
                            activated: data['activated'],
                            username: data['username'],
                            email: data['email']
                        });
                        barrier._user = user;
                        barrier._result = CANOPY_SUCCESS;
                    } else {
                        // TODO: proper error handling
                        barrier._user = null;
                        barrier._result = CANOPY_ERROR_UNKNOWN;
                    }
                    barrier._signal();
                }
            );

        .fail(function(jqXHR, textStatus, errorThrown) {
            /* TODO: determine error */
            if (params.onError)
                params.onError("unknown");
        });

            return barrier;
        }
    }

    this.initContext = function(settings) {
    }
}

Canopy = new CanopyModule()

/*canopy = Canopy.initContext();
remote = canopy.initRemote({
    "auth-username" : "gregp", 
    "auth-password" : "test1234",
    "http-port" : 80,
    "https-port" : 433,
    "use-http" : true,
    "skip-cert-check" : true,
    "host" : "dev02.canopy.link"
});
*/
