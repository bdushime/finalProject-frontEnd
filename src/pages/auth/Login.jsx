import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@/components/common";
import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    const users = {
      "regular@umurinzi.edu": {
        email: "regular@umurinzi.edu",
        password: "password",
        role: "student",
      },
      "it@umurinzi.edu": {
        email: "it@umurinzi.edu",
        password: "password",
        role: "it",
      },
      "security@umurinzi.edu": {
        email: "security@umurinzi.edu",
        password: "password",
        role: "security",
      },
    };

    const userData = users[email];

    // Show error if email not found or password mismatch
    if (!userData || userData.password !== password) {
      setError("Incorrect email or password.");
	  setEmail("");
	  setPassword("");
      return;
    }

    setError("");

    login({
      email: userData.email,
      role: userData.role,
      token: "dummy-token",
    });

    if (userData.role === "it") {
      navigate("/it/dashboard");
    } else if (userData.role === "security") {
      navigate("/security/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  return (
    // <MainLayout>
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center py-10 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-6 sm:p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 text-white grid place-items-center">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-neutral-500">
            Access your Equipment Tracker account
          </p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            className="bg-gray-200 text-black"
            label="Email"
            type="email"
            placeholder="you@school.edu"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            className="bg-gray-200 text-black"
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
    // </MainLayout>
  );
}

