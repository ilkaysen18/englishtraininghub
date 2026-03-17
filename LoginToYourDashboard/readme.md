<!-- ============================================ 
     LOGIN FEATURE — Firebase Google Auth + Approval
     Copy these scripts below to addd before </body> in any HTML file where you want login protection.  
     ============================================ -->



https://github.com/ilkaysen18/englishtraininghub/blob/mainbranch/LoginToYourDashboard/loginfeature.html 

<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>

<!-- Login Feature -->
<script src="loginfeature.js"></script>
<script>
  LoginFeature.init({
    firebaseConfig: {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT.appspot.com",
      messagingSenderId: "123456789",
      appId: "YOUR_APP_ID"
    }
  });
</script>
