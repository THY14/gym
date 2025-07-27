import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi, useAsyncAction } from '../hooks/useApi';
import { authAPI, bookingsAPI, paymentsAPI, trainersAPI } from '../services/api';
import { Users, DollarSign, Calendar, Activity, UserCheck, Settings, Shield, User, MapPin, Phone, Mail, Clock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member' });
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    capacity: '',
    duration: '',
    price: '',
    image: null,
    trainer: { user: { firstName: '', lastName: '' } },
    features: [],
    availability: { days: [], times: [] },
    startTime: ''
  });
  const [newTrainer, setNewTrainer] = useState({
    name: '',
    specialization: [],
    experience: '',
    bio: '',
    image: null,
    certifications: [],
    specialties: [],
    availability: { days: [], times: [] },
    phone: '',
    email: ''
  });
  const [editUser, setEditUser] = useState(null);
  const [editClass, setEditClass] = useState(null);
  const [editTrainer, setEditTrainer] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [successMessage, setSuccessMessage] = useState(null);
  const { execute } = useAsyncAction();

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Predefined options for selections
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const availableSpecializations = [
    'Strength Training', 'Cardio & HIIT', 'Yoga & Wellness', 'Sports Performance', 'Weight Loss'
  ];
  const availableCertifications = ['NASM-CPT', 'ACSM-CPT', 'ACE-CPT', 'TRX Certified'];
  const availableSpecialties = [
    'Weight Loss', 'Muscle Building', 'Nutrition Planning', 'HIIT Training', 'Cardio Conditioning', 'Flexibility'
  ];
  const classFeatures = [
    'Form correction', 'Flexibility improvement', 'Stress reduction', 'Fat burning'
  ];

  // Fetch data using useApi hook
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useApi(
    () => authAPI.getAllUsers(),
    []
  );
  const { data: classesData, loading: classesLoading, error: classesError, refetch: refetchClasses } = useApi(
    () => bookingsAPI.getAllClasses(),
    []
  );
  const { data: trainersData, loading: trainersLoading, error: trainersError, refetch: refetchTrainers } = useApi(
    () => trainersAPI.getAll(),
    []
  );
  const { data: paymentsData, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = useApi(
    () => paymentsAPI.getAllPayments(),
    []
  );
  const { data: contactData, loading: contactLoading, error: contactError, refetch: refetchContact } = useApi(
    () => authAPI.getContactInfo(),
    []
  );

  // Combine API data into states
  const users = usersData || [];
  const classes = classesData || [];
  const trainers = trainersData || [];
  const payments = paymentsData || [];
  const contactInfo = contactData || {
    address: {
      line1: 'No. 123, Street 271',
      line2: 'Boeng Keng Kang 3, Chamkarmon',
      city: 'Phnom Penh, Cambodia'
    },
    phone: '(885) 123-456-789',
    email: 'info@gymclub.com',
    hours: {
      weekdays: 'Monday - Friday: 5:00 AM - 11:00 PM',
      weekends: 'Saturday - Sunday: 6:00 AM - 10:00 PM'
    }
  };

  // Permissions
  const permissions = useMemo(() => ({
    roles: {
      admin: ['all'],
      trainer: ['view_members', 'manage_classes', 'view_profile'],
      receptionist: ['view_members', 'manage_members', 'view_payments', 'view_dashboard', 'view_revenue'],
      member: ['view_profile', 'book_classes']
    },
    users: {},
    actions: {
      view_dashboard: ['admin', 'receptionist'],
      view_members: ['admin', 'trainer', 'receptionist'],
      manage_members: ['admin', 'receptionist'],
      view_trainers: ['admin'],
      manage_trainers: ['admin'],
      view_receptionists: ['admin'],
      manage_receptionists: ['admin'],
      view_classes: ['admin', 'trainer'],
      manage_classes: ['admin', 'trainer'],
      view_payments: ['admin', 'receptionist'],
      view_revenue: ['admin', 'receptionist'],
      manage_permissions: ['admin'],
      manage_settings: ['admin'],
      generate_reports: ['admin']
    }
  }), []);

  // Check user permissions
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    const userRole = permissions.users[user.id] || user.role || 'member';
    return permissions.roles[userRole]?.includes('all') || 
           permissions.actions[permission]?.includes(userRole);
  }, [user, permissions]);

  // Handle permission changes
  const handlePermissionChange = useCallback((userId, role) => {
    permissions.users[userId] = role;
  }, []);

  // Handle action permission changes
  const handleActionPermissionChange = useCallback((action, role, checked) => {
    if (role === 'admin') return;
    permissions.actions[action] = checked
      ? [...(permissions.actions[action] || []), role]
      : permissions.actions[action].filter(r => r !== role);
  }, []);

  // CRUD Operations for Users
  const handleAddUser = useCallback(async (e, role) => {
    e.preventDefault();
    const permission = role === 'member' ? 'manage_members' : role === 'trainer' ? 'manage_trainers' : 'manage_receptionists';
    if (!hasPermission(permission)) {
      setSuccessMessage(`Permission denied: Cannot add ${role}`);
      return;
    }
    if (!newMember.name || !newMember.email) {
      setSuccessMessage('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMember.email)) {
      setSuccessMessage('Please enter a valid email address');
      return;
    }
    try {
      const newUser = {
        name: newMember.name,
        email: newMember.email,
        role,
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
        ...(role === 'trainer' ? { classes: 0 } : {})
      };
      await execute(() => authAPI.createUser(newUser));
      if (role === 'trainer') {
        await execute(() => trainersAPI.create({
          name: newMember.name,
          email: newMember.email,
          specialization: [],
          experience: '',
          bio: '',
          image: null,
          certifications: [],
          specialties: [],
          availability: { days: [], times: [] },
          phone: ''
        }));
      }
      if (role === 'member') {
        await execute(() => paymentsAPI.create({
          userId: newUser.id,
          amount: 199,
          description: 'New Member Registration',
          date: new Date().toISOString().slice(0, 10),
          method: 'Credit Card',
          status: 'completed'
        }));
      }
      setNewMember({ name: '', email: '', role });
      setSuccessMessage(`Successfully added ${role}`);
      refetchUsers();
      if (role === 'trainer') refetchTrainers();
      if (role === 'member') refetchPayments();
    } catch (err) {
      setSuccessMessage(`Failed to add ${role}: ${err.message}`);
    }
  }, [hasPermission, newMember, execute, refetchUsers, refetchTrainers, refetchPayments]);

  const handleEditUser = useCallback((user) => {
    setEditUser(user);
  }, []);

  const handleUpdateUser = useCallback(async (e) => {
    e.preventDefault();
    const permission = editUser?.role === 'member' ? 'manage_members' : editUser?.role === 'trainer' ? 'manage_trainers' : 'manage_receptionists';
    if (!hasPermission(permission) || !editUser) {
      setSuccessMessage(`Permission denied: Cannot update ${editUser?.role || 'user'}`);
      return;
    }
    if (!editUser.name || !editUser.email) {
      setSuccessMessage('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUser.email)) {
      setSuccessMessage('Please enter a valid email address');
      return;
    }
    try {
      await execute(() => authAPI.updateUser(editUser.id, editUser));
      if (editUser.role === 'trainer') {
        await execute(() => trainersAPI.update(editUser.id, { name: editUser.name, email: editUser.email }));
        await execute(() => bookingsAPI.updateClassesByTrainer(editUser.id, { trainer: { user: { firstName: editUser.name.split(' ')[0], lastName: editUser.name.split(' ')[1] || '' } } }));
      }
      setEditUser(null);
      setSuccessMessage('User updated successfully');
      refetchUsers();
      if (editUser.role === 'trainer') {
        refetchTrainers();
        refetchClasses();
      }
    } catch (err) {
      setSuccessMessage(`Failed to update user: ${err.message}`);
    }
  }, [hasPermission, editUser, execute, refetchUsers, refetchTrainers, refetchClasses]);

  const handleDeleteUser = useCallback(async (userId, role) => {
    const permission = role === 'member' ? 'manage_members' : role === 'trainer' ? 'manage_trainers' : 'manage_receptionists';
    if (!hasPermission(permission)) {
      setSuccessMessage(`Permission denied: Cannot delete ${role}`);
      return;
    }
    try {
      await execute(() => authAPI.deleteUser(userId));
      if (role === 'trainer') {
        await execute(() => trainersAPI.delete(userId));
        await execute(() => bookingsAPI.updateClassesByTrainer(userId, { trainer: { user: { firstName: 'Unassigned', lastName: '' } } }));
      }
      if (role === 'member') {
        await execute(() => paymentsAPI.deleteByUserId(userId));
      }
      setSuccessMessage(`Successfully deleted ${role}`);
      refetchUsers();
      if (role === 'trainer') {
        refetchTrainers();
        refetchClasses();
      }
      if (role === 'member') refetchPayments();
    } catch (err) {
      setSuccessMessage(`Failed to delete ${role}: ${err.message}`);
    }
  }, [hasPermission, execute, refetchUsers, refetchTrainers, refetchClasses, refetchPayments]);

  // CRUD Operations for Classes
  const handleAddClass = useCallback(async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_classes')) {
      setSuccessMessage('Permission denied: Cannot add class');
      return;
    }
    if (
      !newClass.name ||
      !newClass.capacity ||
      !newClass.duration ||
      !newClass.price ||
      !newClass.availability.days.length ||
      !newClass.trainer.user.firstName ||
      !newClass.startTime
    ) {
      setSuccessMessage('Please fill in all required fields');
      return;
    }
    try {
      const [firstName, lastName] = newClass.trainer.user.firstName.split(' ');
      const classData = {
        name: newClass.name,
        description: newClass.description || '',
        capacity: parseInt(newClass.capacity),
        duration: parseInt(newClass.duration),
        price: parseFloat(newClass.price),
        image: newClass.image ? await uploadImage(newClass.image) : '/default_class.jpg',
        trainer: { user: { firstName, lastName: lastName || '' } },
        features: newClass.features.filter(f => f.trim()),
        availability: {
          days: newClass.availability.days,
          times: newClass.availability.times.length > 0 ? newClass.availability.times : [newClass.startTime]
        },
        startTime: newClass.startTime
      };
      await execute(() => bookingsAPI.createClass(classData));
      setNewClass({
        name: '',
        description: '',
        capacity: '',
        duration: '',
        price: '',
        image: null,
        trainer: { user: { firstName: '', lastName: '' } },
        features: [],
        availability: { days: [], times: [] },
        startTime: ''
      });
      setSuccessMessage('Class added successfully');
      refetchClasses();
    } catch (err) {
      setSuccessMessage(`Failed to add class: ${err.message}`);
    }
  }, [hasPermission, newClass, execute, refetchClasses]);

  const handleUpdateClass = useCallback(async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_classes') || !editClass) {
      setSuccessMessage('Permission denied: Cannot update class');
      return;
    }
    try {
      const [firstName, lastName] = editClass.trainer.user.firstName.split(' ');
      const classData = {
        name: editClass.name,
        description: editClass.description || '',
        capacity: parseInt(editClass.capacity),
        duration: parseInt(editClass.duration),
        price: parseFloat(editClass.price),
        image: editClass.image && typeof editClass.image !== 'string' ? await uploadImage(editClass.image) : editClass.image || '/default_class.jpg',
        trainer: { user: { firstName, lastName: lastName || '' } },
        features: editClass.features.filter(f => f.trim()),
        availability: editClass.availability,
        startTime: editClass.startTime
      };
      await execute(() => bookingsAPI.updateClass(editClass.id, classData));
      setEditClass(null);
      setSuccessMessage('Class updated successfully');
      refetchClasses();
    } catch (err) {
      setSuccessMessage(`Failed to update class: ${err.message}`);
    }
  }, [hasPermission, editClass, execute, refetchClasses]);

  const handleDeleteClass = useCallback(async (classId) => {
    if (!hasPermission('manage_classes')) {
      setSuccessMessage('Permission denied: Cannot delete class');
      return;
    }
    try {
      await execute(() => bookingsAPI.deleteClass(classId));
      setSuccessMessage('Class deleted successfully');
      refetchClasses();
    } catch (err) {
      setSuccessMessage(`Failed to delete class: ${err.message}`);
    }
  }, [hasPermission, execute, refetchClasses]);

  // CRUD Operations for Trainers
  const handleAddTrainer = useCallback(async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_trainers')) {
      setSuccessMessage('Permission denied: Cannot add trainer');
      return;
    }
    if (
      !newTrainer.name ||
      !newTrainer.specialization.length ||
      !newTrainer.email ||
      !newTrainer.certifications.length ||
      !newTrainer.specialties.length ||
      !newTrainer.availability.days.length
    ) {
      setSuccessMessage('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newTrainer.email)) {
      setSuccessMessage('Please enter a valid email address');
      return;
    }
    try {
      const newUser = {
        name: newTrainer.name,
        email: newTrainer.email,
        role: 'trainer',
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
        classes: 0
      };
      const userResponse = await execute(() => authAPI.createUser(newUser));
      const trainerData = {
        id: userResponse.data.id,
        name: newTrainer.name,
        specialization: newTrainer.specialization,
        experience: newTrainer.experience,
        bio: newTrainer.bio || '',
        image: newTrainer.image ? await uploadImage(newTrainer.image) : null,
        certifications: newTrainer.certifications,
        specialties: newTrainer.specialties,
        availability: {
          days: newTrainer.availability.days,
          times: newTrainer.availability.times.length > 0 ? newTrainer.availability.times : ['Not specified']
        },
        phone: newTrainer.phone,
        email: newTrainer.email
      };
      await execute(() => trainersAPI.create(trainerData));
      setNewTrainer({
        name: '',
        specialization: [],
        experience: '',
        bio: '',
        image: null,
        certifications: [],
        specialties: [],
        availability: { days: [], times: [] },
        phone: '',
        email: ''
      });
      setSuccessMessage('Trainer added successfully');
      refetchUsers();
      refetchTrainers();
    } catch (err) {
      setSuccessMessage(`Failed to add trainer: ${err.message}`);
    }
  }, [hasPermission, newTrainer, execute, refetchUsers, refetchTrainers]);

  const handleUpdateTrainer = useCallback(async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_trainers') || !editTrainer) {
      setSuccessMessage('Permission denied: Cannot update trainer');
      return;
    }
    try {
      const trainerData = {
        name: editTrainer.name,
        specialization: editTrainer.specialization,
        experience: editTrainer.experience,
        bio: editTrainer.bio || '',
        image: editTrainer.image && typeof editTrainer.image !== 'string' ? await uploadImage(editTrainer.image) : editTrainer.image || null,
        certifications: editTrainer.certifications.filter(c => c.trim()),
        specialties: editTrainer.specialties.filter(s => s.trim()),
        availability: editTrainer.availability,
        phone: editTrainer.phone,
        email: editTrainer.email
      };
      await execute(() => trainersAPI.update(editTrainer.id, trainerData));
      await execute(() => authAPI.updateUser(editTrainer.id, { name: editTrainer.name, email: editTrainer.email }));
      await execute(() => bookingsAPI.updateClassesByTrainer(editTrainer.id, { trainer: { user: { firstName: editTrainer.name.split(' ')[0], lastName: editTrainer.name.split(' ')[1] || '' } } }));
      setEditTrainer(null);
      setSuccessMessage('Trainer updated successfully');
      refetchUsers();
      refetchTrainers();
      refetchClasses();
    } catch (err) {
      setSuccessMessage(`Failed to update trainer: ${err.message}`);
    }
  }, [hasPermission, editTrainer, execute, refetchUsers, refetchTrainers, refetchClasses]);

  const handleDeleteTrainer = useCallback(async (trainerId) => {
    if (!hasPermission('manage_trainers')) {
      setSuccessMessage('Permission denied: Cannot delete trainer');
      return;
    }
    try {
      await execute(() => trainersAPI.delete(trainerId));
      await execute(() => authAPI.deleteUser(trainerId));
      await execute(() => bookingsAPI.updateClassesByTrainer(trainerId, { trainer: { user: { firstName: 'Unassigned', lastName: '' } } }));
      setSuccessMessage('Trainer deleted successfully');
      refetchUsers();
      refetchTrainers();
      refetchClasses();
    } catch (err) {
      setSuccessMessage(`Failed to delete trainer: ${err.message}`);
    }
  }, [hasPermission, execute, refetchUsers, refetchTrainers, refetchClasses]);

  // Handle Contact Info Update
  const handleContactChange = useCallback((field, value) => {
    setContactInfo(prev => {
      const updated = { ...prev };
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updated[parent] = { ...updated[parent], [child]: value };
      } else {
        updated[field] = value;
      }
      return updated;
    });
  }, []);

  const handleSaveContact = useCallback(async () => {
    if (!hasPermission('manage_settings')) {
      setSuccessMessage('Permission denied: Cannot save contact information');
      return;
    }
    try {
      await execute(() => authAPI.updateContactInfo(contactInfo));
      setSuccessMessage('Contact information saved successfully');
      refetchContact();
    } catch (err) {
      setSuccessMessage(`Failed to save contact information: ${err.message}`);
    }
  }, [hasPermission, contactInfo, execute, refetchContact]);

  const handleCancelContact = useCallback(() => {
    refetchContact();
  }, [refetchContact]);

  // Helper function to upload images
  const uploadImage = async (file) => {
    if (!file) return null;
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }
    const formData = new FormData();
    formData.append('image', file);
    const response = await authAPI.uploadImage(formData);
    return response.data.imageUrl;
  };

  // Calculate totals
  const totalMembers = useMemo(() => users.filter(u => u.role === 'member').length, [users]);
  const totalTrainers = useMemo(() => users.filter(u => u.role === 'trainer').length, [users]);
  const totalReceptionists = useMemo(() => users.filter(u => u.role === 'receptionist').length, [users]);
  const totalRevenue = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const monthlyRevenue = useMemo(() => 
    payments
      .filter(p => p.date.startsWith(selectedMonth))
      .reduce((sum, p) => sum + p.amount, 0),
    [payments, selectedMonth]
  );

  // Memoized tabs configuration
  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: Activity, permission: 'view_dashboard' },
    { id: 'members', label: 'Members', icon: Users, permission: 'view_members' },
    { id: 'trainers', label: 'Trainers', icon: UserCheck, permission: 'view_trainers' },
    { id: 'receptionists', label: 'Receptionists', icon: User, permission: 'view_receptionists' },
    { id: 'classes', label: 'Classes', icon: Calendar, permission: 'view_classes' },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, permission: 'view_revenue' },
    { id: 'permissions', label: 'Permissions', icon: Shield, permission: 'manage_permissions' },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'manage_settings' }
  ], []);

  // Memoized filtered tabs
  const filteredTabs = useMemo(() => 
    tabs.filter(tab => hasPermission(tab.permission)),
    [tabs, hasPermission]
  );

  // Toggle selection handlers
  const toggleSelection = (item, array, setArray) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  // Handle file input for trainer or class image
  const handleTrainerImageChange = (e) => {
    const file = e.target.files[0];
    if (editTrainer) {
      setEditTrainer(prev => ({ ...prev, image: file || null }));
    } else if (editClass) {
      setEditClass(prev => ({ ...prev, image: file || null }));
    } else {
      setNewTrainer(prev => ({ ...prev, image: file || null }));
      setNewClass(prev => ({ ...prev, image: file || null }));
    }
  };
  return (
    <div className="min-h-screen pt-16 py-8 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out max-w-md text-center">
              {successMessage}
            </div>
          </div>
        )}

        {/* Error Display */}
        {(usersError || classesError || trainersError || paymentsError || contactError) && (
          <ErrorMessage
            message={usersError || classesError || trainersError || paymentsError || contactError}
            onRetry={() => {
              if (usersError) refetchUsers();
              if (classesError) refetchClasses();
              if (trainersError) refetchTrainers();
              if (paymentsError) refetchPayments();
              if (contactError) refetchContact();
            }}
          />
        )}

        {/* Loading Spinner */}
        {(usersLoading || classesLoading || trainersLoading || paymentsLoading || contactLoading) && (
          <div className="flex justify-center items-center my-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome back, {user?.firstName}! Manage your gym operations.</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-900 rounded-lg p-1 mb-8">
          <div className="flex space-x-1 overflow-x-auto">
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 rounded-xl p-6">
          {isLoading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button
                      onClick={() => hasPermission('view_members') && setActiveTab('members')}
                      className="bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Members</p>
                          <p className="text-2xl font-bold text-white">{totalMembers}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                    </button>
                    <button
                      onClick={() => hasPermission('view_trainers') && setActiveTab('trainers')}
                      className="bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Trainers</p>
                          <p className="text-2xl font-bold text-white">{totalTrainers}</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-green-500" />
                      </div>
                    </button>
                    <button
                      onClick={() => hasPermission('view_revenue') && setActiveTab('revenue')}
                      className="bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Revenue</p>
                          <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-yellow-500" />
                      </div>
                    </button>
                    <button
                      onClick={() => hasPermission('view_receptionists') && setActiveTab('receptionists')}
                      className="bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Receptionists</p>
                          <p className="text-2xl font-bold text-white">{totalReceptionists}</p>
                        </div>
                        <User className="h-8 w-8 text-purple-500" />
                      </div>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Recent Activities</h3>
                      <div className="space-y-3">
                        {users.slice(0, 2).map(user => (
                          <div key={user.id} className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-white font-medium">New {user.role} activity</p>
                            <p className="text-gray-400 text-sm">{user.name} performed an action</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Add New Member</h4>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Name"
                              value={newMember.name}
                              onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={newMember.email}
                              onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                            />
                            <select
                              value={newMember.role}
                              onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                            >
                              <option value="member">Member</option>
                              <option value="trainer">Trainer</option>
                              <option value="receptionist">Receptionist</option>
                            </select>
                            <button
                              onClick={(e) => handleAddUser(e, newMember.role)}
                              className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg font-semibold transition-colors text-left border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!hasPermission(newMember.role === 'member' ? 'manage_members' : newMember.role === 'trainer' ? 'manage_trainers' : 'manage_receptionists')}
                            >
                              Add {newMember.role.charAt(0).toUpperCase() + newMember.role.slice(1)}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && hasPermission('view_members') && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Member Management ({totalMembers} Members)</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">Add New Member</h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={newMember.name}
                          onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newMember.email}
                          onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <button
                          onClick={(e) => handleAddUser(e, 'member')}
                          className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg font-semibold transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!hasPermission('manage_members')}
                        >
                          Add Member
                        </button>
                      </div>
                    </div>
                    {editUser && editUser.role === 'member' ? (
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Edit Member</h3>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editUser.name}
                            onChange={(e) => setEditUser(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          />
                          <input
                            type="email"
                            value={editUser.email}
                            onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          />
                          <select
                            value={editUser.status}
                            onChange={(e) => setEditUser(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateUser}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditUser(null)}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {users.filter(u => u.role === 'member').map(member => (
                      <div key={member.id} className="bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-white">{member.name}</h3>
                            <p className="text-gray-400 mt-1">{member.email}</p>
                            <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
                              <span>Joined: {member.joinDate}</span>
                              <span>Type: Premium</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              member.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </span>
                            <button
                              onClick={() => handleEditUser(member)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(member.id, 'member')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'trainers' && hasPermission('view_trainers') && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Trainer Management ({totalTrainers} Trainers)</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">{editTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Name *"
                          value={editTrainer ? editTrainer.name : newTrainer.name}
                          onChange={(e) => editTrainer 
                            ? setEditTrainer(prev => ({ ...prev, name: e.target.value }))
                            : setNewTrainer(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <div>
                          <label className="text-gray-400 text-sm">Specializations *</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {availableSpecializations.map(spec => (
                              <label key={spec} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={editTrainer ? editTrainer.specialization.includes(spec) : newTrainer.specialization.includes(spec)}
                                  onChange={() => editTrainer 
                                    ? setEditTrainer(prev => ({ ...prev, specialization: prev.specialization.includes(spec) ? prev.specialization.filter(s => s !== spec) : [...prev.specialization, spec] }))
                                    : setNewTrainer(prev => ({ ...prev, specialization: prev.specialization.includes(spec) ? prev.specialization.filter(s => s !== spec) : [...prev.specialization, spec] }))}
                                  className="form-checkbox text-red-600"
                                />
                                <span className="text-white">{spec}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Experience (e.g., 5 years)"
                          value={editTrainer ? editTrainer.experience : newTrainer.experience}
                          onChange={(e) => editTrainer 
                            ? setEditTrainer(prev => ({ ...prev, experience: e.target.value }))
                            : setNewTrainer(prev => ({ ...prev, experience: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <textarea
                          placeholder="Bio (optional)"
                          value={editTrainer ? editTrainer.bio : newTrainer.bio}
                          onChange={(e) => editTrainer 
                            ? setEditTrainer(prev => ({ ...prev, bio: e.target.value }))
                            : setNewTrainer(prev => ({ ...prev, bio: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          rows="4"
                        />
                        <div>
                          <label className="text-gray-400 text-sm">Image (optional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleTrainerImageChange}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Certifications *</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {availableCertifications.map(cert => (
                              <label key={cert} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={editTrainer ? editTrainer.certifications.includes(cert) : newTrainer.certifications.includes(cert)}
                                  onChange={() => editTrainer 
                                    ? setEditTrainer(prev => ({ ...prev, certifications: prev.certifications.includes(cert) ? prev.certifications.filter(c => c !== cert) : [...prev.certifications, cert] }))
                                    : setNewTrainer(prev => ({ ...prev, certifications: prev.certifications.includes(cert) ? prev.certifications.filter(c => c !== cert) : [...prev.certifications, cert] }))}
                                  className="form-checkbox text-red-600"
                                />
                                <span className="text-white">{cert}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Specialties *</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {availableSpecialties.map(spec => (
                              <label key={spec} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={editTrainer ? editTrainer.specialties.includes(spec) : newTrainer.specialties.includes(spec)}
                                  onChange={() => editTrainer 
                                    ? setEditTrainer(prev => ({ ...prev, specialties: prev.specialties.includes(spec) ? prev.specialties.filter(s => s !== spec) : [...prev.specialties, spec] }))
                                    : setNewTrainer(prev => ({ ...prev, specialties: prev.specialties.includes(spec) ? prev.specialties.filter(s => s !== spec) : [...prev.specialties, spec] }))}
                                  className="form-checkbox text-red-600"
                                />
                                <span className="text-white">{spec}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Available Days *</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {daysOfWeek.map(day => (
                              <label key={day} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={editTrainer ? editTrainer.availability.days.includes(day) : newTrainer.availability.days.includes(day)}
                                  onChange={() => editTrainer 
                                    ? setEditTrainer(prev => ({ ...prev, availability: { ...prev.availability, days: prev.availability.days.includes(day) ? prev.availability.days.filter(d => d !== day) : [...prev.availability.days, day] } }))
                                    : setNewTrainer(prev => ({ ...prev, availability: { ...prev.availability, days: prev.availability.days.includes(day) ? prev.availability.days.filter(d => d !== day) : [...prev.availability.days, day] } }))}
                                  className="form-checkbox text-red-600"
                                />
                                <span className="text-white">{day}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Phone"
                          value={editTrainer ? editTrainer.phone : newTrainer.phone}
                          onChange={(e) => editTrainer 
                            ? setEditTrainer(prev => ({ ...prev, phone: e.target.value }))
                            : setNewTrainer(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          value={editTrainer ? editTrainer.email : newTrainer.email}
                          onChange={(e) => editTrainer 
                            ? setEditTrainer(prev => ({ ...prev, email: e.target.value }))
                            : setNewTrainer(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={editTrainer ? handleUpdateTrainer : handleAddTrainer}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!hasPermission('manage_trainers')}
                          >
                            {editTrainer ? 'Update Trainer' : 'Add Trainer'}
                          </button>
                          {editTrainer && (
                            <button
                              onClick={() => setEditTrainer(null)}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {trainers.map(trainer => (
                      <div key={trainer.id} className="bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
                            <p className="text-gray-400 mt-1">Specializations: {trainer.specialization.join(', ')}</p>
                            <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
                              <span>Experience: {trainer.experience}</span>
                              <span>Email: {trainer.email}</span>
                              <span>Availability: {trainer.availability.days.join(', ')} ({trainer.availability.times.join(', ')})</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center space-x-2">
                            <button
                              onClick={() => handleEditTrainer(trainer)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTrainer(trainer.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'receptionists' && hasPermission('view_receptionists') && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Receptionist Management ({totalReceptionists} Receptionists)</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">Add New Receptionist</h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={newMember.name}
                          onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newMember.email}
                          onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <button
                          onClick={(e) => handleAddUser(e, 'receptionist')}
                          className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg font-semibold transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!hasPermission('manage_receptionists')}
                        >
                          Add Receptionist
                        </button>
                      </div>
                    </div>
                    {editUser && editUser.role === 'receptionist' ? (
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Edit Receptionist</h3>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editUser.name}
                            onChange={(e) => setEditUser(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          />
                          <input
                            type="email"
                            value={editUser.email}
                            onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          />
                          <select
                            value={editUser.status}
                            onChange={(e) => setEditUser(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateUser}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditUser(null)}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {users.filter(u => u.role === 'receptionist').map(receptionist => (
                      <div key={receptionist.id} className="bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-white">{receptionist.name}</h3>
                            <p className="text-gray-400 mt-1">{receptionist.email}</p>
                            <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
                              <span>Joined: {receptionist.joinDate}</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              receptionist.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {receptionist.status.charAt(0).toUpperCase() + receptionist.status.slice(1)}
                            </span>
                            <button
                              onClick={() => handleEditUser(receptionist)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(receptionist.id, 'receptionist')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'classes' && hasPermission('view_classes') && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Class Management ({classes.length} Classes)</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">{editClass ? 'Edit Class' : 'Add New Class'}</h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Class Name *"
                          value={editClass ? editClass.name : newClass.name}
                          onChange={(e) => editClass 
                            ? setEditClass(prev => ({ ...prev, name: e.target.value }))
                            : setNewClass(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={editClass ? editClass.description : newClass.description}
                          onChange={(e) => editClass 
                            ? setEditClass(prev => ({ ...prev, description: e.target.value }))
                            : setNewClass(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          rows="4"
                        />
                        <input
                          type="number"
                          placeholder="Max Capacity (e.g., 15) *"
                          value={editClass ? editClass.capacity : newClass.capacity}
                          onChange={(e) => editClass 
                            ? setEditClass(prev => ({ ...prev, capacity: parseInt(e.target.value) }))
                            : setNewClass(prev => ({ ...prev, capacity: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <input
                          type="number"
                          placeholder="Duration (minutes) *"
                          value={editClass ? editClass.duration : newClass.duration}
                          onChange={(e) => editClass 
                            ? setEditClass(prev => ({ ...prev, duration: parseInt(e.target.value) }))
                            : setNewClass(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <input
                          type="number"
                          placeholder="Price (e.g., 25) *"
                          value={editClass ? editClass.price : newClass.price}
                          onChange={(e) => editClass 
                            ? setEditClass(prev => ({ ...prev, price: parseFloat(e.target.value) }))
                            : setNewClass(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <div>
                          <label className="text-gray-400 text-sm">Image (optional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleTrainerImageChange}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          />
                        </div>
                        <div className="relative">
                          <select
                            value={editClass ? editClass.features.join(', ') : newClass.features.join(', ') || 'Features *'}
                            onChange={(e) => {
                              const selected = e.target.value.split(', ').filter(f => f.trim());
                              editClass 
                                ? setEditClass(prev => ({ ...prev, features: selected }))
                                : setNewClass(prev => ({ ...prev, features: selected }));
                            }}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 appearance-none"
                          >
                            <option value="">Features *</option>
                            {classFeatures.map(feature => (
                              <option key={feature} value={feature}>{feature}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Available Days *</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {daysOfWeek.map(day => (
                              <label key={day} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={editClass ? editClass.availability.days.includes(day) : newClass.availability.days.includes(day)}
                                  onChange={() => editClass 
                                    ? setEditClass(prev => ({ 
                                        ...prev, 
                                        availability: { 
                                          ...prev.availability, 
                                          days: prev.availability.days.includes(day) ? prev.availability.days.filter(d => d !== day) : [...prev.availability.days, day] 
                                        } 
                                      }))
                                    : setNewClass(prev => ({ 
                                        ...prev, 
                                        availability: { 
                                          ...prev.availability, 
                                          days: prev.availability.days.includes(day) ? prev.availability.days.filter(d => d !== day) : [...prev.availability.days, day] 
                                        } 
                                      }))}
                                  className="form-checkbox text-red-600"
                                />
                                <span className="text-white">{day}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <input
                          type="time"
                          placeholder="Start Time *"
                          value={editClass ? editClass.startTime : newClass.startTime}
                          onChange={(e) => editClass 
                            ? setEditClass(prev => ({ ...prev, startTime: e.target.value }))
                            : setNewClass(prev => ({ ...prev, startTime: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                        <div className="relative">
                          <select
                            value={editClass ? `${editClass.trainer.user.firstName} ${editClass.trainer.user.lastName || ''}`.trim() : `${newClass.trainer.user.firstName} ${newClass.trainer.user.lastName || ''}`.trim()}
                            onChange={(e) => {
                              const selectedTrainer = trainers.find(t => t.name === e.target.value) || { name: '', user: { firstName: '', lastName: '' } };
                              const [firstName, lastName] = selectedTrainer.name.split(' ');
                              const trainerData = { 
                                user: { 
                                  firstName: firstName || '', 
                                  lastName: lastName || '' 
                                } 
                              };
                              editClass 
                                ? setEditClass(prev => ({ ...prev, trainer: trainerData }))
                                : setNewClass(prev => ({ ...prev, trainer: trainerData }));
                            }}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 appearance-none"
                          >
                            <option value="">Select Trainer *</option>
                            {trainers.map(trainer => (
                              <option key={trainer.id} value={trainer.name}>
                                {trainer.name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={editClass ? handleUpdateClass : handleAddClass}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!hasPermission('manage_classes')}
                          >
                            {editClass ? 'Update Class' : 'Add Class'}
                          </button>
                          {editClass && (
                            <button
                              onClick={() => setEditClass(null)}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {classes.map(cls => (
                      <div key={cls.id} className="bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-white">{cls.name}</h3>
                            <p className="text-gray-400 mt-1">Instructor: {cls.trainer.user.firstName} {cls.trainer.user.lastName}</p>
                            <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
                              <span>Duration: {cls.duration} min</span>
                              <span>Capacity: {cls.capacity}</span>
                              <span>Price: ${cls.price}</span>
                              <span>Start Time: {cls.startTime}</span>
                              <span>Availability: {cls.availability.days.join(', ')} ({cls.availability.times.join(', ')})</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center space-x-2">
                            <button
                              onClick={() => handleEditClass(cls)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'revenue' && hasPermission('view_revenue') && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Revenue Management</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400">Total Revenue</p>
                          <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Monthly Revenue</p>
                          <p className="text-2xl font-bold text-white">${monthlyRevenue.toLocaleString()}</p>
                          <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-2"
                          >
                            {[...new Set(payments.map(p => p.date.slice(0, 7)))].map(month => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
                      <div className="space-y-4">
                        {payments.map(payment => (
                          <div key={payment.id} className="bg-gray-900 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xl font-bold text-white">${payment.amount.toLocaleString()}</h4>
                                <p className="text-gray-400 mt-1">{payment.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
                                  <span>{payment.date}</span>
                                  <span>{payment.method}</span>
                                  <span>User: {users.find(u => u.id === payment.userId)?.name || 'Unknown'}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                  payment.status === 'completed' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && hasPermission('manage_permissions') && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Permission Management</h2>
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">User Role Assignment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">User</h4>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">Current Role</h4>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">Change Role</h4>
                          </div>
                        </div>
                        {users.map(user => (
                          <div key={user.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border-t border-gray-700">
                            <div>
                              <p className="text-white">{user.name}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                            <div>
                              <p className="text-white capitalize">{user.role}</p>
                            </div>
                            <div>
                              <select
                                value={permissions.users[user.id] || user.role}
                                onChange={(e) => handlePermissionChange(user.id, e.target.value)}
                                className="bg-gray-700 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600"
                              >
                                <option value="trainer">Trainer</option>
                                <option value="receptionist">Receptionist</option>
                                <option value="member">Member</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Action Permissions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">Action</h4>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">Trainer</h4>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">Receptionist</h4>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">Member</h4>
                          </div>
                        </div>
                        {Object.entries(permissions.actions).map(([action, roles]) => (
                          <div key={action} className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2 border-t border-gray-700">
                            <div>
                              <p className="text-white capitalize">{action.replace(/_/g, ' ')}</p>
                            </div>
                            {['trainer', 'receptionist', 'member'].map(role => (
                              <div key={role}>
                                <input
                                  type="checkbox"
                                  checked={roles.includes(role)}
                                  onChange={(e) => handleActionPermissionChange(action, role, e.target.checked)}
                                  className="form-checkbox text-red-600"
                                  disabled={role === 'admin'}
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && hasPermission('manage_settings') && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
                  <div className="bg-gray-800 p-6 rounded-lg space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="bg-red-600 p-3 rounded-lg">
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-2">Address</h4>
                            <input
                              type="text"
                              placeholder="Address Line 1"
                              value={contactInfo.address.line1}
                              onChange={(e) => handleContactChange('address.line1', e.target.value)}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mb-2"
                            />
                            <input
                              type="text"
                              placeholder="Address Line 2"
                              value={contactInfo.address.line2}
                              onChange={(e) => handleContactChange('address.line2', e.target.value)}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mb-2"
                            />
                            <input
                              type="text"
                              placeholder="City, Country"
                              value={contactInfo.address.city}
                              onChange={(e) => handleContactChange('address.city', e.target.value)}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="bg-red-600 p-3 rounded-lg">
                            <Phone className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-2">Phone</h4>
                            <input
                              type="text"
                              placeholder="Phone Number"
                              value={contactInfo.phone}
                              onChange={(e) => handleContactChange('phone', e.target.value)}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="bg-red-600 p-3 rounded-lg">
                            <Mail className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-2">Email</h4>
                            <input
                              type="email"
                              placeholder="Email Address"
                              value={contactInfo.email}
                              onChange={(e) => handleContactChange('email', e.target.value)}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="bg-red-600 p-3 rounded-lg">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-2">Hours</h4>
                            <input
                              type="text"
                              placeholder="Weekdays"
                              value={contactInfo.hours.weekdays}
                              onChange={(e) => handleContactChange('hours.weekdays', e.target.value)}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mb-2"
                            />
                            <input
                              type="text"
                              placeholder="Weekends"
                              value={contactInfo.hours.weekends}
                              onChange={(e) => handleContactChange('hours.weekends', e.target.value)}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleCancelContact}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 mr-2 rounded-lg font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveContact}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!hasPermission('manage_settings')}
                        >
                          Save Contact Information
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;