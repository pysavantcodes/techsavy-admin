import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Dashboard } from "./pages/dashboard";
import { Products } from "./pages/products";
import { AddProduct } from "./pages/add-product";
import { Orders } from "./pages/orders";
import { Customers } from "./pages/customers";
import { Reviews } from "./pages/reviews";
import { Login } from "./pages/auth/login";
import { Register } from "./pages/auth/register";
import { Layout } from "./components/layout";
import { Ads } from "./pages/ads";
import { Settings } from "./pages/settings";
import { AuthProvider } from "./context/auth-context";
import { Toaster } from "sonner";
import { ProductDetails } from "./pages/products/product-details";
import { OrderDetails } from "./pages/orders/order-details";
import { EditProduct } from "./pages/products/edit-product";
import { NewsletterSubscribers } from "./pages/newsletter-subscribers";
import { Categories } from "./pages/categories";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reviews" element={<Reviews />} />
            <Route
              path="newsletter-subscribers"
              element={<NewsletterSubscribers />}
            />
            <Route path="categories" element={<Categories />} />
            <Route path="ads" element={<Ads />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
