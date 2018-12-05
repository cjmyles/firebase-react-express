# Firebase React Express

Sandbox application to demonstrate the compatibility between a React app and a NodeJS Express app (or API), tailored for Firebase, using Facebook Login and PassportJS.

In this particular example the React and Express apps are stored in the same repository and are deployed simulataneously to Firebase Hosting and Firebase Functions respectively, although they could be broken out if required.

The React and Express apps were bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and the Firebase [`init`](https://www.youtube.com/watch?v=LOeioOKUKI8&vl=en) command respectively.

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

This is required to enable deployment but is not required for local development.

```bash
$ firebase use --add
```

# Local Development

## Express

```bash
$ npm run serve
```

**Note:** This is the same as running `firebase serve --only functions --port=5001`.

You should see a message in terminal containing the functions url, something like [http://localhost:5001/node-test-f2063/us-central1/app](http://localhost:5001/node-test-f2063/us-central1/app).

Copy this URL and paste it into the `package.json` file in the root under `proxy` (not the `package.json` file in the `functions` directory):

```json
"proxy": "http://localhost:5001/node-test-f2063/us-central1/app"
```

Open a browser and navigate to [http://localhost:5001/node-test-f2063/us-central1/app/api/message](http://localhost:5001/node-test-f2063/us-central1/app/api/message) to see a test response. This is tied to the code in `functions/index.js` (an abbreviated version is shown below):

```js
const functions = require('firebase-functions');
const express = require('express');

const app = express();

app.get('/api/message', (req, res) => {
  res.send({ message: 'Hello world!' });
});

exports.app = functions.https.onRequest(app);
```

## React

In a separate terminal window, run the following (we should now have two processes running concurrently):

```bash
$ npm start
```

**Note:** You could create a Docker script to handle both of these terminal processes

You should see a message in terminal containing the React url, something like: [http://localhost:3000/](http://localhost:3000/)

A browser window should open automatically. If not, open a browser and navigate to [http://localhost:3000/](http://localhost:3000/) where you should see your React app running. More importantly, you should see the API response.

We can see from `src/App.js` that we are making a call to the API (an abbreviated version is shown below):

```js
const response = await fetch('/api/message');
const { message } = await response.json(); // Hello world!
this.setState({ message });
```

Since we added the `proxy` field to `package.json`, any `fetch` request to `/api/**` will be proxied to our API. This not only saves us having to use the full API address in our requests, but it also means we're not making cross-origin requests and so therefore do not need to configure CORS in our API (win!)

# Deployment

`$ npm run build`
`$ firebase deploy`

**Note:** This will deploy both the functions and the hosting components and is the same as `firebase deploy --only functions,hosting`

You should see a message in terminal containing the Firebase url, something like: [https://node-test-f2063.firebaseapp.com/](https://node-test-f2063.firebaseapp.com/)

Open a browser and navigate to [https://node-test-f2063.firebaseapp.com/](https://node-test-f2063.firebaseapp.com/) where you should see your React app running again. Similar to our `package.json` `proxy` entry (which is ignored in production), the `firebase.json` file configures the proxy to the API:

```json
"hosting": {
  "public": "build",
  "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
  "rewrites": [{ "source": "/api/**", "function": "app" }]
},
```

This corresponds to the name of the `functions` app we set in `functions/index.js` as previously described:

```js
exports.app = functions.https.onRequest(app);
```

This means that a request such as `/api/message` is proxied to `http://localhost:5001/node-test-f2063/us-central1/app/api/message` in local development and `http://localhost:5001/node-test-f2063/us-central1/app/api/message` in production.
