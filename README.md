# End-to-end acceptance tests of the FaceAnalyzer app

Each of the meticulously developed tests aligns with specific user stories, 
ensuring a direct correspondence to the 29 functional requirements integral 
to the project. This meticulous approach guarantees that the acceptance tests, 
shaped by the consideration of project requirements, are tailored to validate 
the functionality and integrity of the backend components.

## Cypress

E2E tests are executed with the help of Cypress.
Cypress is..

### Installation

In order to install and run E2E tests, you should have [NPM](https://www.npmjs.com/package/npm) installed.

```
npm install
```

### Local run

To run the tests, run this command in repo's root:

```bash
npx cypress run
```

### Configure the browser

Use `--browser` flag to set the broswer. You can only use browsers installed on your system.

```
npx cypress run --browser firefox
```

### Configure the target URL

Target URL is defined in this file with this variable..
