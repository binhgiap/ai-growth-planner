import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginCredentials } from "@/types/auth";
import { usersApi } from "@/lib/api";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "user@example.com",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Try to find user by email via API
      // Note: The API might not have a login endpoint, so we'll try to get user profile
      // If user doesn't exist, API will throw an error
      const usersResponse = await usersApi.findAll({ limit: 100, page: 1 });
      
      if (usersResponse.success && usersResponse.data) {
        const user = usersResponse.data.find(u => u.email === formData.email);
        
        if (!user) {
          throw new Error("User not found. Please check your email or register a new account.");
        }
        
        // Save user data to localStorage
        localStorage.setItem("user", JSON.stringify({
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          role: selectedRole,
          createdAt: user.createdAt,
        }));
        
        setIsLoading(false);
        navigate(selectedRole === "admin" ? "/admin" : "/user");
      } else {
        throw new Error("Failed to authenticate. Please try again.");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
      setIsLoading(false);
      console.error("Login error:", err);
    }
  };

  const handleMagicLinkSelect = (role: "user" | "admin") => {
    // Set the selected role and pre-fill email
    setSelectedRole(role);
    const demoEmail = role === "admin" ? "admin@example.com" : "user@example.com";
    setFormData({ ...formData, email: demoEmail });
  };


  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-lg border border-border shadow-lg p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-base md:text-lg">★</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold truncate">AI Growth Planner</h1>
      </div>

      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Sign in to AI Growth Planner</h2>
        <p className="text-sm md:text-base text-muted-foreground">Ship Faster and Focus on Growth.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      {/* Magic Link Login */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">Login with Magic Link</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={selectedRole === "user" ? "default" : "outline"}
            onClick={() => handleMagicLinkSelect("user")}
            className="w-full"
          >
            Login as User
          </Button>
          <Button
            type="button"
            variant={selectedRole === "admin" ? "default" : "outline"}
            onClick={() => handleMagicLinkSelect("admin")}
            className="w-full"
          >
            Login as Admin
          </Button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address*</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password*</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in to AI Growth Planner"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">New on our platform? </span>
        <Button
          type="button"
          variant="link"
          onClick={onSwitchToRegister}
          className="px-0 font-medium"
        >
          Create an account
        </Button>
      </div>
    </div>
  );
};

