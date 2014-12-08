/*
Canopy Javascript Client API

CANOPY CLIENT OBJECT
--------------------

Initialize the library by creating a Canopy Client Object with:

    canopy = new CanopyClient({
        "cloud-host" : "ccs.canopy.link"
    });

TRACKING ACCOUNTS AND DEVICES
-----------------------

Before you can access a device or account's data, you must first "track" it.

Each Canopy Client Object can "track" multiple Account and Device objects.  By
"tracking" an object you can access and manipulate it within javascript.
The tracking mechanism allows an efficient implementation to update (or
"synchronize") all tracked objects with a single AJAX request.

To track an account:

    var acct = canopy.Account(username);

To track the currently logged-in user (based on session cookies):

    var acct = canopy.Account("me");

To track a device:

    var dev = canopy.Device(UUID);

Once you have started tracking one or more objects, you can synchronize with
the server using:

    canopy.Sync({ onSuccess: function() {
        // your code here
    }});

By default, Sync will synchronize all tracked Accounts and Devices.  You can
synchronize specific objects with:

    canopy.Sync({
        accounts : [username],
        devices: [uuid0, uuid1, ...],
        onSuccess: function() {
        }
    });

This form of the command will synchronize the specified devices even if they
are not being tracked.

Callbacks:
--------------------
OnReady

CanopyClient Callbacks:
    "device-loaded"
        Called when a new Device object is loaded for the first
        time.

Account Callbacks:
    "device-loaded" - Called when a new Device object is loaded.

ACCOUNTS
--------------------

If the user has authenticated with the Canopy Cloud Service (by logging in, for
example), you can access their Account Object:

    canopy.me

    // Get username
    canopy.me.username();

    // Push changes
    canopy.me.save({
        onSuccess: function() {
            alert("Account updated");
        }
    });

    // Get a user's devices:
    canopy.me.devices();

    canopy.users();

    // Get device
    canopy.device("UUID");

    canopy.device("UUID");

CLOUD VARIABLES
--------------------

    device = canopy.device("UUID");

    device.gps.longitude.Value = 4.0f;
*/

function SDDLParser() {
    // Parses json Object into anonymous cloudvar struct
    this.Parse = function(jsonObj) {
        return this.ParseVar("inout struct __root__", propsJsonObj);
    }

    // Returns {value: SDDLVarDef, error: errorStringOrNull}
    this.ParseVar = function(declString, propsJsonObj) {
        var out = new SDDLVar();

        // Parse declString
        // For example: "out float32 temperature";
        out.priv.direction = "out";
        out.priv.datatype = "string";
        out.priv.name = "temperature";

        // Parse properties
        for (var x in propsJsonObj) {
            var val = propsJsonObj[x];

            if (x == "description") {
                out.priv.description = val;
            }
            else if (x == "min-value") {
                out.priv.minValue = val;
            }
            else if (x == "max-value") {
                out.priv.maxValue = val;
            }
            else if (x == "regex") {
                out.priv.regex = val;
            }
            else if (x == "units") {
                out.priv.units = val;
            }
            else if (x == "units") {
                out.priv.units = val;
            }
            else {
                // only do this if it parses to a var declaration
                var child = self.ParseVar(x, val);
                if (child.error != null) {
                    return {value: null, error: child.error};
                }
                out.priv.children[child.value.Name()] = child.value;
            }
        }
        return {value: out, error: null};
    }

    function SDDLVar() {
        this.priv = {};
        this.priv.children = {};

        this.Directio = function() {
            return this.priv.direction;
        }

        this.ConcreteDirection = function() {
            if (this.Direction == "inherit") {
                return this.priv.parent.ConcreteDirection();
            }
            return this.Direction();
        }

        this.Description = function() {
            return this.priv.description;
        }
        this.Datatype = function() {
            return this.priv.datatype;
        }

        this.Name = function() {
            return this.priv.name;
        }

        this.MinValue = function() {
            return this.priv.minValue;
        }

        this.MaxValue = function() {
            return this.priv.maxValue;
        }

        this.NumericDisplayHint = function() {
            return this.priv.numericDisplayHint;
        }

        this.Regex = function() {
            return this.priv.regex;
        }

        this.Units = function() {
            return this.priv.units;
        }
    }
}

