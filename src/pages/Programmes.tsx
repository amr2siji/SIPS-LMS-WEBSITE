import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, Search, Users } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  modules: string[];
  duration: string;
  eligibility: string;
  level: string;
}

export function Programmes() {
  const navigate = useNavigate();
  
  const programs: Program[] = [
    {
      id: 1,
      name: "Certificate in Robotics and Arduino Programming",
      modules: [
        "Foundations of Robotics and Electronics",
        "Programming and System Development",
        "Sensor and Control Integration",
        "Communication and Simulation Techniques",
        "Advanced Robotics and Project Application"
      ],
      duration: "3 Months",
      eligibility: "Students over 12 years old",
      level: "Certificate"
    },
    {
      id: 2,
      name: "Professional Certificate in Research Methodology",
      modules: [
        "Introduction to Research and Research Ethics",
        "Developing a Research Problem and Literature Review",
        "Research Design and Sampling Techniques",
        "Data Collection Methods and Tools",
        "Data Analysis and Interpretation",
        "Research Proposal and Report Writing"
      ],
      duration: "3 Months",
      eligibility: "Anyone who passed O/L examination/ foundation Programme",
      level: "Professional Certificate"
    },
    {
      id: 3,
      name: "Foundation in Office IT Skills",
      modules: [
        "Introduction to Computers & Digital Basics",
        "Microsoft Word – Document Creation",
        "Microsoft Excel – Data Handling for Office Use",
        "Microsoft PowerPoint – Presentations Made Simple",
        "Email & Internet Skills",
        "Final Practical Project & Review"
      ],
      duration: "3 Months",
      eligibility: "Any student who sat for O/L's or equivalent examination",
      level: "Foundation"
    },
    {
      id: 4,
      name: "Certificate in Hospitality, Tourism and Events Management",
      modules: [
        "Introduction to Hospitality Management",
        "Introduction to Tourism Management",
        "Introduction to Events Management"
      ],
      duration: "3 Months",
      eligibility: "Any student who sat for O/L's or equivalent examination",
      level: "Certificate"
    }
  ];

  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>(programs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    filterPrograms();
  }, [searchTerm, selectedLevel]);

  const filterPrograms = () => {
    let filtered = programs;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.eligibility.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== 'All') {
      filtered = filtered.filter(p => p.level === selectedLevel);
    }

    setFilteredPrograms(filtered);
  };

  const levels = ['All', 'Certificate', 'Foundation', 'Professional Certificate'];

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Building future-ready professionals through transformative education</h1>
          <p className="text-xl text-gray-200">
            Programs nurturing critical thinkers and change-makers for tomorrow's world
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline mr-2" size={18} />
                Search Programs
              </label>
              <input
                type="text"
                placeholder="Search by program name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="lg:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Degree Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No programs found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                  <BookOpen className="mb-3" size={40} />
                  <h3 className="text-2xl font-bold">{program.name}</h3>
                </div>

                <div className="p-6">
                  {/* Modules/Curriculum */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <BookOpen size={20} className="mr-2 text-emerald-600" />
                      Modules Covered
                    </h4>
                    <ul className="space-y-2">
                      {program.modules.map((module, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <span className="text-emerald-600 mr-2 font-bold">•</span>
                          <span className="text-sm">{module}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Program Details */}
                  <div className="space-y-3 mb-6 border-t pt-4">
                    <div className="flex items-start text-gray-700">
                      <Clock size={18} className="mr-2 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-sm">Duration: </span>
                        <span className="text-sm">{program.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-start text-gray-700">
                      <Users size={18} className="mr-2 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-sm">Eligibility: </span>
                        <span className="text-sm">{program.eligibility}</span>
                      </div>
                    </div>
                    <div className="flex items-start text-gray-700">
                      <Award size={18} className="mr-2 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-sm">Level: </span>
                        <span className="text-sm">{program.level}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/apply')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    Inquire About Our Programmes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
