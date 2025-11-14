import { Link } from 'react-router-dom';
import { Award, Users, BookOpen, GraduationCap, Target, Heart, Lightbulb } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen">
      <section
        className="relative pb-8 md:pb-64 pt-32 flex flex-col items-center justify-center text-white animate-fade-in"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center max-w-4xl px-4 animate-slide-up mb-8 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in-delay-1">
            WE ARE DESIGNED TO EMPOWER THE<br />NEXT GENERATION OF LEADERS
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-delay-2">
            Learn Today. Lead Tomorrow
          </p>
          <Link
            to="/programmes"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 animate-fade-in-delay-3"
          >
            Explore Programmes
          </Link>
        </div>

        {/* Feature Cards on Hero Image */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative md:absolute md:bottom-[-120px] left-0 right-0 z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-3 md:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-emerald-200 animate-fade-in-up animation-delay-100">
              <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-lg">
                <Award className="text-white w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1 md:mb-2 text-base md:text-lg">Transformative Education</h4>
              <p className="text-gray-700 text-xs md:text-sm font-medium">Skill-based & Student-Centric teaching style</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-3 md:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-emerald-200 animate-fade-in-up animation-delay-200">
              <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-lg">
                <GraduationCap className="text-white w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1 md:mb-2 text-base md:text-lg">Flexible Learning</h4>
              <p className="text-gray-700 text-xs md:text-sm font-medium">Blended model</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-3 md:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-emerald-200 animate-fade-in-up animation-delay-300">
              <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-lg">
                <Users className="text-white w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1 md:mb-2 text-base md:text-lg">Industry Experts</h4>
              <p className="text-gray-700 text-xs md:text-sm font-medium">Learn from the best in the industry</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-3 md:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-emerald-200 animate-fade-in-up animation-delay-400">
              <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-lg">
                <BookOpen className="text-white w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1 md:mb-2 text-base md:text-lg">Life Long Learning</h4>
              <p className="text-gray-700 text-xs md:text-sm font-medium">Learning never stops. Education for Students, Professionals and Career transitioners</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white mt-0 md:mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About SIPS </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>

          <div className="space-y-8">
            {/* First Row: Vision and Mission */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-emerald-50 p-8 rounded-lg animate-fade-in-up animation-delay-100 hover:scale-105 transition-transform duration-300">
                <Lightbulb className="text-emerald-700 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed text-justify">
                  To be the most trusted center of excellence for Next-Generation Education in Sri Lanka.
                </p>
              </div>

              <div className="bg-emerald-50 p-8 rounded-lg animate-fade-in-up animation-delay-200 hover:scale-105 transition-transform duration-300">
                <Target className="text-emerald-700 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed text-justify">
                  To empower students with transformative education that integrates innovation, sustainability, and skill-based learning, fostering intellectual growth and global readiness. We are committed to delivering quality learning experiences, nurturing future leaders, and contributing to the sustainable development of Sri Lanka and beyond.
                </p>
              </div>
            </div>

            {/* Second Row: Core Values */}
            <div className="bg-emerald-50 p-8 rounded-lg animate-fade-in-up animation-delay-300 hover:scale-105 transition-transform duration-300">
              <Heart className="text-emerald-700 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Core Values</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-justify"><strong>Empowerment -</strong> Commitment to giving students the tools, knowledge, and confidence to take charge of their own learning and career paths</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-justify"><strong>Entrepreneurial -</strong> Fostering an entrepreneurial mindset among students, encouraging innovation, creativity, & problem-solving</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-justify"><strong>Excellence -</strong> Dedication to high standards in education, training, and personal development</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Academic Quality</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our commitment to excellence is reflected in our accreditations, experienced faculty, and industry partnerships.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in-up animation-delay-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <Award className="text-emerald-700 mb-4" size={40} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accreditations</h3>
              <p className="text-gray-700 text-justify">
                Internationally recognized programs accredited by leading educational bodies, ensuring the highest standards of education.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in-up animation-delay-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <Users className="text-emerald-700 mb-4" size={40} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Faculty</h3>
              <p className="text-gray-700 text-justify">
                Learn from industry professionals and experienced academics who bring real-world insights to the classroom.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in-up animation-delay-300 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <BookOpen className="text-emerald-700 mb-4" size={40} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Partners</h3>
              <p className="text-gray-700 text-justify">
                Strong partnerships with leading corporations and institutions worldwide, providing students with excellent opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
