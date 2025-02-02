import Credentials from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from '@/db';
import { response } from 'express';

export const authOptions = {
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: {label: "Email", type: "email"},
                password: {label: "Password", type: "password"}
            },
            async authorize(credentials){
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }
                
                const user = await prisma.user.findUnique({
                    where: {email: credentials.email}
                })

                if(!user){
                    const hashedPassword = await bcrypt.hash(credentials.password,10);
                    const user = await prisma.user.create({
                        data: {
                            email: credentials.email,
                            password: hashedPassword,
                            name: credentials.email.split('@')[0] || null
                        }
                    })
                }else{
                    const isValid = await bcrypt.compare(credentials.password,user.password)
                    if(!isValid){
                        throw new Error("Invalid password")
                    }
                }

                return {id: user.id, email: user.email, name: user.name}
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
    ],
    secret: process.env.AUTH_SECRET || "secret",
    callbacks: {
        async session({token,session}){
            session.user.id = token.sub
            session.user.email = token.email
            return session
        },
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {

                const existingUser = await prisma.user.findUnique({
                    where: { email: profile.email }
                });

                if (!existingUser) {
                    
                    await prisma.user.create({
                        data: {
                            email: profile.email,
                            name: profile.name || profile.email.split('@')[0],
                            password: null
                        }
                    });
                }
            }
            return true;
        }
    }
}