"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const createAccount = () => {
    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    const user = { username, password };
    localStorage.setItem("user", JSON.stringify(user));

    router.replace("/book");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Account</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={createAccount}>Create & Continue</button>
    </div>
  );
}
