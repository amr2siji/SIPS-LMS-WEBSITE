import { ArrowRight, Search, Tag, Calendar, MapPin, Clock, X } from 'lucide-react';
import { useState } from 'react';

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<typeof newsAndEvents[0] | null>(null);

  const newsAndEvents = [
    {
      id: 1,
      title: 'Annual Academic Excellence Awards Ceremony 2024',
      excerpt: 'Join us in celebrating outstanding achievements of our students and faculty members at this prestigious annual event recognizing academic excellence and innovation.',
      author: 'SIPS Administration',
      date: 'November 15, 2024',
      category: 'Event',
      image: 'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=800',
      time: '6:00 PM - 9:00 PM',
      location: 'SIPS Main Auditorium',
      featured: true,
      type: 'Upcoming Event'
    },
    {
      id: 2,
      title: 'New Partnership with Leading Tech Companies Announced',
      excerpt: 'SIPS expands industry collaboration with major technology firms to provide students with enhanced internship opportunities and real-world project experience.',
      author: 'Communications Team',
      date: 'November 8, 2024',
      category: 'News',
      image: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'Latest News',
      featured: false
    },
    {
      id: 3,
      title: 'Career Fair 2024: Connect with Top Employers',
      excerpt: 'Meet representatives from over 50 leading companies across various industries. Network, explore career opportunities, and take the next step in your professional journey.',
      author: 'Career Services',
      date: 'November 22, 2024',
      category: 'Event',
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
      time: '10:00 AM - 4:00 PM',
      location: 'University Convention Center',
      type: 'Upcoming Event',
      featured: false
    },
    {
      id: 4,
      title: 'Student Innovation Showcase: Celebrating Creativity',
      excerpt: 'Witness groundbreaking projects and innovative solutions developed by our talented students. Vote for your favorite projects and win exciting prizes.',
      author: 'Student Affairs',
      date: 'December 5, 2024',
      category: 'Event',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
      time: '2:00 PM - 6:00 PM',
      location: 'Innovation Hub',
      type: 'Upcoming Event',
      featured: false
    },
    {
      id: 5,
      title: 'SIPS Ranks Among Top Educational Institutions in Sri Lanka',
      excerpt: 'Latest education rankings place SIPS in the top tier for quality education, student satisfaction, and career outcomes, reinforcing our commitment to excellence.',
      author: 'Public Relations',
      date: 'November 3, 2024',
      category: 'News',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'Latest News',
      featured: false
    },
    {
      id: 6,
      title: 'Guest Lecture: Industry Leaders Share Insights',
      excerpt: 'Renowned industry experts will share their experiences and insights on emerging trends, career development, and entrepreneurship in an interactive session.',
      author: 'Academic Affairs',
      date: 'November 28, 2024',
      category: 'Event',
      image: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=800',
      time: '3:00 PM - 5:00 PM',
      location: 'Lecture Hall A',
      type: 'Upcoming Event',
      featured: false
    }
  ];

  const categories = ['All', 'News', 'Event'];

  const filteredItems = selectedCategory === 'All' 
    ? newsAndEvents 
    : newsAndEvents.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section
        className="relative h-[500px] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(5, 46, 22, 0.9), rgba(16, 185, 129, 0.8)), url(https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-slate-900/50"></div>
        <div className="relative text-center max-w-4xl px-4 z-10">
          <div className="mb-6 inline-block">
            <Calendar className="mx-auto mb-4 animate-pulse" size={56} />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            NEWS & <span className="text-amber-400">EVENTS</span>
          </h1>
          <p className="text-2xl text-emerald-50 mb-8 font-light">
            Stay Updated with the Latest Happenings at SIPS
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search news, events, or announcements..."
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-amber-500/50 shadow-xl"
              />
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Tag className="text-emerald-700" size={24} />
            <h3 className="text-xl font-semibold text-gray-900">Filter by Type</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-300 hover:border-emerald-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Item */}
        {filteredItems.find(item => item.featured) && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-amber-500"></div>
              <h2 className="text-3xl font-bold text-gray-900">Featured {filteredItems[0].category}</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-96 lg:h-auto overflow-hidden group">
                  <img
                    src={filteredItems[0].image}
                    alt={filteredItems[0].title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg uppercase">
                      {filteredItems[0].type}
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      filteredItems[0].category === 'Event' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {filteredItems[0].category}
                    </span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight hover:text-emerald-700 transition-colors cursor-pointer">
                    {filteredItems[0].title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {filteredItems[0].excerpt}
                  </p>
                  
                  {/* Event Details */}
                  {filteredItems[0].category === 'Event' && (
                    <div className="space-y-2 mb-6 border-l-4 border-emerald-500 pl-4 bg-emerald-50 py-3 rounded-r-lg">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={18} className="text-emerald-600" />
                        <span className="font-medium">{filteredItems[0].date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={18} className="text-emerald-600" />
                        <span className="font-medium">{filteredItems[0].time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={18} className="text-emerald-600" />
                        <span className="font-medium">{filteredItems[0].location}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => setSelectedItem(filteredItems[0])}
                      className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold group transition-all shadow-md hover:shadow-lg"
                    >
                      View Details
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News & Events Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-12 bg-amber-500"></div>
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'All News & Events' : 
               selectedCategory === 'News' ? 'Latest News' : 'Upcoming Events'}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.slice(1).map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                      item.category === 'Event' ? 'bg-purple-600' : 'bg-emerald-600'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.category === 'Event' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3 leading-relaxed">
                    {item.excerpt}
                  </p>
                  
                  {/* Event Details for Cards */}
                  {item.category === 'Event' && (
                    <div className="space-y-1 mb-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-emerald-600" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-emerald-600" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-emerald-600" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 group/btn"
                    >
                      View Details
                      <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white px-10 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            Load More {selectedCategory === 'All' ? 'Items' : selectedCategory === 'News' ? 'News' : 'Events'}
          </button>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            {/* Modal Header with Image */}
            <div className="relative h-64 md:h-80">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all hover:scale-110"
              >
                <X size={24} />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg mb-3 ${
                  selectedItem.category === 'Event' ? 'bg-purple-600' : 'bg-emerald-600'
                }`}>
                  {selectedItem.type}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {selectedItem.title}
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8">
              {/* Event Details */}
              {selectedItem.category === 'Event' && (
                <div className="mb-6 grid md:grid-cols-3 gap-4 bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Date</p>
                      <p className="text-sm font-bold text-gray-900">{selectedItem.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Time</p>
                      <p className="text-sm font-bold text-gray-900">{selectedItem.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Location</p>
                      <p className="text-sm font-bold text-gray-900">{selectedItem.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* News Date */}
              {selectedItem.category === 'News' && (
                <div className="mb-6 flex items-center gap-2 text-gray-600">
                  <Calendar size={18} className="text-emerald-600" />
                  <span className="font-medium">{selectedItem.date}</span>
                </div>
              )}

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {selectedItem.excerpt}
                </p>
                
                {/* Additional Content */}
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    {selectedItem.category === 'Event' 
                      ? 'This is an exciting opportunity to engage with our community and participate in meaningful activities. We encourage all interested participants to mark their calendars and join us for this special occasion.'
                      : 'This development represents a significant milestone in our continued commitment to providing the best educational experience for our students. We remain dedicated to innovation and excellence in all our endeavors.'}
                  </p>
                  
                  {selectedItem.category === 'Event' && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">What to Expect</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Engaging presentations and activities</li>
                        <li>Networking opportunities with peers and professionals</li>
                        <li>Refreshments and interactive sessions</li>
                        <li>Q&A with speakers and organizers</li>
                      </ul>
                      
                      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Registration</h3>
                      <p>
                        To register for this event, please contact the administration office or send an email with your details. Limited seats available, so early registration is recommended.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4 flex-wrap">
                {selectedItem.category === 'Event' && (
                  <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                    Register for Event
                    <ArrowRight size={20} />
                  </button>
                )}
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}