import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { createUserProfile } from "../services";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // 1) create the auth account
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      // 2) set a display name
      await updateProfile(cred.user, { displayName: form.name });
      // 3) create the Firestore profile (Member 2's users collection)
      const avatar = `https://i.pravatar.cc/150?u=${cred.user.uid}`;
      await createUserProfile(cred.user.uid, {
        username: form.username,
        name: form.name,
        email: form.email,
        avatar,
      });
      navigate("/");
    } catch (err) {
      setError(friendlyError(err.code) || "Could not create account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Instagram</div>
        <p className="auth-subtitle">Sign up to see photos from your friends.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input placeholder="Email" type="email" value={form.email} onChange={update("email")} required />
          <input placeholder="Full Name" value={form.name} onChange={update("name")} required />
          <input placeholder="Username" value={form.username} onChange={update("username")} required />
          <input placeholder="Password" type="password" value={form.password} onChange={update("password")} required minLength={6} />
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-btn" type="submit" disabled={busy}>
            {busy ? "Creating account…" : "Sign up"}
          </button>
        </form>
      </div>

      <div className="auth-switch">
        Have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}

function friendlyError(code) {
  if (!code) return "";
  if (code.includes("email-already-in-use")) return "That email is already registered.";
  if (code.includes("invalid-email")) return "That email doesn't look right.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("operation-not-allowed"))
    return "Email/Password sign-in isn't enabled in Firebase yet.";
  return "";
}
