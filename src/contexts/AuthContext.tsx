import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile, VerificationStatus } from '@/types/user';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          ...data,
          created_at: data.created_at?.toDate(),
          approved_at: data.approved_at?.toDate(),
        } as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Create user profile
      const newProfile: UserProfile = {
        uid,
        email,
        real_name: profileData.real_name || '',
        father_name: profileData.father_name || '',
        whatsapp_number: profileData.whatsapp_number || '',
        batch_year: profileData.batch_year || '',
        class_or_degree: profileData.class_or_degree || '',
        medical_id_card_url: profileData.medical_id_card_url,
        role: 'user',
        plan: 'free',
        badge: 'bronze',
        verification_status: 'pending',
        is_blocked: false,
        created_at: new Date(),
      };

      await setDoc(doc(db, 'users', uid), newProfile);
      
      toast.success('Account created! Awaiting admin approval.');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      
      // Check verification status
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        if (userData.is_blocked) {
          await firebaseSignOut(auth);
          throw new Error('Your account has been blocked. Please contact support.');
        }
        
        if (userData.verification_status !== 'approved') {
          await firebaseSignOut(auth);
          throw new Error('Your account is pending verification. Please wait for admin approval.');
        }
      }
      
      toast.success('Signed in successfully!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { uid, email } = userCredential.user;
      
      // Check if profile exists
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create minimal profile - will need completion
        const newProfile: UserProfile = {
          uid,
          email: email || '',
          real_name: '',
          father_name: '',
          whatsapp_number: '',
          batch_year: '',
          class_or_degree: '',
          role: 'user',
          plan: 'free',
          badge: 'bronze',
          verification_status: 'pending',
          is_blocked: false,
          created_at: new Date(),
        };
        
        await setDoc(docRef, newProfile);
        toast.info('Please complete your profile for verification.');
      }
      
      toast.success('Signed in with Google!');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
