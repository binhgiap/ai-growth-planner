import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { User } from "@/types/auth";
import { OpenRouter } from "@openrouter/sdk";
const openRouter = new OpenRouter({
  apiKey: "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",
  // defaultHeaders: {
  //   "HTTP-Referer": "http://localhost:8080/", // Optional. Site URL for rankings on openrouter.ai.
  //   "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
  // },
});
const Index = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const getCompletion = async () => {
    const completion = await openRouter.chat.send({
      model: "openai/gpt-oss-20b:free",
      messages: [
        {
          role: "user",
          content: "give me three sentences about the meaning of life?",
        },
      ],
      stream: true,
    });
    for await (const chunk of completion) {
      document.getElementById("completion")?.append(chunk.choices[0].delta.content);
      sleep(50);
    }
    function sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Redirect based on role
      if (parsedUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    }
  }, [navigate]);

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full"
      >
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </motion.div>
      <button onClick={getCompletion}>Get Completion</button>
      <div id="completion"></div>
    </div>
  );
};

export default Index;
