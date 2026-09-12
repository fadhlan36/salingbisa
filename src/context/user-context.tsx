"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  avatarUrl: string | null;
  isLoading: boolean;
  setAvatarUrl: (url: string | null) => void;
  fetchUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.avatar_url || null);
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setAvatarUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider
      value={{ avatarUrl, isLoading, setAvatarUrl, fetchUserProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
