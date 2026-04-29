export const metadata = {
  title: "ARC DApp",
  description: "ARC Hackathon Demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
