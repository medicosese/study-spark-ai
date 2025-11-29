import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, UserPlus, Upload } from "lucide-react";

const SignupForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    real_name: "",
    father_name: "",
    whatsapp_number: "",
    batch_year: "",
    class_or_degree: "",
  });
  const [medicalIdFile, setMedicalIdFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedicalIdFile(e.target.files[0]);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password || !formData.real_name || 
        !formData.father_name || !formData.whatsapp_number || 
        !formData.batch_year || !formData.class_or_degree) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // Upload medical ID card if provided
      let medicalIdUrl = null;
      if (medicalIdFile) {
        const fileExt = medicalIdFile.name.split('.').pop();
        const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('medical-ids')
          .upload(fileName, medicalIdFile);

        if (uploadError) {
          console.error('Error uploading medical ID:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('medical-ids')
            .getPublicUrl(fileName);
          medicalIdUrl = publicUrl;
        }
      }

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          email: formData.email,
          real_name: formData.real_name,
          father_name: formData.father_name,
          whatsapp_number: formData.whatsapp_number,
          batch_year: formData.batch_year,
          class_or_degree: formData.class_or_degree,
          medical_id_card_url: medicalIdUrl,
          verification_status: "pending",
        });

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Account created! Awaiting admin verification.",
      });

      navigate("/verification-pending");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create your account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="real_name">Real Name *</Label>
              <Input
                id="real_name"
                name="real_name"
                value={formData.real_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name *</Label>
              <Input
                id="father_name"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
            <Input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              placeholder="+92 300 1234567"
              value={formData.whatsapp_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch_year">Batch Year *</Label>
              <Input
                id="batch_year"
                name="batch_year"
                placeholder="2024"
                value={formData.batch_year}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_or_degree">Class/Degree *</Label>
              <Input
                id="class_or_degree"
                name="class_or_degree"
                placeholder="MBBS"
                value={formData.class_or_degree}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_id">Medical ID Card (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="medical_id"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('medical_id')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {medicalIdFile ? medicalIdFile.name : "Upload ID Card"}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              "Creating Account..."
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;