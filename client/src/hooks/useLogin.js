import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function useLogin(onLogin) {
  const nav = useNavigate();

  const [email, setEmail] = useState("admin@his.local");
  const [password, setPassword] = useState("Admin@123");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      const d = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("his_token", d.token);
      localStorage.setItem("his_user", JSON.stringify(d.user));

      onLogin(d.token);
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    err,
    submit,
  };
}

export default useLogin;