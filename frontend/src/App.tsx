import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { CartProvider } from './cart/CartContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import LiveSportBackground from './components/LiveSportBackground';
import LoginPage from './pages/Login';
import CatalogPage from './pages/Catalog';
import ProductDetailsPage from './pages/ProductDetails';
import CartPage from './pages/Cart';
import OrdersPage from './pages/Orders';
import AccountPage from './pages/Account';
import ConfirmationPage from './pages/Confirmation';

export default function App() {
  return (
    <BrowserRouter>
      <LiveSportBackground />
      <AuthProvider>
        <CartProvider>
          <Header />
          <main className="container">
            <Routes>
              {/* public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<CatalogPage />} />
              <Route path="/products/:id" element={<ProductDetailsPage />} />

              {/* signed-in only */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/confirmation/:orderId" element={<ConfirmationPage />} />
              </Route>

              <Route
                path="*"
                element={
                  <EmptyState title="Page not found">
                    <Link to="/" className="btn btn-primary">
                      Go to shop
                    </Link>
                  </EmptyState>
                }
              />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
