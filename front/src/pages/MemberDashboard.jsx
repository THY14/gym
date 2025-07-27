import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, bookingsAPI, paymentsAPI, progressAPI } from '../services/api';
import { Calendar, CreditCard, User, Activity, Clock, DollarSign, MapPin, Trash2, Pencil } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// MemberDashboard component with backend-integrated Classes, Progress, Payments, and Profile
const MemberDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [successMessage, setSuccessMessage] = useState(null);
  const [classes, setClasses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [payments, setPayments] = useState([]);
  const [userSettings, setUserSettings] = useState(null);
  const [classesLoading, setClassesLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [classesError, setClassesError] = useState(null);
  const [progressError, setProgressError] = useState(null);
  const [paymentsError, setPaymentsError] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setClassesLoading(true);
        const classesResponse = await bookingsAPI.getUserBookings();
        setClasses(classesResponse.data.data || []);
        setClassesLoading(false);
      } catch (err) {
        setClassesError(err.response?.data?.message || 'Failed to fetch classes');
        setClassesLoading(false);
      }

      try {
        setProgressLoading(true);
        const progressResponse = await progressAPI.getAttendance();
        setProgress(progressResponse.data.data || []);
        setProgressLoading(false);
      } catch (err) {
        setProgressError(err.response?.data?.message || 'Failed to fetch progress');
        setProgressLoading(false);
      }

      try {
        setPaymentsLoading(true);
        const paymentsResponse = await paymentsAPI.getUserPayments();
        setPayments(paymentsResponse.data.data || []);
        setPaymentsLoading(false);
      } catch (err) {
        setPaymentsError(err.response?.data?.message || 'Failed to fetch payments');
        setPaymentsLoading(false);
      }

      try {
        setSettingsLoading(true);
        const settingsResponse = await authAPI.getProfile();
        setUserSettings(settingsResponse.data.data);
        setSettingsLoading(false);
      } catch (err) {
        setSettingsError(err.response?.data?.message || 'Failed to fetch user settings');
        setSettingsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Refetch functions
  const refetchClasses = async () => {
    try {
      setClassesLoading(true);
      const response = await bookingsAPI.getUserBookings();
      setClasses(response.data.data || []);
      setClassesLoading(false);
    } catch (err) {
      setClassesError(err.response?.data?.message || 'Failed to fetch classes');
      setClassesLoading(false);
    }
  };

  const refetchProgress = async () => {
    try {
      setProgressLoading(true);
      const response = await progressAPI.getAttendance();
      setProgress(response.data.data || []);
      setProgressLoading(false);
    } catch (err) {
      setProgressError(err.response?.data?.message || 'Failed to fetch progress');
      setProgressLoading(false);
    }
  };

  const refetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const response = await paymentsAPI.getUserPayments();
      setPayments(response.data.data || []);
      setPaymentsLoading(false);
    } catch (err) {
      setPaymentsError(err.response?.data?.message || 'Failed to fetch payments');
      setPaymentsLoading(false);
    }
  };

  const refetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await authAPI.getProfile();
      setUserSettings(response.data.data);
      setSettingsLoading(false);
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Failed to fetch user settings');
      setSettingsLoading(false);
    }
  };

  // Membership types with prices and durations (in days)
  const membershipTypes = [
    { type: '1 Month', price: 35, duration: 30 },
    { type: '3 Months', price: 75, duration: 90 },
    { type: '6 Months', price: 115, duration: 180 },
    { type: '1 Year', price: 175, duration: 365 },
    { type: 'Individual Personal Trainer', price: 250, duration: 30 },
    { type: 'Group Personal Trainer', price: 180, duration: 30 },
  ];

  // State for new/edit progress log
  const [newProgress, setNewProgress] = useState({
    workout: '',
    customWorkout: '',
    weight: '',
    reps: '',
    sets: '',
    duration: '',
    notes: '',
  });
  const [editProgressId, setEditProgressId] = useState(null);

  // Workout types for dropdown
  const workoutTypes = ['Strength', 'Cardio', 'Yoga', 'Pilates', 'HIIT', 'Other'];

  // State for new payment method
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  // State for purchasing membership
  const [selectedMembership, setSelectedMembership] = useState('1 Month');

  // State for profile
  const [editProfile, setEditProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    fitnessGoals: user?.fitnessGoals || '',
    profileImage: null,
  });
  const [previewImage, setPreviewImage] = useState(user?.profileImage || 'https://via.placeholder.com/150');

  // Calculate active membership and next payment date
  const getActiveMembership = () => {
    const latestPayment = payments
      .filter((p) => p.status === 'Completed' && p.membershipType)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (!latestPayment) return { type: '1 Month', nextPaymentDate: null };

    const paymentDate = new Date(latestPayment.date);
    const membership = membershipTypes.find((m) => m.type === latestPayment.membershipType);
    if (!membership) return { type: '1 Month', nextPaymentDate: null };

    const endDate = new Date(paymentDate);
    endDate.setDate(endDate.getDate() + membership.duration);
    const currentDate = new Date();

    let nextPaymentDate = null;
    if (currentDate <= endDate) {
      nextPaymentDate = new Date(endDate);
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 1);
    }

    return {
      type: membership.type,
      nextPaymentDate: nextPaymentDate ? nextPaymentDate.toISOString().split('T')[0] : null,
    };
  };

  const { type: activeMembership, nextPaymentDate } = getActiveMembership();

  // Update user membership type
  useEffect(() => {
    if (activeMembership !== user?.membershipType) {
      updateUser({ ...user, membershipType: activeMembership });
    }
  }, [activeMembership, user, updateUser]);

  // Handle class booking
  const handleBookClass = async (classId) => {
    try {
      await bookingsAPI.create({ classId, enrolled: true });
      setSuccessMessage('Class booked successfully.');
      refetchClasses();
    } catch (err) {
      setSuccessMessage('Failed to book class. Please try again.');
    }
  };

  // Handle class cancellation
  const handleCancelClass = async (classId) => {
    if (window.confirm('Are you sure you want to cancel this class?')) {
      try {
        await bookingsAPI.cancel(classId);
        setSuccessMessage('Class cancelled successfully.');
        refetchClasses();
      } catch (err) {
        setSuccessMessage('Failed to cancel class. Please try again.');
      }
    }
  };

  // Handle adding/editing progress log
  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!newProgress.workout && !newProgress.customWorkout) {
      setSuccessMessage('Please select or enter a workout type.');
      return;
    }
    if (!newProgress.duration) {
      setSuccessMessage('Please enter a duration.');
      return;
    }
    const workout = newProgress.workout === 'Other' ? newProgress.customWorkout : newProgress.workout;
    const progressData = {
      workout,
      weight: newProgress.weight ? Number(newProgress.weight) : null,
      reps: newProgress.reps ? Number(newProgress.reps) : null,
      sets: newProgress.sets ? Number(newProgress.sets) : null,
      duration: Number(newProgress.duration),
      notes: newProgress.notes || '',
    };

    try {
      if (editProgressId) {
        await progressAPI.update(editProgressId, progressData);
        setSuccessMessage('Progress updated successfully.');
      } else {
        await progressAPI.create({ ...progressData, date: new Date().toISOString().split('T')[0] });
        setSuccessMessage('Progress logged successfully.');
      }
      setNewProgress({ workout: '', customWorkout: '', weight: '', reps: '', sets: '', duration: '', notes: '' });
      setEditProgressId(null);
      refetchProgress();
    } catch (err) {
      setSuccessMessage('Failed to log progress. Please try again.');
    }
  };

  // Handle editing progress entry
  const handleEditProgress = (entry) => {
    setEditProgressId(entry.id);
    setNewProgress({
      workout: workoutTypes.includes(entry.workout) ? entry.workout : 'Other',
      customWorkout: workoutTypes.includes(entry.workout) ? '' : entry.workout,
      weight: entry.weight || '',
      reps: entry.reps || '',
      sets: entry.sets || '',
      duration: entry.duration || '',
      notes: entry.notes || '',
    });
  };

  // Handle deleting progress entry
  const handleDeleteProgress = async (id) => {
    if (window.confirm('Are you sure you want to delete this progress entry?')) {
      try {
        await progressAPI.delete(id);
        setSuccessMessage('Progress entry deleted successfully.');
        refetchProgress();
      } catch (err) {
        setSuccessMessage('Failed to delete progress entry. Please try again.');
      }
    }
  };

  // Handle adding payment method
  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiry || !newPaymentMethod.cvv) {
      setSuccessMessage('Please fill in all payment method fields.');
      return;
    }
    const cardRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;
    if (!cardRegex.test(newPaymentMethod.cardNumber)) {
      setSuccessMessage('Please enter a valid 16-digit card number.');
      return;
    }
    if (!expiryRegex.test(newPaymentMethod.expiry)) {
      setSuccessMessage('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!cvvRegex.test(newPaymentMethod.cvv)) {
      setSuccessMessage('Please enter a valid CVV (3 or 4 digits).');
      return;
    }
    try {
      await paymentsAPI.create({
        amount: 0,
        description: 'New Payment Method Added',
        membershipType: null,
        date: new Date().toISOString().split('T')[0],
        method: `Card ending ${newPaymentMethod.cardNumber.slice(-4)}`,
        status: 'Pending',
      });
      setNewPaymentMethod({ cardNumber: '', expiry: '', cvv: '' });
      setSuccessMessage('Payment method added successfully.');
      refetchPayments();
    } catch (err) {
      setSuccessMessage('Failed to add payment method. Please try again.');
    }
  };

  // Handle purchasing membership
  const handlePurchaseMembership = async (e) => {
    e.preventDefault();
    const hasPaymentMethod = payments.some((p) => p.method.includes('Card ending') && p.status === 'Pending');
    if (!hasPaymentMethod) {
      setSuccessMessage('Please add a payment method before purchasing a membership.');
      return;
    }
    const membership = membershipTypes.find((m) => m.type === selectedMembership);
    try {
      await paymentsAPI.create({
        amount: membership.price,
        description: `${membership.type} Membership`,
        membershipType: membership.type,
        date: new Date().toISOString().split('T')[0],
        method: payments.find((p) => p.method.includes('Card ending'))?.method || 'Credit Card',
        status: 'Completed',
      });
      await updateUser({ ...user, membershipType: membership.type });
      setSuccessMessage('Membership purchased successfully.');
      refetchPayments();
    } catch (err) {
      setSuccessMessage('Failed to purchase membership. Please try again.');
    }
  };

  // Handle profile updates
  const handleProfileChange = (e) => {
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
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!editProfile.firstName || !editProfile.lastName || !editProfile.email || !editProfile.phoneNumber || !editProfile.fitnessGoals) {
        setSuccessMessage('Please fill in all required fields.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editProfile.email)) {
        setSuccessMessage('Please enter a valid email address.');
        return;
      }
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(editProfile.phoneNumber)) {
        setSuccessMessage('Please enter a valid phone number (10-15 digits).');
        return;
      }
      let profileImage = user?.profileImage || 'https://via.placeholder.com/150';
      if (editProfile.profileImage) {
        const formData = new FormData();
        formData.append('profileImage', editProfile.profileImage);
        const uploadResponse = await authAPI.uploadProfileImage(formData);
        profileImage = uploadResponse.data.data.profileImage;
      }
      const updatedUser = {
        firstName: editProfile.firstName,
        lastName: editProfile.lastName,
        email: editProfile.email,
        phoneNumber: editProfile.phoneNumber,
        fitnessGoals: editProfile.fitnessGoals,
        profileImage,
        membershipType: activeMembership,
      };
      await authAPI.updateProfile(updatedUser);
      updateUser(updatedUser);
      setEditProfile((prev) => ({ ...prev, profileImage: null }));
      setPreviewImage(profileImage);
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      setSuccessMessage(`Failed to update profile: ${error.message}. Please try again.`);
    }
  };

  const handleCancelProfile = () => {
    setEditProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      fitnessGoals: user?.fitnessGoals || '',
      profileImage: null,
    });
    setPreviewImage(user?.profileImage || 'https://via.placeholder.com/150');
  };

  // Calculate progress metrics
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyProgress = progress.filter((entry) => entry.date.startsWith(currentMonth));
  const totalSessions = monthlyProgress.length;
  const workoutTypeCounts = monthlyProgress.reduce((acc, entry) => {
    acc[entry.workout] = (acc[entry.workout] || 0) + 1;
    return acc;
  }, {});
  const workoutTypeSummary = Object.entries(workoutTypeCounts)
    .map(([type, count]) => `${type} (${count})`)
    .join(', ');
  const monthlyGoal = userSettings?.monthlyGoal || 12;
  const progressPercentage = totalSessions > 0 ? Math.min((totalSessions / monthlyGoal) * 100, 100) : 0;

  // Calculate total amount spent on memberships
  const totalSpent = payments
    .filter((p) => p.membershipType)
    .reduce((sum, p) => sum + p.amount, 0);

  // Group progress by date
  const groupedProgress = progress.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  // Today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = classes.filter((cls) => (cls.availableDays || []).includes(today) && cls.enrolled);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'progress', label: 'Progress Tracking', icon: Clock },
    { id: 'classes', label: 'My Classes', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

return (
  <div className="min-h-screen pt-16 py-8 bg-gray-900">
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
      {(classesError || progressError || paymentsError || settingsError) && (
        <ErrorMessage
          message={classesError || progressError || paymentsError || settingsError}
          onRetry={() => {
            if (classesError) refetchClasses();
            if (progressError) refetchProgress();
            if (paymentsError) refetchPayments();
            if (settingsError) refetchSettings();
          }}
        />
      )}

      {/* Loading Spinner */}
      {(classesLoading || progressLoading || paymentsLoading || settingsLoading) && (
        <div className="flex justify-center items-center my-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.firstName || 'Member'}!</h1>
        <p className="text-gray-400 mt-2">Manage your fitness journey from your dashboard</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-900 rounded-lg p-1 mb-8">
        <div className="flex flex-wrap space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors ${
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                  onClick={() => setActiveTab('profile')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Membership</p>
                      <p className="text-2xl font-bold text-white">{activeMembership}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <div
                  className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                  onClick={() => setActiveTab('classes')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Classes This Month</p>
                      <p className="text-2xl font-bold text-white">{classes.filter(cls => cls.enrolled).length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div
                  className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                  onClick={() => setActiveTab('payments')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Next Payment</p>
                      <p className="text-2xl font-bold text-white">{nextPaymentDate || 'None'}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    {todayClasses.length === 0 ? (
                      <p className="text-gray-400">No classes scheduled for today.</p>
                    ) : (
                      todayClasses.map((cls) => (
                        <div key={cls.id} className="bg-gray-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white font-medium">{cls.name}</p>
                              <p className="text-gray-400 text-sm">{cls.time} • {(cls.availableDays || []).join(', ')}</p>
                            </div>
                            <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                              Confirmed
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg font-semibold transition-colors text-left"
                      onClick={() => setActiveTab('classes')}
                    >
                      Book a Class
                    </button>
                    <button
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg font-semibold transition-colors text-left border border-gray-600"
                      onClick={() => setActiveTab('progress')}
                    >
                      Log Workout
                    </button>
                    <button
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg font-semibold transition-colors text-left border border-gray-600"
                      onClick={() => setActiveTab('payments')}
                    >
                      View Payment History
                    </button>
                    <button
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg font-semibold transition-colors text-left border border-gray-600"
                      onClick={() => setActiveTab('profile')}
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Progress Tracking</h2>
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Progress Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Sessions (This Month)</p>
                    <p className="text-2xl font-bold text-white">{totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Workout Types</p>
                    <p className="text-2xl font-bold text-white">{workoutTypeSummary || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Monthly Goal Progress</p>
                    <progress value={progressPercentage} max="100" className="w-full h-2 mt-2" />
                    <p className="text-gray-400 text-sm mt-1">{progressPercentage.toFixed(0)}% (Target: {monthlyGoal} sessions)</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-gray-400 text-sm mb-2">Set Monthly Session Goal</label>
                  <input
                    type="number"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(Math.max(1, Number(e.target.value)))}
                    className="w-24 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="1"
                  />
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">{editProgressId ? 'Edit Workout' : 'Log New Workout'}</h3>
                <form onSubmit={handleAddProgress}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Workout Type</label>
                      <select
                        name="workout"
                        value={newProgress.workout}
                        onChange={(e) => setNewProgress((prev) => ({ ...prev, workout: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        required
                      >
                        <option value="">Select Workout Type</option>
                        {workoutTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {newProgress.workout === 'Other' && (
                        <input
                          type="text"
                          name="customWorkout"
                          value={newProgress.customWorkout}
                          onChange={(e) => setNewProgress((prev) => ({ ...prev, customWorkout: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white mt-2"
                          placeholder="Enter custom workout"
                          required
                        />
                      )}
                    </div>
                    {[
                      { label: 'Weight (kg)', name: 'weight', type: 'number' },
                      { label: 'Reps', name: 'reps', type: 'number' },
                      { label: 'Sets', name: 'sets', type: 'number' },
                      { label: 'Duration (min)', name: 'duration', type: 'number', required: true },
                      { label: 'Notes', name: 'notes' },
                    ].map(({ label, name, type = 'text', required = false }) => (
                      <div key={name}>
                        <label className="block text-gray-400 text-sm mb-2">{label}</label>
                        <input
                          type={type}
                          name={name}
                          value={newProgress[name]}
                          onChange={(e) => setNewProgress((prev) => ({ ...prev, [name]: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          required={required}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-right">
                    {editProgressId && (
                      <button
                        type="button"
                        className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg mr-4"
                        onClick={() => {
                          setNewProgress({ workout: '', customWorkout: '', weight: '', reps: '', sets: '', duration: '', notes: '' });
                          setEditProgressId(null);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                      {editProgressId ? 'Update Workout' : 'Log Workout'}
                    </button>
                  </div>
                </form>
              </div>
              <div className="space-y-6">
                {Object.entries(groupedProgress)
                  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                  .map(([date, entries]) => (
                    <div key={date}>
                      <h3 className="text-xl font-semibold text-white mb-4">{date}</h3>
                      <div className="space-y-4">
                        {entries.map((entry) => (
                          <div key={entry.id} className="bg-gray-800 p-6 rounded-lg flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{entry.workout}</p>
                              <p className="text-gray-400 text-sm">
                                {entry.weight ? `Weight: ${entry.weight} kg • ` : ''}
                                {entry.reps ? `Reps: ${entry.reps} • ` : ''}
                                {entry.sets ? `Sets: ${entry.sets}` : ''}
                              </p>
                              <p className="text-gray-400 text-sm">Duration: {entry.duration} min</p>
                              <p className="text-gray-400 text-sm">Notes: {entry.notes || 'None'}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditProgress(entry)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProgress(entry.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">My Classes</h2>
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Available Classes</h3>
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white">{cls.name}</h3>
                          <div className="flex flex-wrap items-center space-x-4 mt-2 text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {(cls.availableDays || []).join(', ')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {cls.time} ({cls.duration} min)
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {cls.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              cls.enrolled
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {cls.enrolled ? 'Enrolled' : 'Not Enrolled'}
                          </span>
                          {cls.enrolled ? (
                            <button
                              className="block mt-2 text-red-400 hover:text-red-300 text-sm"
                              onClick={() => handleCancelClass(cls.id)}
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              className="block mt-2 text-blue-400 hover:text-blue-300 text-sm"
                              onClick={() => handleBookClass(cls.id)}
                            >
                              Book
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Enrolled Classes</h3>
              <div className="space-y-4">
                {classes.filter(cls => cls.enrolled).length === 0 ? (
                  <p className="text-gray-400">No classes enrolled.</p>
                ) : (
                  classes
                    .filter(cls => cls.enrolled)
                    .map((cls) => (
                      <div key={cls.id} className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-white">{cls.name}</h3>
                            <div className="flex flex-wrap items-center space-x-4 mt-2 text-gray-400">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {(cls.availableDays || []).join(', ')}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {cls.time} ({cls.duration} min)
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {cls.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
                              Confirmed
                            </span>
                            <button
                              className="block mt-2 text-red-400 hover:text-red-300 text-sm"
                              onClick={() => handleCancelClass(cls.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Purchase Membership</h3>
                <form onSubmit={handlePurchaseMembership}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Membership Type</label>
                      <select
                        value={selectedMembership}
                        onChange={(e) => setSelectedMembership(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        {membershipTypes.map((membership) => (
                          <option key={membership.type} value={membership.type}>
                            {membership.type} (${membership.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                      Purchase Membership
                    </button>
                  </div>
                </form>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Add Payment Method</h3>
                <form onSubmit={handleAddPaymentMethod}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Card Number', name: 'cardNumber', type: 'text', placeholder: '1234 5678 9012 3456' },
                      { label: 'Expiry (MM/YY)', name: 'expiry', type: 'text', placeholder: '12/25' },
                      { label: 'CVV', name: 'cvv', type: 'text', placeholder: '123' },
                    ].map(({ label, name, type, placeholder }) => (
                      <div key={name}>
                        <label className="block text-gray-400 text-sm mb-2">{label}</label>
                        <input
                          type={type}
                          name={name}
                          value={newPaymentMethod[name]}
                          onChange={(e) => setNewPaymentMethod((prev) => ({ ...prev, [name]: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          placeholder={placeholder}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-right">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                      Add Payment Method
                    </button>
                  </div>
                </form>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Payment Summary</h3>
                <p className="text-gray-400">Total Spent on Memberships: ${totalSpent.toFixed(2)}</p>
              </div>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">${payment.amount.toFixed(2)}</h3>
                        <p className="text-gray-400 mt-1">{payment.description}</p>
                        <p className="text-gray-500 text-sm mt-2">{payment.date} • {payment.method}</p>
                        {payment.membershipType && (
                          <p className="text-gray-500 text-sm">Membership: {payment.membershipType}</p>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
              <div className="bg-gray-800 p-6 rounded-lg">
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-2">Profile Image</label>
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="w-36 h-36 object-cover rounded-full mb-4"
                      />
                      <input
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                    {[
                      { label: 'First Name', name: 'firstName' },
                      { label: 'Last Name', name: 'lastName' },
                      { label: 'Email', name: 'email', type: 'email' },
                      { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
                      { label: 'Fitness Goals', name: 'fitnessGoals', textarea: true },
                    ].map(({ label, name, type = 'text', textarea }) => (
                      <div key={name}>
                        <label className="block text-gray-400 text-sm mb-2">{label}</label>
                        {textarea ? (
                          <textarea
                            name={name}
                            value={editProfile[name]}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                        ) : (
                          <input
                            type={type}
                            name={name}
                            value={editProfile[name]}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                        )}
                      </div>
                    ))}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Membership</label>
                      <input
                        type="text"
                        value={activeMembership}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mt-6 text-right">
                    <button
                      type="button"
                      className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg mr-4"
                      onClick={handleCancelProfile}
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

export default MemberDashboard;