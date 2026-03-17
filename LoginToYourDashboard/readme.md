# LOGIN FEATURE
## Firebase Google Auth + Approval
Copy these scripts below to add in any HTML file where you want login protection.  

### Link to Scripts
➡️ [loginfeature.html](https://github.com/ilkaysen18/englishtraininghub/blob/mainbranch/LoginToYourDashboard/loginfeature.html)

### Quick Setup Reminder
1. Replace firebaseConfig in both admin-panel.html and your call code
2. In Firestore, manually set your own user document to:
* role: "admin"
* status: "approved"

Only accounts with role: "admin" can access the admin panel — everyone else gets "Access denied".


# List of latest features added to "LoginToYourDashboard":
### Important Files - do not delete:
* # admin-panel.html ### --- This is for Admins approving new user signups.
* loginfeature.html --- These are scripts to add to HTML files where you want login protection.
* loginfeature.js --- This is the Login Feature.

