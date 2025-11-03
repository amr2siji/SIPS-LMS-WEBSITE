import { User, ArrowRight, Search, Tag, BookOpen } from 'lucide-react';
import { useState } from 'react';

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const blogPosts = [
    {
      id: 1,
      title: 'The Future of Education: Embracing Blended Learning',
      excerpt: 'Discover how our blended learning model combines the best of online and in-person education to create a flexible, engaging learning experience that adapts to your schedule and learning style.',
      author: 'Dr. Sarah Johnson',
      date: 'October 28, 2024',
      category: 'Education',
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '5 min read',
      featured: true
    },
    {
      id: 2,
      title: 'Success Stories: Alumni Making an Impact',
      excerpt: 'Meet our graduates who are transforming industries and making a difference in their communities through the skills they learned at SIPS.',
      author: 'Michael Chen',
      date: 'October 25, 2024',
      category: 'Alumni',
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '7 min read',
      featured: false
    },
    {
      id: 3,
      title: 'Industry Partnerships: Learning from the Best',
      excerpt: 'Explore our collaborations with leading industry experts who bring real-world experience directly to our classrooms.',
      author: 'Prof. Amanda Williams',
      date: 'October 20, 2024',
      category: 'Industry',
      image: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '6 min read',
      featured: false
    },
    {
      id: 4,
      title: 'Skill-Based Learning: Preparing for Tomorrow',
      excerpt: 'Learn about our student-centric approach that focuses on practical skills and hands-on experience to prepare you for your career.',
      author: 'Dr. James Rodriguez',
      date: 'October 15, 2024',
      category: 'Skills',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '8 min read',
      featured: false
    },
    {
      id: 5,
      title: 'Lifelong Learning: Education Beyond Graduation',
      excerpt: 'Discover how SIPS supports continuous education for students, professionals, and career transitioners throughout their journey.',
      author: 'Lisa Thompson',
      date: 'October 10, 2024',
      category: 'Lifelong Learning',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '5 min read',
      featured: false
    },
    {
      id: 6,
      title: 'Innovation in Education: Our Teaching Methods',
      excerpt: 'Get an inside look at the transformative teaching methods that set SIPS apart from traditional educational institutions.',
      author: 'Prof. David Martinez',
      date: 'October 5, 2024',
      category: 'Innovation',
      image: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '6 min read',
      featured: false
    }
  ];

  const categories = ['All', 'Education', 'Alumni', 'Industry', 'Skills', 'Lifelong Learning', 'Innovation'];

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section
        className="relative h-[500px] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(5, 46, 22, 0.9), rgba(16, 185, 129, 0.8)), url(https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-slate-900/50"></div>
        <div className="relative text-center max-w-4xl px-4 z-10">
          <div className="mb-6 inline-block">
            <BookOpen className="mx-auto mb-4 animate-pulse" size={56} />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            BLOG WITH <span className="font-baskerville text-amber-400">SIPS</span>
          </h1>
          <p className="text-2xl text-emerald-50 mb-8 font-light">
            Insights, Stories, and Updates from Our Educational Community
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles, topics, or authors..."
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
            <h3 className="text-xl font-semibold text-gray-900">Explore by Category</h3>
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

        {/* Featured Post */}
        {filteredPosts.find(post => post.featured) && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-amber-500"></div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Article</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-96 lg:h-auto overflow-hidden group">
                  <img
                    src={filteredPosts[0].image}
                    alt={filteredPosts[0].title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      FEATURED
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                      {filteredPosts[0].category}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">{filteredPosts[0].readTime}</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight hover:text-emerald-700 transition-colors cursor-pointer">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 w-12 h-12 rounded-full flex items-center justify-center">
                        <User className="text-emerald-700" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{filteredPosts[0].author}</p>
                        <p className="text-sm text-gray-500">{filteredPosts[0].date}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold group transition-all shadow-md hover:shadow-lg">
                      Read More
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-12 bg-amber-500"></div>
            <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(1).map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-xs font-medium">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-100 w-9 h-9 rounded-full flex items-center justify-center">
                        <User className="text-emerald-700" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.author}</p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                    </div>
                    <button className="text-emerald-700 hover:text-emerald-800 group/btn">
                      <ArrowRight size={22} className="group-hover/btn:translate-x-1 transition-transform" />
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
            Load More Articles
          </button>
        </div>
      </div>
    </div>
  );
}
