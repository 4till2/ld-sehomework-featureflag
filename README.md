# ld-sehomework-featureflag
https://whatastory.surge.sh/

A small project to demonstrate the usage of using the LaunchDarkly SDK, to implement a feature flag.

## Project Overview

Inspired by OpenAI's text prediction model GPT-2 this site aims to demonstrate the capabilities via an endless stream of computer generated predictive text, in the form of a story. Each page refresh begins with a phrase determined by the LaunchDarkly flag `start-text` which is passed via a fetch request to https://transformer.huggingface.co which in turn runs the the Machine Learning Model and returns its prediction for the next word. The combined text is then used for the next iteration.

NOTE: Currently works best with Google Chrome and at times crashes due to CORS errors with external requests. Suitable for demonstration purposes only.

### Client:

**Overview**
The client consists of an _index.html_ where _bundle.js_ (built from _main.js_ using browserify) renders the story via the request. The story is continuously updated at a configured time interval, until the configured repeat limit is reached. Two LaunchDarkly feature flags are used as described below.

**Code**
_main.js_ initializes by waiting for the dom to load and LaunchDarkly to return a status of ready. Immediately the LaunchDarkly flag `model-off` is checked as a way for real time toggling of the app into "offline mode" in case of a broken api etc. Additionally the starting text is determined by the LaunchDarkly variable `start-text` allowing for the testing of which phrases to begin the story with (currently testing three phrases at an equal distribution). `main()` control's the refresh rate and limit to the apps story length, managing the calls to `play()` which gets the next set of text from `getNextText()` consequently updating the page.

Note: LaunchDarkly is passed the unique ID of the page visitor which either exists or is created as the variable `UserId` in localStorage.

**Develop**
Dependencies: `npm install browserify && npm install --save launchdarkly-js-client-sdk` 
Build: `browserify main.js -o bundle.js`
Deploy: `surge`

