import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, DollarSign, Calendar, Activity, UserCheck, Settings, Shield, User, MapPin, Phone, Mail, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member' });
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    capacity: '',
    duration: '',
    price: '',
    image: '',
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
  const [contactInfo, setContactInfo] = useState({
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
  });

  // Predefined options for selections
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const availableSpecializations = [
    'Strength Training', 'Cardio & HIIT', 'Yoga & Wellness', 'Sports Performance', 'Weight Loss'
  ];
  const availableCertifications = [
    'NASM-CPT', 'ACSM-CPT', 'ACE-CPT', 'TRX Certified' ];

  const availableSpecialties = [
    'Weight Loss', 'Muscle Building', 'Nutrition Planning', 'HIIT Training', 'Cardio Conditioning', 'Flexibility',
  ];
  const classFeatures = [
    'Form correction', 'Flexibility improvement', 'Stress reduction', 'Fat burning',
  ];

  // Load data from local storage or initialize with defaults
  useEffect(() => {
    setIsLoading(true);
    const loadData = () => {
      // Load contact info
      const storedContact = localStorage.getItem('contactInfo');
      if (storedContact) {
        setContactInfo(JSON.parse(storedContact));
      }

      // Load classes
      const storedClasses = localStorage.getItem('classes');
      if (storedClasses) {
        setClasses(JSON.parse(storedClasses));
      } else {
        setClasses([
          {
            id: 1,
            name: 'Strength & Conditioning',
            description: 'Build muscle, increase strength, and tone your body.',
            capacity: 15,
            duration: 90,
            price: 30,
            image: '/Strenght.jpg',
            trainer: { user: { firstName: 'Sarah', lastName: 'Johnson' } },
            features: ['Personal workout plans', 'Form correction', 'Progressive overload'],
            availability: { days: ['Monday', 'Wednesday', 'Friday'], times: ['5:00 PM - 7:00 PM'] },
            startTime: '17:00'
          },
          {
            id: 2,
            name: 'Yoga & Wellness',
            description: 'Find balance, flexibility, and inner peace.',
            capacity: 20,
            duration: 60,
            price: 25,
            image: '/Yoga&Wellness.jpg',
            trainer: { user: { firstName: 'Emma', lastName: 'Chen' } },
            features: ['Flexibility improvement', 'Stress reduction', 'Mindfulness'],
            availability: { days: ['Tuesday', 'Thursday'], times: ['9:00 AM - 11:00 AM'] },
            startTime: '09:00'
          },
          {
            id: 3,
            name: 'Cardio Class',
            description: 'High-intensity cardiovascular workouts.',
            capacity: 25,
            duration: 75,
            price: 25,
            image: '/CardioClass.jpg',
            trainer: { user: { firstName: 'Mike', lastName: 'Rodriguez' } },
            features: ['Fat burning', 'Heart health', 'High energy'],
            availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], times: ['7:00 PM - 9:00 PM'] },
            startTime: '19:00'
          }
        ]);
      }

      // Load trainers
      const storedTrainers = localStorage.getItem('trainers');
      if (storedTrainers) {
        setTrainers(JSON.parse(storedTrainers));
      } else {
        setTrainers([
          {
            id: 1,
            name: 'Sarah Johnson',
            specialization: ['Strength Training', 'Nutrition Planning'],
            experience: '8 years',
            bio: 'Certified personal trainer specializing in strength training.',
            image: '/Group_Persoanl_Trainer.jpg',
            certifications: ['NASM-CPT', 'Precision Nutrition', 'Corrective Exercise Specialist'],
            specialties: ['Weight Loss', 'Muscle Building', 'Nutrition Planning', 'Form Correction'],
            availability: { 
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              times: ['6:00 AM - 8:00 PM']
            },
            phone: '(555) 123-4567',
            email: 'sarah@gymclub.com'
          },
          {
            id: 2,
            name: 'Mike Rodriguez',
            specialization: ['Cardio & HIIT'],
            experience: '6 years',
            bio: 'High-energy trainer focused on cardiovascular fitness.',
            image: '/Cardio.jpg',
            certifications: ['ACSM-CPT', 'TRX Certified', 'HIIT Specialist'],
            specialties: ['HIIT Training', 'Cardio Conditioning', 'Fat Loss', 'Endurance Building'],
            availability: { 
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              times: ['5:00 AM - 7:00 PM']
            },
            phone: '(555) 234-5678',
            email: 'mike@gymclub.com'
          },
          {
            id: 3,
            name: 'Emma Chen',
            specialization: ['Yoga & Wellness'],
            experience: '10 years',
            bio: 'Experienced yoga instructor and wellness coach.',
            image: '/Health & Fitness.jpg',
            certifications: ['RYT-500', 'Meditation Teacher', 'Wellness Coach'],
            specialties: ['Yoga', 'Meditation', 'Flexibility', 'Stress Management', 'Mindfulness'],
            availability: { 
              days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              times: ['7:00 AM - 6:00 PM']
            },
            phone: '(555) 345-6789',
            email: 'emma@gymclub.com'
          },
          {
            id: 4,
            name: 'David Thompson',
            specialization: ['Functional Fitness'],
            experience: '7 years',
            bio: 'Former athlete turned trainer, specializing in functional movement.',
            image: '/Equidment.jpg',
            certifications: ['CSCS', 'FMS Level 2', 'Sports Performance'],
            specialties: ['Functional Movement', 'Sports Performance', 'Injury Prevention', 'Mobility'],
            availability: { 
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'],
              times: ['6:00 AM - 8:00 PM']
            },
            phone: '(555) 456-7890',
            email: 'david@gymclub.com'
          }
        ]);
      }

      // Load users and payments
      setUsers([
        { id: 1, name: 'John Doe', email: 'john.doe@email.com', role: 'member', status: 'active', joinDate: '2024-01-15' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'trainer', status: 'active', classes: 12 },
        { id: 3, name: 'Mike Smith', email: 'mike.s@email.com', role: 'member', status: 'active', joinDate: '2024-01-15' },
        { id: 4, name: 'Lisa Brown', email: 'lisa.b@email.com', role: 'receptionist', status: 'active', joinDate: '2024-02-01' }
      ]);
      setPayments([
        { id: 1, userId: 1, amount: 199, description: '3 Month Membership', date: '2024-01-15', method: 'Credit Card', status: 'completed' },
        { id: 2, userId: 3, amount: 25, description: 'Class Fee', date: '2024-02-01', method: 'Cash', status: 'completed' }
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save data to local storage
  useEffect(() => {
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('trainers', JSON.stringify(trainers));
  }, [contactInfo, classes, trainers]);

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
  const handleAddUser = useCallback((e, role) => {
    e.preventDefault();
    const permission = role === 'member' ? 'manage_members' : role === 'trainer' ? 'manage_trainers' : 'manage_receptionists';
    if (hasPermission(permission)) {
      if (newMember.name && newMember.email) {
        const newUser = {
          id: users.length + 1,
          name: newMember.name,
          email: newMember.email,
          role,
          status: 'active',
          joinDate: new Date().toISOString().slice(0, 10),
          ...(role === 'trainer' ? { classes: 0 } : {})
        };
        setUsers(prev => [...prev, newUser]);
        if (role === 'trainer') {
          setTrainers(prev => [...prev, {
            id: newUser.id,
            name: newUser.name,
            specialization: [],
            experience: '',
            bio: '',
            image: null,
            certifications: [],
            specialties: [],
            availability: { days: [], times: [] },
            phone: '',
            email: newUser.email
          }]);
        }
        if (role === 'member') {
          setPayments(prev => [...prev, {
            id: prev.length + 1,
            userId: newUser.id,
            amount: 199,
            description: 'New Member Registration',
            date: new Date().toISOString().slice(0, 10),
            method: 'Credit Card',
            status: 'completed'
          }]);
        }
        setNewMember({ name: '', email: '', role });
      } else {
        alert('Please fill in all required fields');
      }
    } else {
      alert(`Permission denied: Cannot add ${role}`);
    }
  }, [hasPermission, newMember, users]);

  const handleEditUser = useCallback((user) => {
    setEditUser(user);
  }, []);

  const handleUpdateUser = useCallback((e) => {
    e.preventDefault();
    const permission = editUser.role === 'member' ? 'manage_members' : editUser.role === 'trainer' ? 'manage_trainers' : 'manage_receptionists';
    if (hasPermission(permission) && editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...editUser } : u));
      if (editUser.role === 'trainer') {
        setTrainers(prev => prev.map(t => t.id === editUser.id ? { ...t, name: editUser.name, email: editUser.email } : t));
      }
      setEditUser(null);
    } else {
      alert(`Permission denied: Cannot update ${editUser.role}`);
    }
  }, [hasPermission, editUser]);

  const handleDeleteUser = useCallback((userId, role) => {
    const permission = role === 'member' ? 'manage_members' : role === 'trainer' ? 'manage_trainers' : 'manage_receptionists';
    if (hasPermission(permission)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (role === 'trainer') {
        setTrainers(prev => prev.filter(t => t.id !== userId));
        setClasses(prev => prev.map(c => ({
          ...c,
          trainer: c.trainer.user.firstName + ' ' + c.trainer.user.lastName === users.find(u => u.id === userId)?.name
            ? { user: { firstName: 'Unassigned', lastName: '' } }
            : c.trainer
        })));
      }
      if (role === 'member') {
        setPayments(prev => prev.filter(p => p.userId !== userId));
      }
    } else {
      alert(`Permission denied: Cannot delete ${role}`);
    }
  }, [hasPermission, users]);

  // CRUD Operations for Classes
  const handleAddClass = useCallback((e) => {
  e.preventDefault();
  if (hasPermission('manage_classes')) {
    if (
      newClass.name &&
      newClass.capacity &&
      newClass.duration &&
      newClass.price &&
      newClass.availability.days.length > 0 &&
      newClass.trainer.user.firstName &&
      newClass.startTime
    ) {
      const [firstName, lastName] = newClass.trainer.user.firstName.split(' ');
      setClasses(prev => [...prev, {
        id: prev.length + 1,
        name: newClass.name,
        description: newClass.description || '',
        capacity: parseInt(newClass.capacity),
        duration: parseInt(newClass.duration),
        price: parseFloat(newClass.price),
        image: newClass.image || '/default_class.jpg',
        trainer: { user: { firstName, lastName: lastName || '' } },
        features: newClass.features.filter(f => f.trim()),
        availability: {
          days: newClass.availability.days,
          times: newClass.availability.times.length > 0 ? newClass.availability.times : [newClass.startTime]
        },
        startTime: newClass.startTime
      }]);
      setNewClass({
        name: '',
        description: null,
        capacity: '',
        duration: '',
        price: '',
        image: null,
        trainer: { user: { firstName: '', lastName: '' } },
        features: [],
        availability: { days: [], times: [] },
        startTime: ''
      });
    } else {
      alert('Please fill in all required fields');
    }
  } else {
    alert('Permission denied: Cannot add class');
  }
}, [hasPermission, newClass]);

  const handleUpdateClass = useCallback((e) => {
    e.preventDefault();
    if (hasPermission('manage_classes') && editClass) {
      const [firstName, lastName] = editClass.trainer.user.firstName.split(' ');
      setClasses(prev => prev.map(c => c.id === editClass.id ? {
        ...editClass,
        description: editClass.description || '',
        trainer: { user: { firstName, lastName: lastName || '' } },
        capacity: parseInt(editClass.capacity),
        duration: parseInt(editClass.duration),
        price: parseFloat(editClass.price),
        features: editClass.features.filter(f => f.trim()),
        availability: editClass.availability,
        startTime: editClass.startTime
      } : c));
      setEditClass(null);
    } else {
      alert('Permission denied: Cannot update class');
    }
  }, [hasPermission, editClass]);

  const handleDeleteClass = useCallback((classId) => {
    if (hasPermission('manage_classes')) {
      setClasses(prev => prev.filter(c => c.id !== classId));
    } else {
      alert('Permission denied: Cannot delete class');
    }
  }, [hasPermission]);

  // CRUD Operations for Trainers
  const handleAddTrainer = useCallback((e) => {
  e.preventDefault();
  if (hasPermission('manage_trainers')) {
    if (
      newTrainer.name &&
      newTrainer.specialization.length > 0 &&
      newTrainer.email &&
      newTrainer.certifications.length > 0 &&
      newTrainer.specialties.length > 0 &&
      newTrainer.availability.days.length > 0
    ) {
      const newUser = {
        id: users.length + 1,
        name: newTrainer.name,
        email: newTrainer.email,
        role: 'trainer',
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
        classes: 0
      };
      setUsers(prev => [...prev, newUser]);
      setTrainers(prev => [...prev, {
        id: newUser.id,
        name: newTrainer.name,
        specialization: newTrainer.specialization,
        experience: newTrainer.experience,
        bio: newTrainer.bio || '',
        image: newTrainer.image || null,
        certifications: newTrainer.certifications,
        specialties: newTrainer.specialties,
        availability: {
          days: newTrainer.availability.days,
          times: newTrainer.availability.times.length > 0 ? newTrainer.availability.times : ['Not specified']
        },
        phone: newTrainer.phone,
        email: newTrainer.email
      }]);
      setNewTrainer({
        name: '',
        specialization: [],
        experience: '',
        bio: null,
        image: null,
        certifications: [],
        specialties: [],
        availability: { days: [], times: [] },
        phone: '',
        email: ''
      });
    } else {
      alert('Please fill in all required fields');
    }
  } else {
    alert('Permission denied: Cannot add trainer');
  }
}, [hasPermission, newTrainer, users]);

  const handleUpdateTrainer = useCallback((e) => {
    e.preventDefault();
    if (hasPermission('manage_trainers') && editTrainer) {
      setTrainers(prev => prev.map(t => t.id === editTrainer.id ? {
        ...editTrainer,
        bio: editTrainer.bio || '',
        specialization: editTrainer.specialization,
        certifications: editTrainer.certifications.filter(c => c.trim()),
        specialties: editTrainer.specialties.filter(s => s.trim()),
        availability: editTrainer.availability
      } : t));
      setUsers(prev => prev.map(u => u.id === editTrainer.id ? { ...u, name: editTrainer.name, email: editTrainer.email } : u));
      setClasses(prev => prev.map(c => ({
        ...c,
        trainer: c.trainer.user.firstName + ' ' + c.trainer.user.lastName === users.find(u => u.id === editTrainer.id)?.name
          ? { user: { firstName: editTrainer.name.split(' ')[0], lastName: editTrainer.name.split(' ')[1] || '' } }
          : c.trainer
      })));
      setEditTrainer(null);
    } else {
      alert('Permission denied: Cannot update trainer');
    }
  }, [hasPermission, editTrainer, users]);

  const handleDeleteTrainer = useCallback((trainerId) => {
    if (hasPermission('manage_trainers')) {
      setTrainers(prev => prev.filter(t => t.id !== trainerId));
      setUsers(prev => prev.filter(u => u.id !== trainerId));
      setClasses(prev => prev.map(c => ({
        ...c,
        trainer: c.trainer.user.firstName + ' ' + c.trainer.user.lastName === users.find(u => u.id === trainerId)?.name
          ? { user: { firstName: 'Unassigned', lastName: '' } }
          : c.trainer
      })));
    } else {
      alert('Permission denied: Cannot delete trainer');
    }
  }, [hasPermission, users]);

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

  const handleSaveContact = useCallback(() => {
    if (hasPermission('manage_settings')) {
      localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
      alert('Contact information saved successfully!');
    } else {
      alert('Permission denied: Cannot save contact information');
    }
  }, [hasPermission, contactInfo]);

  const handleCancelContact = useCallback(() => {
    const storedContact = localStorage.getItem('contactInfo');
    if (storedContact) {
      setContactInfo(JSON.parse(storedContact));
    } else {
      setContactInfo({
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
      });
    }
  }, []);

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

  // Handle file input for trainer image
  const handleTrainerImageChange = (e) => {
    const file = e.target.files[0];
    if (editTrainer) {
      setEditTrainer(prev => ({ ...prev, image: file || null }));
    } else {
      setNewTrainer(prev => ({ ...prev, image: file || null }));
    }
  };

  return (
    <div className="min-h-screen pt-16 py-8 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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