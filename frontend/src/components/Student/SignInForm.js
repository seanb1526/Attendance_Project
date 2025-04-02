// ...existing code...
const [rememberMe, setRememberMe] = useState(false);

// ...existing code...
<form onSubmit={handleSignIn}>
  {/* ...existing form fields... */}
  <FormControlLabel
    control={
      <Checkbox
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
        color="primary"
      />
    }
    label="Remember Me"
  />
  <Button type="submit" variant="contained" color="primary">
    Sign In
  </Button>
</form>

// Modify the handleSignIn function to include rememberMe in the request payload
const handleSignIn = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('/api/student/signin', {
      email,
      student_id,
      remember_me: rememberMe,
    });
    // ...existing code...
  } catch (error) {
    // ...existing error handling...
  }
};
