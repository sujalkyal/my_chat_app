import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      name: isSignUp ? name : undefined, // Include name only for sign-up
      redirect: false,
    });

    if (!res?.error) {
      router.push("/");
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="w-96 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">{isSignUp ? "Sign Up" : "Sign In"}</h2>

        {isSignUp && (
          <input
            type="text"
            placeholder="Name"
            className="w-full p-2 mb-3 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>

        <p
          className="mt-3 text-sm text-center cursor-pointer text-blue-500"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </p>
      </form>
    </div>
  );
}
