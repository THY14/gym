import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, Star, Crown, Zap, Shield } from 'lucide-react';

const Membership = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const memberships = [
  {
    id: 1,
    name: '1 Month',
    duration: 1,
    price: 35,
    icon: Zap,
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
    icon: Star,
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
    icon: Shield,
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
    icon: Crown,
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

  return (
    <div className="min-h-screen pt-16 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Membership</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Select the perfect plan that fits your fitness journey and budget. 
            All memberships include access to our world-class facilities and expert guidance.
          </p>
        </div>

        {/* Membership Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {memberships.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <div 
                key={plan.id} 
                className={`relative bg-gray-900 rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
                  isSelected ? `ring-2 ${red.ring}` : ''
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              > {}
                <div className="text-center mb-6">
                  <div className={`${red.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <Check className={`h-5 w-5 ${red.text} mr-3 flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${red.bg + ' ' + red.hover + ' text-white'}`}
                  onClick={() => {window.location.href = '/login';}}>
                Join Now
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Membership Benefits Overview */}
        <div className="bg-gray-900 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">What's Included in Every Membership</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium Equipment</h3>
              <p className="text-gray-400">State-of-the-art fitness equipment and facilities maintained to the highest standards.</p>
            </div>
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Expert Trainers</h3>
              <p className="text-gray-400">Certified professionals ready to guide you every step of your fitness journey.</p>
            </div>
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">10+ Locations</h3>
              <p className="text-gray-400">Access to all our premium locations across the city with flexible scheduling.</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-900 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Can I freeze my membership?</h3>
              <p className="text-gray-400">Yes! 6-month and yearly memberships include freeze options. Contact our staff for details.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Are there any hidden fees?</h3>
              <p className="text-gray-400">No hidden fees! The price you see is exactly what you pay. No enrollment or maintenance fees.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Can I upgrade my membership?</h3>
              <p className="text-gray-400">Absolutely! You can upgrade anytime and we'll prorate the difference for your current billing cycle.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">What if I want to cancel?</h3>
              <p className="text-gray-400">You can cancel anytime with 30 days notice. No cancellation fees for memberships over 3 months.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;