import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services";
import { useAuth } from "../context/AuthContext";

// Read an image File, shrink it, and return a compressed data-URL string.
// This lets us "upload from device" WITHOUT Firebase Storage (which needs the
// paid Blaze plan) — the image is stored inline in Firestore instead.
// We keep it well under Firestore's ~1MB per-document limit.
function fileToDataUrl(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width >= height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Compress progressively until it fits comfortably in a Firestore document.
async function compressImage(file) {
  const attempts = [
    [1080, 0.8],
    [900, 0.7],
    [720, 0.6],
    [500, 0.5],
  ];
  for (const [size, q] of attempts) {
    const url = await fileToDataUrl(file, size, q);
    if (url.length < 900000) return url; // ~<900KB, safe under the 1MB limit
  }
  return fileToDataUrl(file, 400, 0.4);
}

export default function CreatePost() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const username = profile?.username || user?.email?.split("@")[0] || "you";
  const avatar = profile?.avatar || `https://i.pravatar.cc/150?u=${user?.uid}`;

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please choose an image to upload.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const image = await compressImage(file); // -> stored in Firestore
      await createPost(
        { uid: user.uid, username, avatar },
        { image, caption: caption.trim(), location: location.trim() }
      );
      navigate("/");
    } catch (err) {
      setError("Could not create post. " + (err?.message || ""));
      setBusy(false);
    }
  }

  return (
    <div className="main-layout">
      <div className="create-card">
        <h2 className="create-title">Create new post</h2>

        <form className="create-form" onSubmit={handleSubmit}>
          <label>Photo</label>
          <label className="create-dropzone">
            {preview ? (
              <img className="create-preview" src={preview} alt="preview" />
            ) : (
              <span>Click to choose an image from your device</span>
            )}
            <input type="file" accept="image/*" onChange={onPickFile} hidden />
          </label>

          <label>Caption</label>
          <textarea
            rows={3}
            placeholder="Write a caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <label>Location (optional)</label>
          <input
            placeholder="Chennai, India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-btn" type="submit" disabled={busy}>
            {busy ? "Sharing…" : "Share"}
          </button>
        </form>
      </div>
    </div>
  );
}
