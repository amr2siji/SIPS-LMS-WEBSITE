import { Calendar, User, BookOpen, ArrowRight } from 'lucide-react';

export function StudentLife() {
  const blogPosts = [
    {
      id: 1,
      title: 'The Future of Education: Embracing Blended Learning',
      excerpt: 'Discover how our blended learning model combines the best of online and in-person education to create a flexible, engaging learning experience.',
      author: 'Dr. Sarah Johnson',
      date: 'October 28, 2024',
      category: 'Education',
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Success Stories: Alumni Making an Impact',
      excerpt: 'Meet our graduates who are transforming industries and making a difference in their communities through the skills they learned at SIPS.',
      author: 'Michael Chen',
      date: 'October 25, 2024',
      category: 'Alumni',
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'Industry Partnerships: Learning from the Best',
      excerpt: 'Explore our collaborations with leading industry experts who bring real-world experience directly to our classrooms.',
      author: 'Prof. Amanda Williams',
      date: 'October 20, 2024',
      category: 'Industry',
      image: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'Skill-Based Learning: Preparing for Tomorrow',
      excerpt: 'Learn about our student-centric approach that focuses on practical skills and hands-on experience to prepare you for your career.',
      author: 'Dr. James Rodriguez',
      date: 'October 15, 2024',
      category: 'Skills',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '8 min read'
    },
    {
      id: 5,
      title: 'Lifelong Learning: Education Beyond Graduation',
      excerpt: 'Discover how SIPS supports continuous education for students, professionals, and career transitioners throughout their journey.',
      author: 'Lisa Thompson',
      date: 'October 10, 2024',
      category: 'Lifelong Learning',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '5 min read'
    },
    {
      id: 6,
      title: 'Innovation in Education: Our Teaching Methods',
      excerpt: 'Get an inside look at the transformative teaching methods that set SIPS apart from traditional educational institutions.',
      author: 'Prof. David Martinez',
      date: 'October 5, 2024',
      category: 'Innovation',
      image: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: '6 min read'
    }
  ];

  const categories = ['All', 'Education', 'Alumni', 'Industry', 'Skills', 'Lifelong Learning', 'Innovation'];

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            BLOG WITH <span className="font-baskerville">SIPS</span>
          </h1>
          <p className="text-xl text-gray-200 mb-6">
            Insights, Stories, and Updates from Our Community
          </p>
        </div>
      </section>

      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="px-6 py-2 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-full border border-gray-300 hover:border-emerald-500 transition-all font-medium"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <img
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                className="w-full h-full object-cover"
              />
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-semibold">
                    {blogPosts[0].category}
                  </span>
                  <span className="text-gray-500 text-sm">{blogPosts[0].readTime}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center">
                      <User className="text-emerald-700" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{blogPosts[0].author}</p>
                      <p className="text-sm text-gray-500">{blogPosts[0].date}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold group">
                    Read More
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.slice(1).map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-xs">{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-emerald-700 transition-colors cursor-pointer">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center">
                      <User className="text-emerald-700" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-500">{post.date}</p>
                    </div>
                  </div>
                  <button className="text-emerald-700 hover:text-emerald-800 group">
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Load More Articles
          </button>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="text-white mx-auto mb-4" size={48} />
          <h2 className="text-4xl font-bold text-white mb-4">Stay Updated with <span className="font-baskerville">SIPS</span></h2>
          <p className="text-xl text-emerald-100 mb-8">
            Subscribe to our newsletter for the latest insights, stories, and updates from our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
              Subscribe Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
