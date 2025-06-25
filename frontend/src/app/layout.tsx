import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import BootstrapClient from '@/components/BootStrapClient';

export const metadata: Metadata = {
  title: 'RaceParts - Premium Racing Components',
  description: 'Your one-stop shop for high-quality racing parts and accessories',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-vh-100">
              {children}
            </main>
            <footer className="bg-dark text-light py-4 mt-5">
              <div className="container">
                <div className="row">
                  <div className="col-md-6">
                    <h5>🏎️ RaceParts</h5>
                    <p className="mb-0">Premium racing components for enthusiasts</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <p className="mb-0">© 2025 RaceParts. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </footer>
            <BootstrapClient />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}