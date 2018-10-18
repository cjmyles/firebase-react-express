# Firebase React Express

Firebase application to enable React frontend using Firebase Hosting and Node Express backend using Firebase Functions.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and the Firebase `init` command (as per https://www.youtube.com/watch?v=LOeioOKUKI8&vl=en).

The code has been configured to enable local development, as well as deployment to Firebase.

# Install

```bash
$ git clone https://github.com/cjmyles/firebase-react-node.git
$ cd firebase-react-node
$ npm i
$ cd functions
$ npm i
$ cd ..
$ code .
```

# Associate With A Firebase Project

```bash
$ firebase use --add
```

# Run Functions Locally

```bash
$ firebase serve
```

**Note:** This is the same as running `firebase serve --only functions,hosting`.
**Note:** Although we are running functions, we also need Firebase to serve hosting so that the Express app runs correctly. At this point I'm not entirely sure why this is the case (as we run the React app separately below).

You should see a message in terminal containing the functions url, something like `http://localhost:5001/node-test-f2063/us-central1/api`.

Copy this URL and paste it into `package.json`:

```json
"proxy": "http://localhost:5001/node-test-f2063/us-central1/api"
```

Open a browser and navigate to `http://localhost:5001/node-test-f2063/us-central1/api/api/timestamp`. This is tied to the code in `functions/index.js`:

```js
const functions = require("firebase-functions");
const express = require("express");

const app = express();

app.get("/api/timestamp", (req, res) => {
  res.send(`${Date.now()}`);
});

exports.api = functions.https.onRequest(app);
```

# Run React Locally

In a separate terminal window, run the following (we should now have two processes running concurrently):

```bash
$ npm start
```

You should see a message in terminal containing the React url, something like:
`http://localhost:3000/`

A browser window should open automatically. If not, open a browser and navigate to `http://localhost:3000/` where you should see your React app running. More importantly, you should see a timestamp at the bottom of the window (and logged to the console).

We can see from `src/App.js` that we are making a call to the API in the `componentDidMount` function:

```js
async componentDidMount() {
  const response = await fetch('/api/timestamp');
  const timestamp = await response.json();
  console.log(timestamp);
  this.setState({ timestamp });
}
```

Since we added the `proxy` field to `package.json`, any `fetch` request to `/api/**` will be proxied to our API.

# Deployment

`$ npm run build`
`$ firebase deploy`

**Note:** This will deploy both the functions and the hosting components and is the same as `firebase deploy --only functions,hosting`

You should see a message in terminal containing the Firebase url, something like:
`https://node-test-f2063.firebaseapp.com/`

Open a browser and navigate to `https://node-test-f2063.firebaseapp.com/` where you should see your React app running again. Similar to our `package.json` `proxy` entry (which is ignored in production), the `firebase.json` file configures the proxy to the API:

```json
"hosting": {
  "public": "build",
  "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
  "rewrites": [{ "source": "/api/**", "function": "api" }]
},
```

This corresponds to the name of the `functions` we set in `functions/index.js` as previously described:

```js
exports.api = functions.https.onRequest(app);
```
