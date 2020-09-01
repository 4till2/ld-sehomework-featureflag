const LDClient = require('launchdarkly-js-client-sdk');

const user = {
    "key": getUserId(),
    "anonymous": true
};

// Initialize Launch Darkly
const ldclient = LDClient.initialize('5f4d87dd0ebcca0948740f0a', user);

const TEXTCONTAINER = '#mainContent';

// Generates unique user id
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Gets user id if found, otherwise creates one
function getUserId() {
    window.localStorage.UserId = window.localStorage.UserId || uuidv4()
    return window.localStorage.UserId
}

// Queries the api for the next set of text using the current text and number of wanted words as parameters
function getNextText(string) {
    return new Promise(function (resolve, reject) {
        fetch("https://transformer.huggingface.co/autocomplete/gpt2/arxiv-nlp", {
                "credentials": "omit",
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin"
                },
                "referrer": "https://transformer.huggingface.co/doc/arxiv-nlp",
                "referrerPolicy": "no-referrer-when-downgrade",
                "body": `{\"context\":\"${string}\",\"model_size\":\"gpt2/arxiv-nlp\",\"top_p\":0.9,\"temperature\":1,\"max_time\":1}`,
                "method": "POST",
                "mode": "cors"
            })
            .then(response => {
                const reader = response.body.getReader();
                return new ReadableStream({
                    start(controller) {
                        return pump();

                        function pump() {
                            return reader.read().then(({
                                done,
                                value
                            }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                controller.enqueue(value);
                                return pump();
                            });
                        }
                    }
                })
            })
            .then(stream => new Response(stream))
            .then(response => response.blob())
            .then(blob => blob.text())
            .then(text => JSON.parse(text).sentences[0].value)
            .then(newText => resolve(newText))
            .catch(err => {
                reject(err);
            });
    });
}

function getTextOnPage() {
    return $(TEXTCONTAINER).text() || '';
}

// Cleans text before writing as to not break flow, and ML Model
function writeTextToPage(text) {
    $(`<span>${text.replace(/(?:\r\n|\r|\n)/g, '')}</span>`)
        .appendTo(TEXTCONTAINER)
        .hide().fadeIn(3000);
}

function play() {
    getNextText(getTextOnPage())
        .then(text => {
            text ? writeTextToPage(text) : null;
            return true;
        })
        .catch((err) => {
            console.warn(err);
            return false;
        })
}

// Parameters allow for eventual customization of repeatLimit and intervalLimit variables 
function main(repeatLimit, intervalLimit) {
    let isPaused = false;

    //prevents unreasonable interval limits
    if (intervalLimit < 2000 || intervalLimit > 30000) {
        intervalLimit = 5000;
    }
    //prevents unreasonable repeat limit
    if (repeatLimit > 1000) {
        repeatLimit = 1000;
    }
    $('#togglePlay').click(function () {
        isPaused = !isPaused;
    })
    play()
    let repeat = setInterval(function () {
        if (!repeatLimit || repeatLimit <= 0) clearInterval(repeat)
            --repeatLimit;
        if (!isPaused) {
            if (play() == false) clearInterval(repeat)
        }
    }, intervalLimit)
}

// Wait until Dom and Launch Darkly are loaded
window.addEventListener("DOMContentLoaded", () => {
    ldclient.on('ready', function () {
        const modelOff = ldclient.variation("model-off", false);
        const startText = ldclient.variation("start-text", "This is the story of ");
        if (modelOff === true) {
            writeTextToPage("We're sorry but it appears our story tellers are tired. Check back in with us soon!");
        } else {
            writeTextToPage(startText)
            main(1000, 5000);
        }
    });
})
