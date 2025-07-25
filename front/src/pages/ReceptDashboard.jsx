import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Calendar,
  CreditCard,
  UserCheck,
  Activity,
  Edit,
  Trash,
  XCircle,
  Download,
  User,
  Briefcase,
} from 'lucide-react';

// Mock data for frontend-only, single location ("Main Gym")
const initialData = {
  members: [
    {
      id: '1247',
      name: 'John Doe',
      membershipType: '1 Year',
      lastVisit: 'Yesterday 3:00 PM',
      status: 'Active',
      location: 'main',
      expiryDate: '2025-12-31',
      email: 'john.doe@example.com',
      phone: '555-1234',
    },
    {
      id: '1248',
      name: 'Jane Smith',
      membershipType: '3 Month',
      lastVisit: 'Today 1:00 PM',
      status: 'Active',
      location: 'main',
      expiryDate: '2025-07-25',
      email: 'jane.smith@example.com',
      phone: '555-5678',
    },
  ],
  trainers: [
    {
      id: 't001',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '555-9012',
      lastCheckIn: 'Yesterday 9:00 AM',
      status: 'Active',
      location: 'main',
    },
    {
      id: 't002',
      name: 'Emma Chen',
      email: 'emma.c@example.com',
      phone: '555-3456',
      lastCheckIn: 'Today 8:00 AM',
      status: 'Active',
      location: 'main',
    },
  ],
  checkins: [
    {
      id: 1,
      memberId: '1247',
      memberName: 'John Doe',
      membershipType: '1 Year',
      time: '2:30 PM',
      status: 'Checked In',
      duration: '1h 30m',
      location: 'main',
      gateStatus: 'Opened',
    },
    {
      id: 2,
      memberId: '1248',
      memberName: 'Jane Smith',
      membershipType: '3 Month',
      time: '3:15 PM',
      status: 'Checked In',
      duration: '1h',
      location: 'main',
      gateStatus: 'Opened',
    },
  ],
  trainerCheckins: [
    {
      id: 1,
      trainerId: 't001',
      trainerName: 'Sarah Johnson',
      time: '9:00 AM',
      status: 'Checked In',
      duration: '8h',
      location: 'main',
      gateStatus: 'Opened',
    },
  ],
  classes: [
    {
      id: 1,
      className: 'Strength Training',
      time: '6:00 PM',
      instructor: 'Sarah Johnson',
      duration: '60 min',
      enrolled: 2,
      capacity: 15,
      location: 'main',
      room: 'Room A',
      attendees: ['1247', '1248'],
      status: 'Scheduled',
    },
    {
      id: 2,
      className: 'Yoga',
      time: '7:00 PM',
      instructor: 'Emma Chen',
      duration: '45 min',
      enrolled: 1,
      capacity: 12,
      location: 'main',
      room: 'Room B',
      attendees: ['1247'],
      status: 'Scheduled',
    },
  ],
  payments: [
    {
      id: 1,
      memberId: '1247',
      memberName: 'John Doe',
      amount: 199,
      description: '3 Month Membership',
      time: '2025-07-24 2:15 PM',
      method: 'Credit Card',
      status: 'Pending',
      location: 'main',
    },
    {
      id: 2,
      memberId: '1248',
      memberName: 'Jane Smith',
      amount: 50,
      description: 'Monthly Membership',
      time: '2025-07-24 3:00 PM',
      method: 'Cash',
      status: 'Pending',
      location: 'main',
    },
  ],
};

const ReceptDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLocation, setSelectedLocation] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMemberId, setPaymentMemberId] = useState('');
  const [message, setMessage] = useState(null);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('receptDashboardData');
    try {
      const parsed = saved ? JSON.parse(saved) : initialData;
      return {
        members: Array.isArray(parsed.members) ? parsed.members : initialData.members,
        trainers: Array.isArray(parsed.trainers) ? parsed.trainers : initialData.trainers,
        checkins: Array.isArray(parsed.checkins) ? parsed.checkins : initialData.checkins,
        trainerCheckins: Array.isArray(parsed.trainerCheckins) ? parsed.trainerCheckins : initialData.trainerCheckins,
        classes: Array.isArray(parsed.classes) ? parsed.classes : initialData.classes,
        payments: Array.isArray(parsed.payments) ? parsed.payments : initialData.payments,
      };
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      return initialData;
    }
  });
  const [editItem, setEditItem] = useState(null);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-delete expired memberships
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const expiredMembers = (data.members || []).filter((m) => m.expiryDate < today && m.status === 'Active');
    if (expiredMembers.length > 0) {
      setData((prev) => ({
        ...prev,
        members: (prev.members || []).map((m) =>
          m.expiryDate < today ? { ...m, status: 'Expired' } : m
        ),
        checkins: (prev.checkins || []).filter((c) => !expiredMembers.some((m) => m.id === c.memberId)),
        classes: (prev.classes || []).map((b) => ({
          ...b,
          attendees: (b.attendees || []).filter((id) => !expiredMembers.some((m) => m.id === id)),
          enrolled: (b.attendees || []).filter((id) => !expiredMembers.some((m) => m.id === id)).length,
        })),
      }));
    }
  }, [data.members]);

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('receptDashboardData', JSON.stringify(data));
  }, [data]);

  // Optimize member and trainer list rendering
  const filteredMembers = useMemo(() => {
    const members = data.members || [];
    if (!searchQuery.trim()) return members.filter((member) => member.location === 'main');
    return members.filter(
      (member) =>
        member.location === 'main' &&
        (member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         member.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [data.members, searchQuery]);

  const filteredTrainers = useMemo(() => {
    const trainers = data.trainers || [];
    if (!searchQuery.trim()) return trainers.filter((trainer) => trainer.location === 'main');
    return trainers.filter(
      (trainer) =>
        trainer.location === 'main' &&
        (trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         trainer.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [data.trainers, searchQuery]);

  // CRUD Operations
  const createItem = (type, newItem) => {
    setData((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), { id: (prev[type] || []).length + 1, ...newItem, location: 'main' }],
    }));
  };

  const updateItem = (type, updatedItem) => {
    setData((prev) => {
      const newData = {
        ...prev,
        [type]: (prev[type] || []).map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      };
      if (type === 'members') {
        newData.checkins = (prev.checkins || []).map((c) =>
          c.memberId === updatedItem.id ? { ...c, memberName: updatedItem.name, membershipType: updatedItem.membershipType } : c
        );
        newData.payments = (prev.payments || []).map((p) =>
          p.memberId === updatedItem.id ? { ...p, memberName: updatedItem.name } : p
        );
        newData.classes = (prev.classes || []).map((b) => ({
          ...b,
          attendees: (b.attendees || []).map((id) => (id === updatedItem.id ? updatedItem.id : id)),
        }));
      } else if (type === 'trainers') {
        newData.trainerCheckins = (prev.trainerCheckins || []).map((c) =>
          c.trainerId === updatedItem.id ? { ...c, trainerName: updatedItem.name } : c
        );
        newData.classes = (prev.classes || []).map((b) =>
          b.instructor === prev[type].find((t) => t.id === updatedItem.id)?.name
            ? { ...b, instructor: updatedItem.name }
            : b
        );
      }
      return newData;
    });
  };

  const deleteItem = (type, id) => {
    setData((prev) => {
      const newData = {
        ...prev,
        [type]: (prev[type] || []).filter((item) => item.id !== id),
      };
      if (type === 'classes') {
        newData.classes = (prev.classes || []).map((b) =>
          b.id === id ? { ...b, status: 'Cancelled' } : b
        );
      }
      return newData;
    });
  };

  // Check-in/out for members
  const handleCheckIn = (memberId) => {
    const member = (data.members || []).find((m) => m.id === memberId);
    if (member && member.status === 'Active') {
      createItem('checkins', {
        memberId,
        memberName: member.name,
        membershipType: member.membershipType,
        time: new Date().toLocaleTimeString(),
        status: 'Checked In',
        duration: '0m',
        gateStatus: 'Opened',
      });
      updateItem('members', { ...member, lastVisit: new Date().toLocaleTimeString() });
      setMessage({ type: 'success', text: `Successfully checked in ${member.name}` });
    } else {
      setMessage({ type: 'error', text: 'Invalid Member ID or Inactive Member' });
    }
  };

  const handleCheckOut = (checkinId) => {
    const checkin = (data.checkins || []).find((c) => c.id === checkinId);
    if (checkin) {
      updateItem('checkins', { ...checkin, status: 'Checked Out', gateStatus: 'Opened', duration: '2h' });
      setMessage({ type: 'success', text: `Successfully checked out ${checkin.memberName}` });
    }
  };

  // Check-in/out for trainers
  const handleTrainerCheckIn = (trainerId) => {
    const trainer = (data.trainers || []).find((t) => t.id === trainerId);
    if (trainer && trainer.status === 'Active') {
      createItem('trainerCheckins', {
        trainerId,
        trainerName: trainer.name,
        time: new Date().toLocaleTimeString(),
        status: 'Checked In',
        duration: '0m',
        gateStatus: 'Opened',
      });
      updateItem('trainers', { ...trainer, lastCheckIn: new Date().toLocaleTimeString() });
      setMessage({ type: 'success', text: `Successfully checked in ${trainer.name}` });
    } else {
      setMessage({ type: 'error', text: 'Invalid Trainer ID or Inactive Trainer' });
    }
  };

  const handleTrainerCheckOut = (checkinId) => {
    const checkin = (data.trainerCheckins || []).find((c) => c.id === checkinId);
    if (checkin) {
      updateItem('trainerCheckins', { ...checkin, status: 'Checked Out', gateStatus: 'Opened', duration: '8h' });
      setMessage({ type: 'success', text: `Successfully checked out ${checkin.trainerName}` });
    }
  };

  // Export report
  const handleExportReport = (type) => {
    const items = data[type] || [];
    if (items.length === 0) return;
    const headers = Object.keys(items[0]);
    const rows = [headers.join(',')];
    for (let i = 0; i < items.length; i++) {
      const row = headers.map((header) => items[i][header] || '');
      rows.push(row.join(','));
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-report-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile image deletion
  const handleImageDelete = () => {
    setProfileImage('');
  };

  // Save profile updates
  const handleProfileSave = () => {
    const firstName = document.getElementById('profileFirstName')?.value;
    const lastName = document.getElementById('profileLastName')?.value;
    const email = document.getElementById('profileEmail')?.value;
    const phone = document.getElementById('profilePhone')?.value;
    if (firstName && lastName && email && phone) {
      const updatedUser = {
        ...user,
        firstName,
        lastName,
        email,
        phone,
        profileImage: profileImage || '',
      };
      try {
        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setActiveTab('profile');
      } catch (e) {
        console.error('Failed to update profile:', e);
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      }
    } else {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'trainers', label: 'Trainers', icon: Briefcase },
    { id: 'checkins', label: 'Check-ins', icon: UserCheck },
    { id: 'classes', label: 'Classes', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Overview cards
  const currentMonth = '2025-07';
  const overviewCards = [
    {
      title: "Today's Check-ins",
      value: (data.checkins || []).filter((c) => c.status === 'Checked In').length,
      icon: <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />,
      onClick: () => setActiveTab('checkins'),
    },
    {
      title: 'Class Bookings',
      value: (data.classes || []).filter((b) => b.status === 'Scheduled').length,
      icon: <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />,
      onClick: () => setActiveTab('classes'),
    },
    {
      title: 'Monthly Income (July 2025)',
      value: `$${(data.payments || [])
        .filter((p) => p.status === 'Completed' && p.time.startsWith(currentMonth))
        .reduce((sum, p) => sum + p.amount, 0)}`,
      icon: <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />,
      onClick: () => setActiveTab('payments'),
    },
  ];

  return (
    <div className="min-h-screen pt-16 pb-10 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Receptionist Dashboard</h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Welcome back, {user.firstName || 'Staff'}! Manage daily operations.
            </p>
          </div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600 w-full sm:w-auto"
          >
            <option value="main">Main Gym</option>
            <option value="loc1" disabled>Downtown Gym </option>
            <option value="loc2" disabled>Suburban Gym </option>
          </select>
        </header>

        {/* Message Display */}
        {message && (
          <div
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white z-50`}
          >
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-gray-900 rounded-lg p-1 mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 min-w-max">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-3 rounded-md font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                  activeTab === id ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title={label}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">Today's Overview</h2>
                <button
                  onClick={() => handleExportReport('overview')}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  title="Export Overview Report"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Export Report</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {overviewCards.map(({ title, value, icon, onClick }) => (
                  <div
                    key={title}
                    className="bg-gray-800 p-4 sm:p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition"
                    onClick={onClick}
                    title={`Go to ${title} tab`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{title}</p>
                        <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
                      </div>
                      {icon}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-4">Recent Check-ins</h3>
                  {(data.checkins || []).slice(0, 5).map((checkin) => (
                    <div
                      key={checkin.id}
                      className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3"
                    >
                      <div>
                        <p className="text-white font-medium">{checkin.memberName}</p>
                        <p className="text-sm text-gray-400">
                          {checkin.membershipType} • {checkin.time} • Gate: {checkin.gateStatus}
                        </p>
                      </div>
                      <span
                        className={`text-xs sm:text-sm px-2 py-1 rounded bg-${
                          checkin.status === 'Checked In' ? 'green' : 'gray'
                        }-500/20 text-${checkin.status === 'Checked In' ? 'green' : 'gray'}-400 mt-2 sm:mt-0`}
                      >
                        {checkin.status}
                      </span>
                    </div>
                  ))}
                </div> 

                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-4">Classes</h3>
                  {(data.classes || []).slice(0, 5).map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3"
                    >
                      <div>
                        <p className="text-white font-medium">{cls.className}</p>
                        <p className="text-sm text-gray-400">
                          {cls.time} • {cls.instructor} • {cls.room} • {cls.status}
                        </p>
                      </div>
                      <span
                        className={`text-xs sm:text-sm px-2 py-1 rounded ${
                          cls.status === 'Scheduled'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        } mt-2 sm:mt-0`}
                      >
                        {cls.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Members ({filteredMembers.length} Total)
                </h2>
                <button
                  onClick={() => setEditItem({ type: 'members', item: null })}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  title="Add New Member"
                >
                  Add Member
                </button>
              </div>
              <input
                type="text"
                placeholder="Search member by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 mb-6"
              />
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4"
                  >
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold">{member.name}</h3>
                      <p className="text-gray-400 mt-1 text-sm sm:text-base">
                        {member.membershipType} • ID: #{member.id} • Status: {member.status}
                      </p>
                      <p className="text-sm text-gray-400">
                        Last visit: {member.lastVisit} • Expires: {member.expiryDate}
                      </p>
                      <p className="text-sm text-gray-400">
                        Email: {member.email} • Phone: {member.phone}
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleCheckIn(member.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold transition text-sm sm:text-base"
                        title={`Check In ${member.name}`}
                      >
                        Check In
                      </button>
                      <button
                        onClick={() => {
                          setPaymentMemberId(member.id);
                          setActiveTab('payments');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold transition text-sm sm:text-base"
                        title={`Assign Payment for ${member.name}`}
                      >
                        Assign Payment
                      </button>
                      <button
                        onClick={() => setEditItem({ type: 'members', item: member })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                        title={`Edit ${member.name}`}
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => deleteItem('members', member.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                        title={`Delete ${member.name}`}
                      >
                        <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No members found matching your search.</p>
              )}
            </div>
          )}

          {/* Trainers Tab */}
          {activeTab === 'trainers' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Trainers ({filteredTrainers.length} Total)
                </h2>
                <button
                  onClick={() => setEditItem({ type: 'trainers', item: null })}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  title="Add New Trainer"
                >
                  Add Trainer
                </button>
              </div>
              <input
                type="text"
                placeholder="Search trainer by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 mb-6"
              />
              {filteredTrainers.length > 0 ? (
                filteredTrainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4"
                  >
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold">{trainer.name}</h3>
                      <p className="text-gray-400 mt-1 text-sm sm:text-base">
                        ID: #{trainer.id} • Status: {trainer.status}
                      </p>
                      <p className="text-sm text-gray-400">
                        Last Check-in: {trainer.lastCheckIn}
                      </p>
                      <p className="text-sm text-gray-400">
                        Email: {trainer.email} • Phone: {trainer.phone}
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleTrainerCheckIn(trainer.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold transition text-sm sm:text-base"
                        title={`Check In ${trainer.name}`}
                      >
                        Check In
                      </button>
                      <button
                        onClick={() => setEditItem({ type: 'trainers', item: trainer })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                        title={`Edit ${trainer.name}`}
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => deleteItem('trainers', trainer.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                        title={`Delete ${trainer.name}`}
                      >
                        <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No trainers found matching your search.</p>
              )}
            </div>
          )}

          {/* Check-ins Tab */}
          {activeTab === 'checkins' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Today's Check-ins</h2>
                <button
                  onClick={() => handleExportReport('checkins')}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  title="Export Check-ins Report"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Export Report</span>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Enter Member or Trainer ID to check in..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      if (searchQuery.startsWith('t')) {
                        handleTrainerCheckIn(searchQuery);
                      } else {
                        handleCheckIn(searchQuery);
                      }
                      setSearchQuery('');
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button
                  onClick={() => {
                    if (searchQuery) {
                      if (searchQuery.startsWith('t')) {
                        handleTrainerCheckIn(searchQuery);
                      } else {
                        handleCheckIn(searchQuery);
                      }
                      setSearchQuery('');
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
                  title="Submit Check-in"
                >
                  Submit
                </button>
              </div>
              <h3 className="text-lg font-semibold mb-4">Member Check-ins</h3>
              {(data.checkins || []).map((checkin) => (
                <div
                  key={checkin.id}
                  className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4"
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">{checkin.memberName}</h3>
                    <p className="text-sm text-gray-400">
                      {checkin.membershipType} • Check-in: {checkin.time} • Gate: {checkin.gateStatus}
                    </p>
                    <p className="text-sm text-gray-400">Duration: {checkin.duration}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <span
                      className={`text-xs sm:text-sm px-3 py-1 rounded-full ${
                        checkin.status === 'Checked In'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {checkin.status}
                    </span>
                    {checkin.status === 'Checked In' && (
                      <button
                        onClick={() => handleCheckOut(checkin.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm sm:text-base"
                        title={`Check Out ${checkin.memberName}`}
                      >
                        Check Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <h3 className="text-lg font-semibold mb-4 mt-6">Trainer Check-ins</h3>
              {(data.trainerCheckins || []).map((checkin) => (
                <div
                  key={checkin.id}
                  className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4"
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">{checkin.trainerName}</h3>
                    <p className="text-sm text-gray-400">
                      Check-in: {checkin.time} • Gate: {checkin.gateStatus}
                    </p>
                    <p className="text-sm text-gray-400">Duration: {checkin.duration}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <span
                      className={`text-xs sm:text-sm px-3 py-1 rounded-full ${
                        checkin.status === 'Checked In'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {checkin.status}
                    </span>
                    {checkin.status === 'Checked In' && (
                      <button
                        onClick={() => handleTrainerCheckOut(checkin.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm sm:text-base"
                        title={`Check Out ${checkin.trainerName}`}
                      >
                        Check Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Classes</h2>
                <button
                  onClick={() => handleExportReport('classes')}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  title="Export Classes Report"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Export Report</span>
                </button>
              </div>
              {(data.classes || []).map((cls) => (
                <div
                  key={cls.id}
                  className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start mb-4 gap-4"
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">{cls.className}</h3>
                    <p className="text-sm text-gray-400">
                      {cls.time} • {cls.instructor} • {cls.room}
                    </p>
                    <p className="text-sm text-gray-400">
                      Duration: {cls.duration} • Capacity: {cls.enrolled}/{cls.capacity} • Status: {cls.status}
                    </p>
                    <p className="text-sm text-gray-400">
                      Attendees:{' '}
                      {(cls.attendees || [])
                        .map((id) => (data.members || []).find((m) => m.id === id)?.name || id)
                        .join(', ') || 'None'}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => setEditItem({ type: 'classes', item: cls })}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm sm:text-base"
                      title={`Manage Attendees for ${cls.className}`}
                    >
                      Manage Attendees
                    </button>
                    <button
                      onClick={() => deleteItem('classes', cls.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                      title={`Cancel ${cls.className}`}
                    >
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Payment Transactions</h2>
                <button
                  onClick={() => handleExportReport('payments')}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  title="Export Payments Report"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Export Report</span>
                </button>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Assign New Payment</h3>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 gap-4">
                  <input
                    type="text"
                    placeholder="Member ID"
                    value={paymentMemberId}
                    onChange={(e) => setPaymentMemberId(e.target.value)}
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 w-full sm:w-auto"
                    id="paymentMemberId"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 w-full sm:w-auto"
                    id="paymentAmount"
                  />
                  <select
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 w-full sm:w-auto"
                    id="paymentMethod"
                  >
                    {['card', 'cash', 'mobile'].map((method) => (
                      <option key={method} value={method}>
                        {method === 'card' ? 'Credit Card' : method === 'cash' ? 'Cash' : 'Mobile Payment'}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 w-full sm:w-auto"
                    id="paymentDescription"
                  />
                  <select
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 w-full sm:w-auto"
                    id="paymentStatus"
                  >
                    {['Pending', 'Completed', 'Overdue', 'Cancelled'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const memberId = document.getElementById('paymentMemberId').value;
                      const amount = parseFloat(document.getElementById('paymentAmount').value);
                      const method = document.getElementById('paymentMethod').value;
                      const description = document.getElementById('paymentDescription').value;
                      const status = document.getElementById('paymentStatus').value;
                      const member = (data.members || []).find((m) => m.id === memberId);
                      if (member && amount > 0 && member.status === 'Active' && status !== 'Refund') {
                        createItem('payments', {
                          memberId,
                          memberName: member.name,
                          amount,
                          description,
                          time: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString(),
                          method,
                          status,
                        });
                        setMessage({ type: 'success', text: `Payment assigned to ${member.name}` });
                        setPaymentMemberId('');
                        document.getElementById('paymentAmount').value = '';
                        document.getElementById('paymentDescription').value = '';
                        document.getElementById('paymentStatus').value = 'Pending';
                      } else {
                        setMessage({
                          type: 'error',
                          text: member
                            ? status === 'Refund'
                              ? 'Refund status is not allowed'
                              : 'Invalid amount'
                            : 'Invalid Member ID or Inactive Member',
                        });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
                    title="Assign Payment"
                  >
                    Assign
                  </button>
                </div>
              </div>
              {(data.payments || []).map((payment) => (
                <div
                  key={payment.id}
                  className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4"
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">${payment.amount}</h3>
                    <p className="text-sm text-gray-400">
                      {payment.memberName} • {payment.description}
                    </p>
                    <p className="text-sm text-gray-400">
                      {payment.time} • {payment.method} • ID: #{payment.memberId}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <span
                      className={`text-xs sm:text-sm px-3 py-1 rounded-full ${
                        payment.status === 'Completed'
                          ? 'bg-green-500/20 text-green-400'
                          : payment.status === 'Pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : payment.status === 'Overdue'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold">Your Profile</h2>
              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={profileImage || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                    />
                    <div className="mt-2 space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-sm text-gray-400"
                      />
                      {profileImage && (
                        <button
                          onClick={handleImageDelete}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                          title="Delete Profile Image"
                        >
                          Delete Image
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400">First Name</label>
                        <input
                          type="text"
                          defaultValue={user?.firstName || ''}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                          id="profileFirstName"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Last Name</label>
                        <input
                          type="text"
                          defaultValue={user?.lastName || ''}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                          id="profileLastName"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <input
                          type="email"
                          defaultValue={user?.email || ''}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                          id="profileEmail"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Phone Number</label>
                        <input
                          type="tel"
                          defaultValue={user?.phone || ''}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                          id="profilePhone"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Role</label>
                        <input
                          type="text"
                          defaultValue={user?.role || 'Receptionist'}
                          disabled
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                          id="profileRole"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                        title="Cancel"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProfileSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        title="Save Profile"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit/Create Modal */}
          {editItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg sm:text-xl font-bold mb-4">
                  {editItem.item ? `Edit ${editItem.type.slice(0, -1)}` : `Add ${editItem.type.slice(0, -1)}`}
                </h3>
                {editItem.type === 'members' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Name"
                      defaultValue={editItem.item?.name || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editMemberName"
                    />
                    <select
                      defaultValue={editItem.item?.membershipType || '1 Month'}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editMemberType"
                    >
                      {['1 Month', '3 Month', '6 Month', '1 Year', 'Individual Personal Trainer', 'Group Personal Trainer'].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      placeholder="Expiry Date"
                      defaultValue={editItem.item?.expiryDate || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editMemberExpiry"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      defaultValue={editItem.item?.email || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editMemberEmail"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      defaultValue={editItem.item?.phone || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editMemberPhone"
                    />
                  </div>
                )}
                {editItem.type === 'trainers' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Name"
                      defaultValue={editItem.item?.name || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editTrainerName"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      defaultValue={editItem.item?.email || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editTrainerEmail"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      defaultValue={editItem.item?.phone || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editTrainerPhone"
                    />
                    <select
                      defaultValue={editItem.item?.status || 'Active'}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editTrainerStatus"
                    >
                      {['Active', 'Inactive'].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {editItem.type === 'classes' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Manage Attendees for {editItem.item.className}</h4>
                    <select
                      multiple
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      id="editClassAttendees"
                      defaultValue={editItem.item.attendees}
                    >
                      {(data.members || []).map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setEditItem(null);
                      setActiveTab(editItem.type);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    title="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editItem.type === 'members') {
                        const name = document.getElementById('editMemberName').value;
                        const membershipType = document.getElementById('editMemberType').value;
                        const expiryDate = document.getElementById('editMemberExpiry').value;
                        const email = document.getElementById('editMemberEmail').value;
                        const phone = document.getElementById('editMemberPhone').value;
                        if (name && membershipType && expiryDate && email && phone) {
                          const newItem = {
                            id: editItem.item?.id || `mem${(data.members || []).length + 1}`,
                            name,
                            membershipType,
                            expiryDate,
                            email,
                            phone,
                            location: 'main',
                            lastVisit: editItem.item?.lastVisit || 'Never',
                            status: 'Active',
                          };
                          if (editItem.item) {
                            updateItem('members', newItem);
                            setMessage({ type: 'success', text: `Member ${name} updated successfully` });
                          } else {
                            createItem('members', newItem);
                            setMessage({ type: 'success', text: `Member ${name} added successfully` });
                          }
                          setEditItem(null);
                          setActiveTab('members');
                        } else {
                          setMessage({ type: 'error', text: 'Please fill in all fields' });
                          return;
                        }
                      } else if (editItem.type === 'trainers') {
                        const name = document.getElementById('editTrainerName').value;
                        const email = document.getElementById('editTrainerEmail').value;
                        const phone = document.getElementById('editTrainerPhone').value;
                        const status = document.getElementById('editTrainerStatus').value;
                        if (name && email && phone && status) {
                          const newItem = {
                            id: editItem.item?.id || `t${(data.trainers || []).length + 1}`,
                            name,
                            email,
                            phone,
                            status,
                            location: 'main',
                            lastCheckIn: editItem.item?.lastCheckIn || 'Never',
                          };
                          if (editItem.item) {
                            updateItem('trainers', newItem);
                            setMessage({ type: 'success', text: `Trainer ${name} updated successfully` });
                          } else {
                            createItem('trainers', newItem);
                            setMessage({ type: 'success', text: `Trainer ${name} added successfully` });
                          }
                          setEditItem(null);
                          setActiveTab('trainers');
                        } else {
                          setMessage({ type: 'error', text: 'Please fill in all fields' });
                          return;
                        }
                      } else if (editItem.type === 'classes') {
                        const attendees = Array.from(document.getElementById('editClassAttendees').selectedOptions).map(
                          (opt) => opt.value
                        );
                        updateItem('classes', {
                          ...editItem.item,
                          attendees,
                          enrolled: attendees.length,
                        });
                        setMessage({ type: 'success', text: `Attendees for ${editItem.item.className} updated successfully` });
                        setEditItem(null);
                        setActiveTab('classes');
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    title="Save Changes"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptDashboard;