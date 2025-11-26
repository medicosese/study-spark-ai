import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

export const SignUpForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    real_name: '',
    father_name: '',
    whatsapp_number: '',
    batch_year: '',
    class_or_degree: ''
  });
  const [idCard, setIdCard] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!idCard) {
        throw new Error('Please upload your medical ID card');
      }

      // Upload ID card
      const idCardRef = ref(storage, `verification_docs/${Date.now()}_${idCard.name}`);
      await uploadBytes(idCardRef, idCard);
      const medical_id_card_url = await getDownloadURL(idCardRef);

      // Create account
      await signUp(formData.email, formData.password, {
        ...formData,
        medical_id_card_url
      });

      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="real_name">Full Name</Label>
        <Input
          id="real_name"
          required
          value={formData.real_name}
          onChange={(e) => setFormData(prev => ({ ...prev, real_name: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="father_name">Father's Name</Label>
        <Input
          id="father_name"
          required
          value={formData.father_name}
          onChange={(e) => setFormData(prev => ({ ...prev, father_name: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
        <Input
          id="whatsapp_number"
          required
          placeholder="03001234567"
          value={formData.whatsapp_number}
          onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="batch_year">Batch Year</Label>
        <Input
          id="batch_year"
          required
          placeholder="2024"
          value={formData.batch_year}
          onChange={(e) => setFormData(prev => ({ ...prev, batch_year: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="class_or_degree">Class / Degree</Label>
        <Input
          id="class_or_degree"
          required
          placeholder="1st Year MBBS"
          value={formData.class_or_degree}
          onChange={(e) => setFormData(prev => ({ ...prev, class_or_degree: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="id_card">Medical ID Card</Label>
        <div className="mt-2">
          <label htmlFor="id_card" className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 transition-colors">
            <Upload className="h-4 w-4" />
            {idCard ? idCard.name : 'Choose file'}
          </label>
          <input
            id="id_card"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setIdCard(e.target.files?.[0] || null)}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign Up
      </Button>
    </form>
  );
};
