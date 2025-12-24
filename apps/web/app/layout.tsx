import { GoogleOAuthProvider } from "@react-oauth/google"
import "./globals.css";


export default function RootLayout({ children }: Readonly<{children: React.ReactNode;}>) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID! // ! is not null assertion operator

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </GoogleOAuthProvider>
  );
}
