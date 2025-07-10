import React from 'react';
import { Award, Users, Clock, Target, Star, Phone, Mail } from 'lucide-react';

const About = () => {
  

  return (
    <div className="min-h-screen pt-16 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">About Gym Club</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We're more than just a gym. We're a community dedicated to helping you achieve your fitness goals 
            and transform your life through health and wellness.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-gray-900 rounded-2xl p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                At Gym Club, we believe that fitness is not just about physical transformation—it's about 
                building confidence, creating healthy habits, and fostering a supportive community where 
                everyone can thrive.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our state-of-the-art facilities, expert trainers, and comprehensive programs are designed 
                to meet you wherever you are in your fitness journey and help you reach new heights.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/Health & Fitness.jpg" 
                alt="Health and Fitness" 
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Values Section with Images */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <img 
                src="/Equidment.jpg" 
                alt="Excellence in Equipment" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Excellence</h3>
                <p className="text-gray-400">
                  We strive for excellence in everything we do, from our equipment and facilities 
                  to our training programs and customer service.
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <img 
                src="/Group_Persoanl_Trainer.jpg" 
                alt="Community Training" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Community</h3>
                <p className="text-gray-400">
                  We foster a welcoming, inclusive environment where members support and motivate 
                  each other to achieve their goals.
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <img 
                src="/Cardio.jpg" 
                alt="Innovation in Cardio" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Innovation</h3>
                <p className="text-gray-400">
                  We continuously evolve our programs and facilities to incorporate the latest 
                  fitness trends and technologies.
                </p>
              </div>
            </div>
          </div>
        </div>

        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">5000+</h3>
            <p className="text-gray-400">Active Members</p>
          </div>

          <div className="text-center">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">50+</h3>
            <p className="text-gray-400">Expert Trainers</p>
          </div>

          <div className="text-center">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">24/7</h3>
            <p className="text-gray-400">Access Hours</p>
          </div>

          <div className="text-center">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">10+</h3>
            <p className="text-gray-400">Locations</p>
          </div>
        </div>

        {/* Facilities Showcase */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our World-Class Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-xl">
              <img 
                src="/Gym.jpg" 
                alt="Main Gym Floor" 
                className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Main Gym Floor</h3>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <img 
                src="/Equipment.jpg" 
                alt="Equipment" 
                className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Equipment</h3>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <img 
                src="/Cardio.jpg" 
                alt="Cardio section" 
                className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Cardio</h3>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <img 
                src="/Health & Fitness.jpg" 
                alt="Wellness Center" 
                className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Wellness & Recovery Center</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Our Commitment to Excellence</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Every member of our team is dedicated to providing you with the best possible fitness experience. 
            From our front desk staff to our maintenance crew, everyone plays a vital role in your success.
          </p>
          
          <div className="relative overflow-hidden rounded-xl">
            <img 
              src="/Group_Persoanl_Trainer.jpg" 
              alt="Our Training Team" 
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">Our Expert Training Team</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;