function CanopyClient(origSettings) {
    var self=this;
    this.priv = {};

    // map: username -> Account object
    this.priv.trackedAccounts = {};
    // map: uuid -> Account object
    this.priv.trackedDevices = {};

    function device(id) {
        return this.priv.device
    }

    this.OnReady = function(fn) {
        this.priv.onReady = fn;
    }

    this.IsLoggedIn = function() {
        return self.priv.me !== undefined;
    }

    this.ApiBaseUrl = function() {
        return "http://dev02.canopy.link/api";
    }

    this.CreateAccount = function(params) {
        $.ajax({
            type: "POST",
            dataType : "json",
            contentType: 'text/plain; charset=utf-8', /* Needed for safari */
            url: self.ApiBaseUrl() + "/create_account",
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
            /*self.devices = new CanopyDeviceList([]);
            self.account = new CanopyAccount({
                username: params.username,
                email: params.email
            });*/
            if (data['result'] == "ok") {
                if (params.onSuccess != null)
                    params.onSuccess();
            } 
            else {
                if (params.onError != null)
                    params.onError(data['error']);
            }
        })
        .fail(function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
            if (params.onError != null)
                params.onError();
        });
    }

    this.Login = function(params) {
        /* TODO: proper error handlilng */
        /* TODO: response needs to include username & email */
        $.ajax({
            type: "POST",
            contentType: 'text/plain; charset=utf-8', /* Needed for safari */
            dataType : "json",
            url: self.ApiBaseUrl() + "/login",
            data: JSON.stringify({username : params.username, password : params.password}),
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function(data, textStatus, jqXHR) {
            if (data['result'] == "ok") {
                /*var acct = new CanopyAccount({
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
                self.account = acct;*/
                if (params.onSuccess)
                    params.onSuccess();
                
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
            console.log(XMLHttpRequest.responseText);
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

    // Synchronize with the server
    this.Sync = function(params) {
        var trackAccts = this.priv.trackedAccounts;
        var trackDevices = this.priv.trackedDevices;

        if (priv.trackedAccounts['me'] !== undefined) {
            var acct = priv.trackedAccounts['me'];
            acct.priv.email = "greg@greg.com";
            acct.priv.username = "gregulator";
            acct.priv.ready = true;
            acct.priv.onChange();

            acct.priv.devices = [
                new CanopyDevice()
            ];
            acct.priv.onDeviceLoaded(acct.priv.devices[0]);
        }

        var ajax = CCSSimulatorAjax;

        ajax({
            type: "POST",
            data: JSON.stringify({ "sync-accounts" : trackAccts, "sync-devices" : trackDevices}),
            dataType : "json",
            url: self.ApiBaseUrl() + "/sync",
            xhrFields: {
                 withCredentials: true
            },
            crossDomain: true
        })
        .done(function(data, textStatus, jqXHR) {
            // Update each synchronized account object
            alert("sync done");
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

    this.Account = function(account) {
        if (priv.trackedAccounts[account] === undefined) {
            var acct = new CanopyAccount(account);
            priv.trackedAccounts[account] = acct;
            return acct;
        } else {
            return priv.trackedAccounts[account];
        }
    }

    this.Device = function(device) {
    }
    
    // fetchAccount (private)
    // AJAX request for account details.
    function fetchAccount(params) {
        $.ajax({
            type: "GET",
            dataType : "json",
            url: self.ApiBaseUrl() + "/me",
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

    // CanopyAccount
    // This is a private "class" of CanopyClient to prevent the caller from
    // calling the constructor.
    function CanopyAccount(initObj) {
        var priv = {};
        this.priv = priv;
        priv.ready = false;

        this.Email = function() {
            if (!priv.ready) {
                return {"value" : "", "error" : "Account Not Ready"};
            }
            return {"value" : priv.email, "error" : null};
        }

        this.On = function(eventNames, callback) {
            if (eventNames == "change") {
                priv.onChange = callback;
            } else if (eventNames == "device-loaded") {
                priv.onDeviceLoaded = callback;
            }
        }

        this.Username = function() {
            if (!priv.ready) {
                return {"value" : "", "error" : "Not Ready"};
            }
            return {"value" : priv.username, "error" : null};
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
                    var dev = new CanopyDevice(data.devices[i]);
                    if (dev.friendlyName().substring(0, 10) != "FakeDevice") // HACK!
                        devices.push(dev);
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

    function CloudVar(params) {
        var priv = {};
        priv.value = undefined;
        this.Value = function(newValue) {
            if (newValue !== undefined) {
                priv.value = newValue;
                // mark dirty
            }
            return priv.value;
        }
    }

    function CanopyDevice(params) {
        this.vars = {
            "temperature" : new CloudVar()
        };
    }

    // Initialization
    $(function() {
        fetchAccount({
            onSuccess : function(acct) {
                self.priv.me = acct;
                self.priv.onReady();
            },
            onError : function(acct) {
                self.priv.onReady();
            }
        })
    });

}

// Example program:
/*
var canopy = new CanopyClient();

acct = canopy.Account("me");
device = acct.Devices();

canopy.TrackDevice(CANOPY_DEVICE_UUID);
canopy.AutoSync(true);

canopy.onChange(canopy.Device("uuid").);

canopy.Sync({
    onSuccess: function() {
        canopy.Device("UUID")
    }
});
*/
