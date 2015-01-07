var SIMULATOR_ACTIVE = true;

function CCSSimulatorAjax(params) {
    var out = {};
    if (params.url == "/sync") {
        var data = {
            "accounts" : {
                "me" : {
                    "username" : "fry",
                    "email" : "fry@futurama.com",
                    "devices" : [
                        "c31a8ced-b9f1-4b0c-afe9-1afed3b0c21f"
                    ]
                }
            },
            "devices" : {
                "c31a8ced-b9f1-4b0c-afe9-1afed3b0c21f" : {
                    "sddl" : {
                        "out float32 temperature" : {},
                    },
                    "vars" : {
                        "temperature" : 97.4,
                    }
                }
            }
        }
        out.done = function(cb) {
            cb(data, textStatus, jqXHR);
        }
    }
    return out;
}
