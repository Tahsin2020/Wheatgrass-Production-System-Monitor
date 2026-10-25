# Bug List

## Main bugs

The camera stream to the user interface is a stretch goal, and as such lacks the same robustness (security, responsiveness, stability, etc.) compared to other system components. 

Below are some of the issues identified during usage of the camera stream.

- The camera stream rtsp endpoint shared by the Node.js backend is accessible by anyone with the url.
- The camera stream glitches out on the user interface when the camera's footage changes too much.
- The camera stream in the user interface does not change size if the user interface changes in size.
- If the wifi network is change, the camera stream cannot be properly seen on the UI.

We have concerns about Keycloak user authentication, even if the tests might have passed. Below are some concerns, others might be identified with further investigation.

- Are tokens properly verified in order to access the dashboard?
- Are the api data paths properly protected?
- Are some api data paths too protected (i.e. not accessible due to malformed code?)
