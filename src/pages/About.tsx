import { Users } from 'lucide-react';
import { useState } from 'react';

export function About() {
  const teamMembers = [
    {
      name: "Charunadi Ratnayake",
      title: "Director / Lecturer",
      qualifications: "PhD (Reading, UOC) | MSc (USJP) | BBM (UWU) | CIMA (Reading) | PGD (OTHM L7 - SML)",
      bio: "Charunadi Ratnayake is an academic and management professional with expertise in business management, entrepreneurship, and leadership. She has extensive experience in higher education, having served in academic and administrative roles that contribute to institutional development and academic excellence.\n\nHer research focuses on corporate entrepreneurship, sustainable leadership, and work–family initiatives, with several publications and conference presentations in related areas. Currently pursuing doctoral studies, she is dedicated to advancing knowledge that bridges theory and practice in organizational and entrepreneurial contexts.\n\nCharunadi is committed to fostering innovation, leadership, and sustainable growth through her teaching, research, and professional engagement within the academic community.",
      imageBase: "/team/charunadi"
    },
    {
      name: "Duranga Senanayake",
      title: "Director / Lecturer",
      qualifications: "PhD (Reading, AUS) | MSc (UOP) | BSc. (UWU)",
      bio: "A dedicated academic professional with over 5 years of experience in higher education and a solid industrial background in Mechatronics, Robotics, and applied engineering technologies.",
      imageBase: "/team/duranga"
    },
    // {
    //   name: "Pabasara Amarawardena",
    //   title: "Director",
    //   qualifications: "MBA, BSc (Hons) in Chemistry",
    //   bio: "A passionate and dedicated professional with over 10 years of experience in academic administration, contributing at both strategic and operational levels within the higher education sector. Demonstrated success in leading and supporting reputed higher education institutions, driving institutional excellence through strategic leadership, process improvement, and operational efficiency.",
    //   imageBase: "/team/pabasara"
    // },
    {
      name: "Ruwin Ratnayake",
      title: "Lecturer / Consultant",
      qualifications: "BSc (Hons) in IT, Cyber Security",
      bio: "An experienced DevSecOps Engineer and a graduate of the Sri Lanka Institute of Information Technology, specializing in Cyber Security. Recognized for a strong work ethic, problem-solving mindset, and a determined, never-give-up attitude toward achieving excellence in both technical and collaborative environments.",
      imageBase: "/team/ruwin"
    },
    {
      name: "Tharushi Nimanthika",
      title: "Lecturer / Consultant",
      qualifications: "MBA, MBCS Information Technology",
      bio: "Possesses extensive experience in academic administration since 2019, demonstrating consistent commitment to academic quality, institutional excellence, and continuous professional growth within the higher education sector.",
      imageBase: "/team/tharushi"
    },
    {
      name: "A. A. Idroos",
      title: "Lecturer / Consultant",
      qualifications: "MBA in Tourism (Reading) | Bachelor's in Hospitality, Tourism and Events Management",
      bio: "A.A. Idroos is an experienced academic and consultant in Tourism, Events, Hospitality, and Business Management with over eight years of teaching and industry experience. He has served as a visiting lecturer and programme coordinator across leading higher education institutions, specialising in tourism planning, event management, and strategic hospitality operations.\n\nHe holds a Bachelor's degree in Hospitality, Tourism and Events Management and is completing a Master of Business Administration in Tourism. His professional background includes consultancy in tourism development and sustainable destination planning.\n\nA committed educator and researcher, Idroos has published on topics such as eco-tourism, service quality, and post-pandemic tourism recovery, contributing to the advancement of sustainable practices in the tourism and hospitality industry.",
      imageBase: "/team/ali"
    },
    {
      name: "Pethmi Omalka De Silva",
      title: "Lecturer in Accounting and Finance",
      qualifications: "Reading PhD (PIM) | MSc. (UoL-UK) | MBA (Napier-UK) | BSc. in Accounting (1st Class)-USJP | ACA (CASL) | ACCA (UK) | ACMA (SL) | MAAT (AATSL) | PG dip in Banking (IBSL) | CBF/DBF (IBSL) | CTHE-UWU",
      bio: "",
      imageBase: "/team/pethmi"
    },


  ];

  // Component to handle image with multiple format fallbacks
  const TeamMemberImage = ({ imageBase, name }: { imageBase: string; name: string }) => {
    const [imageExtensions] = useState(['.jpeg', '.jpg', '.png', '.svg']);
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0);

    const handleImageError = () => {
      if (currentExtensionIndex < imageExtensions.length - 1) {
        setCurrentExtensionIndex(currentExtensionIndex + 1);
      }
    };

    const currentImageSrc = currentExtensionIndex < imageExtensions.length
      ? imageBase + imageExtensions[currentExtensionIndex]
      : 'https://via.placeholder.com/256x256/10b981/ffffff?text=' + name.split(' ').map(n => n[0]).join('');

    return (
      <img
        src={currentImageSrc}
        alt={name}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    );
  };

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

      {/* Leadership Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="text-emerald-700" size={48} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet the exceptional individuals who drive our institution's vision and commitment to educational excellence.
          </p>
        </div>

        {/* Leadership Members (Charunadi, Duranga, Pabasara) */}
        <div className="space-y-12 mb-24">
          {teamMembers.slice(0, 2).map((member, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in-up animation-delay-${(index + 1) * 100} hover:-translate-y-2 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex flex-col md:flex`}
            >
              {/* Image Section */}
              <div className="md:w-1/3 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center p-8">
                <div className="w-64 h-64 rounded-full overflow-hidden border-8 border-white shadow-lg">
                  <TeamMemberImage imageBase={member.imageBase} name={member.name} />
                </div>
              </div>

              {/* Content Section */}
              <div className="md:w-2/3 p-8 md:p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-xl text-emerald-700 font-semibold mb-3">{member.title}</p>
                <p className="text-sm text-gray-600 font-medium mb-4 italic">{member.qualifications}</p>
                <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-amber-500 mb-6"></div>
                <p className="text-gray-700 leading-relaxed text-justify">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Academic Team Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="text-amber-600" size={48} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Academic Team</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet the professionals dedicated towards academic excellence and industry oriented program delivery.
          </p>
        </div>

        {/* Academic Team Members (From Ruwin onwards) */}
        <div className="space-y-12">
          {teamMembers.slice(2).map((member, index) => (
            <div
              key={index + 3}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in-up animation-delay-${(index + 4) * 100} hover:-translate-y-2 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex flex-col md:flex`}
            >
              {/* Image Section */}
              <div className="md:w-1/3 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center p-8">
                <div className="w-64 h-64 rounded-full overflow-hidden border-8 border-white shadow-lg">
                  <TeamMemberImage imageBase={member.imageBase} name={member.name} />
                </div>
              </div>

              {/* Content Section */}
              <div className="md:w-2/3 p-8 md:p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-xl text-amber-600 font-semibold mb-3">{member.title}</p>
                <p className="text-sm text-gray-600 font-medium mb-4 italic">{member.qualifications}</p>
                <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-emerald-500 mb-6"></div>
                <p className="text-gray-700 leading-relaxed text-justify">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-2xl p-12 text-center text-white animate-fade-in-up hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold mb-4">Be a part of SIPS Community</h2>
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
