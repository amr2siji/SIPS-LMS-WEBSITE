import { Target, Lightbulb, Heart, Award, GraduationCap, BookOpen, Users } from 'lucide-react';

export function About() {
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
            OUR PURPOSE: MISSION, VISION & VALUES
          </h1>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            Learn Our Story
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-emerald-700" size={40} />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To provide world-class education that empowers students with knowledge, skills, and values needed to excel in their professional careers and contribute meaningfully to society. We strive to create an inclusive learning environment that fosters critical thinking, innovation, and lifelong learning.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="text-emerald-700" size={40} />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To be a leading institution recognized globally for academic excellence, innovative teaching methodologies, and producing graduates who are industry-ready and socially responsible leaders. We aim to set new standards in professional education and research.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-emerald-700" size={40} />
              <h2 className="text-2xl font-bold text-gray-900">Our Core Values</h2>
            </div>
            <ul className="text-gray-700 space-y-3">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2 font-bold">•</span>
                <div>
                  <strong>Excellence:</strong> Commitment to the highest standards
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2 font-bold">•</span>
                <div>
                  <strong>Integrity:</strong> Ethical conduct in all endeavors
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2 font-bold">•</span>
                <div>
                  <strong>Community:</strong> Building strong partnerships
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2 font-bold">•</span>
                <div>
                  <strong>Leadership:</strong> Developing future leaders
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Journey</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="text-emerald-700" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2000: Founded</h3>
              <p className="text-gray-600 text-sm">
                Established with a vision to transform professional education
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="text-emerald-700" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2010: First Accreditation</h3>
              <p className="text-gray-600 text-sm">
                Received international accreditation for excellence in education
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="text-emerald-700" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2018: New Campus Wing</h3>
              <p className="text-gray-600 text-sm">
                Expanded facilities to accommodate growing student body
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-emerald-700" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2023: Global Partnerships</h3>
              <p className="text-gray-600 text-sm">
                Established partnerships with leading international universities
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Quality</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-emerald-700 mb-2">World-Class Faculty</h3>
                <p className="text-gray-700">
                  Our faculty members are industry experts and experienced academics who bring real-world knowledge to the classroom.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-emerald-700 mb-2">Cutting-Edge Curriculum</h3>
                <p className="text-gray-700">
                  Programs designed in collaboration with industry leaders to ensure relevance and employability.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-emerald-700 mb-2">Research Excellence</h3>
                <p className="text-gray-700">
                  Active research programs contributing to knowledge advancement in various fields.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Partners</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-emerald-700 mb-2">Industry Collaboration</h3>
                <p className="text-gray-700">
                  Strategic partnerships with leading corporations providing internships and employment opportunities.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-emerald-700 mb-2">International Universities</h3>
                <p className="text-gray-700">
                  Exchange programs and joint degrees with prestigious universities worldwide.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-emerald-700 mb-2">Accreditation Bodies</h3>
                <p className="text-gray-700">
                  Recognized by major national and international accreditation organizations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
