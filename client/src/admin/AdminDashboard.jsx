import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Users,
  Scissors,
  Image as ImageIcon,
  Star,
  MessageSquare,
  Phone,
  PhoneCall,
  Globe,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Edit3,
  Save,
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  LogOut,
  ExternalLink,
  Eye,
  RefreshCw,
  FileDown,
  Send,
  History,
  Tag,
  IndianRupee,
  Check,
  Copy,
  MapPin,
  Mail,
  Layers,
  Sparkles,
  SlidersHorizontal,
  ArrowLeft,
  MoreVertical,
  Lock,
  User,
  Menu,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart3,
  CheckSquare,
  Square
} from 'lucide-react';
import { adminFetch } from '../lib/api';
import { bookingTemplates, clientGreetingMessage, leadFollowUpMessage, openWhatsApp, waLink } from '../lib/whatsapp';
import DashboardOverview from './DashboardOverview';
import CustomerProfile from './CustomerProfile';

// Today's date in the browser's timezone (toISOString() would give the UTC date)
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function AdminDashboard({ onLogout, onBackToSite, whatsappNumber = '919999999999' }) {
  // Navigation active tab: overview, leads, bookings, customers, services, media, reviews
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('nilavi_sidebar_collapsed') === 'true';
  });

  // Dedicated Record Detail View State (URL synced: ?tab=X&id=Y)
  const [selectedRecord, setSelectedRecord] = useState(null); // { type: 'booking'|'lead'|'customer'|'service'|'review', id, data }

  // Dashboard period ('7' | '30' | '90' | 'all') and the analytics the server calculates for it
  const [dashboardRange, setDashboardRange] = useState('30');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  // Small status message shown at the bottom of the screen
  const [toast, setToast] = useState(null);
  const notify = (message, kind = 'success') => {
    setToast({ message, kind, id: Date.now() });
  };
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Custom Professional Delete Confirmation Dialog (replaces window.confirm)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Topbar dropdown states
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // CRM State
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalInquiries: 0,
    newInquiries: 0,
    totalCustomers: 0
  });

  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    logoText: 'Nilavi',
    logoImageUrl: '',
    heroTagline: 'Aesthetics and beauty studio, Chennai',
    heroTitle: 'Soft light for skin, hair and nails.',
    heroSubtitle: 'Gentle, personalized and unhurried treatments planned around your skin, hair care, makeup, and wellness goals.',
    heroImageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
    servicesImages: {
      facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
      hair: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=80',
      nails: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=80',
      bridal: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      wax: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80'
    },
    galleryImages: [
      {
        id: 1,
        cat: 'bridal',
        title: 'Bridal glow',
        subtitle: 'Makeup and skin prep',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 2,
        cat: 'skin',
        title: 'Hydra glow facial',
        subtitle: 'Skin care',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 3,
        cat: 'hair',
        title: 'Colour melt & styling',
        subtitle: 'Hair care',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 4,
        cat: 'nails',
        title: 'Gold fleck gel set',
        subtitle: 'Nail artistry',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 5,
        cat: 'hair',
        title: 'Keratin smoothing & spa',
        subtitle: 'Hair care',
        image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 6,
        cat: 'skin',
        title: 'Brightening botanical facial',
        subtitle: 'Skin care',
        image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 7,
        cat: 'nails',
        title: 'Luxury french manicure',
        subtitle: 'Nail artistry',
        image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 8,
        cat: 'bridal',
        title: 'Reception makeup & draping',
        subtitle: 'Bridal artistry',
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80'
      }
    ]
  });

  // Global search & filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [leadSourceFilter, setLeadSourceFilter] = useState('all'); // all, whatsapp, website, phone
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');

  // Sorting & Pagination States
  // Leads
  const [leadSortField, setLeadSortField] = useState('name');
  const [leadSortDir, setLeadSortDir] = useState('asc');
  const [leadPage, setLeadPage] = useState(1);
  const [leadPageSize, setLeadPageSize] = useState(10);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // Bookings
  const [bookingSortField, setBookingSortField] = useState('date');
  const [bookingSortDir, setBookingSortDir] = useState('desc');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);

  // Customers
  const [customerSortField, setCustomerSortField] = useState('totalSpent');
  const [customerSortDir, setCustomerSortDir] = useState('desc');
  const [customerPage, setCustomerPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(10);

  // Modals & Drawers
  const [selectedLead, setSelectedLead] = useState(null); // Detailed lead view drawer
  const [newLeadNote, setNewLeadNote] = useState('');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [showNewReviewModal, setShowNewReviewModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [waModalBooking, setWaModalBooking] = useState(null);
  const [mediaSavedSuccess, setMediaSavedSuccess] = useState(false);

  // Forms
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'whatsapp',
    topic: 'Signature Facial',
    message: ''
  });

  const [newBooking, setNewBooking] = useState({
    customerName: '',
    customerPhone: '',
    serviceName: 'Signature Facial',
    servicePrice: 1800,
    date: todayLocal(),
    timeSlot: '11:00 AM',
    notes: '',
    status: 'confirmed'
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    tags: 'Regular',
    notes: ''
  });

  const [newService, setNewService] = useState({
    name: '',
    category: 'skin',
    dur: '60 min',
    price: 1500,
    description: ''
  });

  const [newReview, setNewReview] = useState({
    name: '',
    service: 'Signature Facial',
    stars: 5,
    quote: '',
    featured: false
  });

  // Fetch all CRM data
  const fetchData = async () => {
    try {
      const [resStats, resBookings, resInquiries, resCustomers, resServices, resReviews, resSettings] = await Promise.all([
        adminFetch('/api/crm/stats').then(r => r.json()).catch(() => ({})),
        adminFetch('/api/bookings').then(r => r.json()).catch(() => ({})),
        adminFetch('/api/inquiries').then(r => r.json()).catch(() => ({})),
        adminFetch('/api/crm/customers').then(r => r.json()).catch(() => ({})),
        adminFetch('/api/services').then(r => r.json()).catch(() => ({})),
        adminFetch('/api/reviews?all=true').then(r => r.json()).catch(() => ({})),
        adminFetch('/api/settings').then(r => r.json()).catch(() => ({}))
      ]);

      if (resStats?.data) setStats(resStats.data);
      if (resBookings?.data) setBookings(resBookings.data);
      if (resInquiries?.data) setInquiries(resInquiries.data);
      if (resCustomers?.data) setCustomers(resCustomers.data);
      if (resServices?.data) setServices(resServices.data);
      if (resReviews?.data) setReviews(resReviews.data);
      if (resSettings?.data) {
        setSiteSettings(prev => ({
          ...prev,
          ...resSettings.data,
          servicesImages: {
            ...prev.servicesImages,
            ...(resSettings.data.servicesImages || {})
          },
          galleryImages: resSettings.data.galleryImages?.length
            ? resSettings.data.galleryImages
            : prev.galleryImages
        }));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const loadAnalytics = async (range = dashboardRange) => {
    setAnalyticsLoading(true);
    try {
      const res = await adminFetch(`/api/crm/analytics?range=${range}`);
      const out = await res.json();
      if (out.success) {
        setAnalytics(out.data);
        setAnalyticsError('');
      } else {
        setAnalyticsError(out.message || 'Could not load dashboard figures.');
      }
    } catch {
      setAnalyticsError('Could not reach the studio server.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Recalculate whenever the period changes or the underlying records are reloaded
  useEffect(() => {
    loadAnalytics(dashboardRange);
  }, [dashboardRange, bookings, inquiries, customers]);

  const openTabFromDashboard = (tab, opts = {}) => {
    switchTab(tab);
    if (tab === 'bookings') {
      setBookingFilter(opts.filter || 'all');
      setBookingSearch(opts.search || '');
    }
    if (tab === 'leads') setLeadStatusFilter(opts.status || 'all');
  };

  // Sidebar toggle with localStorage persistence
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('nilavi_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Custom Delete Confirmation Modal Invoker
  const requestDelete = (title, message, confirmFn) => {
    setDeleteDialog({
      isOpen: true,
      title,
      message,
      onConfirm: confirmFn
    });
  };

  // Dedicated Record Detail View URL synchronization (?tab=X&id=Y)
  const openRecordDetail = (type, item) => {
    if (!item) return;
    setSelectedRecord({ type, id: item.id, data: item });
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    params.set('id', item.id);
    window.history.pushState({}, '', `?${params.toString()}`);
  };

  const closeRecordDetail = () => {
    setSelectedRecord(null);
    const params = new URLSearchParams(window.location.search);
    params.delete('id');
    const qs = params.toString();
    window.history.pushState({}, '', qs ? `?${qs}` : window.location.pathname);
  };

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setSelectedRecord(null);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tabName);
    params.delete('id');
    window.history.pushState({}, '', `?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  // Sync state on URL popstate or initial load
  useEffect(() => {
    const handleUrlSync = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const idParam = params.get('id');

      if (tabParam && ['overview', 'leads', 'bookings', 'customers', 'services', 'media', 'reviews'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      if (idParam) {
        const foundLead = inquiries.find(l => String(l.id) === String(idParam));
        if (foundLead) { setSelectedRecord({ type: 'lead', id: idParam, data: foundLead }); return; }
        const foundBooking = bookings.find(b => String(b.id) === String(idParam));
        if (foundBooking) { setSelectedRecord({ type: 'booking', id: idParam, data: foundBooking }); return; }
        const foundCust = customers.find(c => String(c.id) === String(idParam));
        if (foundCust) { setSelectedRecord({ type: 'customer', id: idParam, data: foundCust }); return; }
        const foundSvc = services.find(s => String(s.id) === String(idParam));
        if (foundSvc) { setSelectedRecord({ type: 'service', id: idParam, data: foundSvc }); return; }
        const foundRev = reviews.find(r => String(r.id) === String(idParam));
        if (foundRev) { setSelectedRecord({ type: 'review', id: idParam, data: foundRev }); return; }
      } else {
        setSelectedRecord(null);
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, [inquiries, bookings, customers, services, reviews]);

  // Global Escape key dismisses modals and detail views
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deleteDialog.isOpen) setDeleteDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        else if (selectedRecord) closeRecordDetail();
        else if (selectedLead) setSelectedLead(null);
        else if (showNewLeadModal) setShowNewLeadModal(false);
        else if (showNewBookingModal) setShowNewBookingModal(false);
        else if (showNewCustomerModal) setShowNewCustomerModal(false);
        else if (showNewServiceModal) setShowNewServiceModal(false);
        else if (showNewReviewModal) setShowNewReviewModal(false);
        else if (editingBooking) setEditingBooking(null);
        else if (editingService) setEditingService(null);
        else if (waModalBooking) setWaModalBooking(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteDialog, selectedRecord, selectedLead, showNewLeadModal, showNewBookingModal, showNewCustomerModal, showNewServiceModal, showNewReviewModal, editingBooking, editingService, waModalBooking]);

  // Save Settings
  const handleSaveSiteSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await adminFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      const data = await res.json();
      if (data.success) {
        setMediaSavedSuccess(true);
        setTimeout(() => setMediaSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Helper: File Upload with Base64 FileReader
  const handleFileUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      callback(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Status Change for Leads
  const handleUpdateLeadStatus = async (id, newStatus) => {
    try {
      const res = await adminFetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        if (selectedLead?.id === id) {
          setSelectedLead(data.data);
        }
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Add History entry to Lead
  const handleAddLeadHistory = async (id) => {
    if (!newLeadNote.trim()) return;
    try {
      const res = await adminFetch(`/api/inquiries/${id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'Staff Note',
          note: newLeadNote,
          author: 'Studio Manager'
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewLeadNote('');
        fetchData();
        if (selectedLead?.id === id) {
          setSelectedLead(data.data);
        }
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Convert Lead to Booking
  const handleConvertLeadToBooking = (lead) => {
    setNewBooking({
      customerName: lead.name,
      customerPhone: lead.phone || '',
      serviceName: lead.topic || 'Signature Facial',
      servicePrice: 1800,
      date: todayLocal(),
      timeSlot: '11:00 AM',
      notes: `Converted from lead: ${lead.message || ''}`,
      status: 'confirmed'
    });
    setShowNewBookingModal(true);
    setSelectedLead(null);
  };

  // Delete Lead
  const handleDeleteLead = (id) => {
    requestDelete('Delete Lead Inquiry?', 'This action cannot be undone. Are you sure you want to permanently delete this lead inquiry?', async () => {
      try {
        const res = await adminFetch(`/api/inquiries/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          if (selectedLead?.id === id) setSelectedLead(null);
          if (selectedRecord?.id === id) closeRecordDetail();
          fetchData();
        }
      } catch (err) {
        console.error(err);
        notify('Could not reach the studio server.', 'error');
      }
    });
  };

  // Create Manual / WhatsApp Lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowNewLeadModal(false);
        setNewLeadForm({
          name: '',
          phone: '',
          email: '',
          source: 'whatsapp',
          topic: 'Signature Facial',
          message: ''
        });
        fetchData();
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      const res = await adminFetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Save Edited Booking
  const handleSaveEditedBooking = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      const res = await adminFetch(`/api/bookings/${editingBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBooking)
      });
      const data = await res.json();
      if (data.success) {
        setEditingBooking(null);
        fetchData();
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Delete Booking
  const handleDeleteBooking = (id) => {
    requestDelete('Delete Appointment?', 'This action cannot be undone. Are you sure you want to permanently delete this appointment record?', async () => {
      try {
        const res = await adminFetch(`/api/bookings/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          if (selectedRecord?.id === id) closeRecordDetail();
          fetchData();
        }
      } catch (err) {
        console.error(err);
        notify('Could not reach the studio server.', 'error');
      }
    });
  };

  // Create Direct Booking (Walk-in / Phone)
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      const data = await res.json();
      if (data.success) {
        setShowNewBookingModal(false);
        setNewBooking({
          customerName: '',
          customerPhone: '',
          serviceName: 'Signature Facial',
          servicePrice: 1800,
          date: todayLocal(),
          timeSlot: '11:00 AM',
          notes: '',
          status: 'confirmed'
        });
        fetchData();
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Create Customer Profile
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCustomer,
        tags: newCustomer.tags ? newCustomer.tags.split(',').map(t => t.trim()) : ['Regular']
      };
      const res = await adminFetch('/api/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowNewCustomerModal(false);
        setNewCustomer({ name: '', phone: '', email: '', tags: 'Regular', notes: '' });
        fetchData();
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Delete Customer Profile (their bookings are kept)
  const handleDeleteCustomer = (cust) => {
    requestDelete('Delete Client Profile?', `This removes ${cust.name} from the client directory. Their appointments are kept. This cannot be undone.`, async () => {
      try {
        const res = await adminFetch(`/api/crm/customers/${cust.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          if (selectedRecord?.id === cust.id) closeRecordDetail();
          notify('Client profile deleted.');
          fetchData();
        } else {
          notify(data.message || 'That client could not be deleted.', 'error');
        }
      } catch (err) {
        console.error(err);
        notify('Could not reach the studio server.', 'error');
      }
    });
  };

  // Create Service
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      const data = await res.json();
      if (data.success) {
        setShowNewServiceModal(false);
        setNewService({ name: '', category: 'skin', dur: '60 min', price: 1500, description: '' });
        fetchData();
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Save Edited Service
  const handleSaveEditedService = async (e) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      const res = await adminFetch(`/api/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });
      const data = await res.json();
      if (data.success) {
        setEditingService(null);
        fetchData();
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Delete Service
  const handleDeleteService = (id) => {
    requestDelete('Delete Treatment Service?', 'Are you sure you want to remove this treatment from your service menu?', async () => {
      try {
        const res = await adminFetch(`/api/services/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          if (selectedRecord?.id === id) closeRecordDetail();
          fetchData();
        }
      } catch (err) {
        console.error(err);
        notify('Could not reach the studio server.', 'error');
      }
    });
  };

  // Create Review
  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      const data = await res.json();
      if (data.success) {
        setShowNewReviewModal(false);
        setNewReview({ name: '', service: 'Signature Facial', stars: 5, quote: '', featured: false });
        fetchData();
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Toggle Review
  const handleToggleReview = async (id, updates) => {
    try {
      const res = await adminFetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        notify(data.message || 'That change could not be saved.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Could not reach the studio server.', 'error');
    }
  };

  // Delete Review
  const handleDeleteReview = (id) => {
    requestDelete('Delete Client Review?', 'Are you sure you want to permanently delete this testimonial?', async () => {
      try {
        const res = await adminFetch(`/api/reviews/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          if (selectedRecord?.id === id) closeRecordDetail();
          fetchData();
        }
      } catch (err) {
        console.error(err);
        notify('Could not reach the studio server.', 'error');
      }
    });
  };

  // CSV Export utility
  const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]).filter(k => k !== 'history');
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Array ? cell.join('; ') : cell.toString();
          cell = cell.replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}-${todayLocal()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp template launcher: opens the chat with the chosen message and records that it was sent
  const launchWhatsAppMessage = (booking, type = 'confirmation') => {
    const template = bookingTemplates[type] || bookingTemplates.confirmation;
    openWhatsApp(booking.customerPhone, template.build(booking));
    if (booking.id && !booking.whatsappSent) {
      adminFetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappSent: true })
      }).then(() => fetchData()).catch(() => {});
    }
    setWaModalBooking(null);
  };

  const fmtCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  // Quick stats counts
  const whatsappLeadsCount = inquiries.filter(i => i.source === 'whatsapp').length;
  const websiteLeadsCount = inquiries.filter(i => (i.source === 'website' || !i.source)).length;
  const phoneLeadsCount = inquiries.filter(i => i.source === 'phone' || i.source === 'walk-in').length;

  const todayStr = todayLocal();
  const todayAppointments = bookings.filter(b => b.date === todayStr);

  // Sorting generic helper
  const sortComparator = (a, b, field, dir) => {
    let valA = a[field] ?? '';
    let valB = b[field] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return dir === 'asc' ? -1 : 1;
    if (valA > valB) return dir === 'asc' ? 1 : -1;
    return 0;
  };

  // Filtered & Sorted Leads
  const processedLeads = useMemo(() => {
    const q = (leadSearch || globalSearch).toLowerCase();
    let res = inquiries.filter(lead => {
      if (leadSourceFilter !== 'all' && (lead.source || 'website') !== leadSourceFilter) return false;
      if (leadStatusFilter !== 'all' && (lead.status || 'new') !== leadStatusFilter) return false;
      if (q) {
        const matchName = (lead.name || '').toLowerCase().includes(q);
        const matchPhone = (lead.phone || '').toLowerCase().includes(q);
        const matchEmail = (lead.email || '').toLowerCase().includes(q);
        const matchTopic = (lead.topic || '').toLowerCase().includes(q);
        const matchMsg = (lead.message || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchEmail || matchTopic || matchMsg;
      }
      return true;
    });

    res.sort((a, b) => sortComparator(a, b, leadSortField, leadSortDir));
    return res;
  }, [inquiries, leadSourceFilter, leadStatusFilter, leadSearch, globalSearch, leadSortField, leadSortDir]);

  // Paginated Leads
  const paginatedLeads = useMemo(() => {
    const start = (leadPage - 1) * leadPageSize;
    return processedLeads.slice(start, start + leadPageSize);
  }, [processedLeads, leadPage, leadPageSize]);
  const totalLeadPages = Math.ceil(processedLeads.length / leadPageSize) || 1;

  // Filtered & Sorted Bookings
  const processedBookings = useMemo(() => {
    const q = (bookingSearch || globalSearch).toLowerCase();
    let res = bookings.filter(b => {
      if (bookingFilter !== 'all' && b.status !== bookingFilter) return false;
      if (q) {
        const matchName = (b.customerName || '').toLowerCase().includes(q);
        const matchPhone = (b.customerPhone || '').toLowerCase().includes(q);
        const matchSvc = (b.serviceName || '').toLowerCase().includes(q);
        const matchDate = (b.date || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchSvc || matchDate;
      }
      return true;
    });

    res.sort((a, b) => sortComparator(a, b, bookingSortField, bookingSortDir));
    return res;
  }, [bookings, bookingFilter, bookingSearch, globalSearch, bookingSortField, bookingSortDir]);

  // Paginated Bookings
  const paginatedBookings = useMemo(() => {
    const start = (bookingPage - 1) * bookingPageSize;
    return processedBookings.slice(start, start + bookingPageSize);
  }, [processedBookings, bookingPage, bookingPageSize]);
  const totalBookingPages = Math.ceil(processedBookings.length / bookingPageSize) || 1;

  // Filtered & Sorted Customers
  const processedCustomers = useMemo(() => {
    const q = (customerSearch || globalSearch).toLowerCase();
    let res = customers.filter(c => {
      if (q) {
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchEmail;
      }
      return true;
    });

    res.sort((a, b) => sortComparator(a, b, customerSortField, customerSortDir));
    return res;
  }, [customers, customerSearch, globalSearch, customerSortField, customerSortDir]);

  const paginatedCustomers = useMemo(() => {
    const start = (customerPage - 1) * customerPageSize;
    return processedCustomers.slice(start, start + customerPageSize);
  }, [processedCustomers, customerPage, customerPageSize]);
  const totalCustomerPages = Math.ceil(processedCustomers.length / customerPageSize) || 1;

  // Filtered Services
  const filteredServices = services.filter(s => {
    if (serviceCategoryFilter === 'all') return true;
    return (s.category || '').toLowerCase() === serviceCategoryFilter.toLowerCase();
  });

  // Table Sort Header Helper
  const renderSortableTh = (label, field, currentField, currentDir, setField, setDir) => {
    const isActive = currentField === field;
    const handleSort = () => {
      if (isActive) {
        setDir(currentDir === 'asc' ? 'desc' : 'asc');
      } else {
        setField(field);
        setDir('asc');
      }
    };
    return (
      <th className="sortable" onClick={handleSort}>
        <span className="pro-th-content">
          <span>{label}</span>
          {isActive ? (
            currentDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          ) : (
            <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
          )}
        </span>
      </th>
    );
  };

  // Reusable Pagination UI Helper
  const renderPaginationControls = (currentPage, totalPages, totalCount, pageSize, setPage, setPageSize) => {
    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
      <div className="pro-table-pagination">
        <div className="pro-pagination-info">
          <span>Showing <b>{startItem}</b> to <b>{endItem}</b> of <b>{totalCount}</b> entries</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 16 }}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="pro-per-page-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="pro-pagination-controls">
          <button
            className="pro-page-btn"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(pageNum => (
            <button
              key={pageNum}
              className={`pro-page-btn ${pageNum === currentPage ? 'active' : ''}`}
              onClick={() => setPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button
            className="pro-page-btn"
            disabled={currentPage >= totalPages || totalPages === 0}
            onClick={() => setPage(currentPage + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // Quick Action Handler from Topbar
  const handlePrimaryQuickAction = () => {
    if (activeTab === 'leads') setShowNewLeadModal(true);
    else if (activeTab === 'bookings' || activeTab === 'overview') setShowNewBookingModal(true);
    else if (activeTab === 'customers') setShowNewCustomerModal(true);
    else if (activeTab === 'services') setShowNewServiceModal(true);
    else if (activeTab === 'reviews') setShowNewReviewModal(true);
    else if (activeTab === 'media') handleSaveSiteSettings();
  };

  // Detailed Full Record View Renderer (SaaS pattern with URL sync & back button)
  const renderRecordDetail = () => {
    if (!selectedRecord) return null;
    const { type, id, data } = selectedRecord;
    if (!data) return null;

    if (type === 'booking') {
      const isConfirmed = data.status === 'confirmed';
      const isCompleted = data.status === 'completed';
      const isPending = data.status === 'pending';
      const isCancelled = data.status === 'cancelled';

      return (
        <div className="record-detail-view">
          <div className="record-detail-header-card">
            <div>
              <button className="record-detail-back-btn" onClick={closeRecordDetail}>
                <ArrowLeft size={14} />
                <span>Back to Appointments</span>
              </button>
              <div className="record-detail-title-block">
                <h2>
                  <span>{data.customerName}</span>
                  <span className={`pro-status-badge ${data.status || 'pending'}`}>{data.status}</span>
                </h2>
                <div className="record-detail-meta">
                  <span><b>Booking ID:</b> #{data.id}</span>
                  <span>·</span>
                  <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{data.date} at {data.timeSlot}</span>
                  <span>·</span>
                  <span>Created {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recent'}</span>
                </div>
              </div>
            </div>

            <div className="record-detail-actions">
              {isPending && (
                <button
                  className="pro-btn pro-btn-primary pro-btn-sm"
                  onClick={() => {
                    handleUpdateBookingStatus(data.id, 'confirmed');
                    setSelectedRecord(prev => ({ ...prev, data: { ...prev.data, status: 'confirmed' } }));
                  }}
                >
                  <Check size={14} />
                  <span>Confirm Appointment</span>
                </button>
              )}
              {isConfirmed && (
                <button
                  className="pro-btn pro-btn-gold pro-btn-sm"
                  onClick={() => {
                    handleUpdateBookingStatus(data.id, 'completed');
                    setSelectedRecord(prev => ({ ...prev, data: { ...prev.data, status: 'completed' } }));
                  }}
                >
                  <CheckCircle size={14} />
                  <span>Mark Completed</span>
                </button>
              )}
              {!isCancelled && (
                <button
                  className="pro-btn pro-btn-secondary pro-btn-sm"
                  onClick={() => {
                    handleUpdateBookingStatus(data.id, 'cancelled');
                    setSelectedRecord(prev => ({ ...prev, data: { ...prev.data, status: 'cancelled' } }));
                  }}
                >
                  <X size={14} />
                  <span>Cancel Slot</span>
                </button>
              )}
              {data.customerPhone && (
                <button
                  className="pro-btn-action wa"
                  style={{ height: 34, padding: '0 12px' }}
                  onClick={() => setWaModalBooking(data)}
                >
                  <MessageSquare size={14} />
                  <span>WhatsApp Outreach</span>
                </button>
              )}
              <button
                className="pro-btn-action delete"
                style={{ height: 34, padding: '0 12px' }}
                onClick={() => handleDeleteBooking(data.id)}
                title="Delete Appointment"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="record-detail-layout">
            <div>
              {/* Treatment Information Card */}
              <div className="record-field-card">
                <div className="record-field-card-title">
                  <Scissors size={16} style={{ color: 'var(--adm-primary)' }} />
                  <span>Treatment Reservation Details</span>
                </div>
                <div className="record-keyvalue-grid">
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Treatment Service</span>
                    <span className="record-keyvalue-val">{data.serviceName}</span>
                  </div>
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Treatment Fee</span>
                    <span className="record-keyvalue-val" style={{ color: 'var(--adm-primary)', fontWeight: 700 }}>
                      {fmtCurrency(data.servicePrice)}
                    </span>
                  </div>
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Appointment Date</span>
                    <span className="record-keyvalue-val">{data.date}</span>
                  </div>
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Time Slot</span>
                    <span className="record-keyvalue-val">{data.timeSlot}</span>
                  </div>
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Status</span>
                    <span className="record-keyvalue-val" style={{ textTransform: 'capitalize' }}>{data.status}</span>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--adm-border-subtle)' }}>
                  <span className="record-keyvalue-label" style={{ display: 'block', marginBottom: 6 }}>Client Special Notes &amp; Requests</span>
                  <div style={{ padding: 12, background: 'var(--adm-surface-alt)', borderRadius: 'var(--adm-radius-md)', border: '1px solid var(--adm-border)', fontSize: '.84rem', color: 'var(--adm-text-primary)' }}>
                    {data.notes || 'No special requests or skin allergies recorded by the client.'}
                  </div>
                </div>
              </div>

              {/* Client Profile Summary Card */}
              <div className="record-field-card">
                <div className="record-field-card-title">
                  <Users size={16} style={{ color: 'var(--adm-primary)' }} />
                  <span>Client Profile</span>
                </div>
                <div className="record-keyvalue-grid">
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Client Name</span>
                    <span className="record-keyvalue-val">{data.customerName}</span>
                  </div>
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Phone Contact</span>
                    <span className="record-keyvalue-val">{data.customerPhone || 'Not provided'}</span>
                  </div>
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Channel Origin</span>
                    <span className="record-keyvalue-val">Website Booking Wizard</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Fast WhatsApp Presets */}
              <div className="record-field-card">
                <div className="record-field-card-title">
                  <MessageSquare size={16} style={{ color: 'var(--adm-accent)' }} />
                  <span>Client Messaging Quick Links</span>
                </div>
                <p style={{ fontSize: '.8rem', color: 'var(--adm-text-secondary)', margin: '0 0 14px' }}>
                  Send pre-composed WhatsApp notices directly to {data.customerName}:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    className="pro-btn pro-btn-secondary pro-btn-sm"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => launchWhatsAppMessage(data, 'confirmation')}
                  >
                    <CheckCircle2 size={13} style={{ color: 'var(--adm-success-text)' }} />
                    <span>Send Booking Confirmation</span>
                  </button>
                  <button
                    className="pro-btn pro-btn-secondary pro-btn-sm"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => launchWhatsAppMessage(data, 'reminder')}
                  >
                    <Clock size={13} style={{ color: 'var(--adm-accent)' }} />
                    <span>Send Day-of Reminder</span>
                  </button>
                  {data.customerPhone && (
                    <a
                      href={`tel:${data.customerPhone}`}
                      className="pro-btn pro-btn-secondary pro-btn-sm"
                      style={{ justifyContent: 'flex-start', textDecoration: 'none' }}
                    >
                      <PhoneCall size={13} style={{ color: 'var(--adm-primary)' }} />
                      <span>Direct Phone Call</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'lead') {
      return (
        <div className="record-detail-view">
          <div className="record-detail-header-card">
            <div>
              <button className="record-detail-back-btn" onClick={closeRecordDetail}>
                <ArrowLeft size={14} />
                <span>Back to Leads</span>
              </button>
              <div className="record-detail-title-block">
                <h2>
                  <span>{data.name}</span>
                  <span className={`pro-source-pill ${data.source || 'website'}`}>
                    {data.source === 'whatsapp' ? <MessageSquare size={11} /> : data.source === 'phone' ? <Phone size={11} /> : <Globe size={11} />}
                    <span style={{ textTransform: 'capitalize' }}>{data.source || 'Website'}</span>
                  </span>
                </h2>
                <div className="record-detail-meta">
                  <span><b>Lead ID:</b> #{data.id}</span>
                  <span>·</span>
                  <span><b>Topic:</b> {data.topic || 'General Inquiry'}</span>
                  <span>·</span>
                  <span>Received {data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Recent'}</span>
                </div>
              </div>
            </div>

            <div className="record-detail-actions">
              <button
                className="pro-btn pro-btn-gold pro-btn-sm"
                onClick={() => handleConvertLeadToBooking(data)}
              >
                <Calendar size={14} />
                <span>Convert to Appointment</span>
              </button>

              <select
                value={data.status || 'new'}
                onChange={(e) => {
                  const newSt = e.target.value;
                  handleUpdateLeadStatus(data.id, newSt);
                  setSelectedRecord(prev => ({ ...prev, data: { ...prev.data, status: newSt } }));
                }}
                className="pro-select"
                style={{ height: 34, fontSize: '.82rem', padding: '0 10px' }}
              >
                <option value="new">Status: New</option>
                <option value="in_progress">Status: In Progress</option>
                <option value="contacted">Status: Contacted</option>
                <option value="closed">Status: Closed / Booked</option>
              </select>

              {data.phone && (
                <button
                  className="pro-btn-action wa"
                  style={{ height: 34, padding: '0 12px' }}
                  onClick={() => {
                    const clean = data.phone.replace(/\D/g, '');
                    const target = clean.length === 10 ? `91${clean}` : clean;
                    window.open(waLink(target, leadFollowUpMessage(data)), '_blank');
                  }}
                >
                  <MessageSquare size={14} />
                  <span>WhatsApp</span>
                </button>
              )}

              <button
                className="pro-btn-action delete"
                style={{ height: 34, padding: '0 12px' }}
                onClick={() => handleDeleteLead(data.id)}
                title="Delete Lead"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="record-detail-layout">
            <div>
              {/* Inquiry Message Card */}
              <div className="record-field-card">
                <div className="record-field-card-title">
                  <Inbox size={16} style={{ color: 'var(--adm-primary)' }} />
                  <span>Inquiry Context &amp; Client Message</span>
                </div>
                <div className="record-keyvalue-grid">
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Inquiry Interest</span>
                    <span className="record-keyvalue-val">{data.topic || 'General Inquiry'}</span>
                  </div>
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Acquisition Channel</span>
                    <span className="record-keyvalue-val" style={{ textTransform: 'capitalize' }}>{data.source || 'Website'}</span>
                  </div>
                  <div className="record-keyvalue-item">
                    <span className="record-keyvalue-label">Current Pipeline Status</span>
                    <span className="record-keyvalue-val" style={{ textTransform: 'capitalize' }}>{(data.status || 'new').replace('_', ' ')}</span>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--adm-border-subtle)' }}>
                  <span className="record-keyvalue-label" style={{ display: 'block', marginBottom: 8 }}>Client's Original Message</span>
                  <div style={{ padding: 14, background: 'var(--adm-surface-alt)', borderRadius: 'var(--adm-radius-md)', border: '1px solid var(--adm-border)', fontStyle: 'italic', fontSize: '.86rem', color: 'var(--adm-text-primary)', lineHeight: 1.5 }}>
                    "{data.message || 'No written message provided with this lead.'}"
                  </div>
                </div>
              </div>

              {/* Activity Timeline & Staff Notes */}
              <div className="record-field-card">
                <div className="record-field-card-title">
                  <History size={16} style={{ color: 'var(--adm-primary)' }} />
                  <span>Staff Activity Timeline &amp; Follow-up History</span>
                </div>

                <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="pro-input"
                    placeholder="Log a note (e.g. Called client, shared bridal brochure on WhatsApp)..."
                    value={newLeadNote}
                    onChange={(e) => setNewLeadNote(e.target.value)}
                    style={{ flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLeadHistory(data.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="pro-btn pro-btn-primary pro-btn-sm"
                    onClick={() => handleAddLeadHistory(data.id)}
                  >
                    <Plus size={14} />
                    <span>Log Note</span>
                  </button>
                </div>

                <div className="record-timeline-list">
                  {(data.history || []).map((h, idx) => (
                    <div key={idx} className="record-timeline-item">
                      <div className="record-timeline-dot" />
                      <div className="record-timeline-text">{h.note || h.action}</div>
                      <div className="record-timeline-time">
                        {h.author || 'Staff'} · {h.timestamp ? new Date(h.timestamp).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  ))}
                  {(!data.history || data.history.length === 0) && (
                    <div style={{ color: 'var(--adm-text-tertiary)', fontSize: '.8rem', fontStyle: 'italic' }}>
                      No staff interactions recorded yet. Log the first follow-up note above.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              {/* Contact Profile Card */}
              <div className="record-field-card">
                <div className="record-field-card-title">
                  <Users size={16} style={{ color: 'var(--adm-accent)' }} />
                  <span>Lead Contact Profile</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <span className="record-keyvalue-label" style={{ display: 'block' }}>Full Name</span>
                    <b style={{ fontSize: '.95rem', color: 'var(--adm-text-primary)' }}>{data.name}</b>
                  </div>
                  {data.phone && (
                    <div>
                      <span className="record-keyvalue-label" style={{ display: 'block' }}>Phone</span>
                      <b style={{ fontSize: '.9rem' }}>{data.phone}</b>
                    </div>
                  )}
                  {data.email && (
                    <div>
                      <span className="record-keyvalue-label" style={{ display: 'block' }}>Email</span>
                      <span style={{ fontSize: '.84rem', color: 'var(--adm-text-secondary)' }}>{data.email}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--adm-border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.phone && (
                    <button
                      className="pro-btn pro-btn-secondary pro-btn-sm"
                      style={{ justifyContent: 'flex-start' }}
                      onClick={() => {
                        const clean = data.phone.replace(/\D/g, '');
                        const target = clean.length === 10 ? `91${clean}` : clean;
                        window.open(waLink(target, clientGreetingMessage(data)), '_blank');
                      }}
                    >
                      <MessageSquare size={13} style={{ color: '#25D366' }} />
                      <span>Open WhatsApp Chat</span>
                    </button>
                  )}
                  {data.phone && (
                    <a
                      href={`tel:${data.phone}`}
                      className="pro-btn pro-btn-secondary pro-btn-sm"
                      style={{ justifyContent: 'flex-start', textDecoration: 'none' }}
                    >
                      <PhoneCall size={13} style={{ color: 'var(--adm-primary)' }} />
                      <span>Call Client Directly</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'customer') {
      return (
        <CustomerProfile
          customer={data}
          onBack={closeRecordDetail}
          onBook={(client) => {
            setNewBooking({
              customerName: client.name,
              customerPhone: client.phone || '',
              serviceName: client.favouriteService || 'Signature Facial',
              servicePrice: 1800,
              date: todayLocal(),
              timeSlot: '11:00 AM',
              notes: '',
              status: 'confirmed'
            });
            setShowNewBookingModal(true);
          }}
          onMessageBooking={(booking) => setWaModalBooking(booking)}
          onChanged={fetchData}
          onDelete={handleDeleteCustomer}
          notify={notify}
        />
      );
    }

    if (type === 'service') {
      return (
        <div className="record-detail-view">
          <div className="record-detail-header-card">
            <div>
              <button className="record-detail-back-btn" onClick={closeRecordDetail}>
                <ArrowLeft size={14} />
                <span>Back to Services</span>
              </button>
              <div className="record-detail-title-block">
                <h2>
                  <span>{data.name}</span>
                  <span className="pro-status-badge in_progress" style={{ textTransform: 'uppercase' }}>{data.category}</span>
                </h2>
                <div className="record-detail-meta">
                  <span><b>Duration:</b> {data.dur}</span>
                  <span>·</span>
                  <span><b>Price:</b> {fmtCurrency(data.price)}</span>
                </div>
              </div>
            </div>

            <div className="record-detail-actions">
              <button
                className="pro-btn pro-btn-gold pro-btn-sm"
                onClick={() => setEditingService({ ...data })}
              >
                <Edit3 size={14} />
                <span>Edit Treatment</span>
              </button>
              <button
                className="pro-btn-action delete"
                style={{ height: 34, padding: '0 12px' }}
                onClick={() => handleDeleteService(data.id)}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="record-field-card">
            <div className="record-field-card-title">
              <Scissors size={16} style={{ color: 'var(--adm-primary)' }} />
              <span>Service Description &amp; Details</span>
            </div>
            <p style={{ fontSize: '.9rem', color: 'var(--adm-text-primary)', lineHeight: 1.6 }}>
              {data.description || 'Gentle, personalized treatment planned around your skincare and beauty goals.'}
            </p>
          </div>
        </div>
      );
    }

    if (type === 'review') {
      return (
        <div className="record-detail-view">
          <div className="record-detail-header-card">
            <div>
              <button className="record-detail-back-btn" onClick={closeRecordDetail}>
                <ArrowLeft size={14} />
                <span>Back to Reviews</span>
              </button>
              <div className="record-detail-title-block">
                <h2>
                  <span>{data.name}</span>
                  <span className={`pro-status-badge ${data.featured ? 'confirmed' : 'pending'}`}>
                    {data.featured ? 'Featured on Webpage' : 'CRM Archive'}
                  </span>
                </h2>
                <div className="record-detail-meta">
                  <span><b>Treatment:</b> {data.service}</span>
                  <span>·</span>
                  <span><b>Rating:</b> {data.stars || 5} Stars</span>
                </div>
              </div>
            </div>

            <div className="record-detail-actions">
              <button
                className={`pro-btn pro-btn-sm ${data.featured ? 'pro-btn-secondary' : 'pro-btn-gold'}`}
                onClick={() => {
                  const nextFeatured = !data.featured;
                  handleToggleReview(data.id, { featured: nextFeatured });
                  setSelectedRecord(prev => ({ ...prev, data: { ...prev.data, featured: nextFeatured } }));
                }}
              >
                <Sparkles size={14} />
                <span>{data.featured ? 'Remove from Homepage' : 'Feature on Homepage'}</span>
              </button>
              <button
                className="pro-btn-action delete"
                style={{ height: 34, padding: '0 12px' }}
                onClick={() => handleDeleteReview(data.id)}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="record-field-card">
            <div className="record-field-card-title">
              <Star size={16} style={{ color: 'var(--adm-accent)' }} />
              <span>Client Review Testimonial</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {Array.from({ length: data.stars || 5 }).map((_, i) => (
                <Star key={i} size={18} fill="#C59B3F" color="#C59B3F" />
              ))}
            </div>
            <blockquote style={{ margin: 0, padding: 18, background: 'var(--adm-surface-alt)', borderLeft: '4px solid var(--adm-accent)', borderRadius: 'var(--adm-radius-md)', fontSize: '.95rem', color: 'var(--adm-text-primary)', fontStyle: 'italic', lineHeight: 1.6 }}>
              “{data.quote}”
            </blockquote>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="pro-admin-layout">
      {/* 1. PROFESSIONAL SIDEBAR NAVIGATION */}
      <aside className={`pro-admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="pro-sidebar-brand">
          {!isSidebarCollapsed ? (
            <>
              <div className="pro-brand-link">
                <div className="pro-brand-crest">
                  <Sparkles size={18} />
                </div>
                <div className="pro-brand-text">
                  <h4>{siteSettings.logoText || 'Nilavi'}</h4>
                  <span>Studio Operations</span>
                </div>
              </div>

              <button
                className="pro-sidebar-toggle-btn"
                onClick={toggleSidebar}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={17} />
              </button>
            </>
          ) : (
            <button
              className="pro-sidebar-toggle-btn"
              onClick={toggleSidebar}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Nav Items */}
        <nav className="pro-sidebar-nav">
          {!isSidebarCollapsed && <div className="pro-nav-group-title">Studio Operations</div>}

          <button
            className={`pro-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => switchTab('overview')}
            title={isSidebarCollapsed ? 'Dashboard Overview' : undefined}
          >
            <span className="pro-nav-icon"><LayoutDashboard size={18} /></span>
            {!isSidebarCollapsed && <span className="pro-nav-label">Dashboard</span>}
          </button>

          <button
            className={`pro-nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => switchTab('leads')}
            title={isSidebarCollapsed ? 'Lead Management' : undefined}
          >
            <span className="pro-nav-icon"><Inbox size={18} /></span>
            {!isSidebarCollapsed && (
              <>
                <span className="pro-nav-label">Lead Management</span>
                {stats.newInquiries > 0 && (
                  <span className="pro-nav-badge highlight">{stats.newInquiries}</span>
                )}
              </>
            )}
          </button>

          <button
            className={`pro-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => switchTab('bookings')}
            title={isSidebarCollapsed ? 'Appointments' : undefined}
          >
            <span className="pro-nav-icon"><Calendar size={18} /></span>
            {!isSidebarCollapsed && (
              <>
                <span className="pro-nav-label">Appointments</span>
                {stats.pendingBookings > 0 && (
                  <span className="pro-nav-badge warning">{stats.pendingBookings}</span>
                )}
              </>
            )}
          </button>

          <button
            className={`pro-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => switchTab('customers')}
            title={isSidebarCollapsed ? 'Client Directory' : undefined}
          >
            <span className="pro-nav-icon"><Users size={18} /></span>
            {!isSidebarCollapsed && (
              <>
                <span className="pro-nav-label">Client Directory</span>
                <span className="pro-nav-badge">{customers.length || stats.totalCustomers}</span>
              </>
            )}
          </button>

          {!isSidebarCollapsed && <div className="pro-nav-group-title" style={{ marginTop: 18 }}>Content &amp; Brand</div>}

          <button
            className={`pro-nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => switchTab('services')}
            title={isSidebarCollapsed ? 'Treatment Menu' : undefined}
          >
            <span className="pro-nav-icon"><Scissors size={18} /></span>
            {!isSidebarCollapsed && <span className="pro-nav-label">Service Menu</span>}
          </button>

          <button
            className={`pro-nav-item ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => switchTab('media')}
            title={isSidebarCollapsed ? 'Site Logo & Media' : undefined}
          >
            <span className="pro-nav-icon"><ImageIcon size={18} /></span>
            {!isSidebarCollapsed && <span className="pro-nav-label">Logo &amp; Site Media</span>}
          </button>

          <button
            className={`pro-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => switchTab('reviews')}
            title={isSidebarCollapsed ? 'Testimonials' : undefined}
          >
            <span className="pro-nav-icon"><Star size={18} /></span>
            {!isSidebarCollapsed && <span className="pro-nav-label">Testimonials</span>}
          </button>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="pro-sidebar-footer">
          <div className="pro-admin-user-card">
            <div className="pro-user-avatar" title={isSidebarCollapsed ? "Studio Administrator" : undefined}>
              <UserCheck size={16} />
            </div>
            {!isSidebarCollapsed && (
              <div className="pro-user-details">
                <b>Studio Administrator</b>
                <small>Authorized Staff</small>
              </div>
            )}
          </div>

          <div className="pro-sidebar-actions" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            <button
              className="pro-btn-visit-site"
              onClick={onBackToSite}
              title={isSidebarCollapsed ? "Visit Customer Website" : "Open customer-facing website"}
            >
              <ExternalLink size={15} />
              {!isSidebarCollapsed && <span>Visit Store</span>}
            </button>
            <button
              className="pro-btn-logout-refined"
              onClick={() => {
                localStorage.removeItem('nilavi_admin_token');
                if (onLogout) onLogout();
              }}
              title={isSidebarCollapsed ? "Sign Out of Session" : "Sign out of CRM Session"}
            >
              <LogOut size={15} />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSTATION VIEW */}
      <main className="pro-admin-main">
        {/* TOP NAVIGATION BAR */}
        <header className="pro-topbar">
          <div className="pro-topbar-left">
            <div className="pro-topbar-breadcrumb">
              <span>Nilavi CRM</span>
              <span className="sep"><ChevronRight size={12} /></span>
              <span className="active-crumb">{activeTab.toUpperCase()}</span>
              {selectedRecord && (
                <>
                  <span className="sep"><ChevronRight size={12} /></span>
                  <span className="active-crumb" style={{ color: 'var(--adm-primary)', fontWeight: 600 }}>
                    {selectedRecord.type === 'booking' ? `Appointment #${selectedRecord.id}` :
                     selectedRecord.type === 'lead' ? `Lead #${selectedRecord.id}` :
                     selectedRecord.type === 'customer' ? `Client #${selectedRecord.id}` :
                     selectedRecord.type === 'service' ? `Service #${selectedRecord.id}` :
                     `Review #${selectedRecord.id}`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="pro-topbar-center">
            <div className="pro-global-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search clients, appointments, leads, or services..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => setGlobalSearch('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--adm-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="pro-topbar-right">
            {/* Quick Action Button */}
            <button className="pro-btn pro-btn-primary pro-btn-sm" onClick={handlePrimaryQuickAction}>
              <Plus size={14} />
              <span>
                {activeTab === 'leads' ? 'Log Lead' :
                 activeTab === 'bookings' || activeTab === 'overview' ? 'New Booking' :
                 activeTab === 'customers' ? 'Add Client' :
                 activeTab === 'services' ? 'Add Service' :
                 activeTab === 'reviews' ? 'Add Review' : 'Save Changes'}
              </span>
            </button>

            {/* Notification Bell with Unread Badge & Popover */}
            <div style={{ position: 'relative' }}>
              <button
                className="pro-icon-btn"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                title="Notifications & Alerts"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {(stats.pendingBookings > 0 || stats.newInquiries > 0) && (
                  <span className="pro-badge-dot"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="pro-popover-menu">
                  <div className="pro-popover-header">
                    <h5>Notifications &amp; Activity</h5>
                    <button
                      className="pro-btn-subtle"
                      onClick={() => setNotificationsOpen(false)}
                      style={{ padding: '2px 6px', fontSize: '.72rem' }}
                    >
                      Close
                    </button>
                  </div>
                  <div className="pro-popover-list">
                    {stats.pendingBookings > 0 && (
                      <div
                        className="pro-popover-item"
                        onClick={() => { setActiveTab('bookings'); setNotificationsOpen(false); }}
                      >
                        <AlertCircle size={16} style={{ color: 'var(--adm-warning-text)', flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <b>{stats.pendingBookings} Appointments Pending</b>
                          <span>Review and confirm client slot reservations</span>
                        </div>
                      </div>
                    )}
                    {stats.newInquiries > 0 && (
                      <div
                        className="pro-popover-item"
                        onClick={() => { setActiveTab('leads'); setNotificationsOpen(false); }}
                      >
                        <MessageSquare size={16} style={{ color: 'var(--adm-accent)', flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <b>{stats.newInquiries} New Pipeline Leads</b>
                          <span>Respond to customer messages &amp; inquiries</span>
                        </div>
                      </div>
                    )}
                    <div
                      className="pro-popover-item"
                      onClick={() => { setActiveTab('media'); setNotificationsOpen(false); }}
                    >
                      <Sparkles size={16} style={{ color: 'var(--adm-primary)', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <b>Client Webpage Live</b>
                        <span>Branding and media sync active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="pro-user-dropdown-btn"
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                aria-label="Staff User Profile Menu"
              >
                <div className="pro-user-dropdown-avatar">
                  N
                </div>
                <ChevronDown size={14} style={{ color: 'var(--adm-text-secondary)' }} />
              </button>

              {userDropdownOpen && (
                <div className="pro-popover-menu" style={{ width: 220, right: 0 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--adm-border)' }}>
                    <b style={{ display: 'block', fontSize: '.84rem', color: 'var(--adm-text-primary)' }}>Studio Admin</b>
                    <span style={{ fontSize: '.72rem', color: 'var(--adm-text-secondary)' }}>admin@nilavi.com</span>
                  </div>
                  <div style={{ padding: 6 }}>
                    <button
                      className="pro-nav-item"
                      onClick={() => { onBackToSite(); setUserDropdownOpen(false); }}
                      style={{ padding: '8px 10px' }}
                    >
                      <ExternalLink size={14} />
                      <span>View Customer Site</span>
                    </button>
                    <button
                      className="pro-nav-item"
                      onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                      style={{ padding: '8px 10px', color: 'var(--adm-danger-text)' }}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. CONTENT AREA */}
        <div className="pro-admin-content-wrap">
          {selectedRecord ? (
            renderRecordDetail()
          ) : (
            <>
              {/* Context Title Header */}
              <div className="pro-page-title-block">
            <div className="pro-page-title-text">
              <h2>
                {activeTab === 'overview' && 'Executive Dashboard'}
                {activeTab === 'leads' && 'Lead Management & History'}
                {activeTab === 'bookings' && 'Appointments & Calendar'}
                {activeTab === 'customers' && 'Client Directory & Records'}
                {activeTab === 'services' && 'Treatment Menu & Pricing'}
                {activeTab === 'media' && 'Site Branding & Media'}
                {activeTab === 'reviews' && 'Client Testimonials'}
              </h2>
              <p>
                {activeTab === 'overview' && 'Overview of bookings, revenue performance, staff workload, and lead pipeline.'}
                {activeTab === 'leads' && 'Track incoming inquiries across WhatsApp, website forms, and phone consultations.'}
                {activeTab === 'bookings' && 'Manage appointment reservations, confirmation workflows, and client rescheduling.'}
                {activeTab === 'customers' && 'Client relationship records, visit frequencies, and lifetime value tracking.'}
                {activeTab === 'services' && 'Curate salon service categories, treatment timings, and pricing tiers.'}
                {activeTab === 'media' && 'Update the customer-facing website logo, hero banners, and gallery showcases in real time.'}
                {activeTab === 'reviews' && 'Manage customer ratings and spotlight client reviews on the homepage.'}
              </p>
            </div>

            <div className="pro-page-actions">
              {activeTab === 'leads' && (
                <button className="pro-btn pro-btn-gold" onClick={() => setShowNewLeadModal(true)}>
                  <Plus size={15} />
                  <span>Log Lead (WhatsApp / Walk-in)</span>
                </button>
              )}
              {activeTab === 'bookings' && (
                <button className="pro-btn pro-btn-gold" onClick={() => setShowNewBookingModal(true)}>
                  <Plus size={15} />
                  <span>Schedule Appointment</span>
                </button>
              )}
              {activeTab === 'customers' && (
                <button className="pro-btn pro-btn-gold" onClick={() => setShowNewCustomerModal(true)}>
                  <Plus size={15} />
                  <span>Add New Client</span>
                </button>
              )}
              {activeTab === 'services' && (
                <button className="pro-btn pro-btn-gold" onClick={() => setShowNewServiceModal(true)}>
                  <Plus size={15} />
                  <span>Add Treatment</span>
                </button>
              )}
              {activeTab === 'reviews' && (
                <button className="pro-btn pro-btn-gold" onClick={() => setShowNewReviewModal(true)}>
                  <Plus size={15} />
                  <span>Add Review</span>
                </button>
              )}
              {activeTab === 'media' && (
                <button className="pro-btn pro-btn-gold" onClick={handleSaveSiteSettings}>
                  <Save size={15} />
                  <span>Save Media Changes</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'overview' && (
            <div>
              <DashboardOverview
                analytics={analytics}
                range={dashboardRange}
                onRangeChange={setDashboardRange}
                loading={analyticsLoading}
                error={analyticsError}
                onRefresh={() => { fetchData(); loadAnalytics(); }}
                onOpenTab={openTabFromDashboard}
                actions={{
                  newBooking: () => setShowNewBookingModal(true),
                  newLead: () => setShowNewLeadModal(true),
                  newCustomer: () => setShowNewCustomerModal(true),
                  openMedia: () => switchTab('media'),
                  exportBookings: () => exportToCSV('nilavi-bookings', bookings)
                }}
              />

              {/* Two Column Grid: Upcoming Visits + Recent Leads */}
              <div className="pro-grid-2">
                {/* Upcoming Scheduled Visits */}
                <div className="pro-card">
                  <div className="pro-card-header">
                    <div className="pro-card-title-group">
                      <CalendarDays size={18} style={{ color: 'var(--adm-primary)' }} />
                      <div>
                        <h3>Upcoming Visits Queue</h3>
                        <p>Immediate reservations in the pipeline</p>
                      </div>
                    </div>
                    <button
                      className="pro-btn-subtle"
                      onClick={() => switchTab('bookings')}
                      title="View all appointments in table"
                    >
                      <span>View All</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                  <div className="pro-card-body" style={{ padding: 0 }}>
                    <div className="pro-table-responsive">
                      <table className="pro-table">
                        <thead>
                          <tr>
                            <th>Client &amp; Service</th>
                            <th>Slot</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(analytics?.upcoming || []).slice(0, 5).map(b => (
                            <tr key={b.id}>
                              <td>
                                <b style={{ display: 'block', fontSize: '.84rem' }}>{b.customerName}</b>
                                <span style={{ fontSize: '.74rem', color: 'var(--adm-text-secondary)' }}>{b.serviceName}</span>
                              </td>
                              <td>
                                <div style={{ fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} style={{ color: 'var(--adm-text-tertiary)' }} />
                                  <span>{b.timeSlot}</span>
                                </div>
                                <small style={{ fontSize: '.72rem', color: 'var(--adm-text-secondary)' }}>{b.date}</small>
                              </td>
                              <td>
                                <span className={`pro-status-badge ${b.status || 'pending'}`}>{b.status}</span>
                              </td>
                              <td>
                                <button
                                  className="pro-btn-action"
                                  onClick={() => setEditingBooking({ ...b })}
                                  title="Reschedule"
                                >
                                  <Edit3 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {bookings.length === 0 && (
                            <tr>
                              <td colSpan="4" className="pro-table-empty">
                                <Calendar size={24} />
                                <p>No scheduled visits recorded.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Recent Leads Activity */}
                <div className="pro-card">
                  <div className="pro-card-header">
                    <div className="pro-card-title-group">
                      <Inbox size={18} style={{ color: 'var(--adm-accent)' }} />
                      <div>
                        <h3>Recent Customer Leads</h3>
                        <p>Incoming WhatsApp and web queries</p>
                      </div>
                    </div>
                    <button
                      className="pro-btn-subtle"
                      onClick={() => switchTab('leads')}
                      title="View all customer inquiries"
                    >
                      <span>View All Leads</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                  <div className="pro-card-body" style={{ padding: 0 }}>
                    <div className="pro-table-responsive">
                      <table className="pro-table">
                        <thead>
                          <tr>
                            <th>Contact</th>
                            <th>Source</th>
                            <th>Service</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inquiries.slice(0, 5).map(lead => (
                            <tr key={lead.id}>
                              <td>
                                <b style={{ display: 'block', fontSize: '.84rem' }}>{lead.name}</b>
                                <span style={{ fontSize: '.74rem', color: 'var(--adm-text-secondary)' }}>{lead.phone || lead.email || '—'}</span>
                              </td>
                              <td>
                                <span className={`pro-source-pill ${lead.source || 'website'}`}>
                                  {lead.source === 'whatsapp' ? 'WhatsApp' : lead.source === 'phone' ? 'Phone' : 'Website'}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '.8rem' }}>{lead.topic || 'General'}</span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button
                                    className="pro-btn-action"
                                    onClick={() => setSelectedLead(lead)}
                                    title="View timeline history"
                                  >
                                    <Clock size={12} />
                                  </button>
                                  {lead.phone && (
                                    <button
                                      className="pro-btn-action wa"
                                      onClick={() => {
                                        const clean = lead.phone.replace(/\D/g, '');
                                        const target = clean.length === 10 ? `91${clean}` : clean;
                                        window.open(waLink(target, leadFollowUpMessage(lead)), '_blank');
                                      }}
                                      title="WhatsApp"
                                    >
                                      <MessageSquare size={12} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {inquiries.length === 0 && (
                            <tr>
                              <td colSpan="4" className="pro-table-empty">
                                <Inbox size={24} />
                                <p>No leads recorded yet.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS CRM */}
          {activeTab === 'leads' && (
            <div className="pro-table-container">
              {/* Toolbar */}
              <div className="pro-table-toolbar">
                <div className="pro-table-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search leads by name, phone, email, service..."
                    value={leadSearch}
                    onChange={(e) => {
                      setLeadSearch(e.target.value);
                      setLeadPage(1);
                    }}
                  />
                  {leadSearch && (
                    <button
                      type="button"
                      onClick={() => setLeadSearch('')}
                      style={{
                        position: 'absolute',
                        right: 10,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--adm-text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="pro-filter-pills-row">
                  {['all', 'whatsapp', 'website', 'phone'].map(src => (
                    <button
                      key={src}
                      className={`pro-pill-filter ${leadSourceFilter === src ? 'active' : ''}`}
                      onClick={() => {
                        setLeadSourceFilter(src);
                        setLeadPage(1);
                      }}
                    >
                      {src === 'all' ? `All Sources (${inquiries.length})` :
                       src === 'whatsapp' ? `WhatsApp (${whatsappLeadsCount})` :
                       src === 'website' ? `Website (${websiteLeadsCount})` :
                       `Phone (${phoneLeadsCount})`}
                    </button>
                  ))}

                  <div style={{ width: 1, height: 20, background: 'var(--adm-border)', margin: '0 4px' }} />

                  {['all', 'new', 'in_progress', 'contacted', 'closed'].map(st => (
                    <button
                      key={st}
                      className={`pro-pill-filter ${leadStatusFilter === st ? 'active' : ''}`}
                      onClick={() => {
                        setLeadStatusFilter(st);
                        setLeadPage(1);
                      }}
                    >
                      {st === 'all' ? 'All Status' : st.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="pro-page-actions">
                  <button
                    className="pro-btn pro-btn-secondary pro-btn-sm"
                    onClick={() => exportToCSV('nilavi-leads', processedLeads)}
                  >
                    <FileDown size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="pro-table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.length > 0 && selectedLeadIds.length === paginatedLeads.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLeadIds(paginatedLeads.map(l => l.id));
                            else setSelectedLeadIds([]);
                          }}
                        />
                      </th>
                      {renderSortableTh('Lead Contact', 'name', leadSortField, leadSortDir, setLeadSortField, setLeadSortDir)}
                      {renderSortableTh('Source', 'source', leadSortField, leadSortDir, setLeadSortField, setLeadSortDir)}
                      {renderSortableTh('Inquiry Service', 'topic', leadSortField, leadSortDir, setLeadSortField, setLeadSortDir)}
                      {renderSortableTh('Status', 'status', leadSortField, leadSortDir, setLeadSortField, setLeadSortDir)}
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.map(lead => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      return (
                        <tr
                          key={lead.id}
                          className={`clickable ${isSelected ? 'selected' : ''}`}
                          onClick={() => openRecordDetail('lead', lead)}
                        >
                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedLeadIds([...selectedLeadIds, lead.id]);
                                else setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id));
                              }}
                            />
                          </td>
                          <td>
                            <b style={{ display: 'block', fontSize: '.86rem', color: 'var(--adm-text-primary)' }}>{lead.name}</b>
                            <div style={{ fontSize: '.76rem', color: 'var(--adm-text-secondary)' }}>
                              {lead.phone || lead.email || 'No contact provided'}
                            </div>
                          </td>
                          <td>
                            <span className={`pro-source-pill ${lead.source || 'website'}`}>
                              {lead.source === 'whatsapp' ? (
                                <><MessageSquare size={11} /> <span>WhatsApp</span></>
                              ) : lead.source === 'phone' ? (
                                <><Phone size={11} /> <span>Phone</span></>
                              ) : (
                                <><Globe size={11} /> <span>Website</span></>
                              )}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '.82rem', fontWeight: 500 }}>{lead.topic || 'General Inquiry'}</span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.status || 'new'}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                              className="pro-select"
                              style={{ height: 30, fontSize: '.76rem', padding: '0 8px' }}
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="contacted">Contacted</option>
                              <option value="closed">Closed / Booked</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              <button
                                className="pro-btn-action"
                                onClick={() => openRecordDetail('lead', lead)}
                                title="Open full record details"
                              >
                                <Eye size={13} />
                                <span>Details</span>
                              </button>

                              {lead.phone && (
                                <button
                                  className="pro-btn-action wa"
                                  onClick={() => {
                                    const clean = lead.phone.replace(/\D/g, '');
                                    const target = clean.length === 10 ? `91${clean}` : clean;
                                    window.open(waLink(target, leadFollowUpMessage(lead)), '_blank');
                                  }}
                                  title="Send WhatsApp message"
                                >
                                  <MessageSquare size={13} />
                                </button>
                              )}

                              <button
                                className="pro-btn-action delete"
                                onClick={() => handleDeleteLead(lead.id)}
                                title="Delete lead"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {paginatedLeads.length === 0 && (
                      <tr>
                        <td colSpan="6" className="pro-table-empty">
                          <Inbox size={32} />
                          <h4>No leads match current filters</h4>
                          <p>Try clearing your search query or selecting a different status segment.</p>
                          <button
                            className="pro-btn pro-btn-secondary pro-btn-sm"
                            onClick={() => {
                              setLeadSearch('');
                              setLeadSourceFilter('all');
                              setLeadStatusFilter('all');
                            }}
                          >
                            Reset Filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {renderPaginationControls(leadPage, totalLeadPages, processedLeads.length, leadPageSize, setLeadPage, setLeadPageSize)}
            </div>
          )}

          {/* TAB 3: BOOKINGS CRM */}
          {activeTab === 'bookings' && (
            <div className="pro-table-container">
              {/* Toolbar */}
              <div className="pro-table-toolbar">
                <div className="pro-table-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search appointments by client name, phone, treatment, or date..."
                    value={bookingSearch}
                    onChange={(e) => {
                      setBookingSearch(e.target.value);
                      setBookingPage(1);
                    }}
                  />
                  {bookingSearch && (
                    <button
                      type="button"
                      onClick={() => setBookingSearch('')}
                      style={{
                        position: 'absolute',
                        right: 10,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--adm-text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="pro-filter-pills-row">
                  {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(st => (
                    <button
                      key={st}
                      className={`pro-pill-filter ${bookingFilter === st ? 'active' : ''}`}
                      onClick={() => {
                        setBookingFilter(st);
                        setBookingPage(1);
                      }}
                    >
                      {st === 'all' ? `All (${bookings.length})` : st.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="pro-page-actions">
                  <button
                    className="pro-btn pro-btn-secondary pro-btn-sm"
                    onClick={() => exportToCSV('nilavi-appointments', processedBookings)}
                  >
                    <FileDown size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="pro-table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedBookingIds.length > 0 && selectedBookingIds.length === paginatedBookings.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBookingIds(paginatedBookings.map(b => b.id));
                            else setSelectedBookingIds([]);
                          }}
                        />
                      </th>
                      {renderSortableTh('Client Name & Phone', 'customerName', bookingSortField, bookingSortDir, setBookingSortField, setBookingSortDir)}
                      {renderSortableTh('Treatment', 'serviceName', bookingSortField, bookingSortDir, setBookingSortField, setBookingSortDir)}
                      {renderSortableTh('Date & Time Slot', 'date', bookingSortField, bookingSortDir, setBookingSortField, setBookingSortDir)}
                      {renderSortableTh('Status', 'status', bookingSortField, bookingSortDir, setBookingSortField, setBookingSortDir)}
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map(b => {
                      const isSelected = selectedBookingIds.includes(b.id);
                      return (
                        <tr
                          key={b.id}
                          className={`clickable ${isSelected ? 'selected' : ''}`}
                          onClick={() => openRecordDetail('booking', b)}
                        >
                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedBookingIds([...selectedBookingIds, b.id]);
                                else setSelectedBookingIds(selectedBookingIds.filter(id => id !== b.id));
                              }}
                            />
                          </td>
                          <td>
                            <b style={{ display: 'block', fontSize: '.86rem', color: 'var(--adm-text-primary)' }}>{b.customerName}</b>
                            <span style={{ fontSize: '.76rem', color: 'var(--adm-text-secondary)' }}>{b.customerPhone}</span>
                          </td>
                          <td>
                            <b style={{ display: 'block', fontSize: '.84rem' }}>{b.serviceName}</b>
                            <span style={{ fontSize: '.76rem', color: 'var(--adm-accent)', fontWeight: 600 }}>{fmtCurrency(b.servicePrice)}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.82rem' }}>
                              <Calendar size={13} style={{ color: 'var(--adm-text-tertiary)' }} />
                              <b>{b.date}</b>
                              <span>·</span>
                              <span>{b.timeSlot}</span>
                            </div>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <span className={`pro-status-badge ${b.status || 'pending'}`}>{b.status}</span>
                          </td>
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              <button
                                className="pro-btn-action"
                                onClick={() => openRecordDetail('booking', b)}
                                title="Open full record details"
                              >
                                <Eye size={13} />
                                <span>Details</span>
                              </button>

                              {b.status === 'pending' && (
                                <button
                                  className="pro-btn-action"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                  title="Confirm appointment"
                                >
                                  <Check size={13} />
                                  <span>Confirm</span>
                                </button>
                              )}
                              {b.status === 'confirmed' && (
                                <button
                                  className="pro-btn-action wa"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                  title="Mark completed"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Complete</span>
                                </button>
                              )}
                              <button
                                className="pro-btn-action wa"
                                onClick={() => setWaModalBooking(b)}
                                title="WhatsApp Template Launcher"
                              >
                                <MessageSquare size={13} />
                              </button>
                              <button
                                className="pro-btn-action"
                                onClick={() => setEditingBooking({ ...b })}
                                title="Reschedule Date / Time"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                className="pro-btn-action delete"
                                onClick={() => handleDeleteBooking(b.id)}
                                title="Delete appointment"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {paginatedBookings.length === 0 && (
                      <tr>
                        <td colSpan="6" className="pro-table-empty">
                          <Calendar size={32} />
                          <h4>No appointments found</h4>
                          <p>No appointment records match the current filter selection.</p>
                          <button
                            className="pro-btn pro-btn-secondary pro-btn-sm"
                            onClick={() => {
                              setBookingSearch('');
                              setBookingFilter('all');
                            }}
                          >
                            Reset Filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {renderPaginationControls(bookingPage, totalBookingPages, processedBookings.length, bookingPageSize, setBookingPage, setBookingPageSize)}
            </div>
          )}

          {/* TAB 4: CLIENTS DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="pro-table-container">
              {/* Toolbar */}
              <div className="pro-table-toolbar">
                <div className="pro-table-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search client directory by name, phone, or email..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setCustomerPage(1);
                    }}
                  />
                  {customerSearch && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearch('')}
                      style={{
                        position: 'absolute',
                        right: 10,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--adm-text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="pro-page-actions">
                  <button
                    className="pro-btn pro-btn-secondary pro-btn-sm"
                    onClick={() => exportToCSV('nilavi-clients', processedCustomers)}
                  >
                    <FileDown size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="pro-table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      {renderSortableTh('Client Contact', 'name', customerSortField, customerSortDir, setCustomerSortField, setCustomerSortDir)}
                      {renderSortableTh('Visits', 'totalVisits', customerSortField, customerSortDir, setCustomerSortField, setCustomerSortDir)}
                      {renderSortableTh('Lifetime Value', 'totalSpent', customerSortField, customerSortDir, setCustomerSortField, setCustomerSortDir)}
                      <th>Patron Tags</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map(c => (
                      <tr
                        key={c.id}
                        className="clickable"
                        onClick={() => openRecordDetail('customer', c)}
                      >
                        <td>
                          <b style={{ display: 'block', fontSize: '.86rem', color: 'var(--adm-text-primary)' }}>{c.name}</b>
                          <div style={{ fontSize: '.76rem', color: 'var(--adm-text-secondary)' }}>
                            {c.phone || c.email || 'No contact provided'}
                          </div>
                        </td>
                        <td>
                          <span className="pro-status-badge in_progress">{c.totalVisits || 0} visits</span>
                        </td>
                        <td>
                          <b style={{ fontSize: '.88rem', color: 'var(--adm-primary)' }}>{fmtCurrency(c.totalSpent)}</b>
                        </td>
                        <td>
                          {(c.tags || ['Regular']).map((t, idx) => (
                            <span key={idx} className="pro-status-badge in_progress" style={{ marginRight: 4 }}>{t}</span>
                          ))}
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <button
                              className="pro-btn-action"
                              onClick={() => openRecordDetail('customer', c)}
                              title="Inspect full customer profile"
                            >
                              <Eye size={13} />
                              <span>Profile</span>
                            </button>

                            {c.phone && (
                              <button
                                className="pro-btn-action wa"
                                onClick={() => {
                                  const clean = c.phone.replace(/\D/g, '');
                                  const target = clean.length === 10 ? `91${clean}` : clean;
                                  window.open(waLink(target, clientGreetingMessage(c)), '_blank');
                                }}
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {paginatedCustomers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="pro-table-empty">
                          <Users size={32} />
                          <h4>No client profiles found</h4>
                          <p>Clients are automatically cataloged here as appointments are booked.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {renderPaginationControls(customerPage, totalCustomerPages, processedCustomers.length, customerPageSize, setCustomerPage, setCustomerPageSize)}
            </div>
          )}

          {/* TAB 5: SERVICES MENU */}
          {activeTab === 'services' && (
            <div>
              {/* Category Filter Pills */}
              <div className="pro-quick-actions-bar" style={{ marginBottom: 20 }}>
                <span className="pro-quick-actions-label">Filter Category:</span>
                {['all', 'skin', 'hair', 'nails', 'bridal', 'wellness'].map(cat => (
                  <button
                    key={cat}
                    className={`pro-pill-filter ${serviceCategoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setServiceCategoryFilter(cat)}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Services Cards Grid */}
              <div className="pro-service-cards-grid">
                {filteredServices.map(s => (
                  <div key={s.id} className="pro-service-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="pro-status-badge in_progress" style={{ textTransform: 'uppercase' }}>{s.category}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.76rem', color: 'var(--adm-text-secondary)' }}>
                        <Clock size={12} />
                        <span>{s.dur}</span>
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--adm-text-primary)' }}>{s.name}</h4>
                    <p style={{ fontSize: '.8rem', color: 'var(--adm-text-secondary)', margin: '0 0 16px', lineHeight: 1.45, flex: 1 }}>
                      {s.description || 'Gentle, personalized treatment planned around your goals.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--adm-border)' }}>
                      <div>
                        <small style={{ display: 'block', fontSize: '.7rem', color: 'var(--adm-text-secondary)', textTransform: 'uppercase' }}>Price</small>
                        <b style={{ fontSize: '1.05rem', color: 'var(--adm-primary)' }}>{fmtCurrency(s.price)}</b>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="pro-btn-action"
                          onClick={() => setEditingService({ ...s })}
                          title="Edit Treatment"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="pro-btn-action delete"
                          onClick={() => handleDeleteService(s.id)}
                          title="Delete Treatment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SITE BRANDING, LOGO & IMAGES (LIVE CUSTOMIZER) */}
          {activeTab === 'media' && (
            <div>
              {mediaSavedSuccess && (
                <div className="crm-alert" style={{ background: 'var(--adm-success-bg)', color: 'var(--adm-success-text)', border: '1px solid var(--adm-success-border)' }}>
                  <CheckCircle2 size={18} />
                  <span>Site branding, logo, and images successfully updated! Changes are live on the client website.</span>
                </div>
              )}

              <form onSubmit={handleSaveSiteSettings}>
                {/* 1. Brand Logo */}
                <div className="pro-card">
                  <div className="pro-card-header">
                    <div className="pro-card-title-group">
                      <Sparkles size={18} style={{ color: 'var(--adm-accent)' }} />
                      <div>
                        <h3>Studio Brand Logo &amp; Identity</h3>
                        <p>Customize the brand text or upload an image mark shown in the header</p>
                      </div>
                    </div>
                  </div>
                  <div className="pro-card-body">
                    <div className="pro-form-row">
                      <div className="pro-form-group">
                        <label className="pro-form-label">Brand Name / Logo Text</label>
                        <input
                          type="text"
                          className="pro-input"
                          value={siteSettings.logoText || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, logoText: e.target.value })}
                          placeholder="e.g. Nilavi"
                        />
                      </div>
                      <div className="pro-form-group">
                        <label className="pro-form-label">Custom Image Logo URL</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="url"
                            className="pro-input"
                            value={siteSettings.logoImageUrl || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, logoImageUrl: e.target.value })}
                            placeholder="https://... logo image link"
                          />
                          <label className="pro-btn pro-btn-secondary" style={{ cursor: 'pointer' }} title="Upload local image">
                            <Upload size={14} />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload(e, (dataUrl) => {
                                setSiteSettings({ ...siteSettings, logoImageUrl: dataUrl });
                              })}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {siteSettings.logoImageUrl && (
                      <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 12, padding: 10, background: 'var(--adm-bg)', borderRadius: 'var(--adm-radius-md)' }}>
                        <img src={siteSettings.logoImageUrl} alt="Logo preview" style={{ height: 38, objectFit: 'contain' }} />
                        <span style={{ fontSize: '.76rem', color: 'var(--adm-text-secondary)' }}>Live Logo Preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Hero Section Media */}
                <div className="pro-card">
                  <div className="pro-card-header">
                    <div className="pro-card-title-group">
                      <ImageIcon size={18} style={{ color: 'var(--adm-primary)' }} />
                      <div>
                        <h3>Hero Section Imagery &amp; Copy</h3>
                        <p>Update the luxury arch portrait, headline, and subtitle</p>
                      </div>
                    </div>
                  </div>
                  <div className="pro-card-body">
                    <div className="pro-form-group">
                      <label className="pro-form-label">Hero Arch Portrait Image URL</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="url"
                          className="pro-input"
                          value={siteSettings.heroImageUrl || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroImageUrl: e.target.value })}
                          placeholder="https://... portrait image link"
                        />
                        <label className="pro-btn pro-btn-secondary" style={{ cursor: 'pointer' }} title="Upload local image">
                          <Upload size={14} />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(e, (dataUrl) => {
                              setSiteSettings({ ...siteSettings, heroImageUrl: dataUrl });
                            })}
                          />
                        </label>
                      </div>

                      {siteSettings.heroImageUrl && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
                          <img
                            src={siteSettings.heroImageUrl}
                            alt="Hero preview"
                            style={{ width: 100, height: 120, objectFit: 'cover', borderRadius: 'var(--adm-radius-md)', border: '1px solid var(--adm-border)' }}
                          />
                          <div>
                            <b style={{ display: 'block', fontSize: '.84rem', color: 'var(--adm-text-primary)' }}>Hero Arch Live Preview</b>
                            <span style={{ fontSize: '.76rem', color: 'var(--adm-text-secondary)' }}>Rendered inside the luxury arch frame on the client homepage.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pro-form-row">
                      <div className="pro-form-group">
                        <label className="pro-form-label">Hero Tagline</label>
                        <input
                          type="text"
                          className="pro-input"
                          value={siteSettings.heroTagline || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroTagline: e.target.value })}
                        />
                      </div>
                      <div className="pro-form-group">
                        <label className="pro-form-label">Hero Headline</label>
                        <input
                          type="text"
                          className="pro-input"
                          value={siteSettings.heroTitle || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="pro-form-group">
                      <label className="pro-form-label">Hero Subtitle</label>
                      <textarea
                        className="pro-textarea"
                        rows="2"
                        value={siteSettings.heroSubtitle || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* 3. Services Section Images */}
                <div className="pro-card">
                  <div className="pro-card-header">
                    <div className="pro-card-title-group">
                      <Scissors size={18} style={{ color: 'var(--adm-primary)' }} />
                      <div>
                        <h3>Treatment Category Imagery</h3>
                        <p>Update category card photography shown on the website service menu</p>
                      </div>
                    </div>
                  </div>
                  <div className="pro-card-body">
                    <div className="pro-media-grid">
                      {['facial', 'hair', 'nails', 'bridal', 'wax'].map(svcKey => (
                        <div key={svcKey} className="pro-media-card">
                          <b style={{ display: 'block', fontSize: '.82rem', marginBottom: 8, color: 'var(--adm-text-primary)' }}>
                            {svcKey === 'facial' ? 'Facials & Skin Care' :
                             svcKey === 'hair' ? 'Hair Spa & Style' :
                             svcKey === 'nails' ? 'Manicure & Nails' :
                             svcKey === 'bridal' ? 'Bridal Artistry' : 'Wellness & Waxing'}
                          </b>
                          <div className="pro-media-preview-box">
                            <img src={siteSettings.servicesImages?.[svcKey] || ''} alt={svcKey} />
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input
                              type="url"
                              className="pro-input"
                              style={{ height: 32, fontSize: '.78rem' }}
                              value={siteSettings.servicesImages?.[svcKey] || ''}
                              onChange={(e) => setSiteSettings({
                                ...siteSettings,
                                servicesImages: {
                                  ...siteSettings.servicesImages,
                                  [svcKey]: e.target.value
                                }
                              })}
                              placeholder="Image URL"
                            />
                            <label className="pro-btn pro-btn-secondary pro-btn-sm" style={{ cursor: 'pointer' }}>
                              <Upload size={12} />
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e, (dataUrl) => {
                                  setSiteSettings({
                                    ...siteSettings,
                                    servicesImages: {
                                      ...siteSettings.servicesImages,
                                      [svcKey]: dataUrl
                                    }
                                  });
                                })}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Gallery Showcase Images */}
                <div className="pro-card">
                  <div className="pro-card-header">
                    <div className="pro-card-title-group">
                      <ImageIcon size={18} style={{ color: 'var(--adm-accent)' }} />
                      <div>
                        <h3>Customer Showcase Gallery</h3>
                        <p>Curate client result photos displayed in the homepage gallery grid</p>
                      </div>
                    </div>
                  </div>
                  <div className="pro-card-body">
                    <div className="pro-media-grid">
                      {(siteSettings.galleryImages || []).map((imgItem, idx) => (
                        <div key={imgItem.id || idx} className="pro-media-card">
                          <b style={{ display: 'block', fontSize: '.82rem', marginBottom: 8, color: 'var(--adm-text-primary)' }}>
                            Tile {idx + 1}: {imgItem.title || 'Showcase'}
                          </b>
                          <div className="pro-media-preview-box">
                            <img src={imgItem.image} alt={imgItem.title} />
                          </div>
                          <div style={{ marginBottom: 6 }}>
                            <input
                              type="text"
                              className="pro-input"
                              style={{ height: 30, fontSize: '.76rem' }}
                              value={imgItem.title}
                              placeholder="Tile title"
                              onChange={(e) => {
                                const copy = [...siteSettings.galleryImages];
                                copy[idx] = { ...copy[idx], title: e.target.value };
                                setSiteSettings({ ...siteSettings, galleryImages: copy });
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input
                              type="url"
                              className="pro-input"
                              style={{ height: 32, fontSize: '.78rem' }}
                              value={imgItem.image}
                              placeholder="Image URL"
                              onChange={(e) => {
                                const copy = [...siteSettings.galleryImages];
                                copy[idx] = { ...copy[idx], image: e.target.value };
                                setSiteSettings({ ...siteSettings, galleryImages: copy });
                              }}
                            />
                            <label className="pro-btn pro-btn-secondary pro-btn-sm" style={{ cursor: 'pointer' }}>
                              <Upload size={12} />
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e, (dataUrl) => {
                                  const copy = [...siteSettings.galleryImages];
                                  copy[idx] = { ...copy[idx], image: dataUrl };
                                  setSiteSettings({ ...siteSettings, galleryImages: copy });
                                })}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: 24 }}>
                  <button type="submit" className="pro-btn pro-btn-gold" style={{ padding: '0 32px', height: 42 }}>
                    <Save size={16} />
                    <span>Save All Media &amp; Branding Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: REVIEWS & TESTIMONIALS */}
          {activeTab === 'reviews' && (
            <div className="pro-table-container">
              <div className="pro-table-toolbar">
                <span style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--adm-text-primary)' }}>
                  Total Testimonials ({reviews.length})
                </span>
                <button className="pro-btn pro-btn-gold pro-btn-sm" onClick={() => setShowNewReviewModal(true)}>
                  <Plus size={14} />
                  <span>Add Review</span>
                </button>
              </div>

              <div className="pro-table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Treatment</th>
                      <th>Rating</th>
                      <th>Website Spotlight</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(r => (
                      <tr
                        key={r.id}
                        className="clickable"
                        onClick={() => openRecordDetail('review', r)}
                      >
                        <td><b style={{ fontSize: '.86rem' }}>{r.name}</b></td>
                        <td><span style={{ fontSize: '.82rem' }}>{r.service}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {Array.from({ length: r.stars || 5 }).map((_, i) => (
                              <Star key={i} size={13} fill="#C59B3F" color="#C59B3F" />
                            ))}
                          </div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button
                            className={`pro-btn-action ${r.featured ? 'wa' : ''}`}
                            onClick={() => handleToggleReview(r.id, { featured: !r.featured })}
                          >
                            <Sparkles size={12} />
                            <span>{r.featured ? 'Featured on Webpage' : 'CRM Only'}</span>
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <button
                              className="pro-btn-action"
                              onClick={() => openRecordDetail('review', r)}
                              title="View full review"
                            >
                              <Eye size={13} />
                              <span>Details</span>
                            </button>
                            <button
                              className="pro-btn-action delete"
                              onClick={() => handleDeleteReview(r.id)}
                              title="Delete review"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan="5" className="pro-table-empty">
                          <Star size={32} />
                          <h4>No client reviews yet</h4>
                          <p>Record client reviews to highlight them on the customer homepage.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </main>

      {/* DETAIL DRAWER: LEAD TIMELINE & INTERACTION HISTORY */}
      {selectedLead && (
        <div className="pro-modal-backdrop" onClick={() => setSelectedLead(null)}>
          <div className="pro-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="pro-drawer-header">
              <div>
                <span className={`pro-source-pill ${selectedLead.source || 'website'}`} style={{ marginBottom: 6 }}>
                  {selectedLead.source === 'whatsapp' ? 'WhatsApp Lead' : selectedLead.source === 'phone' ? 'Phone Inquiry' : 'Website Form'}
                </span>
                <h3 style={{ margin: '4px 0 2px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--adm-text-primary)' }}>
                  {selectedLead.name}
                </h3>
                <div style={{ fontSize: '.8rem', color: 'var(--adm-text-secondary)' }}>
                  {selectedLead.phone} · {selectedLead.email || 'No email registered'}
                </div>
              </div>
              <button className="pro-modal-close" onClick={() => setSelectedLead(null)} aria-label="Close drawer">
                <X size={18} />
              </button>
            </div>

            <div className="pro-drawer-body">
              {/* Lead Summary Meta Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 14, background: 'var(--adm-bg)', borderRadius: 'var(--adm-radius-md)', marginBottom: 20 }}>
                <div>
                  <small style={{ display: 'block', fontSize: '.72rem', color: 'var(--adm-text-secondary)', textTransform: 'uppercase' }}>Inquiry Topic</small>
                  <b style={{ fontSize: '.88rem', color: 'var(--adm-text-primary)' }}>{selectedLead.topic || 'General'}</b>
                </div>
                <div>
                  <small style={{ display: 'block', fontSize: '.72rem', color: 'var(--adm-text-secondary)', textTransform: 'uppercase' }}>Pipeline Status</small>
                  <select
                    value={selectedLead.status || 'new'}
                    onChange={(e) => handleUpdateLeadStatus(selectedLead.id, e.target.value)}
                    className="pro-select"
                    style={{ height: 30, fontSize: '.76rem', marginTop: 2 }}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed / Booked</option>
                  </select>
                </div>
              </div>

              {/* Message from client */}
              <div style={{ marginBottom: 20 }}>
                <b style={{ display: 'block', fontSize: '.82rem', color: 'var(--adm-text-primary)', marginBottom: 6 }}>Client Inquiry Message:</b>
                <div style={{ padding: 12, background: 'var(--adm-surface-alt)', border: '1px solid var(--adm-border)', borderRadius: 'var(--adm-radius-md)', fontSize: '.84rem', color: 'var(--adm-text-primary)', fontStyle: 'italic' }}>
                  "{selectedLead.message || 'No initial message text recorded.'}"
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {selectedLead.phone && (
                  <button
                    className="pro-btn-action wa"
                    style={{ height: 34, padding: '0 12px' }}
                    onClick={() => {
                      const clean = selectedLead.phone.replace(/\D/g, '');
                      const target = clean.length === 10 ? `91${clean}` : clean;
                      window.open(waLink(target, leadFollowUpMessage(selectedLead)), '_blank');
                    }}
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp</span>
                  </button>
                )}

                {selectedLead.phone && (
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="pro-btn-action"
                    style={{ height: 34, padding: '0 12px', textDecoration: 'none' }}
                  >
                    <PhoneCall size={14} />
                    <span>Call Phone</span>
                  </a>
                )}

                <button
                  className="pro-btn-action"
                  style={{ height: 34, padding: '0 12px', background: 'var(--adm-primary)', color: '#FFFFFF', borderColor: 'var(--adm-primary)' }}
                  onClick={() => handleConvertLeadToBooking(selectedLead)}
                >
                  <Calendar size={14} />
                  <span>Convert to Appointment</span>
                </button>
              </div>

              {/* Add Interaction Log */}
              <div style={{ marginBottom: 24, padding: 16, border: '1px solid var(--adm-border)', borderRadius: 'var(--adm-radius-md)' }}>
                <b style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: 'var(--adm-text-primary)', marginBottom: 10 }}>
                  <Plus size={14} />
                  <span>Record Staff Note / Interaction</span>
                </b>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="pro-input"
                    placeholder="e.g. Called client; confirmed bridal package trial for Friday..."
                    value={newLeadNote}
                    onChange={(e) => setNewLeadNote(e.target.value)}
                    style={{ flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLeadHistory(selectedLead.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="pro-btn pro-btn-gold pro-btn-sm"
                    onClick={() => handleAddLeadHistory(selectedLead.id)}
                  >
                    <span>Save Note</span>
                  </button>
                </div>
              </div>

              {/* Interaction Timeline History */}
              <div>
                <b style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: 'var(--adm-text-primary)', marginBottom: 14 }}>
                  <History size={14} />
                  <span>Interaction Timeline ({(selectedLead.history || []).length} events)</span>
                </b>

                <div className="pro-timeline-wrap">
                  {(selectedLead.history && selectedLead.history.length > 0) ? (
                    selectedLead.history.map((h, idx) => (
                      <div key={h.id || idx} className="pro-timeline-item">
                        <div className="pro-timeline-dot"></div>
                        <div className="pro-timeline-content">
                          <div className="pro-timeline-header">
                            <b>{h.action}</b>
                            <span>{new Date(h.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p>{h.note}</p>
                          <small style={{ display: 'block', marginTop: 4, color: 'var(--adm-text-tertiary)', fontSize: '.7rem' }}>Logged by {h.author || 'Admin'}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '.82rem', color: 'var(--adm-text-secondary)' }}>No interaction logs recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD LEAD */}
      {showNewLeadModal && (
        <div className="pro-modal-backdrop" onClick={() => setShowNewLeadModal(false)}>
          <div className="pro-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <div>
                <h3>Record New Lead</h3>
                <p>Log a WhatsApp chat inquiry, phone call, or walk-in client</p>
              </div>
              <button className="pro-modal-close" onClick={() => setShowNewLeadModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div className="pro-modal-body">
                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Client Name <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      className="pro-input"
                      value={newLeadForm.name}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Lead Source</label>
                    <select
                      className="pro-form-select"
                      value={newLeadForm.source}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    >
                      <option value="whatsapp">WhatsApp Chat</option>
                      <option value="phone">Phone Call</option>
                      <option value="walk-in">Walk-in Patron</option>
                      <option value="website">Website Contact</option>
                    </select>
                  </div>
                </div>

                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Phone Number <span className="req">*</span></label>
                    <input
                      type="tel"
                      required
                      className="pro-input"
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Email (Optional)</label>
                    <input
                      type="email"
                      className="pro-input"
                      value={newLeadForm.email}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Interested Treatment</label>
                  <select
                    className="pro-form-select"
                    value={newLeadForm.topic}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, topic: e.target.value })}
                  >
                    <option value="Signature Facial">Signature Facial</option>
                    <option value="Hair Spa & Style">Hair Spa &amp; Style</option>
                    <option value="Gel Manicure">Gel Manicure</option>
                    <option value="Bridal Packages">Bridal Packages</option>
                    <option value="Waxing & Wellness">Waxing &amp; Wellness</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Client Message / Notes</label>
                  <textarea
                    rows="3"
                    className="pro-textarea"
                    value={newLeadForm.message}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                    placeholder="e.g. Patron inquired via WhatsApp about weekend availability..."
                  ></textarea>
                </div>
              </div>

              <div className="pro-modal-footer">
                <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setShowNewLeadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pro-btn pro-btn-gold">
                  <span>Save Lead to Pipeline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESCHEDULE APPOINTMENT */}
      {editingBooking && (
        <div className="pro-modal-backdrop" onClick={() => setEditingBooking(null)}>
          <div className="pro-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <div>
                <h3>Reschedule Appointment</h3>
                <p>Update date, time slot, service price, or status</p>
              </div>
              <button className="pro-modal-close" onClick={() => setEditingBooking(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedBooking}>
              <div className="pro-modal-body">
                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Client Name</label>
                    <input
                      type="text"
                      className="pro-input"
                      value={editingBooking.customerName}
                      onChange={(e) => setEditingBooking({ ...editingBooking, customerName: e.target.value })}
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Phone</label>
                    <input
                      type="tel"
                      className="pro-input"
                      value={editingBooking.customerPhone}
                      onChange={(e) => setEditingBooking({ ...editingBooking, customerPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Date</label>
                    <input
                      type="date"
                      className="pro-input"
                      value={editingBooking.date}
                      onChange={(e) => setEditingBooking({ ...editingBooking, date: e.target.value })}
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Time Slot</label>
                    <select
                      className="pro-form-select"
                      value={editingBooking.timeSlot}
                      onChange={(e) => setEditingBooking({ ...editingBooking, timeSlot: e.target.value })}
                    >
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>12:00 PM</option>
                      <option>1:30 PM</option>
                      <option>2:30 PM</option>
                      <option>3:30 PM</option>
                      <option>4:30 PM</option>
                      <option>5:30 PM</option>
                      <option>6:30 PM</option>
                    </select>
                  </div>
                </div>

                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Status</label>
                    <select
                      className="pro-form-select"
                      value={editingBooking.status}
                      onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Price (₹)</label>
                    <input
                      type="number"
                      className="pro-input"
                      value={editingBooking.servicePrice}
                      onChange={(e) => setEditingBooking({ ...editingBooking, servicePrice: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Notes</label>
                  <textarea
                    rows="2"
                    className="pro-textarea"
                    value={editingBooking.notes || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="pro-modal-footer">
                <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setEditingBooking(null)}>
                  Cancel
                </button>
                <button type="submit" className="pro-btn pro-btn-gold">
                  <span>Save Rescheduled Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD APPOINTMENT */}
      {showNewBookingModal && (
        <div className="pro-modal-backdrop" onClick={() => setShowNewBookingModal(false)}>
          <div className="pro-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <div>
                <h3>Schedule Appointment</h3>
                <p>Reserve a treatment slot directly in the studio calendar</p>
              </div>
              <button className="pro-modal-close" onClick={() => setShowNewBookingModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div className="pro-modal-body">
                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Client Name <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      className="pro-input"
                      value={newBooking.customerName}
                      onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Phone <span className="req">*</span></label>
                    <input
                      type="tel"
                      required
                      className="pro-input"
                      value={newBooking.customerPhone}
                      onChange={(e) => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Treatment</label>
                    <select
                      className="pro-form-select"
                      value={newBooking.serviceName}
                      onChange={(e) => {
                        const found = services.find(s => s.name === e.target.value);
                        setNewBooking({
                          ...newBooking,
                          serviceName: e.target.value,
                          servicePrice: found ? found.price : 1800
                        });
                      }}
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.name}>{s.name} ({fmtCurrency(s.price)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Price (₹)</label>
                    <input
                      type="number"
                      className="pro-input"
                      value={newBooking.servicePrice}
                      onChange={(e) => setNewBooking({ ...newBooking, servicePrice: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Date</label>
                    <input
                      type="date"
                      className="pro-input"
                      value={newBooking.date}
                      onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Time Slot</label>
                    <select
                      className="pro-form-select"
                      value={newBooking.timeSlot}
                      onChange={(e) => setNewBooking({ ...newBooking, timeSlot: e.target.value })}
                    >
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>12:00 PM</option>
                      <option>1:30 PM</option>
                      <option>2:30 PM</option>
                      <option>3:30 PM</option>
                      <option>4:30 PM</option>
                      <option>5:30 PM</option>
                      <option>6:30 PM</option>
                    </select>
                  </div>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Client Notes</label>
                  <textarea
                    rows="2"
                    className="pro-textarea"
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="pro-modal-footer">
                <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setShowNewBookingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pro-btn pro-btn-gold">
                  <span>Confirm &amp; Schedule Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`pro-toast ${toast.kind}`} role="status" aria-live="polite" key={toast.id}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss message"><X size={14} /></button>
        </div>
      )}

      {/* MODAL: WHATSAPP TEMPLATES */}
      {waModalBooking && (
        <div className="pro-modal-backdrop" onClick={() => setWaModalBooking(null)}>
          <div className="pro-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <div>
                <h3>WhatsApp Notification</h3>
                <p>Dispatch a personalized message to {waModalBooking.customerName}</p>
              </div>
              <button className="pro-modal-close" onClick={() => setWaModalBooking(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="pro-modal-body" style={{ display: 'grid', gap: 12 }}>
              {Object.entries(bookingTemplates).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  className="wa-template-option"
                  onClick={() => launchWhatsAppMessage(waModalBooking, key)}
                >
                  <span className="wa-template-head">
                    <MessageSquare size={15} />
                    <b>{template.label}</b>
                    <small>{template.hint}</small>
                  </span>
                  <span className="wa-template-preview">{template.build(waModalBooking)}</span>
                </button>
              ))}
            </div>

            <div className="pro-modal-footer">
              <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setWaModalBooking(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLIENT */}
      {showNewCustomerModal && (
        <div className="pro-modal-backdrop" onClick={() => setShowNewCustomerModal(false)}>
          <div className="pro-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <div>
                <h3>Add New Client</h3>
                <p>Register a patron profile in the studio directory</p>
              </div>
              <button className="pro-modal-close" onClick={() => setShowNewCustomerModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div className="pro-modal-body">
                <div className="pro-form-group">
                  <label className="pro-form-label">Client Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    className="pro-input"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>

                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Phone <span className="req">*</span></label>
                    <input
                      type="tel"
                      required
                      className="pro-input"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Email</label>
                    <input
                      type="email"
                      className="pro-input"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Tags (e.g. VIP, Regular, Bridal)</label>
                  <input
                    type="text"
                    className="pro-input"
                    value={newCustomer.tags}
                    onChange={(e) => setNewCustomer({ ...newCustomer, tags: e.target.value })}
                  />
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Notes</label>
                  <textarea
                    rows="2"
                    className="pro-textarea"
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="pro-modal-footer">
                <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setShowNewCustomerModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pro-btn pro-btn-gold">
                  <span>Save Client Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE */}
      {showNewServiceModal && (
        <div className="pro-modal-backdrop" onClick={() => setShowNewServiceModal(false)}>
          <div className="pro-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <div>
                <h3>Add New Treatment</h3>
                <p>Register a service in the studio treatment menu</p>
              </div>
              <button className="pro-modal-close" onClick={() => setShowNewServiceModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateService}>
              <div className="pro-modal-body">
                <div className="pro-form-group">
                  <label className="pro-form-label">Treatment Name <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    className="pro-input"
                    placeholder="e.g. 24K Gold Collagen Facial"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  />
                </div>

                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Category</label>
                    <select
                      className="pro-form-select"
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    >
                      <option value="skin">Skin Care</option>
                      <option value="hair">Hair Care</option>
                      <option value="nails">Nail Artistry</option>
                      <option value="bridal">Bridal Artistry</option>
                      <option value="wellness">Wellness &amp; Waxing</option>
                    </select>
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Duration</label>
                    <input
                      type="text"
                      className="pro-input"
                      placeholder="e.g. 75 min"
                      value={newService.dur}
                      onChange={(e) => setNewService({ ...newService, dur: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Price (₹) <span className="req">*</span></label>
                  <input
                    type="number"
                    required
                    className="pro-input"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                  />
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Description</label>
                  <textarea
                    rows="2"
                    className="pro-textarea"
                    placeholder="Treatment details and benefits..."
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="pro-modal-footer">
                <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setShowNewServiceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pro-btn pro-btn-gold">
                  <span>Create Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SERVICE */}
      {editingService && (
        <div className="pro-modal-backdrop" onClick={() => setEditingService(null)}>
          <div className="pro-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <div>
                <h3>Edit Treatment</h3>
                <p>Update service pricing, duration, or description</p>
              </div>
              <button className="pro-modal-close" onClick={() => setEditingService(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedService}>
              <div className="pro-modal-body">
                <div className="pro-form-group">
                  <label className="pro-form-label">Treatment Name</label>
                  <input
                    type="text"
                    required
                    className="pro-input"
                    value={editingService.name}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  />
                </div>

                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Price (₹)</label>
                    <input
                      type="number"
                      required
                      className="pro-input"
                      value={editingService.price}
                      onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Duration</label>
                    <input
                      type="text"
                      className="pro-input"
                      value={editingService.dur}
                      onChange={(e) => setEditingService({ ...editingService, dur: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Description</label>
                  <textarea
                    rows="2"
                    className="pro-textarea"
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="pro-modal-footer">
                <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setEditingService(null)}>
                  Cancel
                </button>
                <button type="submit" className="pro-btn pro-btn-gold">
                  <span>Save Treatment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD REVIEW */}
      {showNewReviewModal && (
        <div className="pro-modal-backdrop" onClick={() => setShowNewReviewModal(false)}>
          <div className="pro-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <div>
                <h3>Add Client Review</h3>
                <p>Record client feedback to highlight on your studio website</p>
              </div>
              <button className="pro-modal-close" onClick={() => setShowNewReviewModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateReview}>
              <div className="pro-modal-body">
                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Client Name <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      className="pro-input"
                      placeholder="e.g. Meera S."
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    />
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Treatment</label>
                    <input
                      type="text"
                      className="pro-input"
                      placeholder="e.g. Signature Facial"
                      value={newReview.service}
                      onChange={(e) => setNewReview({ ...newReview, service: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pro-form-row">
                  <div className="pro-form-group">
                    <label className="pro-form-label">Rating (Stars)</label>
                    <select
                      className="pro-form-select"
                      value={newReview.stars}
                      onChange={(e) => setNewReview({ ...newReview, stars: Number(e.target.value) })}
                    >
                      <option value={5}>5 Stars - Excellent</option>
                      <option value={4}>4 Stars - Very Good</option>
                      <option value={3}>3 Stars - Good</option>
                    </select>
                  </div>
                  <div className="pro-form-group">
                    <label className="pro-form-label">Feature on Homepage</label>
                    <select
                      className="pro-form-select"
                      value={newReview.featured ? 'yes' : 'no'}
                      onChange={(e) => setNewReview({ ...newReview, featured: e.target.value === 'yes' })}
                    >
                      <option value="yes">Yes - Spotlight on Homepage</option>
                      <option value="no">No - Keep in CRM Only</option>
                    </select>
                  </div>
                </div>

                <div className="pro-form-group">
                  <label className="pro-form-label">Review Quote <span className="req">*</span></label>
                  <textarea
                    rows="3"
                    required
                    className="pro-textarea"
                    placeholder="The best facial experience I've had in Chennai..."
                    value={newReview.quote}
                    onChange={(e) => setNewReview({ ...newReview, quote: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="pro-modal-footer">
                <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setShowNewReviewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pro-btn pro-btn-gold">
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFESSIONAL CUSTOM DELETE CONFIRMATION DIALOG */}
      {deleteDialog.isOpen && (
        <div className="pro-confirm-backdrop" onClick={() => setDeleteDialog({ isOpen: false, title: '', message: '', onConfirm: null })}>
          <div className="pro-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="pro-confirm-header">
              <div className="pro-confirm-icon-wrap">
                <AlertTriangle size={22} />
              </div>
              <div className="pro-confirm-body">
                <h3>{deleteDialog.title || 'Confirm Deletion'}</h3>
                <p>{deleteDialog.message || 'This action cannot be undone. Are you sure you want to permanently delete this item?'}</p>
              </div>
            </div>
            <div className="pro-confirm-footer">
              <button
                type="button"
                className="pro-btn pro-btn-secondary"
                onClick={() => setDeleteDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pro-confirm-btn-danger"
                onClick={() => {
                  if (deleteDialog.onConfirm) deleteDialog.onConfirm();
                  setDeleteDialog({ isOpen: false, title: '', message: '', onConfirm: null });
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
