import { Users, Building2, Heart, Calendar } from 'lucide-react';

export function StudentLife() {
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
            CAMPUS VIBES: LIFE & EVENTS<br />AT THE SIPS
          </h1>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            JOIN THE FUN
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">STUDENT LIFE</h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
              ].map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Student life ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="text-emerald-700" size={32} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Clubs & Organizations</h3>
                <p className="text-gray-600 text-sm">Breakthrough of Students</p>
              </div>

              <div className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building2 className="text-emerald-700" size={32} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Campus Facilities</h3>
                <p className="text-gray-600 text-sm">Get a mess fill leave & lovely room</p>
              </div>

              <div className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="text-emerald-700" size={32} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Health & Wellness</h3>
                <p className="text-gray-600 text-sm">Readness, all taking a special</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">UPCOMING EVENTS</h2>

            <div className="bg-emerald-50 rounded-lg p-6 mb-12">
              <div className="space-y-4">
                {[
                  { date: 'Oct 20', title: 'Annual Fest', icon: Calendar },
                  { date: 'Oct 26', title: 'Annual Fest', icon: Calendar },
                  { date: 'Nov 5', title: 'Workshop', icon: Calendar },
                  { date: 'Nov 12', title: 'Career Fair', icon: Calendar },
                  { date: 'Nov 18', title: 'Next Career Fair', icon: Calendar },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <event.icon className="text-emerald-700" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{event.date}</p>
                        <p className="font-semibold text-gray-900">{event.title}</p>
                      </div>
                    </div>
                    <button className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-100 p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Connected!</h3>
              <div className="flex justify-center gap-4">
                <button className="bg-white hover:bg-gray-100 p-3 rounded-full transition-colors">
                  <Users size={24} className="text-emerald-700" />
                </button>
                <button className="bg-white hover:bg-gray-100 p-3 rounded-full transition-colors">
                  <Users size={24} className="text-emerald-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Value Additions</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-emerald-700" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Industry Mentorship</h3>
              <p className="text-gray-700">
                Connect with industry professionals who guide you throughout your academic journey and career planning.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-emerald-700" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Internship Opportunities</h3>
              <p className="text-gray-700">
                Gain practical experience through our extensive network of partner organizations and companies.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-emerald-700" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Skill Development</h3>
              <p className="text-gray-700">
                Access to workshops, seminars, and training programs to enhance both technical and soft skills.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
