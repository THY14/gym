import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, ArrowRight, Check } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const memberships = [
    {
      id: 1,
      name: '1 Month',
      duration: 1,
      price: 35,
      features: [
        'Gym access',
        'Group classes',
        'Locker room',
        'Fitness assessment'
      ],
      description: 'A great start to explore our gym and try the basics.'
    },
    {
      id: 2,
      name: '3 Months',
      duration: 3,
      price: 75,
      features: [
        'Everything in 1 Month',
        '1 personal training session',
        'Nutrition tips',
        'Guest passes'
      ],
      popular: true,
      description: 'Build momentum and get extra support along the way.'
    },
    {
      id: 3,
      name: '6 Months',
      duration: 6,
      price: 115,
      features: [
        'Everything in 3 Months',
        '3 training sessions',
        'Premium classes',
        'Free gear'
      ],
      description: 'Great for steady progress and premium-level perks.'
    },
    {
      id: 4,
      name: '1 Year',
      duration: 12,
      price: 175,
      features: [
        'Everything in 6 Months',
        '6 training sessions',
        'VIP events',
        'Free massage'
      ],
      description: 'Commit long-term and enjoy full benefits and savings.'
    }
  ];

  const red = {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    ring: 'ring-red-600',
    text: 'text-red-400'
  };

  // Determine the redirect path based on user role
  const getRedirectPath = () => {
    if (!user) return '/register';
    switch (user.role) {
      case 'member':
        return '/member-dashboard';
      case 'trainer':
        return '/trainer-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/staff-dashboard';
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/Main.jpg)',
            filter: 'brightness(0.3)'
          }}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Transform Your Body
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Join the ultimate fitness experience with world-class equipment, 
            expert trainers, and a community that pushes you to excel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={getRedirectPath()}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Membership Plans</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the perfect plan that fits your fitness journey and budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {memberships.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div 
                  key={plan.id} 
                  className={`relative bg-gray-900 rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
                    isSelected ? `ring-2 ${red.ring}` : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <Check className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${red.bg} ${red.hover} text-white`}
                    onClick={() => navigate(getRedirectPath())}
                  >
                    Join Now
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              to={user ? getRedirectPath() : '/membership'}
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Plans & Details
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Classes Poster Section */}
      <section className="bg-black text-white px-4 sm:px-8 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Poster Image */}
          <div>
            <img
              src="/Group_Persoanl_Trainer.jpg"
              alt="Health & Fitness Coaching"
              className="rounded-xl w-full h-[500px] object-cover shadow-xl"
            />
          </div>

          {/* Poster Text */}
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold">
              HEALTH & FITNESS CLASSES
            </h2>
            <p className="text-lg font-semibold text-gray-100">
              Personalized guidance. Real results.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Join our expert-led fitness classes designed to help you build sustainable habits and reach your health goals. Whether you're a beginner or looking to level up, our programs support weight management, strength building, and overall wellness in a motivating group environment.
            </p>
            <ul className="space-y-2 text-gray-300 list-disc list-inside"> 
              <li>Strength & Conditioning</li>
              <li>Yoga & Wellness</li>
              <li>Cardio Class</li>
            </ul>
            <div className="text-sm text-white font-semibold space-y-1">
              <p>Available: Monday-Friday</p>
              <p>Session Duration: 45-90 minutes</p>
            </div>
            <Link
              to="/services"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300"
            >
              View All Classes & Services
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities Showcase */}
      <div className="mt-16 mb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our World-Class Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { src: '/Gym.jpg', alt: 'Main Gym Floor', title: 'Main Gym Floor' },
            { src: '/Equipment.jpg', alt: 'Strength Training Zone', title: 'Strength Training Equipment' },
            { src: '/Cardio.jpg', alt: 'Cardio Machines Area', title: 'Cardio Zone' },
            { src: '/Functional.jpg', alt: 'Functional Training Area', title: 'Functional & Resistance Training' },
            { src: '/Suana.jpg', alt: 'Sauna & Recovery Zone', title: 'Sauna & Recovery' },
            { src: '/locker.jpg', alt: 'Changing & Storage Area', title: 'Locker Rooms & Showers' }
          ].map((facility, index) => (
            <div key={index} className="relative overflow-hidden rounded-xl">
              <img 
                src={facility.src} 
                alt={facility.alt} 
                className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">{facility.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of members who have transformed their lives at <span className="text-red-500 font-semibold">Gym Club</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={getRedirectPath()}
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Get Started Today
            </Link>
            {!user && (
              <Link
                to="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                Contact Us
              </Link>
            )}
          </div>         
        </div>
      </section>
    </div>
  );
};

export default Home;