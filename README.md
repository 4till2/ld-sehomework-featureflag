# ld-sehomework-featureflag
https://whatastory.surge.sh/
NOTE: Currently compatible with Google Chrome and at times crashes due to CORS errors with external requests. Suitable for demonstration purposes only.

A small project to demonstrate the usage of using the LaunchDarkly SDK, to implement a feature flag.

## Project Overview

Inspired by OpenAI's text prediction model GPT-2, this site aims to demonstrate the capabilities via an endless stream of computer generated predictive text in the form of a story. Each page refresh loads the page with a phrase determined by the LaunchDarkly flag `start-text`, then passed via a fetch request to https://transformer.huggingface.co, which in turn runs the Machine Learning Model and returns its prediction for the next set of words. The combined text is then used for the next iteration.

## Client

### Overview
The client consists of an _index.html_ where _bundle.js_ (built from _main.js_ using browserify) renders the story via the request. The story is continuously updated at a configured time interval until the configured repeat limit is reached. Two LaunchDarkly feature flags are used as described below:

### Code
_main.js_: The app initializes by waiting for the DOM to load and LaunchDarkly to return a status of ready. Immediately, the LaunchDarkly flag `model-off` is checked as a way for real time toggling of the app into "offline mode", in which case the app stops. Otherwise, the initial text is written to the document as determined by the LaunchDarkly variable `start-text`. The app then calls `main()`, which controls the refresh rate and limit to the apps story length, managing the calls to `play()` which repeatedly gets the next set of predicted text from `getNextText()`, and consequently updates the page. `getNextText()` handles the processing of data into text, while `writeText()` handles formatting.

Note: LaunchDarkly is passed the unique ID (anonymously) of the page visitor which either exists or is created as the variable `UserId` in localStorage.

### Feature Flags

[```model-off```]
Use this feature flag as a way for real time toggling of the app into "offline mode" in case of a broken api etc. Toggling this flag ON will set the variable to True. When ON the visitor will see a predetermined message instead of the story.

*Type:* Boolean

*Options:* 
- `True`
- `False`

*Default:* `False`

[```start-text```]
Customize or test the starting text for new visitors. Currently configured to A/B/C test three variations at an equal distribution.

*Type:* String

*Options:*
- "This is the story of"
- "Once upon a time"
- "A long long time ago"

*Default:* "This is the story of"

### Develop

Dependencies: `npm install browserify && npm install --save launchdarkly-js-client-sdk`

Build: `browserify main.js -o bundle.js`

Deploy: `surge`

