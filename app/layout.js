export const metadata = {
  title: 'Apex Innovate AI Academy',
  description: 'Learn AI step by step'
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header className="header">
          <h1>AI Academy</h1>
        </header>
        {children}
      </body>
    </html>
  );
}