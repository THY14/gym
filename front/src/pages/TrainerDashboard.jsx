import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MessageCircle,
  UserCheck,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApi, useAsyncAction } from '../hooks/useApi';
import { authAPI, bookingsAPI, paymentsAPI, trainersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const TrainerDashboard = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Days of the week for selection
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch data using useApi hook
  const { data: clientsData, loading: clientsLoading, error: clientsError, refetch: refetchClients } = useApi(
    () => trainersAPI.getClients(user?.id),
    [user?.id]
  );
  const { data: classesData, loading: classesLoading, error: classesError, refetch: refetchClasses } = useApi(
    () => bookingsAPI.getTrainerClasses(user?.id),
    [user?.id]
  );
  const { data: classSchedulesData, loading: schedulesLoading, error: schedulesError, refetch: refetchSchedules } = useApi(
    () => bookingsAPI.getTrainerSchedules(user?.id),
    [user?.id]
  );
  const { data: trainingSessionsData, loading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useApi(
    () => trainersAPI.getTrainingSessions(user?.id),
    [user?.id]
  );
  const { data: profileData, loading: profileLoading, error: profileError, refetch: refetchProfile } = useApi(
    () => authAPI.getUser(user?.id),
    [user?.id]
  );

  // Combine API data into states
  const clients = clientsData || [];
  const classes = classesData || [];
  const classSchedules = classSchedulesData || [];
  const trainingSessions = trainingSessionsData || [];
  const profile = profileData || {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || 'trainer',
    bio: user?.bio || '',
    specialties: user?.specialties || '',
    certifications: user?.certifications || '',
    phoneNumber: user?.phoneNumber || '',
    specialization: user?.specialization || '',
    availability: user?.availability || '',
    profileImage: user?.profileImage || 'https://via.placeholder.com/150'
  };

  // Placeholder workout plans (kept in-memory for now)
  const workoutPlans = [
    { id: 1, name: 'Full Body Blast', description: '3x per week full body workout.' },
    { id: 2, name: 'Strength Focus', description: 'Targeted strength building routine.' }
  ];

  // State for selected workout plan per client
  const [selectedPlans, setSelectedPlans] = useState({});

  // State for new client form
  const [newClient, setNewClient] = useState({
    name: '',
    goal: '',
    fitnessLevel: '',
    medicalHistory: '',
    phoneNumber: '',
    email: ''
  });

  // State for new class form
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    duration: '',
    capacity: '',
    price: '',
    availableDays: []
  });

  // State for new class schedule form
  const [newClassSchedule, setNewClassSchedule] = useState({
    className: '',
    time: '',
    capacity: '',
    location: '',
    room: '',
    availableDays: []
  });

  // State for new training session form
  const [newTrainingSession, setNewTrainingSession] = useState({
    type: 'individual',
    clientId: '',
    clientIds: [],
    time: '',
    startDate: '',
    endDate: '',
    trainingDays: [],
    location: '',
    notes: ''
  });

  // State for editing client, class, class schedule, or training session
  const [editingClient, setEditingClient] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingClassSchedule, setEditingClassSchedule] = useState(null);
  const [editingTrainingSession, setEditingTrainingSession] = useState(null);

  // State for messaging
  const [selectedClientForMessage, setSelectedClientForMessage] = useState(null);
  const [messageText, setMessageText] = useState('');

  // State for profile
  const [editProfile, setEditProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    bio: '',
    specialties: '',
    certifications: '',
    phoneNumber: '',
    specialization: '',
    availability: '',
    profileImage: null
  });
  const [previewImage, setPreviewImage] = useState('https://via.placeholder.com/150');

  // Sync profile data when fetched
  useEffect(() => {
    if (profileData) {
      const initialProfile = {
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        role: profileData.role || 'trainer',
        bio: profileData.bio || '',
        specialties: profileData.specialties || '',
        certifications: profileData.certifications || '',
        phoneNumber: profileData.phoneNumber || '',
        specialization: profileData.specialization || '',
        availability: profileData.availability || '',
        profileImage: null
      };
      setEditProfile(initialProfile);
      setPreviewImage(profileData.profileImage || 'https://via.placeholder.com/150');
      setUser({ ...user, ...profileData });
    }
  }, [profileData, setUser]);

  const { execute } = useAsyncAction();

  // Handler for assigning workout plan to a client
  const assignWorkoutPlan = useCallback((clientId) => {
    const selectedPlanId = selectedPlans[clientId];
    if (!selectedPlanId) {
      setSuccessMessage('Please select a workout plan to assign.');
      return;
    }
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId
          ? { ...client, workoutPlanId: Number(selectedPlanId) }
          : client
      )
    );
    setSuccessMessage('Workout plan assigned successfully.');
  }, [selectedPlans]);

  // Placeholder for member booking a class
  const handleBookClass = useCallback(async (classId) => {
    try {
      await execute(() => bookingsAPI.bookClass(classId, user.id));
      setSuccessMessage('Class booked successfully.');
      refetchClasses();
    } catch (err) {
      setSuccessMessage(`Failed to book class: ${err.message}`);
    }
  }, [execute, user, refetchClasses]);

  // CRUD for Clients
  const handleAddClient = useCallback(async (e) => {
    e.preventDefault();
    if (!newClient.name || !newClient.goal || !newClient.fitnessLevel || !newClient.email) {
      setSuccessMessage('Please fill in all required fields (Name, Goal, Fitness Level, Email).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClient.email)) {
      setSuccessMessage('Please enter a valid email address.');
      return;
    }
    try {
      const clientData = {
        ...newClient,
        trainerId: user.id,
        workoutPlanId: null,
        messages: []
      };
      await execute(() => trainersAPI.createClient(clientData));
      setNewClient({ name: '', goal: '', fitnessLevel: '', medicalHistory: '', phoneNumber: '', email: '' });
      setSuccessMessage('Client added successfully.');
      refetchClients();
    } catch (err) {
      setSuccessMessage(`Failed to add client: ${err.message}`);
    }
  }, [newClient, user, execute, refetchClients]);

  const handleUpdateClient = useCallback(async (e) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name || !editingClient.goal || !editingClient.fitnessLevel || !editingClient.email) {
      setSuccessMessage('Please fill in all required fields (Name, Goal, Fitness Level, Email).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingClient.email)) {
      setSuccessMessage('Please enter a valid email address.');
      return;
    }
    try {
      await execute(() => trainersAPI.updateClient(editingClient.id, editingClient));
      setEditingClient(null);
      setSuccessMessage('Client updated successfully.');
      refetchClients();
    } catch (err) {
      setSuccessMessage(`Failed to update client: ${err.message}`);
    }
  }, [editingClient, execute, refetchClients]);

  const handleDeleteClient = useCallback(async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await execute(() => trainersAPI.deleteClient(clientId));
        setSelectedPlans((prev) => {
          const updated = { ...prev };
          delete updated[clientId];
          return updated;
        });
        setTrainingSessions((prev) =>
          prev.filter((session) =>
            session.type === 'individual'
              ? session.clientId !== clientId
              : !session.clientIds.includes(clientId)
          )
        );
        setSuccessMessage('Client deleted successfully.');
        refetchClients();
        refetchSessions();
      } catch (err) {
        setSuccessMessage(`Failed to delete client: ${err.message}`);
      }
    }
  }, [execute, refetchClients, refetchSessions]);

  // CRUD for Classes
  const handleAddClass = useCallback(async (e) => {
    e.preventDefault();
    if (!newClass.name || !newClass.description || !newClass.duration || !newClass.capacity || !newClass.price || !newClass.availableDays.length) {
      setSuccessMessage('Please fill in all required fields, including at least one available day.');
      return;
    }
    try {
      const classData = {
        ...newClass,
        duration: Number(newClass.duration),
        capacity: Number(newClass.capacity),
        price: Number(newClass.price),
        enrolled: 0,
        trainerId: user.id,
        availableDays: Array.isArray(newClass.availableDays) ? newClass.availableDays : []
      };
      await execute(() => bookingsAPI.createClass(classData));
      setNewClass({ name: '', description: '', duration: '', capacity: '', price: '', availableDays: [] });
      setSuccessMessage('Class added successfully.');
      refetchClasses();
    } catch (err) {
      setSuccessMessage(`Failed to add class: ${err.message}`);
    }
  }, [newClass, user, execute, refetchClasses]);

  const handleUpdateClass = useCallback(async (e) => {
    e.preventDefault();
    if (!editingClass || !editingClass.name || !editingClass.description || !editingClass.duration || !editingClass.capacity || !editingClass.price || !editingClass.availableDays.length) {
      setSuccessMessage('Please fill in all required fields, including at least one available day.');
      return;
    }
    try {
      const classData = {
        ...editingClass,
        duration: Number(editingClass.duration),
        capacity: Number(editingClass.capacity),
        price: Number(editingClass.price),
        availableDays: Array.isArray(editingClass.availableDays) ? editingClass.availableDays : []
      };
      await execute(() => bookingsAPI.updateClass(editingClass.id, classData));
      setEditingClass(null);
      setSuccessMessage('Class updated successfully.');
      refetchClasses();
    } catch (err) {
      setSuccessMessage(`Failed to update class: ${err.message}`);
    }
  }, [editingClass, execute, refetchClasses]);

  const handleDeleteClass = useCallback(async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        const className = classes.find((c) => c.id === classId).name;
        await execute(() => bookingsAPI.deleteClass(classId));
        setClassSchedules((prev) => prev.filter((s) => s.className !== className));
        setSuccessMessage('Class deleted successfully.');
        refetchClasses();
        refetchSchedules();
      } catch (err) {
        setSuccessMessage(`Failed to delete class: ${err.message}`);
      }
    }
  }, [classes, execute, refetchClasses, refetchSchedules]);

  // CRUD for Class Schedules
  const handleAddClassSchedule = useCallback(async (e) => {
    e.preventDefault();
    if (!newClassSchedule.className || !newClassSchedule.time || !newClassSchedule.capacity || !newClassSchedule.location || !newClassSchedule.room || !newClassSchedule.availableDays.length) {
      setSuccessMessage('Please fill in all required fields, including at least one available day.');
      return;
    }
    try {
      const scheduleData = {
        ...newClassSchedule,
        capacity: Number(newClassSchedule.capacity),
        participants: 0,
        trainerId: user.id,
        availableDays: Array.isArray(newClassSchedule.availableDays) ? newClassSchedule.availableDays : []
      };
      await execute(() => bookingsAPI.createSchedule(scheduleData));
      setNewClassSchedule({ className: '', time: '', capacity: '', location: '', room: '', availableDays: [] });
      setSuccessMessage('Class schedule added successfully.');
      refetchSchedules();
    } catch (err) {
      setSuccessMessage(`Failed to add class schedule: ${err.message}`);
    }
  }, [newClassSchedule, user, execute, refetchSchedules]);

  const handleUpdateClassSchedule = useCallback(async (e) => {
    e.preventDefault();
    if (!editingClassSchedule || !editingClassSchedule.className || !editingClassSchedule.time || !editingClassSchedule.capacity || !editingClassSchedule.location || !editingClassSchedule.room || !editingClassSchedule.availableDays.length) {
      setSuccessMessage('Please fill in all required fields, including at least one available day.');
      return;
    }
    try {
      const scheduleData = {
        ...editingClassSchedule,
        capacity: Number(editingClassSchedule.capacity),
        availableDays: Array.isArray(editingClassSchedule.availableDays) ? editingClassSchedule.availableDays : []
      };
      await execute(() => bookingsAPI.updateSchedule(editingClassSchedule.id, scheduleData));
      setEditingClassSchedule(null);
      setSuccessMessage('Class schedule updated successfully.');
      refetchSchedules();
    } catch (err) {
      setSuccessMessage(`Failed to update class schedule: ${err.message}`);
    }
  }, [editingClassSchedule, execute, refetchSchedules]);

  const handleDeleteClassSchedule = useCallback(async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this class schedule?')) {
      try {
        await execute(() => bookingsAPI.deleteSchedule(scheduleId));
        setSuccessMessage('Class schedule deleted successfully.');
        refetchSchedules();
      } catch (err) {
        setSuccessMessage(`Failed to delete class schedule: ${err.message}`);
      }
    }
  }, [execute, refetchSchedules]);

  // CRUD for Training Sessions
  const handleAddTrainingSession = useCallback(async (e) => {
    e.preventDefault();
    if (
      !newTrainingSession.type ||
      (newTrainingSession.type === 'individual' && !newTrainingSession.clientId) ||
      (newTrainingSession.type === 'group' && newTrainingSession.clientIds.length === 0) ||
      !newTrainingSession.time ||
      !newTrainingSession.startDate ||
      !newTrainingSession.endDate ||
      !newTrainingSession.trainingDays.length ||
      !newTrainingSession.location
    ) {
      setSuccessMessage('Please fill in all required fields, including at least one training day.');
      return;
    }
    try {
      const sessionData = {
        ...newTrainingSession,
        clientIds: newTrainingSession.type === 'group' ? newTrainingSession.clientIds.map(Number) : [],
        clientId: newTrainingSession.type === 'individual' ? Number(newTrainingSession.clientId) : null,
        trainerId: user.id,
        trainingDays: Array.isArray(newTrainingSession.trainingDays) ? newTrainingSession.trainingDays : []
      };
      await execute(() => trainersAPI.createTrainingSession(sessionData));
      setNewTrainingSession({ type: 'individual', clientId: '', clientIds: [], time: '', startDate: '', endDate: '', trainingDays: [], location: '', notes: '' });
      setSuccessMessage('Training session added successfully.');
      refetchSessions();
    } catch (err) {
      setSuccessMessage(`Failed to add training session: ${err.message}`);
    }
  }, [newTrainingSession, user, execute, refetchSessions]);

  const handleUpdateTrainingSession = useCallback(async (e) => {
    e.preventDefault();
    if (
      !editingTrainingSession ||
      !editingTrainingSession.type ||
      (editingTrainingSession.type === 'individual' && !editingTrainingSession.clientId) ||
      (editingTrainingSession.type === 'group' && editingTrainingSession.clientIds.length === 0) ||
      !editingTrainingSession.time ||
      !editingTrainingSession.startDate ||
      !editingTrainingSession.endDate ||
      !editingTrainingSession.trainingDays.length ||
      !editingTrainingSession.location
    ) {
      setSuccessMessage('Please fill in all required fields, including at least one training day.');
      return;
    }
    try {
      const sessionData = {
        ...editingTrainingSession,
        clientIds: editingTrainingSession.type === 'group' ? editingTrainingSession.clientIds.map(Number) : [],
        clientId: editingTrainingSession.type === 'individual' ? Number(editingTrainingSession.clientId) : null,
        trainingDays: Array.isArray(editingTrainingSession.trainingDays) ? editingTrainingSession.trainingDays : []
      };
      await execute(() => trainersAPI.updateTrainingSession(editingTrainingSession.id, sessionData));
      setEditingTrainingSession(null);
      setSuccessMessage('Training session updated successfully.');
      refetchSessions();
    } catch (err) {
      setSuccessMessage(`Failed to update training session: ${err.message}`);
    }
  }, [editingTrainingSession, execute, refetchSessions]);

  const handleDeleteTrainingSession = useCallback(async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this training session?')) {
      try {
        await execute(() => trainersAPI.deleteTrainingSession(sessionId));
        setSuccessMessage('Training session deleted successfully.');
        refetchSessions();
      } catch (err) {
        setSuccessMessage(`Failed to delete training session: ${err.message}`);
      }
    }
  }, [execute, refetchSessions]);

  // Messages (kept in-memory for now)
  const openMessageBox = useCallback((client) => {
    setSelectedClientForMessage(client);
    setMessageText('');
  }, []);

  const sendMessage = useCallback(() => {
    if (!messageText.trim()) {
      setSuccessMessage('Please enter a message.');
      return;
    }
    setClients((prev) =>
      prev.map((client) =>
        client.id === selectedClientForMessage.id
          ? { ...client, messages: [...client.messages, messageText] }
          : client
      )
    );
    setMessageText('');
    setSelectedClientForMessage(null);
    setSuccessMessage('Message sent successfully.');
  }, [messageText, selectedClientForMessage]);

  const cancelMessage = useCallback(() => {
    setSelectedClientForMessage(null);
    setMessageText('');
  }, []);

  // Profile Management
  const handleProfileChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage' && files && files[0]) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setSuccessMessage('Image size must be less than 5MB.');
        return;
      }
      setEditProfile((prev) => ({ ...prev, profileImage: file }));
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setEditProfile((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleUpdateProfile = useCallback(async (e) => {
    e.preventDefault();
    try {
      let updatedProfile = { ...editProfile };
      if (editProfile.profileImage && typeof editProfile.profileImage !== 'string') {
        const formData = new FormData();
        formData.append('image', editProfile.profileImage);
        const response = await execute(() => authAPI.uploadImage(formData));
        updatedProfile.profileImage = response.data.imageUrl;
      } else {
        updatedProfile.profileImage = profile.profileImage || 'https://via.placeholder.com/150';
      }
      await execute(() => authAPI.updateUser(user.id, updatedProfile));
      setUser({ ...user, ...updatedProfile });
      setEditProfile((prev) => ({ ...prev, profileImage: null }));
      setPreviewImage(updatedProfile.profileImage);
      setSuccessMessage('Profile updated successfully.');
      refetchProfile();
    } catch (err) {
      setSuccessMessage(`Failed to update profile: ${err.message}`);
    }
  }, [editProfile, profile, user, setUser, execute, refetchProfile]);

  const handleCancel = useCallback(() => {
    if (profile) {
      setEditProfile({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        role: profile.role || 'trainer',
        bio: profile.bio || '',
        specialties: profile.specialties || '',
        certifications: profile.certifications || '',
        phoneNumber: profile.phoneNumber || '',
        specialization: profile.specialization || '',
        availability: profile.availability || '',
        profileImage: null
      });
      setPreviewImage(profile.profileImage || 'https://via.placeholder.com/150');
    }
  }, [profile]);

  // Filter Today's Schedule for current day (Sunday, July 27, 2025)
  const today = 'Sunday';
  const todaySchedules = [
    ...classSchedules.filter((s) => (Array.isArray(s.availableDays) ? s.availableDays : []).includes(today)),
    ...trainingSessions.filter((s) => (Array.isArray(s.trainingDays) ? s.trainingDays : []).includes(today))
  ];

  // Calculate Monthly Earnings for July 2025
  const monthlyEarnings = useMemo(() => ({
    sessions: trainingSessions
      .filter((s) => new Date(s.startDate).getMonth() <= 6 && new Date(s.endDate).getMonth() >= 6 && new Date(s.startDate).getFullYear() === 2025)
      .map((s) => ({
        id: s.id,
        type: s.type,
        clientNames: s.type === 'individual'
          ? [clients.find(c => c.id === s.clientId)?.name || 'Unknown']
          : s.clientIds.map(id => clients.find(c => c.id === id)?.name || 'Unknown'),
        trainingDays: Array.isArray(s.trainingDays) ? s.trainingDays : [],
        amount: s.type === 'individual' ? 50 : s.clientIds.length * 30
      })),
    classes: classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      enrolled: cls.enrolled,
      amount: cls.enrolled * cls.price
    }))
  }), [trainingSessions, classes, clients]);
  const totalEarnings = useMemo(() => 
    monthlyEarnings.sessions.reduce((sum, s) => sum + s.amount, 0) +
    monthlyEarnings.classes.reduce((sum, c) => sum + c.amount, 0),
    [monthlyEarnings]
  );

  return (
    <div className="min-h-screen pt-16 py-8 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md text-center animate-fade-in-out">
            {successMessage}
          </div>
        )}

        {/* Error Display */}
        {(clientsError || classesError || schedulesError || sessionsError || profileError) && (
          <ErrorMessage
            message={clientsError || classesError || schedulesError || sessionsError || profileError}
            onRetry={() => {
              if (clientsError) refetchClients();
              if (classesError) refetchClasses();
              if (schedulesError) refetchSchedules();
              if (sessionsError) refetchSessions();
              if (profileError) refetchProfile();
            }}
          />
        )}

        {/* Loading Spinner */}
        {(clientsLoading || classesLoading || schedulesLoading || sessionsLoading || profileLoading) && (
          <div className="flex justify-center items-center my-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Trainer Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Welcome back, {user?.firstName || 'Trainer'}! Manage your clients, schedule, and content.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 rounded-lg p-1 mb-8">
          {/* Hamburger Menu for Mobile */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center px-3 py-2 text-gray-400 hover:text-white"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {/* Tab List */}
          <div className={`flex flex-col sm:flex-row sm:space-x-1 ${isMenuOpen ? 'block' : 'hidden sm:flex'}`}>
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'classes', label: 'My Classes', icon: Calendar },
              { id: 'schedule', label: 'Schedule', icon: Clock },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'profile', label: 'Profile', icon: UserCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors w-full sm:w-auto text-left ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
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
        <div className="bg-gray-800 rounded-xl p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div
                  className="bg-gray-700 p-6 rounded-lg cursor-pointer hover:bg-gray-600"
                  onClick={() => setActiveTab('classes')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Classes</p>
                      <p className="text-2xl font-bold text-white">{classes.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <div
                  className="bg-gray-700 p-6 rounded-lg cursor-pointer hover:bg-gray-600"
                  onClick={() => setActiveTab('clients')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Students</p>
                      <p className="text-2xl font-bold text-white">{clients.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div
                  className="bg-gray-700 p-6 rounded-lg cursor-pointer hover:bg-gray-600"
                  onClick={() => setActiveTab('schedule')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Sessions This Week</p>
                      <p className="text-2xl font-bold text-white">{classSchedules.length + trainingSessions.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div
                  className="bg-gray-700 p-6 rounded-lg cursor-pointer hover:bg-gray-600"
                  onClick={() => setShowEarningsModal(true)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Monthly Earnings</p>
                      <p className="text-2xl font-bold text-white">${totalEarnings.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Earnings Modal */}
              {showEarningsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-white mb-4">Monthly Earnings - July 2025</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Personal Training Sessions</h4>
                        {monthlyEarnings.sessions.length === 0 ? (
                          <p className="text-gray-400">No sessions in July 2025.</p>
                        ) : (
                          <div className="space-y-2">
                            {monthlyEarnings.sessions.map((session) => (
                              <div key={session.id} className="bg-gray-700 p-3 rounded-lg">
                                <p className="text-white">
                                  {session.type === 'individual' ? 'Individual Session' : 'Group Session'} - {session.clientNames.join(', ')}
                                </p>
                                <p className="text-gray-400 text-sm">Days: {(Array.isArray(session.trainingDays) ? session.trainingDays : []).join(', ') || 'N/A'}</p>
                                <p className="text-gray-400 text-sm">Amount: ${session.amount}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Classes</h4>
                        {monthlyEarnings.classes.length === 0 ? (
                          <p className="text-gray-400">No classes with enrollments.</p>
                        ) : (
                          <div className="space-y-2">
                            {monthlyEarnings.classes.map((cls) => (
                              <div key={cls.id} className="bg-gray-700 p-3 rounded-lg">
                                <p className="text-white">{cls.name}</p>
                                <p className="text-gray-400 text-sm">Enrolled: {cls.enrolled} clients</p>
                                <p className="text-gray-400 text-sm">Amount: ${cls.amount}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">Total: ${totalEarnings.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg"
                        onClick={() => setShowEarningsModal(false)}
                      >
                        Close
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-4">
                      Note: Assumes $50 per individual session, $30 per client for group sessions. Class earnings based on enrolled count.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                  {todaySchedules.length === 0 && (
                    <p className="text-gray-400">No sessions scheduled for today.</p>
                  )}
                  {todaySchedules.map((entry) => (
                    <div key={entry.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">
                            {entry.className || (entry.type === 'individual' ? `Individual: ${clients.find(c => c.id === entry.clientId)?.name || 'Unknown'}` : 'Group Training')}
                          </p>
                          <p className="text-gray-400 text-sm">{entry.time} • {(entry.trainingDays || entry.availableDays || []).join(', ') || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">{entry.location}</p>
                          <p className="text-white font-medium">{entry.room || entry.notes || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">My Clients</h2>
              <div className="bg-gray-700 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Add New Client</h3>
                <form onSubmit={handleAddClient}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Name', name: 'name' },
                      { label: 'Goal', name: 'goal' },
                      { label: 'Fitness Level', name: 'fitnessLevel' },
                      { label: 'Medical History', name: 'medicalHistory' },
                      { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
                      { label: 'Email', name: 'email', type: 'email' },
                    ].map(({ label, name, type = 'text' }) => (
                      <div key={name}>
                        <label className="block text-gray-400 text-sm mb-2">{label}</label>
                        <input
                          type={type}
                          name={name}
                          value={newClient[name]}
                          onChange={(e) => setNewClient((prev) => ({ ...prev, [name]: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                          required={name === 'name' || name === 'goal' || name === 'fitnessLevel' || name === 'email'}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-right">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                      Add Client
                    </button>
                  </div>
                </form>
              </div>

              {editingClient && (
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Edit Client</h3>
                  <form onSubmit={handleUpdateClient}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Name', name: 'name' },
                        { label: 'Goal', name: 'goal' },
                        { label: 'Fitness Level', name: 'fitnessLevel' },
                        { label: 'Medical History', name: 'medicalHistory' },
                        { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
                        { label: 'Email', name: 'email', type: 'email' },
                      ].map(({ label, name, type = 'text' }) => (
                        <div key={name}>
                          <label className="block text-gray-400 text-sm mb-2">{label}</label>
                          <input
                            type={type}
                            name={name}
                            value={editingClient[name]}
                            onChange={(e) => setEditingClient((prev) => ({ ...prev, [name]: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            required={name === 'name' || name === 'goal' || name === 'fitnessLevel' || name === 'email'}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-right">
                      <button
                        type="button"
                        className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg mr-4"
                        onClick={() => setEditingClient(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                      >
                        Update Client
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-6">
                {clients.map((client) => (
                  <div key={client.id} className="bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-white">{client.name}</h3>
                    <p className="text-gray-400 mb-1">Goal: {client.goal}</p>
                    <p className="text-gray-400 mb-1">Fitness Level: {client.fitnessLevel}</p>
                    <p className="text-gray-400 mb-1">Medical History: {client.medicalHistory || 'None'}</p>
                    <p className="text-gray-400 mb-1">Phone: {client.phoneNumber || 'N/A'}</p>
                    <p className="text-gray-400 mb-4">Email: {client.email}</p>
                    <p className="text-gray-400 mb-4">
                      Current Workout Plan:{' '}
                      {client.workoutPlanId
                        ? workoutPlans.find((p) => p.id === client.workoutPlanId)?.name
                        : 'None assigned'}
                    </p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                        onClick={() => setEditingClient({ ...client })}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        Delete
                      </button>
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-semibold">
                        Assign Workout Plan
                      </label>
                      <select
                        className="w-full p-2 rounded bg-gray-600 text-white mb-2"
                        value={selectedPlans[client.id] || ''}
                        onChange={(e) =>
                          setSelectedPlans((prev) => ({
                            ...prev,
                            [client.id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select a plan</option>
                        {workoutPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        onClick={() => assignWorkoutPlan(client.id)}
                      >
                        Assign Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Classes Tab */}
          {activeTab === 'classes' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">My Classes</h2>
              <div className="bg-gray-700 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Add New Class</h3>
                <form onSubmit={handleAddClass}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Name', name: 'name' },
                      { label: 'Description', name: 'description' },
                      { label: 'Duration (minutes)', name: 'duration', type: 'number' },
                      { label: 'Capacity', name: 'capacity', type: 'number' },
                      { label: 'Price ($)', name: 'price', type: 'number' },
                    ].map(({ label, name, type = 'text' }) => (
                      <div key={name}>
                        <label className="block text-gray-400 text-sm mb-2">{label}</label>
                        <input
                          type={type}
                          name={name}
                          value={newClass[name]}
                          onChange={(e) => setNewClass((prev) => ({ ...prev, [name]: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                          required
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Available Days</label>
                      <select
                        multiple
                        name="availableDays"
                        value={newClass.availableDays}
                        onChange={(e) =>
                          setNewClass((prev) => ({
                            ...prev,
                            availableDays: Array.from(e.target.selectedOptions, (option) => option.value),
                          }))
                        }
                        className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white h-40"
                        required
                      >
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple days (e.g., Monday, Thursday, Saturday)</p>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                      Add Class
                    </button>
                  </div>
                </form>
              </div>

              {editingClass && (
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Edit Class</h3>
                  <form onSubmit={handleUpdateClass}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Name', name: 'name' },
                        { label: 'Description', name: 'description' },
                        { label: 'Duration (minutes)', name: 'duration', type: 'number' },
                        { label: 'Capacity', name: 'capacity', type: 'number' },
                        { label: 'Price ($)', name: 'price', type: 'number' },
                      ].map(({ label, name, type = 'text' }) => (
                        <div key={name}>
                          <label className="block text-gray-400 text-sm mb-2">{label}</label>
                          <input
                            type={type}
                            name={name}
                            value={editingClass[name]}
                            onChange={(e) => setEditingClass((prev) => ({ ...prev, [name]: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            required
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Available Days</label>
                        <select
                          multiple
                          name="availableDays"
                          value={editingClass.availableDays}
                          onChange={(e) =>
                            setEditingClass((prev) => ({
                              ...prev,
                              availableDays: Array.from(e.target.selectedOptions, (option) => option.value),
                            }))
                          }
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white h-40"
                          required
                        >
                          {daysOfWeek.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                        <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple days (e.g., Monday, Thursday, Saturday)</p>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <button
                        type="button"
                        className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg mr-4"
                        onClick={() => setEditingClass(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                      >
                        Update Class
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="bg-gray-700 p-6 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{cls.name}</h3>
                        <p className="text-gray-400 mt-2">{cls.description}</p>
                        <p className="text-gray-400 mt-2">Available Days: {(Array.isArray(cls.availableDays) ? cls.availableDays : []).join(', ') || 'N/A'}</p>
                        <div className="flex flex-wrap gap-4 mt-4 text-gray-400">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {cls.duration} min
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {cls.enrolled}/{cls.capacity} enrolled
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${cls.price} per session
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:text-right space-y-2 w-full sm:w-auto">
                        <button
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg w-full"
                          onClick={() => setEditingClass({ ...cls })}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full"
                          onClick={() => handleDeleteClass(cls.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
                          onClick={() => handleBookClass(cls.id)}
                        >
                          Book Class (Placeholder)
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Schedule</h2>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Class Schedules</h3>
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-bold text-white mb-4">Add New Class Schedule</h4>
                  <form onSubmit={handleAddClassSchedule}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Class Name', name: 'className' },
                        { label: 'Time (e.g., 6:00 PM - 7:00 PM)', name: 'time' },
                        { label: 'Capacity', name: 'capacity', type: 'number' },
                        { label: 'Location', name: 'location' },
                        { label: 'Room', name: 'room' },
                      ].map(({ label, name, type = 'text' }) => (
                        <div key={name}>
                          <label className="block text-gray-400 text-sm mb-2">{label}</label>
                          <input
                            type={type}
                            name={name}
                            value={newClassSchedule[name]}
                            onChange={(e) => setNewClassSchedule((prev) => ({ ...prev, [name]: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            required
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Available Days</label>
                        <select
                          multiple
                          name="availableDays"
                          value={newClassSchedule.availableDays}
                          onChange={(e) =>
                            setNewClassSchedule((prev) => ({
                              ...prev,
                              availableDays: Array.from(e.target.selectedOptions, (option) => option.value),
                            }))
                          }
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white h-40"
                          required
                        >
                          {daysOfWeek.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                        <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple days (e.g., Monday, Thursday, Saturday)</p>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                      >
                        Add Class Schedule
                      </button>
                    </div>
                  </form>
                </div>

                {editingClassSchedule && (
                  <div className="bg-gray-700 p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-bold text-white mb-4">Edit Class Schedule</h4>
                    <form onSubmit={handleUpdateClassSchedule}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: 'Class Name', name: 'className' },
                          { label: 'Time (e.g., 6:00 PM - 7:00 PM)', name: 'time' },
                          { label: 'Capacity', name: 'capacity', type: 'number' },
                          { label: 'Location', name: 'location' },
                          { label: 'Room', name: 'room' },
                        ].map(({ label, name, type = 'text' }) => (
                          <div key={name}>
                            <label className="block text-gray-400 text-sm mb-2">{label}</label>
                            <input
                              type={type}
                              name={name}
                              value={editingClassSchedule[name]}
                              onChange={(e) => setEditingClassSchedule((prev) => ({ ...prev, [name]: e.target.value }))}
                              className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                              required
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Available Days</label>
                          <select
                            multiple
                            name="availableDays"
                            value={editingClassSchedule.availableDays}
                            onChange={(e) =>
                              setEditingClassSchedule((prev) => ({
                                ...prev,
                                availableDays: Array.from(e.target.selectedOptions, (option) => option.value),
                              }))
                            }
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white h-40"
                            required
                          >
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                          <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple days (e.g., Monday, Thursday, Saturday)</p>
                        </div>
                      </div>
                      <div className="mt-4 text-right">
                        <button
                          type="button"
                          className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg mr-4"
                          onClick={() => setEditingClassSchedule(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                        >
                          Update Class Schedule
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {classSchedules.map((entry) => (
                    <div key={entry.id} className="bg-gray-700 p-6 rounded-lg">
                      <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">{entry.className}</h3>
                          <p className="text-gray-400 mt-2">{entry.time} • {entry.participants}/{entry.capacity} participants</p>
                          <p className="text-gray-400 mt-1">{entry.location} • {entry.room}</p>
                          <p className="text-gray-400 mt-1">Days: {(Array.isArray(entry.availableDays) ? entry.availableDays : []).join(', ') || 'N/A'}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:text-right space-y-2 w-full sm:w-auto">
                          <button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg w-full"
                            onClick={() => setEditingClassSchedule({ ...entry })}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full"
                            onClick={() => handleDeleteClassSchedule(entry.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Training Sessions</h3>
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-bold text-white mb-4">Add New Training Session</h4>
                  <form onSubmit={handleAddTrainingSession}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Session Type</label>
                        <select
                          name="type"
                          value={newTrainingSession.type}
                          onChange={(e) => setNewTrainingSession((prev) => ({ ...prev, type: e.target.value, clientId: '', clientIds: [] }))}
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                          required
                        >
                          <option value="individual">Individual</option>
                          <option value="group">Group</option>
                        </select>
                      </div>
                      {newTrainingSession.type === 'individual' ? (
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Client</label>
                          <select
                            name="clientId"
                            value={newTrainingSession.clientId}
                            onChange={(e) => setNewTrainingSession((prev) => ({ ...prev, clientId: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            required
                          >
                            <option value="">Select Client</option>
                            {clients.map((client) => (
                              <option key={client.id} value={client.id}>
                                {client.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Clients</label>
                          <select
                            multiple
                            name="clientIds"
                            value={newTrainingSession.clientIds}
                            onChange={(e) =>
                              setNewTrainingSession((prev) => ({
                                ...prev,
                                clientIds: Array.from(e.target.selectedOptions, (option) => option.value),
                              }))
                            }
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white h-40"
                            required
                          >
                            {clients.map((client) => (
                              <option key={client.id} value={client.id}>
                                {client.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple clients</p>
                        </div>
                      )}
                      {[
                        { label: 'Time (e.g., 10:00 AM - 11:00 AM)', name: 'time' },
                        { label: 'Start Date (e.g., 2025-07-24)', name: 'startDate', type: 'date' },
                        { label: 'End Date (e.g., 2025-08-24)', name: 'endDate', type: 'date' },
                        { label: 'Location', name: 'location' },
                        { label: 'Notes', name: 'notes' },
                      ].map(({ label, name, type = 'text' }) => (
                        <div key={name}>
                          <label className="block text-gray-400 text-sm mb-2">{label}</label>
                          <input
                            type={type}
                            name={name}
                            value={newTrainingSession[name]}
                            onChange={(e) => setNewTrainingSession((prev) => ({ ...prev, [name]: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            required={name !== 'notes'}
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Training Days</label>
                        <select
                          multiple
                          name="trainingDays"
                          value={newTrainingSession.trainingDays}
                          onChange={(e) =>
                            setNewTrainingSession((prev) => ({
                              ...prev,
                              trainingDays: Array.from(e.target.selectedOptions, (option) => option.value),
                            }))
                          }
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white h-40"
                          required
                        >
                          {daysOfWeek.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                        <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple days (e.g., Monday, Thursday, Saturday)</p>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                      >
                        Add Training Session
                      </button>
                    </div>
                  </form>
                </div>

                {editingTrainingSession && (
                  <div className="bg-gray-700 p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-bold text-white mb-4">Edit Training Session</h4>
                    <form onSubmit={handleUpdateTrainingSession}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Session Type</label>
                          <select
                            name="type"
                            value={editingTrainingSession.type}
                            onChange={(e) => setEditingTrainingSession((prev) => ({ ...prev, type: e.target.value, clientId: '', clientIds: [] }))}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            required
                          >
                            <option value="individual">Individual</option>
                            <option value="group">Group</option>
                          </select>
                        </div>
                        {editingTrainingSession.type === 'individual' ? (
                          <div>
                            <label className="block text-gray-400 text-sm mb-2">Client</label>
                            <select
                              name="clientId"
                              value={editingTrainingSession.clientId}
                              onChange={(e) => setEditingTrainingSession((prev) => ({ ...prev, clientId: e.target.value }))}
                              className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                              required
                            >
                              <option value="">Select Client</option>
                              {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                  {client.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-gray-400 text-sm mb-2">Clients</label>
                            <select
                              multiple
                              name="clientIds"
                              value={editingTrainingSession.clientIds}
                              onChange={(e) =>
                                setEditingTrainingSession((prev) => ({
                                  ...prev,
                                  clientIds: Array.from(e.target.selectedOptions, (option) => option.value),
                                }))
                              }
                              className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white h-40"
                              required
                            >
                              {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                  {client.name}
                                </option>
                              ))}
                            </select>
                            <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple clients</p>
                          </div>
                        )}
                        {[
                          { label: 'Time (e.g., 10:00 AM - 11:00 AM)', name: 'time' },
                          { label: 'Start Date (e.g., 2025-07-24)', name: 'startDate', type: 'date' },
                          { label: 'End Date (e.g., 2025-08-24)', name: 'endDate', type: 'date' },
                          { label: 'Location', name: 'location' },
                          { label: 'Notes', name: 'notes' },
                        ].map(({ label, name, type = 'text' }) => (
                          <div key={name}>
                            <label className="block text-gray-400 text-sm mb-2">{label}</label>
                            <input
                              type={type}
                              name={name}
                              value={editingTrainingSession[name]}
                              onChange={(e) => setEditingTrainingSession((prev) => ({ ...prev, [name]: e.target.value }))}
                              className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                              required={name !== 'notes'}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Training Days</label>
                          <select
                            multiple
                            name="trainingDays"
                            value={editingTrainingSession.trainingDays}
                            onChange={(e) =>
                              setEditingTrainingSession((prev) => ({
                                ...prev,
                                trainingDays: Array.from(e.target.selectedOptions, (option) => option.value),
                              }))
                            }
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white h-40"
                            required
                          >
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                          <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple days (e.g., Monday, Thursday, Saturday)</p>
                        </div>
                      </div>
                      <div className="mt-4 text-right">
                        <button
                          type="button"
                          className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg mr-4"
                          onClick={() => setEditingTrainingSession(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                        >
                          Update Training Session
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {trainingSessions.map((session) => (
                    <div key={session.id} className="bg-gray-700 p-6 rounded-lg">
                      <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">
                            {session.type === 'individual'
                              ? `Individual: ${clients.find(c => c.id === session.clientId)?.name || 'Unknown'}`
                              : `Group: ${session.clientIds.map(id => clients.find(c => c.id === id)?.name || 'Unknown').join(', ')}`}
                          </h3>
                          <p className="text-gray-400 mt-2">{session.time} • {(Array.isArray(session.trainingDays) ? session.trainingDays : []).join(', ') || 'N/A'}</p>
                          <p className="text-gray-400 mt-1">{session.startDate} to {session.endDate}</p>
                          <p className="text-gray-400 mt-1">{session.location} • {session.notes || 'N/A'}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:text-right space-y-2 w-full sm:w-auto">
                          <button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg w-full"
                            onClick={() => setEditingTrainingSession({ ...session })}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full"
                            onClick={() => handleDeleteTrainingSession(session.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Messages</h2>
              {!selectedClientForMessage && (
                <div className="space-y-4">
                  {clients.length === 0 && (
                    <p className="text-gray-400">No clients to message.</p>
                  )}
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600"
                      onClick={() => openMessageBox(client)}
                    >
                      <p className="text-white font-semibold">{client.name}</p>
                      <p className="text-gray-400 text-sm">
                        {client.messages.length} messages
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {selectedClientForMessage && (
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Messages with {selectedClientForMessage.name}
                  </h3>
                  <div className="mb-4 max-h-40 overflow-y-auto space-y-2 bg-gray-600 p-3 rounded">
                    {selectedClientForMessage.messages.length === 0 && (
                      <p className="text-gray-400">No messages yet.</p>
                    )}
                    {selectedClientForMessage.messages.map((msg, i) => (
                      <p key={i} className="text-white">
                        {msg}
                      </p>
                    ))}
                  </div>
                  <textarea
                    className="w-full p-3 rounded bg-gray-600 text-white mb-4"
                    rows={3}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <div className="flex space-x-4">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      onClick={sendMessage}
                    >
                      Send
                    </button>
                    <button
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
                      onClick={cancelMessage}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Trainer Profile</h2>
              <div className="bg-gray-700 p-6 rounded-lg">
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-2">Current Profile Image</label>
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="w-36 h-36 object-cover rounded-full mb-4"
                      />
                    </div>
                    {[
                      { label: 'First Name', name: 'firstName' },
                      { label: 'Last Name', name: 'lastName' },
                      { label: 'Email', name: 'email', type: 'email' },
                      { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
                      { label: 'Specialization', name: 'specialization' },
                      { label: 'Availability', name: 'availability' },
                      { label: 'Profile Image', name: 'profileImage', type: 'file', accept: 'image/*' },
                      { label: 'Role', name: 'role', disabled: true },
                      { label: 'Bio', name: 'bio', textarea: true },
                      { label: 'Specialties', name: 'specialties' },
                      { label: 'Certifications', name: 'certifications' },
                    ].map(({ label, name, type = 'text', textarea, disabled, accept }) => (
                      <div key={name}>
                        <label className="block text-gray-400 text-sm mb-2">{label}</label>
                        {name === 'profileImage' ? (
                          <input
                            type={type}
                            name={name}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            accept={accept}
                            disabled={disabled}
                          />
                        ) : textarea ? (
                          <textarea
                            name={name}
                            value={editProfile[name]}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            disabled={disabled}
                          />
                        ) : (
                          <input
                            type={type}
                            name={name}
                            value={editProfile[name]}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            disabled={disabled}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-right">
                    <button
                      type="button"
                      className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg mr-4"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;