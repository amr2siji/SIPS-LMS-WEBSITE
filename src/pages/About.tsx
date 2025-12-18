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
    {
      name: "Jami Perera",
      title: "Visiting Lecturer",
      qualifications: "BBM (Hons)(UWU) | MBA (UoK) | PhD in reading (UoC) | Dip.CIMA (UK) | AAT(SL) | CTHE (UWU)",
      bio: "Jami Perera is a Lecturer (Transitional) in the Faculty of Management at Uva Wellassa University of Sri Lanka, with a growing academic career shaped by teaching, research, and scholarly engagement across the fields of management studies. With several years of experience in both academia and industry, she brings a balanced perspective to her teaching, combining theoretical depth with practical understanding.\n\nShe began her academic journey with a BBM in Entrepreneurship and Management from Uva Wellassa University, graduating with Second Class Honours (Upper Division). She later completed a Master of Business Administration at the University of Kelaniya with a Merit Pass. Currently, she is reading for an MPhil/PhD in Management and Business Studies at the University of Colombo, focusing on social entrepreneurship, an area in which she continues to build strong research expertise.\n\nHer teaching extends beyond Sri Lanka government universities, with experience as a visiting lecturer at the multiple higher education institutions affiliated with international universities. She teaches a range of subjects, including Human Resource Management, Research Methods, Organizational Behaviour, and Entrepreneurship.\n\nJami is an active researcher with publications in indexed journals, international conference proceedings, and edited book volumes. Her research has earned multiple national and international recognitions, including the Emerald Literati Outstanding Paper Award, Best Presenter Awards, multiple UWU Research Awards, and the prestigious Paul R. Lawrence Fellowship 2025 from NACRA, USA.\n\nShe has also secured several competitive research grants, both as Principal Investigator and Co-Investigator, demonstrating a strong commitment to advancing research in entrepreneurship and management. Beyond publishing, she regularly contributes as a reviewer for journals such as Tourism Review (Emerald) and the Journal of Hospitality & Tourism Cases (SAGE), and serves on program committees and academic panels for research conferences.\n\nHer academic service includes curriculum development, module design, postgraduate program coordination, and involvement in major university committees. She has contributed to the development of modules in social innovation, creativity, digital entrepreneurship, and qualitative research, reflecting her interest in future-oriented management education. In addition to university roles, Jami actively contributes to community development through workshops and training programs on entrepreneurship, business planning, personal development, and marketing, conducted in collaboration with government agencies and professional bodies. Her work with the State Ministry of Co-operative Services and the Small and Medium Enterprise Development Authority highlights her commitment to supporting grassroots entrepreneurial growth.",
      imageBase: "/team/jami perera"
    },
    {
      name: "Dr. Dimuthu Senevirathne",
      title: "Academic Consultant",
      qualifications: "PhD (Chemistry, Monash University - Australia)",
      bio: "Dynamic and results-oriented Analytical Chemist with over a decade of diverse experience in industry, academia, and R&D environments. Expertise in advanced analytical instrumentation and method validation/verification drives robust outcomes within ISO 17025 and NATA accreditation frameworks. Recognised for exceptional leadership, effective communication, and strategic problem-solving abilities, alongside a strong commitment to integrity and continuous improvement. Proven track record of collaborating with cross-functional teams across ZONE AOA and Europe to foster innovation and achieve operational excellence in laboratories while ensuring compliance with safety standards and regulatory requirements. Dimuthu completed his PhD in Chemistry from Monash University, Australia and currently holds the responsibility as the Project Lead at Nestlé Quality Assurance Centre, Mulgrave Australia.",
      imageBase: "/team/Dimuthu",
      link: "https://www.researchgate.net/profile/Dimuthu-Senevirathna"
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

      {/* Our Team Members Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="text-emerald-700" size={48} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team Members</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet the exceptional individuals who drive our institution's vision and commitment to educational excellence.
          </p>
        </div>

        {/* All Team Members */}
        <div className="space-y-12">
          {teamMembers.map((member, index) => (
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
                {(member as any).link && (
                  <div className="mt-4">
                    <a
                      href={(member as any).link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View ResearchGate Profile
                    </a>
                  </div>
                )}
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
