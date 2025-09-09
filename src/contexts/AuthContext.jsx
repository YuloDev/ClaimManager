import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase?.auth?.getSession();
        if (error) {
          setAuthError(error?.message);
          return;
        }
        
        if (session?.user) {
          setUser(session?.user);
          await fetchUserProfile(session?.user?.id);
        }
      } catch (error) {
        setAuthError('Failed to get session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        setAuthError(null);
        
        if (session?.user) {
          setUser(session?.user);
          fetchUserProfile(session?.user?.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          // Profile doesn't exist, this is ok for new users
          setUserProfile(null);
          return;
        }
        setAuthError(error?.message);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      setAuthError('Failed to fetch user profile');
    }
  };

  const signIn = async (email, password) => {
    try {
      setAuthError(null);
      setLoading(true);
      
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error?.message);
        return { success: false, error: error?.message };
      }

      // Profile will be fetched via auth state change listener
      return { success: true, user: data?.user };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        setAuthError('Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        return { success: false, error: 'Connection failed' };
      }
      
      setAuthError('Something went wrong. Please try again.');
      return { success: false, error: 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setAuthError(null);
      setLoading(true);

      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name || '',
            role: userData?.role || 'member',
          },
        },
      });

      if (error) {
        setAuthError(error?.message);
        return { success: false, error: error?.message };
      }

      return { success: true, user: data?.user };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        setAuthError('Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        return { success: false, error: 'Connection failed' };
      }
      
      setAuthError('Something went wrong. Please try again.');
      return { success: false, error: 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setAuthError(null);
      const { error } = await supabase?.auth?.signOut();
      
      if (error) {
        setAuthError(error?.message);
        return { success: false, error: error?.message };
      }

      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      setAuthError('Failed to sign out');
      return { success: false, error: 'Sign out failed' };
    }
  };

  const updateProfile = async (updates) => {
    try {
      setAuthError(null);
      
      if (!user) {
        setAuthError('No user logged in');
        return { success: false, error: 'No user logged in' };
      }

      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single();

      if (error) {
        setAuthError(error?.message);
        return { success: false, error: error?.message };
      }

      setUserProfile(data);
      return { success: true, profile: data };
    } catch (error) {
      setAuthError('Failed to update profile');
      return { success: false, error: 'Update failed' };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError: () => setAuthError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;