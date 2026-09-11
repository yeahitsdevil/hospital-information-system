import useLogin from "../hooks/useLogin";

function Login({ onLogin }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    err,
    submit,
  } = useLogin(onLogin);

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand-mark">+</div>
        <h1>HIS</h1>
        <p>Hospital Information System</p>

        <form onSubmit={submit}>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {err && <div className="error">{err}</div>}

          <button>Sign in</button>
        </form>

        <small>Demo: admin@his.local / Admin@123</small>
      </div>
    </div>
  );
}

export default Login;