import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient.js';
import { useAuth } from './AuthContext.jsx';

const OrgContext = createContext(null);

export const OrgProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoadingOrgs(true);
      const res = await axiosClient.get('/orgs');
      // Backend response: { success: true, count, data: [ { organization, role, joinedAt } ] }
      const orgList = res.data || [];
      setOrganizations(orgList);

      if (orgList.length > 0) {
        // Check karo kya pehle se koi saved orgId hai localStorage mein
        const savedOrgId = localStorage.getItem('activeOrgId');
        const matched = orgList.find((item) => item.organization?._id === savedOrgId);

        if (matched) {
          setCurrentOrg(matched.organization);
        } else {
          // Default to first organization
          setCurrentOrg(orgList[0].organization);
          localStorage.setItem('activeOrgId', orgList[0].organization._id);
        }
      } else {
        setCurrentOrg(null);
        localStorage.removeItem('activeOrgId');
      }
    } catch (err) {
      console.error('Failed to fetch orgs:', err.message);
      setOrganizations([]);
      setCurrentOrg(null);
    } finally {
      setLoadingOrgs(false);
    }
  }, []);

  // Jab Auth loading khatam ho jaye aur user authenticated ho, tabhi fetch karo
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchOrganizations();
      } else {
        setOrganizations([]);
        setCurrentOrg(null);
        setLoadingOrgs(false);
      }
    }
  }, [isAuthenticated, authLoading, fetchOrganizations]);

  // Active Org change karne ka clean method
  const switchOrg = (org) => {
    setCurrentOrg(org);
    if (org?._id) {
      localStorage.setItem('activeOrgId', org._id);
    }
  };

  // Naya org create karne ka handler
  const createOrg = async (name) => {
    const res = await axiosClient.post('/orgs', { name });
    const newlyCreatedOrg = res.data;
    
    // Fetch latest list from backend
    await fetchOrganizations();
    switchOrg(newlyCreatedOrg);
    return newlyCreatedOrg;
  };

  return (
    <OrgContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrg: switchOrg,
        loadingOrgs,
        fetchOrganizations,
        createOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};