import React, { createContext, useContext, useState, useEffect } from "react";
import { userServiceApi } from "@/services/userApiService";
import { doctorServiceApi } from "@/services/doctorApiService";

interface User {
  id: string;
  email: string;
  fullName: string;
  isBlocked?: boolean;
  isAdmin?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | undefined;
  profile?: any;
  certificates?: string[]
  profilePhoto?: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  setApi: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [api, setApi] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true);

  const findUser = async (): Promise<User | null> => {
    try {
      const user = await userServiceApi.findOne({ fields: `
          id
          fullName
          email
          isAdmin
          isBlocked
        `});

      console.log('the userrrr in the context: ', user)
      const doctor = await doctorServiceApi.findOne({ fields: `
           id
           fullName
            email
            certificates
            profilePhoto
            status
            profile {
              personal {
                username
                phone
                gender
                country
                state 
                experience
                bio
                specializations
                languages
                registrationNumber
                preferredMode
                profileVisibility
              }
              clinic {
                  name
                  address
                  phoneNumber
                  country
                  workingDays
              }
              consultationSettings {
                  type
                  consultationModes
                  consultationFee
                  duration
                  sessionBufferTime
                  cancellationPolicy
                  inPersonFee
                  videoFee
              } 
            }
        `});
      const foundUser = user?.data?.findUser;
      const foundDoctor = doctor?.data?.findDoctor;
      return foundUser || foundDoctor || null;
    } catch (err) {
      console.error("Error fetching user:", err);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = await findUser();
      setUser(storedUser);
      setIsLoading(false);
    };

    checkAuth();
  }, [api]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, setApi }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
