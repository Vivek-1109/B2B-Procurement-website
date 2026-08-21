import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { AdminUser, Product, Certification, Category, Client } from '../types';
import { loginApi, logoutApi } from '../api/auth';
import {
  fetchProducts,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
} from '../api/products';
import {
  fetchCertifications,
  createCertification as createCertApi,
  deleteCertificationApi,
} from '../api/certifications';
import {
  fetchCategories,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
} from '../api/categories';
import {
  fetchClients,
  fetchClientsAll,
  createClient as createClientApi,
  updateClient as updateClientApi,
  deleteClient as deleteClientApi,
} from '../api/clients';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_CLIENTS,
  INITIAL_CERTIFICATIONS,
} from '../data/initialData';

interface AdminContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  products: Product[];
  certifications: Certification[];
  loadingProducts: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  addCertification: (cert: Omit<Certification, 'id'>) => Promise<void>;
  deleteCertification: (id: string) => Promise<void>;
  categories_list: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  clients_list: Client[];
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  refreshClients: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Initialize with rich seeded dataset from divyanshiaviation.com
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [certifications, setCertifications] = useState<Certification[]>(INITIAL_CERTIFICATIONS);
  const [categories_list, setCategoriesList] = useState<Category[]>(INITIAL_CATEGORIES);
  const [clients_list, setClientsList] = useState<Client[]>(INITIAL_CLIENTS);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const refreshProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await fetchProducts();
      if (data && data.length > 0) {
        setProducts(data);
      }
    } catch (err) {
      console.warn('API unavailable, keeping initial product catalog:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const refreshCertifications = useCallback(async () => {
    try {
      const data = await fetchCertifications();
      if (data && data.length > 0) {
        setCertifications(data);
      }
    } catch (err) {
      console.warn('API unavailable, keeping initial certifications:', err);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      if (data && data.length > 0) {
        setCategoriesList(data);
      }
    } catch (err) {
      console.warn('API unavailable, keeping initial categories:', err);
    }
  }, []);

  const refreshClients = useCallback(async () => {
    try {
      const data = admin ? await fetchClientsAll() : await fetchClients();
      if (data && data.length > 0) {
        setClientsList(data);
      }
    } catch (err) {
      console.warn('API unavailable, keeping initial clients:', err);
    }
  }, [admin]);

  // Load public data on mount
  useEffect(() => {
    refreshProducts();
    refreshCertifications();
    refreshCategories();
    refreshClients();
  }, [refreshProducts, refreshCertifications, refreshCategories, refreshClients]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginApi(email, password);
      const user: AdminUser = {
        email: response.user.email,
        role: response.user.role,
        token: response.token,
      };
      setAdmin(user);
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ email: user.email, role: user.role, token: user.token })
      );
      return true;
    } catch (apiErr) {
      console.error('Login failed:', apiErr);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    setAdmin(null);
    localStorage.removeItem('admin_user');
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const newProduct = await createProductApi(product);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch {
      const fallback: Product = {
        ...product,
        id: 'prod-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProducts(prev => [fallback, ...prev]);
      return fallback;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    try {
      const updated = await updateProductApi(id, data);
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      return updated;
    } catch {
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, ...data } : p))
      );
      const updated = products.find(p => p.id === id);
      return (updated ? { ...updated, ...data } : { ...data, id, createdAt: '' }) as Product;
    }
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await deleteProductApi(id);
    } catch (e) {
      console.warn('Delete product API error, removing locally:', e);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addCertification = useCallback(async (cert: Omit<Certification, 'id'>) => {
    try {
      const newCert = await createCertApi(cert);
      setCertifications(prev => [newCert, ...prev]);
    } catch {
      const fallback: Certification = { ...cert, id: 'cert-' + Date.now() };
      setCertifications(prev => [fallback, ...prev]);
    }
  }, []);

  const deleteCertification = useCallback(async (id: string) => {
    try {
      await deleteCertificationApi(id);
    } catch (e) {
      console.warn('Delete certification API error:', e);
    }
    setCertifications(prev => prev.filter(c => c.id !== id));
  }, []);

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try {
      const newCat = await createCategoryApi(category);
      setCategoriesList(prev => [newCat, ...prev]);
      return newCat;
    } catch {
      const fallback: Category = { ...category, id: 'cat-' + Date.now() };
      setCategoriesList(prev => [fallback, ...prev]);
      return fallback;
    }
  }, []);

  const updateCategoryFn = useCallback(async (id: string, data: Partial<Category>) => {
    try {
      const updated = await updateCategoryApi(id, data);
      setCategoriesList(prev => prev.map(c => (c.id === id ? updated : c)));
      return updated;
    } catch {
      setCategoriesList(prev =>
        prev.map(c => (c.id === id ? { ...c, ...data } : c))
      );
      const updated = categories_list.find(c => c.id === id);
      return (updated ? { ...updated, ...data } : { ...data, id }) as Category;
    }
  }, [categories_list]);

  const deleteCategoryFn = useCallback(async (id: string) => {
    try {
      await deleteCategoryApi(id);
    } catch (e) {
      console.warn('Delete category API error:', e);
    }
    setCategoriesList(prev => prev.filter(c => c.id !== id));
  }, []);

  const addClient = useCallback(async (client: Omit<Client, 'id'>) => {
    try {
      const newClient = await createClientApi(client);
      setClientsList(prev => [newClient, ...prev]);
      return newClient;
    } catch {
      const fallback: Client = { ...client, id: 'client-' + Date.now() };
      setClientsList(prev => [fallback, ...prev]);
      return fallback;
    }
  }, []);

  const updateClientFn = useCallback(async (id: string, data: Partial<Client>) => {
    try {
      const updated = await updateClientApi(id, data);
      setClientsList(prev => prev.map(c => (c.id === id ? updated : c)));
      return updated;
    } catch {
      setClientsList(prev =>
        prev.map(c => (c.id === id ? { ...c, ...data } : c))
      );
      const updated = clients_list.find(c => c.id === id);
      return (updated ? { ...updated, ...data } : { ...data, id }) as Client;
    }
  }, [clients_list]);

  const deleteClientFn = useCallback(async (id: string) => {
    try {
      await deleteClientApi(id);
    } catch (e) {
      console.warn('Delete client API error:', e);
    }
    setClientsList(prev => prev.filter(c => c.id !== id));
  }, []);

  const contextValue = useMemo(
    () => ({
      admin,
      isAuthenticated: !!admin,
      login,
      logout,
      products,
      certifications,
      loadingProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshProducts,
      addCertification,
      deleteCertification,
      categories_list,
      addCategory,
      updateCategory: updateCategoryFn,
      deleteCategory: deleteCategoryFn,
      refreshCategories,
      clients_list,
      addClient,
      updateClient: updateClientFn,
      deleteClient: deleteClientFn,
      refreshClients,
    }),
    [
      admin,
      products,
      certifications,
      loadingProducts,
      login,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshProducts,
      addCertification,
      deleteCertification,
      categories_list,
      addCategory,
      updateCategoryFn,
      deleteCategoryFn,
      refreshCategories,
      clients_list,
      addClient,
      updateClientFn,
      deleteClientFn,
      refreshClients,
    ]
  );

  return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
