import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Award, ArrowLeft, Users, Clock } from 'lucide-react';
import { SEO } from '../components/SEO';

interface Program {
  id: number;
  name: string;
  modules: string[];
  duration: string;
  eligibility: string;
  level: string;
  description?: string;
  learnMoreUrl?: string;
  detailedDescription?: string;
  benefits?: string[];
  targetAudience?: string[];
  certificationInfo?: string;
  logoUrl?: string;
}

export function ProgrammeDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [program, setProgram] = useState<Program | null>(null);
  const [activeTab, setActiveTab] = useState<'sips' | 'ibm' | 'certiport'>('ibm');

  useEffect(() => {
    // Get program data from navigation state
    if (location.state && location.state.program) {
      setProgram(location.state.program);
      setActiveTab(location.state.activeTab || 'ibm');
    } else {
      // If no state, redirect back to programmes
      navigate('/programmes');
    }
  }, [location, navigate]);

  if (!program) {
    return null;
  }

  const handleBack = () => {
    navigate('/programmes', { state: { activeTab } });
  };

  const handleApplyNow = () => {
    navigate('/apply');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={`${program.name} - SIPS Programme Details`}
        description={program.description || `Learn more about ${program.name} at SIPS`}
        keywords={`${program.name}, SIPS courses, ${activeTab === 'ibm' ? 'IBM certification' : activeTab === 'certiport' ? 'Certiport certification' : 'SIPS programme'}`}
        canonical={`https://www.sips.edu.lk/programmes/${program.id}`}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Programmes</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                {activeTab === 'ibm' && (
                  <img src="/partners/IBM logo..jpeg" alt="IBM" className="h-10 w-auto" />
                )}
                {activeTab === 'certiport' && (
                  <img src="/partners/Certiport logo.svg" alt="Certiport" className="h-10 w-auto" />
                )}
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {activeTab === 'ibm' ? 'IBM Programme' : activeTab === 'certiport' ? 'Certiport Programme' : 'SIPS Programme'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h1>
              {program.description && (
                <p className="text-sm text-gray-600">{program.description}</p>
              )}
            </div>

            {/* Programme Overview */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b flex items-center">
                <BookOpen className="mr-2 text-emerald-600" size={20} />
                Programme Overview
              </h2>
              <div 
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: program.detailedDescription || '' }}
              />
            </div>

            {/* Programme Benefits */}
            {program.benefits && program.benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b flex items-center">
                  <Award className="mr-2 text-emerald-600" size={20} />
                  What You'll Gain
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {program.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start bg-gray-50 p-3 rounded border border-gray-200">
                      <svg className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target Audience */}
            {program.targetAudience && program.targetAudience.length > 0 && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b flex items-center">
                  <Users className="mr-2 text-emerald-600" size={20} />
                  Who Should Enroll?
                </h2>
                <div className="space-y-2">
                  {program.targetAudience.map((audience, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-emerald-600 rounded-full p-1 mr-2 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm">{audience}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {/* Programme Info Card */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b">Programme Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Clock size={18} className="mr-2 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block text-sm">Duration</span>
                      <span className="text-gray-700 text-sm">{program.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users size={18} className="mr-2 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block text-sm">Eligibility</span>
                      <span className="text-gray-700 text-sm">{program.eligibility}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Award size={18} className="mr-2 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block text-sm">Level</span>
                      <span className="text-gray-700 text-sm">{program.level}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Topics Card */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b">Key Topics Covered</h3>
                <ul className="space-y-2">
                  {program.modules.map((module, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="text-emerald-600 mr-2 font-bold">•</span>
                      <span className="text-sm">{module}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleApplyNow}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors shadow"
                >
                  Submit Your Inquiry
                </button>
                
                {program.learnMoreUrl && (
                  <a
                    href={program.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors shadow flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Brochure
                  </a>
                )}
              </div>

              {/* External Link Card */}
              {(activeTab === 'ibm' || activeTab === 'certiport') && (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Learn More</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Visit the official {activeTab === 'ibm' ? 'IBM' : 'Certiport'} website for more information about this programme.
                  </p>
                  <a
                    href={
                      activeTab === 'certiport' 
                        ? 'https://lpec.lk/academic-partners/certiport-certification/'
                        : 'https://www.ibm.com/training'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
                  >
                    {activeTab === 'certiport' ? 'Visit Certiport Site' : 'Visit IBM Website'}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
