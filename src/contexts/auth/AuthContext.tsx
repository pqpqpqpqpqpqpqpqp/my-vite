import { createContext } from "react";
import type { AuthContextType } from "../../types/login";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);