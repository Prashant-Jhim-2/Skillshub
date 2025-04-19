import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
 const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENTID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENTSECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        Email: { label: "Email", type: "text" },
        Password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log()
        const Details = {
            Email:credentials.Email,
            Password:credentials.Password
        }
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Login`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(Details)
          })
          const Response = await Request.json()
          console.log(Response)
          if (Response.status == true){
            return {Email:Details.Email,Type:Response.Type,id:Response.id,FullName:Response.FullName,ImgSrc:Response.ImgSrc}
          }
          else{
            return null
          }
        
          
      },
    }),
  ],
  session : {
    strategy: "jwt",    
  },
  
  secret: process.env.NEXTAUTH_SECRET, // Use a secure secret
  callbacks: {
    
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        token.userType = "google";
        console.log(user)
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/EmailID`,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({Email:user.email , FullName:user.name})
        })
        const Response = await Request.json()
        if (Response.status == true){
          token.id = Response.id
          token.FullName = Response.FullName
          token.ImgSrc=Response.ImgSrc
          token.Type=Response.Type
          token.Email = user.Email
        }
      } else if (account?.provider === "credentials") {
        token.userType = "credentials";
        if (user) {
          token.id = user.id;
          token.FullName=user.FullName
          token.ImgSrc=user.ImgSrc
          token.Type=user.Type
          token.Email=user.Email

        }
      }
     
      return token;
    },
    async session({ session, token }) {
      // Add user type to session
      session.user.userType = token.userType;
      session.user.id = token.id; // Attach user ID
      session.user.FullName = token.FullName 
      session.user.ImgSrc = token.ImgSrc
      session.user.Type = token.Type
      session.user.Email = token.Email 
      return session;
    },
  },
});

export { handler as GET, handler as POST };
export const config = { runtime: "edge" };