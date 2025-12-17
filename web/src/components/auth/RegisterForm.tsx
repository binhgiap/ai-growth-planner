import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterFormData, RegisterData, StoredUser } from "@/types/auth";
import { authApi } from "@/lib/api";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    walletAddress: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.walletAddress || formData.walletAddress.trim() === "") {
      setError("Wallet address is required");
      return;
    }

    setIsLoading(true);

    try {
      // Split name into first and last name for backend payload
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      console.log(`[API] Registering user via auth API:`, {
        email: formData.email,
        firstName,
        lastName,
      });

      const payload: RegisterData = {
        email: formData.email,
        password: formData.password,
        firstName,
        lastName,
        walletAddress: formData.walletAddress.trim(),
        currentRole: "",
        targetRole: "",
      };

      const response = await authApi.register(payload);

      if (response.success && response.data) {
        const { accessToken, user } = response.data;

        // Persist auth token and user info
        const storedUser: StoredUser = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        };

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(storedUser));

        setIsLoading(false);
        // New users start as normal users -> go to user dashboard
        navigate("/user");
      } else {
        setError("Failed to create account. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      setIsLoading(false);
    }
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
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Create an account</h2>
        <p className="text-sm md:text-base text-muted-foreground">Get started with your 6-month growth plan</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name*</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password*</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="walletAddress">Wallet Address*</Label>
          <Input
            id="walletAddress"
            type="text"
            placeholder="Enter your wallet address (e.g., 0x...)"
            value={formData.walletAddress}
            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button
          type="button"
          variant="link"
          onClick={onSwitchToLogin}
          className="px-0 font-medium"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
};

