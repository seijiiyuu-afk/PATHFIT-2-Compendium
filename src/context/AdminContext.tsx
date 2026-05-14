import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  loginAdmin,
  logoutAdmin,
  onAuthChange,
  setupAdminAccount,
  getPublishedStatus,
  publishSite,
  unpublishSite,
  getSiteData,
  saveSiteData,
  getPageContent,
  savePageContent,
  initializeDefaultData,
  type SiteData,
  type PageContent,
} from '@/firebase/services';

interface AdminContextType {
  isAdmin: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  isPublished: boolean;
  siteData: SiteData | null;
  pageContent: PageContent;
  showLoginModal: boolean;
  showAdminPanel: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  toggleAdminPanel: () => void;
  publish: () => Promise<void>;
  unpublish: () => Promise<void>;
  refreshData: () => Promise<void>;
  saveContent: (pageId: string, fieldId: string, value: string) => Promise<void>;
  saveSite: (data: Partial<SiteData>) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [pageContent, setPageContent] = useState<PageContent>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await setupAdminAccount();
      await initializeDefaultData();
      await refreshData();
      setIsLoading(false);
    };
    init();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user: FirebaseUser | null) => {
      if (user) {
        setIsLoggedIn(true);
        setIsAdmin(true);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setShowAdminPanel(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [published, data, content] = await Promise.all([
        getPublishedStatus(),
        getSiteData(),
        getPageContent(),
      ]);
      setIsPublished(published);
      setSiteData(data);
      setPageContent(content);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await loginAdmin(username, password);
      if (user) {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setShowLoginModal(false);
        await refreshData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [refreshData]);

  const logout = useCallback(async () => {
    await logoutAdmin();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowAdminPanel(false);
  }, []);

  const openLoginModal = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const toggleAdminPanel = useCallback(() => {
    setShowAdminPanel(prev => !prev);
  }, []);

  const publish = useCallback(async () => {
    await publishSite();
    setIsPublished(true);
  }, []);

  const unpublish = useCallback(async () => {
    await unpublishSite();
    setIsPublished(false);
  }, []);

  const saveContent = useCallback(async (pageId: string, fieldId: string, value: string) => {
    await savePageContent(pageId, fieldId, value);
    setPageContent(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [fieldId]: value,
      },
    }));
  }, []);

  const saveSite = useCallback(async (data: Partial<SiteData>) => {
    await saveSiteData(data);
    setSiteData(prev => prev ? { ...prev, ...data } : null);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isLoggedIn,
        isLoading,
        isPublished,
        siteData,
        pageContent,
        showLoginModal,
        showAdminPanel,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        toggleAdminPanel,
        publish,
        unpublish,
        refreshData,
        saveContent,
        saveSite,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export default AdminContext;
