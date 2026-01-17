window.logout = async () => {
  try {
    // If you are using Firebase Auth:
    if(auth) await signOut(auth);
    
    localStorage.clear();
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    // Fallback if auth isn't initialized but we want to redirect
    localStorage.clear();
    window.location.href = "login.html";
  }
};