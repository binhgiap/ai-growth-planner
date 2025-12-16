import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginData, StoredUser } from "@/types/auth";
import { authApi } from "@/lib/api";
import { hasUserPlan } from "@/lib/utils/api-converters";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [formData, setFormData] = useState<LoginData>({
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
      const payload: LoginData = {
        email: formData.email,
        password: formData.password,
      };

      const response = await authApi.login(payload);

      if (!response.success || !response.data) {
        throw new Error("Failed to authenticate. Please try again.");
      }

      const { accessToken, user } = response.data;

      const storedUser: StoredUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        name: `${user.firstName} ${user.lastName}`.trim() || user.email,
      };

      // Persist auth state
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(storedUser));

      // Route based on actual role from backend, but keep current UX shortcut
      const effectiveRole = user.role === "admin" ? "admin" : selectedRole;

      if (effectiveRole === "admin") {
        setIsLoading(false);
        navigate("/admin");
      } else {
        // For normal users, check if they already have a plan
        const hasPlan = await hasUserPlan(user.id);
        setIsLoading(false);

        if (hasPlan) {
          navigate("/user");
        } else {
          navigate("/user");
        }
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

