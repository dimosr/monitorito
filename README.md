# ![alt text][logo] Monitorito

This repository contains Monitorito, a browser extension capable of capturing the requests being made by your browser and generating a graph network to visualise it. There are additional functionalities for manipulating the graph, such as:
- filtering parts of the graph
- clustering different nodes into a single node
- expanding domain nodes to observe the internal resources of specific domains.

Finally, the user can export all the data captured (either the raw requests and redirects captured) or the generated graph in **[.csv]** files to import them in other analytics tools.

### Installation
To install in Chrome, follow the procedure below:
- Clone the repo in your local filesystem
- Open the Chrome browser and visit the [Extensions tab](chrome://extensions)
- Click the button “Load unpacked extension...”
- Select the subfolder **_app_** of the repo

### Testing
To execute the unit tests, open the file **_test/index.html_** in your browser. If you also want to see the code coverage of each different component of the application, you will have to transfer the whole repository to a web server (Apache, Nginx etc.) and visit the **_<APPLICATION_HOME>/test_** url in your browser, to access the file via a web browser. Then, click the button “Enable coverage” in the visited webpage.

### Contributing

Contributions back to the project are greatly welcome! To contribute a new functionality or a fix to an existing functionality:
- fork the repo
- develop your feature or make the fix to an existing feature
- add a new unit test in the existing suite, either to expose the bug (if fixing an existing feature) or to cover all the functionalities of the new feature (if developing a new feature).
- make a pull request
The pull request will be reviewed and merged to the repo as soon as possible (if the above suggestions are followed).

For more information about the project: check [here](https://monitorito.github.io/)

---------------------------------------------------------
LICENSE: [GNU GPLv3](./LICENSE.md)

[logo]: https://monitorito.github.io/assets/ico/apple-touch-icon-57-precomposed.png "Monitorito logo"