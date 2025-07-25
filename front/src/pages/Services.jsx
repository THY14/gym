import React, { useState, useEffect } from 'react';
import { Clock, Users, DollarSign, Calendar, Star, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  // Local mock data for demonstration (replace with API call later)
  const mockClasses = [
    {
      id: 1,
      name: 'Strength & Conditioning',
      description: 'Build muscle, increase strength, and tone your body with our comprehensive strength training program.',
      capacity: 15,
      duration: 90,
      price: 30,
      image: '/Strenght.jpg',
      trainer: {
        user: {
          firstName: 'Sarah',
          lastName: 'Johnson'
        }
      },
      features: ['Personal workout plans', 'Form correction', 'Progressive overload'],
      availability: 'Monday to Friday'
    },
    {
      id: 2,
      name: 'Yoga & Wellness',
      description: 'Find balance, flexibility, and inner peace through our guided yoga sessions.',
      capacity: 20,
      duration: 60,
      price: 25,
      image: '/Yoga&Wellness.jpg',
      trainer: {
        user: {
          firstName: 'Emma',
          lastName: 'Chen'
        }
      },
      features: ['Flexibility improvement', 'Stress reduction', 'Mindfulness'],
      availability: 'Monday to Friday'
    },
    {
      id: 3,
      name: 'Cardio Class',
      description: 'High-intensity cardiovascular workouts to boost your endurance and burn calories.',
      capacity: 25,
      duration: 75,
      price: 25,
      image: '/CardioClass.jpg',
      trainer: {
        user: {
          firstName: 'Mike',
          lastName: 'Rodriguez'
        }
      },
      features: ['Fat burning', 'Heart health', 'High energy'],
      availability: 'Daily'
    },
  ];

  useEffect(() => {
    // Using local mock data for now
    setClasses(mockClasses);

    // Later, replace with real backend call like:
    // fetch('/api/classes')
    //   .then(res => res.json())
    //   .then(data => setClasses(data))
    //   .catch(err => console.error(err));
  }, []);

  // Local list of personal trainers
  const trainers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      specialization: 'Strength Training & Nutrition',
      experience: '8 years',
      bio: 'Certified personal trainer specializing in strength training and nutrition coaching...',
      image: '/Group_Persoanl_Trainer.jpg',
      certifications: ['NASM-CPT', 'Precision Nutrition', 'Corrective Exercise Specialist'],
      specialties: ['Weight Loss', 'Muscle Building', 'Nutrition Planning', 'Form Correction'],
      availability: 'Mon-Fri: 6AM-8PM, Sat: 8AM-4PM',
      phone: '(555) 123-4567',
      email: 'sarah@gymclub.com'
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      specialization: 'Cardio & HIIT',
      experience: '6 years',
      bio: 'High-energy trainer focused on cardiovascular fitness and high-intensity interval training...',
      image: '/Cardio.jpg',
      certifications: ['ACSM-CPT', 'TRX Certified', 'HIIT Specialist'],
      specialties: ['HIIT Training', 'Cardio Conditioning', 'Fat Loss', 'Endurance Building'],
      availability: 'Mon-Sat: 5AM-7PM',
      phone: '(555) 234-5678',
      email: 'mike@gymclub.com'
    },
    {
      id: 3,
      name: 'Emma Chen',
      specialization: 'Yoga & Wellness',
      experience: '10 years',
      bio: 'Experienced yoga instructor and wellness coach. Helps clients find balance...',
      image: '/Health & Fitness.jpg',
      certifications: ['RYT-500', 'Meditation Teacher', 'Wellness Coach'],
      specialties: ['Yoga', 'Meditation', 'Flexibility', 'Stress Management', 'Mindfulness'],
      availability: 'Tue-Sun: 7AM-6PM',
      phone: '(555) 345-6789',
      email: 'emma@gymclub.com'
    },
    {
      id: 4,
      name: 'David Thompson',
      specialization: 'Functional Fitness',
      experience: '7 years',
      bio: 'Former athlete turned trainer, specializing in functional movement...',
      image: '/Equidment.jpg',
      certifications: ['CSCS', 'FMS Level 2', 'Sports Performance'],
      specialties: ['Functional Movement', 'Sports Performance', 'Injury Prevention', 'Mobility'],
      availability: 'Mon-Fri: 6AM-8PM, Sun: 9AM-3PM',
      phone: '(555) 456-7890',
      email: 'david@gymclub.com'
    }
  ];

  return (
    <div className="min-h-screen pt-16 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Hero Section */}
        <div className="relative mb-16 rounded-2xl overflow-hidden">
          <div 
            className="h-64 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/Gym.jpg)',
              filter: 'brightness(0.4)'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Our Classes</h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Choose from our wide variety of fitness classes designed to help you reach your goals.
              </p>
            </div>
          </div>
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((classItem) => (
            <div key={classItem.id} className="bg-gray-900 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <img 
                  src={classItem.image} 
                  alt={classItem.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${classItem.price}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">{classItem.name}</h3>
                <p className="text-gray-400 mb-4">{classItem.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-5 w-5 mr-3 text-red-600" />
                    <span>{classItem.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Users className="h-5 w-5 mr-3 text-red-600" />
                    <span>Max {classItem.capacity} participants</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-5 w-5 mr-3 text-red-600" />
                    <span>{classItem.availability}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <DollarSign className="h-5 w-5 mr-3 text-red-600" />
                    <span>Instructor: {classItem.trainer?.user?.firstName} {classItem.trainer?.user?.lastName}</span>
                  </div>
                </div>

                {/* Button updated to redirect to /dashboard after login */}
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300">
                  Book Class
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trainers Section */}
        <div className="mt-16 mb-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Choose Your Personal Trainer</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Our certified trainers are here to help you achieve your fitness goals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-gray-900 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img 
                      src={trainer.image} 
                      alt={trainer.name}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{trainer.name}</h3>
                        <p className="text-red-600 font-semibold mb-2">{trainer.specialization}</p>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{trainer.bio}</p>

                    <div className="mb-4">
                      <h4 className="text-white font-semibold mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {trainer.specialties.map((specialty, index) => (
                          <span key={index} className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-white font-semibold mb-2">Certifications:</h4>
                      <div className="flex flex-wrap gap-2">
                        {trainer.certifications.map((cert, index) => (
                          <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-white font-semibold mb-1">Availability:</h4>
                      <p className="text-gray-400 text-sm">{trainer.availability}</p>
                    </div>

                    <div className="flex items-center space-x-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-400">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{trainer.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Mail className="h-4 w-4 mr-1" />
                        <span>{trainer.email}</span>
                      </div>
                    </div>

                    {/* Button updated to redirect to /dashboard after login */}
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-sm">
                        Book Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;