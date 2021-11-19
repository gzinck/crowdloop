# CrowdLoop

A Web Audio-based loop pedal for a performer. When configured with a
[CrowdLoop Server](https://github.com/gzinck/crowdloop-server), it provides
the ability to record loops locally and play them remotely on audience phones
which are on the [CrowdLoop Client](https://github.com/gzinck/crowdloop-client)
web app.

## Getting started

### Development

To get husky set up with pre-commit hooks for linting, run `npm run prepare`.

To get everything installed and running, run:

```
npm i
npm start
```

Then, go to your browser and accept the unsecure site. HTTPS is used because
on mobile Safari, the mic is disabled for unsecure websites.

## Known issues

- On iOS, audio interfaces are not supported. This is not something we can fix,
  it's a limitation of the platform.
- On iOS, drag end does not always register.
- On laptops/desktops, drag end does not always register in Chrome. This can be
  avoided by using Firefox instead.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
