# End-to-end acceptance tests of the FaceAnalyzer app

Each of the meticulously developed tests aligns with specific user stories, 
ensuring a direct correspondence to the 29 functional requirements integral 
to the project. This meticulous approach guarantees that the acceptance tests, 
shaped by the consideration of project requirements, are tailored to validate 
the functionality and integrity of the backend components. Furthermore, all 
these tests will be run against the production version of FaceAnalyzer.

## Cypress

E2E tests are executed with the help of [Cypress](https://www.cypress.io/).  

Cypress is an open-source end-to-end testing framework designed to simplify and 
streamline the process of testing web applications. It provides a comprehensive 
set of features for writing, running, and debugging tests, all while offering a 
real-time interactive test runner that allows developers to observe test 
execution directly in the browser. Cypress is known for its simplicity, speed, 
and reliability in automating browser interactions, making it a popular choice 
for ensuring the quality and functionality of web applications.

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

The target URL is defined in the configuration file. You can set it in the cypress.config.json 
file under the baseUrl property:

```json
{
  "baseUrl": "https://faceanalyzer.plavy.me"
}
```

By configuring the baseUrl variable, you can easily manage and switch between different 
environments or URLs for your tests.
