import { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Program {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: string;
  curriculum: string;
}

export function Programmes() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [searchTerm, selectedLevel, programs]);

  const loadPrograms = async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error loading programs:', error);
    } else {
      setPrograms(data || []);
    }
  };

  const filterPrograms = () => {
    let filtered = programs;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== 'All') {
      filtered = filtered.filter(p => p.level === selectedLevel);
    }

    setFilteredPrograms(filtered);
  };

  const levels = ['All', 'Diploma', 'Bachelor', 'Master', 'Professional Certificate'];

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
            Programs adhering to ancestry credential teaching
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="bg-emerald-100 p-6">
                  <BookOpen className="text-emerald-700 mb-3" size={40} />
                  <h3 className="text-xl font-bold text-gray-900">{program.name}</h3>
                </div>

                <div className="p-6">
                  <p className="text-gray-700 mb-4 line-clamp-3">{program.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Clock size={18} className="mr-2 text-emerald-700" />
                      <span className="text-sm">{program.duration || 'Duration varies'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Award size={18} className="mr-2 text-emerald-700" />
                      <span className="text-sm">{program.level || 'Professional Program'}</span>
                    </div>
                  </div>

                  <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-semibold transition-colors">
                    View Curriculum
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
