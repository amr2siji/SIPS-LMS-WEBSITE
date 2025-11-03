import { Users } from 'lucide-react';

export function About() {
  const teamMembers = [
    {
      name: "Charunadi Ratnayake",
      title: "Director / Lecturer",
      qualifications: "PhD (Reading, UOC) | MSc (USJP) | BBM (UWU) | CIMA (Reading) | PGD (OTHM L7 - SML)",
      bio: "An accomplished academic and administrator with over 6 years of experience in the higher education sector, having served at Uva Wellassa University, Metropolitan College, Lyceum Campus, and Aquinas College of Higher Studies (as Head of Faculty). Currently contributes to academia as a visiting lecturer across multiple universities and higher education institutions.",
      image: "/team/charunadi.jpg" // Placeholder - you'll add the actual image
    },
    {
      name: "Duranga Senanayake",
      title: "Director / Lecturer",
      qualifications: "PhD (Reading, AUS) | MSc (UOP) | BSc. (UWU)",
      bio: "A dedicated academic professional with over 5 years of experience in higher education and a solid industrial background in Mechatronics, Robotics, and applied engineering technologies.",
      image: "/team/duranga.jpg" // Placeholder - you'll add the actual image
    },
    {
      name: "Pabasara Amarawardena",
      title: "Director",
      qualifications: "MBA, BSc (Hons) in Chemistry",
      bio: "A passionate and dedicated professional with over 10 years of experience in academic administration, contributing at both strategic and operational levels within the higher education sector. Demonstrated success in leading and supporting reputed higher education institutions, driving institutional excellence through strategic leadership, process improvement, and operational efficiency.",
      image: "/team/pabasara.jpg" // Placeholder - you'll add the actual image
    },
    {
      name: "Ruwin Ratnayake",
      title: "Academic Consultant",
      qualifications: "BSc (Hons) in IT, Cyber Security",
      bio: "An experienced DevSecOps Engineer and a graduate of the Sri Lanka Institute of Information Technology, specializing in Cyber Security. Recognized for a strong work ethic, problem-solving mindset, and a determined, never-give-up attitude toward achieving excellence in both technical and collaborative environments.",
      image: "/team/ruwin.jpg" // Placeholder - you'll add the actual image
    },
    {
      name: "Tharushi Nimanthika",
      title: "Academic Consultant",
      qualifications: "MBA, MBCS Information Technology",
      bio: "Possesses extensive experience in academic administration since 2019, demonstrating consistent commitment to academic quality, institutional excellence, and continuous professional growth within the higher education sector.",
      image: "/team/tharushi.jpg" // Placeholder - you'll add the actual image
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
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
            MEET OUR TEAM
          </h1>
          <p className="text-xl text-emerald-100">
            Dedicated professionals committed to academic excellence
          </p>
        </div>
      </section>

      {/* Team Members Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="text-emerald-700" size={48} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet the exceptional individuals who drive our institution's vision and commitment to educational excellence.
          </p>
        </div>

        <div className="space-y-12">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex flex-col md:flex`}
            >
              {/* Image Section */}
              <div className="md:w-1/3 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center p-8">
                <div className="w-64 h-64 rounded-full overflow-hidden border-8 border-white shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image not found
                      e.currentTarget.src = 'https://via.placeholder.com/256x256/10b981/ffffff?text=' + member.name.split(' ').map(n => n[0]).join('');
                    }}
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="md:w-2/3 p-8 md:p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-xl text-emerald-700 font-semibold mb-3">{member.title}</p>
                <p className="text-sm text-gray-600 font-medium mb-4 italic">{member.qualifications}</p>
                <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-amber-500 mb-6"></div>
                <p className="text-gray-700 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Academic Community</h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Experience world-class education guided by industry experts and dedicated professionals committed to your success.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => window.location.href = '/register'}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Register Online
            </button>
            <button
              onClick={() => window.location.href = '/programmes'}
              className="bg-white hover:bg-gray-100 text-emerald-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              View Programmes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
