import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.BETTER_AUTH_SECRET!, // Reuse the existing secret
  cookieName: "lending-os-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return await getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    throw new Error("Unauthorized");
  }
  
  return session;
}

