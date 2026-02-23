import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Clock, Award, Search, Users } from 'lucide-react';
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

export function Programmes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'sips' | 'ibm' | 'certiport'>('ibm');
  
  // Check if there's a state with activeTab from navigation
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  
  const sipsPrograms: Program[] = [
    {
      id: 1,
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
    }
  ];

  const ibmPrograms: Program[] = [
    {
      id: 101,
      name: "Professional Training in Emerging Technologies",
      modules: [
        "Artificial Intelligence & Machine Learning",
        "Cyber Security",
        "Blockchain"
      ],
      duration: "30 hours - 1 certificate | 105 hours - 3 certificates",
      eligibility: "After O/L, After A/L, Undergraduates, Employed Professionals",
      level: "Certificate of Proficiency",
      description: "Transform Academic Learning into Industry Excellence with future-ready skills through globally recognized courses by IBM, powered by SIPS, delivered virtually.",
      learnMoreUrl: "#",
      detailedDescription: `<div class="space-y-6">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">THE FUTURE STARTS HERE</h3>
          <h4 class="text-xl font-semibold text-green-700 mb-3">Transform Academic Learning into Industry Excellence</h4>
          <p class="text-gray-700 mb-2"><strong>Future-Ready Skills. Globally Recognized Courses by IBM. Powered by SIPS. Delivered Virtually.</strong></p>
          <p class="text-gray-700 mb-4">The future belongs to professionals who can apply knowledge, adapt to change, and work with real technologies.</p>
          <p class="text-gray-700">At Steller Institute of Professional Studies, we enable students to move beyond theory and step confidently into the professional world—through our collaboration with Industry Majors all-round the globe. Our programs are designed to complement university education, equipping students with hands-on skills, industry exposure, and globally recognized credentials—all delivered through a fully virtual learning model.</p>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">Why This Matters Today</h4>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Employers seek skills, not just degrees</li>
            <li>Technologies evolve faster than academic syllabi</li>
            <li>Students must be career-ready from Day One</li>
          </ul>
          <p class="text-gray-700 mt-2">SIPS bridges this gap—strategically, practically, and globally.</p>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-3">Key Highlights</h4>
          <ul class="space-y-2 text-gray-700">
            <li>✓ Industry-aligned Emerging Technology Programs</li>
            <li>✓ Live Virtual Training by IBM Subject Matter Experts</li>
            <li>✓ 100% Online</li>
            <li>✓ Access to IBM Learn LMS and hands-on labs</li>
            <li>✓ Industry-Recognized Globally Accepted Certifications</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">Who Is This For?</h4>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>After O/L, After A/L, Undergraduates</li>
            <li>Students seeking industry exposure beyond university curriculum</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">WHY CHOOSE SIPS?</h4>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Collaboration with Industry Majors like IBM</li>
            <li>Expert-led virtual delivery</li>
            <li>Flexible learning alongside university studies</li>
            <li>Globally recognized credentials</li>
            <li>Affordable access to premium tech education</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">STUDENT OUTCOMES</h4>
          <p class="text-gray-700 mb-2">By the End of the Program, Students Will:</p>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Gain practical exposure to emerging technologies</li>
            <li>Build industry-aligned skill portfolios</li>
            <li>Improve employability and internship readiness</li>
            <li>Earn Industry-aligned Globally Recognized certifications</li>
            <li>Develop confidence to enter the digital workforce</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">Global Recognition, Local Advantage</h4>
          <p class="text-gray-700 mb-2">Industry certifications are globally recognized, allowing students to:</p>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Compete in national and international job markets</li>
            <li>Apply for internships, entry-level roles, and higher studies</li>
            <li>Build credibility across industries and geographies</li>
          </ul>
          <p class="text-gray-700 mt-2">Certifications from globally reputed organizations such as IBM carry strong weight with recruiters worldwide.</p>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">IBM Innovation Centre for Education</h4>
          <p class="text-gray-700 mb-2"><strong>What Is IBM Innovation Centre for Education?</strong></p>
          <p class="text-gray-700 mb-3">The IBM Innovation Centre for Education (IBM ICE) is a global initiative by IBM that focuses on developing industry-ready talent through structured, hands-on learning in emerging technologies.</p>
          
          <p class="text-gray-700 mb-2">IBM ICE programs are created to:</p>
          <ul class="list-disc list-inside space-y-1 text-gray-700 mb-3">
            <li>Address real industry skill gaps</li>
            <li>Prepare students for future job roles</li>
            <li>Blend theory with deep practical exposure</li>
          </ul>

          <p class="text-gray-700 mb-2"><strong>Why IBM ICE Is Different</strong></p>
          <p class="text-gray-700 mb-2">Unlike conventional training programs, IBM ICE emphasizes:</p>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Applied learning</li>
            <li>Industry use cases</li>
            <li>Performance-based assessments</li>
            <li>Continuous curriculum updates</li>
          </ul>
          <p class="text-gray-700 mt-2">This ensures students learn what the industry actually uses, not outdated or generic content.</p>
        </div>
      </div>`,
      benefits: [
        "Industry-aligned Emerging Technology Programs",
        "Live Virtual Training by IBM Subject Matter Experts",
        "100% Online Learning",
        "Access to IBM Learn LMS and hands-on labs",
        "Industry-Recognized Globally Accepted Certifications",
        "Flexible learning alongside university studies"
      ],
      targetAudience: [
        "After O/L students",
        "After A/L students",
        "Undergraduates from any discipline",
        "Students seeking industry exposure beyond university curriculum"
      ],
      certificationInfo: "Students who successfully complete all assignments and assessments with 70% attendance receive an IBM certification recognized globally by employers."
    },
    {
      id: 102,
      name: "Professional Training Certificates",
      modules: [
        "Artificial Intelligence & Machine Learning",
        "Cloud Computing & Virtualization",
        "Cyber Security & Forensics",
        "Data Science",
        "Business Analytics",
        "Blockchain",
        "Internet of Things",
        "Graphics & Gaming"
      ],
      duration: "30 hours - 1 certificate | 105 hours - 3 certificates",
      eligibility: "Undergraduates, Employed Professionals",
      level: "Certificate of Proficiency",
      description: "These programs emphasize technical depth, hands-on labs, and project-based learning. Transform your career with industry-recognized certifications.",
      learnMoreUrl: "#",
      detailedDescription: `<div class="space-y-6">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">THE FUTURE STARTS HERE</h3>
          <h4 class="text-xl font-semibold text-green-700 mb-3">Transform Academic Learning into Industry Excellence</h4>
          <p class="text-gray-700 mb-2"><strong>Future-Ready Skills. Globally Recognized Courses by IBM. Powered by SIPS. Delivered Virtually.</strong></p>
          <p class="text-gray-700 mb-4">The future belongs to professionals who can apply knowledge, adapt to change, and work with real technologies.</p>
          <p class="text-gray-700">At Steller Institute of Professional Studies, we enable students to move beyond theory and step confidently into the professional world—through our collaboration with Industry Majors all-round the globe. Our programs are designed to complement university education, equipping students with hands-on skills, industry exposure, and globally recognized credentials—all delivered through a fully virtual learning model.</p>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">Why This Matters Today</h4>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Employers seek skills, not just degrees</li>
            <li>Technologies evolve faster than academic syllabi</li>
            <li>Students must be career-ready from Day One</li>
          </ul>
          <p class="text-gray-700 mt-2">SIPS bridges this gap—strategically, practically, and globally.</p>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-3">Key Highlights</h4>
          <ul class="space-y-2 text-gray-700">
            <li>✓ Industry-aligned Emerging Technology Programs</li>
            <li>✓ Live Virtual Training by IBM Subject Matter Experts</li>
            <li>✓ 100% Online</li>
            <li>✓ Access to IBM Learn LMS and hands-on labs</li>
            <li>✓ Industry-Recognized Globally Accepted Certifications</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">Who Is This For?</h4>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Undergraduates from any discipline</li>
            <li>Employed Professionals seeking upskilling</li>
            <li>Students seeking industry exposure beyond university curriculum</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">WHY CHOOSE SIPS?</h4>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Collaboration with Industry Majors like IBM</li>
            <li>Expert-led virtual delivery</li>
            <li>Flexible learning alongside university studies</li>
            <li>Globally recognized credentials</li>
            <li>Affordable access to premium tech education</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">STUDENT OUTCOMES</h4>
          <p class="text-gray-700 mb-2">By the End of the Program, Students Will:</p>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Gain practical exposure to emerging technologies</li>
            <li>Build industry-aligned skill portfolios</li>
            <li>Improve employability and internship readiness</li>
            <li>Earn Industry-aligned Globally Recognized certifications</li>
            <li>Develop confidence to enter the digital workforce</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">Global Recognition, Local Advantage</h4>
          <p class="text-gray-700 mb-2">Industry certifications are globally recognized, allowing students to:</p>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Compete in national and international job markets</li>
            <li>Apply for internships, entry-level roles, and higher studies</li>
            <li>Build credibility across industries and geographies</li>
          </ul>
          <p class="text-gray-700 mt-2">Certifications from globally reputed organizations such as IBM carry strong weight with recruiters worldwide.</p>
        </div>

        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">IBM Innovation Centre for Education</h4>
          <p class="text-gray-700 mb-2"><strong>What Is IBM Innovation Centre for Education?</strong></p>
          <p class="text-gray-700 mb-3">The IBM Innovation Centre for Education (IBM ICE) is a global initiative by IBM that focuses on developing industry-ready talent through structured, hands-on learning in emerging technologies.</p>
          
          <p class="text-gray-700 mb-2">IBM ICE programs are created to:</p>
          <ul class="list-disc list-inside space-y-1 text-gray-700 mb-3">
            <li>Address real industry skill gaps</li>
            <li>Prepare students for future job roles</li>
            <li>Blend theory with deep practical exposure</li>
          </ul>

          <p class="text-gray-700 mb-2"><strong>Why IBM ICE Is Different</strong></p>
          <p class="text-gray-700 mb-2">Unlike conventional training programs, IBM ICE emphasizes:</p>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Applied learning</li>
            <li>Industry use cases</li>
            <li>Performance-based assessments</li>
            <li>Continuous curriculum updates</li>
          </ul>
          <p class="text-gray-700 mt-2">This ensures students learn what the industry actually uses, not outdated or generic content.</p>
        </div>
      </div>`,
      benefits: [
        "Technical depth with hands-on labs",
        "Project-based learning approach",
        "Live Virtual Training by IBM Subject Matter Experts",
        "100% Online Learning",
        "Access to IBM Learn LMS and hands-on labs",
        "Industry-Recognized Globally Accepted Certifications"
      ],
      targetAudience: [
        "Undergraduates from Computer Science and Non-Computer Science backgrounds",
        "Employed Professionals seeking career advancement",
        "Final-year students preparing for placements",
        "Professionals in career transition"
      ],
      certificationInfo: "Students who successfully complete all assignments and assessments with 70% attendance receive an IBM certification recognized globally by employers."
    }
  ];

  const certiportPrograms: Program[] = [
    {
      id: 201,
      name: "IC3 Digital Literacy Certification",
      modules: [
        "Computing Fundamentals",
        "Key Applications",
        "Living Online"
      ],
      duration: "Self-Paced",
      eligibility: "Students, Educators, and Working Professionals",
      level: "Stackable Credential - Beginner to Advanced",
      description: "IC3 Digital Literacy Certification validates your proficiency across essential digital domains",
      learnMoreUrl: "/cources/IC3 Certiport Overview Datasheet Online Version 0923.pdf",
      logoUrl: "/cources/IC3 course.jpeg",
      detailedDescription: `<div class="space-y-6">
        <div class="flex justify-center mb-6">
          <img src="/cources/IC3 course.jpeg" alt="IC3 Digital Literacy" class="w-full max-w-3xl h-auto rounded-lg shadow-lg border border-gray-200" />
        </div>
        
        <!-- What is IC3 Section -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 class="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            What is IC3 Digital Literacy?
          </h3>
          <div class="space-y-3">
            <p class="text-gray-700 text-sm leading-relaxed">
              <strong class="text-emerald-600">IC3 Digital Literacy Certification</strong> is a stackable credential that validates each learner's level of proficiency, whether <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">beginner</span>, <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">intermediate</span>, or <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">advanced</span>.
            </p>
            <p class="text-gray-700 text-sm leading-relaxed">
              It measures against <span class="font-semibold text-gray-900">seven major domains</span> that are essential to success and aligns to multiple international standards to ensure it is the most comprehensive solution available.
            </p>
            <div class="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded mt-4">
              <p class="text-gray-700 text-sm">
                The newest version, <strong class="text-emerald-700">Global Standard Six</strong>, focuses on competency; allowing students to enter at the appropriate skill level and exit with mastery.
              </p>
            </div>
          </div>
        </div>

        <!-- Digital Literacy Domains Table -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            Digital Literacy Domains & Skill Levels
          </h4>
          
          <!-- Level Legend -->
          <div class="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <div class="flex items-center">
              <span class="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-semibold mr-2">Level 1</span>
              <span class="text-gray-600 text-xs">Beginner</span>
            </div>
            <div class="flex items-center">
              <span class="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-semibold mr-2">Level 2</span>
              <span class="text-gray-600 text-xs">Intermediate</span>
            </div>
            <div class="flex items-center">
              <span class="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-semibold mr-2">Level 3</span>
              <span class="text-gray-600 text-xs">Advanced</span>
            </div>
          </div>
          
          <div class="overflow-x-auto rounded border border-gray-200">
            <table class="w-full bg-white">
              <thead class="bg-emerald-600 text-white">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-sm">Domain</th>
                  <th class="px-4 py-3 text-left font-semibold text-sm">Competency</th>
                  <th class="px-3 py-3 text-center font-semibold text-sm w-20">L1</th>
                  <th class="px-3 py-3 text-center font-semibold text-sm w-20">L2</th>
                  <th class="px-3 py-3 text-center font-semibold text-sm w-20">L3</th>
                </tr>
              </thead>
              <tbody class="text-gray-700 text-sm">
                <!-- Technology Basics -->
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 font-semibold text-gray-900 bg-gray-50" rowspan="3">Technology Basics</td>
                  <td class="px-4 py-3">Explain fundamental software concepts</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Customize digital environments</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Identify, troubleshoot, and resolve technical problems with assistance</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                </tr>
                
                <!-- Digital Citizenship -->
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 font-semibold text-gray-900 bg-gray-50" rowspan="3">Digital Citizenship</td>
                  <td class="px-4 py-3">Cultivate, manage, and protect your digital reputation</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Apply digital etiquette standards</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Explain best practices for digital citizenship</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                </tr>
                
                <!-- Information Management -->
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 font-semibold text-gray-900 bg-gray-50" rowspan="3">Information Management</td>
                  <td class="px-4 py-3">Use and refine criteria for online searches</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Manage online data collection, storage, and retrieval</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Evaluate digital information sources and multiple search results</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                </tr>
                
                <!-- Content Creation -->
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 font-semibold text-gray-900 bg-gray-50" rowspan="3">Content Creation</td>
                  <td class="px-4 py-3">Create basic digital content</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Responsibly repurpose digital resources</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Create, edit, and publish or present original digital media content for a specific audience</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                </tr>
                
                <!-- Communication -->
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 font-semibold text-gray-900 bg-gray-50" rowspan="3">Communication</td>
                  <td class="px-4 py-3">Express yourself through digital means</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Interact with others in a digital environment</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Customize the message and medium for a specific audience</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                </tr>
                
                <!-- Collaboration -->
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 font-semibold text-gray-900 bg-gray-50" rowspan="3">Collaboration</td>
                  <td class="px-4 py-3">Identify digital etiquette standards for collaborative processes</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Use digital tools and technologies to collaborate on the creation of content</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Use collaboration tools to work with others to examine issues and problems from multiple viewpoints</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                </tr>
                
                <!-- Safety and Security -->
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 font-semibold text-gray-900 bg-gray-50" rowspan="3">Safety and Security</td>
                  <td class="px-4 py-3">Identify threats and security measures in a digital environment</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3">Avoid mental health threats while using digital technologies (Catfishing, FOMO, etc.)</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                </tr>
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3">Manage device security (encryption, biometric passwords, viruses)</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center text-gray-300">—</td>
                  <td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center bg-emerald-600 text-white rounded w-6 h-6 text-xs font-bold">✓</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`,
      benefits: [
        "Stackable credential from beginner to advanced levels",
        "Globally recognized digital literacy certification",
        "Aligned with multiple international standards",
        "Comprehensive coverage of 7 essential domains",
        "Self-paced learning for flexible study"
      ],
      targetAudience: [
        "Students building foundational digital skills",
        "Educators seeking to validate digital competency",
        "Working professionals entering digital roles",
        "Anyone seeking internationally recognized digital literacy"
      ]
    },
    {
      id: 202,
      name: "Microsoft Office Specialist (MOS)",
      modules: [
        "Word Associate",
        "Excel Associate",
        "PowerPoint Associate",
        "Outlook Associate",
        "Word Expert",
        "Excel Expert",
        "Access Expert"
      ],
      duration: "Self-Paced",
      eligibility: "Students, Educators, and Working Professionals",
      level: "Industry Certification",
      description: "Microsoft Office Specialist certification validates your expertise in Microsoft Office applications",
      learnMoreUrl: "/cources/Microsoft office specialist Datasheet - DIGITAL.pdf",
      logoUrl: "/cources/Microsoft Office Specializations.jpeg",
      detailedDescription: `<div class="space-y-6">
        <div class="flex justify-center mb-6">
          <img src="/cources/Microsoft Office Specializations.jpeg" alt="Microsoft Office Specialist" class="w-full max-w-3xl h-auto rounded-lg shadow-lg border border-gray-200" />
        </div>
        
        <!-- About Section -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 class="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            About Microsoft Office Specialist (MOS)
          </h3>
          <div class="space-y-3">
            <p class="text-gray-700 text-sm leading-relaxed">
              <strong class="text-[#D04423]">Microsoft Office Specialist (MOS)</strong> is the only endorsed certification by Microsoft that validates skills in Microsoft Office applications, including Word, Excel, PowerPoint, and Outlook.
            </p>
            <p class="text-gray-700 text-sm leading-relaxed">
              Certifications are available for <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">Microsoft Office 365 Apps</span>, <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">Microsoft Office 2019</span>, and <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">Microsoft Office 2016</span>.
            </p>
            <div class="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded mt-4">
              <p class="text-gray-700 text-sm">
                Candidates who take and pass MOS certification are empowered to stand out in the competitive job market, while simplifying daily tasks and fostering career growth.
              </p>
            </div>
          </div>
        </div>

        <!-- Certification Levels Section -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            Certification Levels
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Associate Level Card -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h5 class="text-base font-semibold text-gray-900 mb-2">Associate Level</h5>
              <p class="text-gray-600 text-xs mb-3 italic">Foundational skills for everyday Office tasks</p>
              <ul class="space-y-2">
                <li class="flex items-center">
                  <span class="bg-emerald-600 text-white rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold">✓</span>
                  <span class="text-gray-700 text-sm">Word Associate</span>
                </li>
                <li class="flex items-center">
                  <span class="bg-emerald-600 text-white rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold">✓</span>
                  <span class="text-gray-700 text-sm">Excel Associate</span>
                </li>
                <li class="flex items-center">
                  <span class="bg-emerald-600 text-white rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold">✓</span>
                  <span class="text-gray-700 text-sm">PowerPoint Associate</span>
                </li>
                <li class="flex items-center">
                  <span class="bg-emerald-600 text-white rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold">✓</span>
                  <span class="text-gray-700 text-sm">Outlook Associate</span>
                </li>
              </ul>
            </div>
            
            <!-- Expert Level Card -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h5 class="text-base font-semibold text-gray-900 mb-2">Expert Level</h5>
              <p class="text-gray-600 text-xs mb-3 italic">Advanced skills for complex professional tasks</p>
              <ul class="space-y-2">
                <li class="flex items-center">
                  <span class="bg-[#D04423] text-white rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold">★</span>
                  <span class="text-gray-700 text-sm">Word Expert</span>
                </li>
                <li class="flex items-center">
                  <span class="bg-[#D04423] text-white rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold">★</span>
                  <span class="text-gray-700 text-sm">Excel Expert</span>
                </li>
                <li class="flex items-center">
                  <span class="bg-[#D04423] text-white rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold">★</span>
                  <span class="text-gray-700 text-sm">Access Expert</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Learning Path Section -->
        <div class="bg-[#D04423] p-6 rounded-lg shadow text-white">
          <h4 class="text-lg font-bold mb-3 border-b border-orange-400 pb-3">
            Your Path to Certification Success
          </h4>
          <p class="text-white text-sm leading-relaxed mb-4 opacity-95">
            Certiport provides a full pathway for MOS certification success, including leading courseware, learning products, and state-of-the-art practice tests. Regardless of industry, it provides resources for educators and employers to increase Microsoft Office skills and empowers individuals to take and pass MOS certification.
          </p>
          
          <!-- Why Choose MOS -->
          <div class="bg-white bg-opacity-10 p-4 rounded border border-white border-opacity-20">
            <h5 class="text-base font-bold text-white mb-3">Why Choose MOS?</h5>
            <ul class="space-y-2">
              <li class="flex items-start">
                <span class="bg-white text-[#D04423] rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span class="text-white text-sm">The only Microsoft-endorsed certification for Office applications</span>
              </li>
              <li class="flex items-start">
                <span class="bg-white text-[#D04423] rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span class="text-white text-sm">Recognized globally by employers across all industries</span>
              </li>
              <li class="flex items-start">
                <span class="bg-white text-[#D04423] rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span class="text-white text-sm">Demonstrates proficiency in real-world Office tasks</span>
              </li>
              <li class="flex items-start">
                <span class="bg-white text-[#D04423] rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span class="text-white text-sm">Enhances resume and career opportunities</span>
              </li>
              <li class="flex items-start">
                <span class="bg-white text-[#D04423] rounded w-5 h-5 flex items-center justify-center mr-2 text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span class="text-white text-sm">Available for Office 365, Office 2019, and Office 2016</span>
              </li>
            </ul>
          </div>
        </div>
      </div>`,
      benefits: [
        "Only Microsoft-endorsed Office certification",
        "Globally recognized by employers",
        "Stand out in competitive job markets",
        "Simplify daily tasks and boost productivity",
        "Foster career growth and advancement",
        "Comprehensive practice and learning resources"
      ],
      targetAudience: [
        "Students preparing for the workforce",
        "Office professionals seeking validation",
        "Career changers entering administrative roles",
        "Anyone using Microsoft Office applications"
      ]
    },
    {
      id: 203,
      name: "Entrepreneurship and Small Business (ESB)",
      modules: [
        "Entrepreneurial Concepts",
        "Small Business Management",
        "Marketing and Sales",
        "Production and Distribution",
        "Business Financials"
      ],
      duration: "Self-Paced",
      eligibility: "Aspiring Entrepreneurs and Business Professionals",
      level: "Industry Certification",
      description: "ESB certification validates foundational concepts in entrepreneurship and small business management",
      learnMoreUrl: "/cources/ESB Program Overview Datasheet 1024.pdf",
      logoUrl: "/cources/ESB.jpeg",
      detailedDescription: `<div class="space-y-6">
        <div class="flex justify-center mb-6">
          <img src="/cources/ESB.jpeg" alt="Entrepreneurship and Small Business" class="w-full max-w-3xl h-auto rounded-lg shadow-lg border border-gray-200" />
        </div>
        
        <!-- Objectives Section -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 class="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            Objectives of the ESB Certification
          </h3>
          <p class="text-gray-700 text-sm leading-relaxed">
            The <strong class="text-emerald-600">ESB certification</strong> is built to test and validate foundational concepts and knowledge in entrepreneurship and small business management. These core concepts include: <span class="font-semibold">Entrepreneurial and small business concepts</span>, <span class="font-semibold">marketing and sales</span>, <span class="font-semibold">production and distribution</span>, and <span class="font-semibold">business financials</span>.
          </p>
        </div>

        <!-- Core Competency Areas -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            Core Competency Areas
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Entrepreneurial Concepts -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h5 class="text-base font-semibold text-gray-900 mb-2">Entrepreneurial Concepts</h5>
              <p class="text-gray-700 text-sm leading-relaxed">Understanding the fundamentals of entrepreneurship, innovation, and business opportunity recognition</p>
            </div>
            
            <!-- Marketing and Sales -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h5 class="text-base font-semibold text-gray-900 mb-2">Marketing and Sales</h5>
              <p class="text-gray-700 text-sm leading-relaxed">Developing effective marketing strategies, customer acquisition, and sales techniques for small businesses</p>
            </div>
            
            <!-- Production and Distribution -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h5 class="text-base font-semibold text-gray-900 mb-2">Production & Distribution</h5>
              <p class="text-gray-700 text-sm leading-relaxed">Managing operations, supply chain, and product/service delivery effectively</p>
            </div>
            
            <!-- Business Financials -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h5 class="text-base font-semibold text-gray-900 mb-2">Business Financials</h5>
              <p class="text-gray-700 text-sm leading-relaxed">Understanding financial management, budgeting, cash flow, and basic accounting principles</p>
            </div>
          </div>
        </div>

        <!-- What You'll Learn Section -->
        <div class="bg-emerald-600 p-6 rounded-lg shadow text-white">
          <h4 class="text-lg font-bold mb-4 border-b border-emerald-500 pb-3">
            What You'll Learn
          </h4>
          <ul class="space-y-3">
            <li class="flex items-start">
              <div class="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold mt-0.5">✓</div>
              <div>
                <strong class="block text-sm mb-1">Business Planning</strong>
                <span class="text-emerald-50 text-sm">How to develop comprehensive business plans and strategies</span>
              </div>
            </li>
            <li class="flex items-start group">
              <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-opacity-30 transition-all">
                <span class="text-white font-bold text-xl">✓</span>
              </div>
              <div>
                <strong class="block text-lg mb-1">Financial Management</strong>
                <span class="text-green-50">Essential accounting and financial decision-making skills</span>
              </div>
            </li>
            <li class="flex items-start group">
              <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-opacity-30 transition-all">
                <span class="text-white font-bold text-xl">✓</span>
              </div>
              <div>
                <strong class="block text-lg mb-1">Marketing Fundamentals</strong>
                <span class="text-green-50">Creating effective marketing campaigns and sales strategies</span>
              </div>
            </li>
            <li class="flex items-start">
              <div class="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold mt-0.5">✓</div>
              <div>
                <strong class="block text-sm mb-1">Operations Management</strong>
                <span class="text-emerald-50 text-sm">Streamlining production and distribution processes</span>
              </div>
            </li>
            <li class="flex items-start">
              <div class="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold mt-0.5">✓</div>
              <div>
                <strong class="block text-sm mb-1">Risk Assessment</strong>
                <span class="text-emerald-50 text-sm">Identifying and managing business risks effectively</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- Who Should Take This -->
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h4 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            Who Should Take This Certification?
          </h4>
          <p class="text-gray-700 text-sm leading-relaxed">
            The ESB certification is ideal for <span class="font-semibold">aspiring entrepreneurs</span>, <span class="font-semibold">small business owners</span>, <span class="font-semibold">business students</span>, and <span class="font-semibold">professionals</span> looking to start or grow their own ventures. It provides a solid foundation in business principles and validates your readiness to launch and manage a successful small business.
          </p>
        </div>
      </div>`,
      benefits: [
        "Validate entrepreneurship knowledge and skills",
        "Globally recognized certification",
        "Comprehensive business management foundation",
        "Self-paced learning for busy professionals",
        "Essential for starting your own business",
        "Recognized by educational institutions worldwide"
      ],
      targetAudience: [
        "Aspiring entrepreneurs planning to start a business",
        "Small business owners seeking formal validation",
        "Business students enhancing their credentials",
        "Career professionals considering entrepreneurship"
      ]
    }
  ];


  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>(ibmPrograms);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    filterPrograms();
  }, [searchTerm, selectedLevel, activeTab]);

  const filterPrograms = () => {
    const currentPrograms = activeTab === 'sips' ? sipsPrograms : activeTab === 'ibm' ? ibmPrograms : certiportPrograms;
    let filtered = currentPrograms;

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

  const handleTabChange = (tab: 'sips' | 'ibm' | 'certiport') => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelectedLevel('All');
  };

  const handleLearnMore = (program: Program) => {
    navigate(`/programmes/${program.id}`, {
      state: {
        program,
        activeTab
      }
    });
  };

  const levels = activeTab === 'sips' 
    ? ['All', 'Professional Certificate']
    : activeTab === 'ibm'
    ? ['All', 'Certificate of Proficiency']
    : ['All', 'Industry Certification'];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="SIPS Programmes & Courses - IBM Certifications, Professional Certificates | Sri Lanka"
        description="Explore SIPS programmes in Sri Lanka: IBM Innovation Centre certifications (AI, Machine Learning, Cyber Security, Blockchain), Professional Certificate in Research Methodology, and career development courses. Industry-recognized qualifications with flexible learning options in Galle, Sri Lanka."
        keywords="SIPS programmes, SIPS courses Sri Lanka, IBM certifications Sri Lanka, IBM ICE Sri Lanka, AI courses Sri Lanka, machine learning courses, cyber security training, blockchain courses, research methodology Sri Lanka, professional certificates, career development courses, online learning Sri Lanka, certificate programs Galle"
        canonical="https://www.sips.edu.lk/programmes"
      />
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
        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('ibm')}
                className={`${
                  activeTab === 'ibm'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors flex items-center gap-2`}
              >
                <img src="/partners/IBM logo..jpeg" alt="IBM" className="h-28 w-56 object-contain" />
              </button>
              <button
                onClick={() => handleTabChange('certiport')}
                className={`${
                  activeTab === 'certiport'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors flex items-center gap-2`}
              >
                <img src="/partners/Certiport logo.svg" alt="Certiport" className="h-28 w-56 object-contain" />
              </button>
              <button
                onClick={() => handleTabChange('sips')}
                className={`${
                  activeTab === 'sips'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors flex items-center gap-2`}
              >
                <img src="/sips.png" alt="SIPS" className="h-14 w-auto" />
                SIPS Programmes
              </button>
            </nav>
          </div>
        </div>

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
                  {activeTab === 'certiport' && program.logoUrl ? (
                    <div className="flex justify-center items-center mb-3">
                      <img 
                        src={program.logoUrl} 
                        alt={program.name} 
                        className="h-32 w-auto object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  ) : (
                    <BookOpen className="mb-3" size={40} />
                  )}
                  <h3 className="text-2xl font-bold">{program.name}</h3>
                </div>

                <div className="p-6">
                  {/* Description for IBM Programs */}
                  {program.description && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-gray-700 text-sm leading-relaxed">{program.description}</p>
                    </div>
                  )}

                  {/* Modules/Curriculum */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <BookOpen size={20} className="mr-2 text-emerald-600" />
                      {activeTab === 'sips' ? 'Modules Covered' : 'Key Topics Covered'}
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

                  {/* Action Buttons */}
                  {(activeTab === 'ibm' || activeTab === 'certiport') && program.learnMoreUrl ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleLearnMore(program)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Learn More
                      </button>
                      <button 
                        onClick={() => navigate('/apply')}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                      >
                        Submit Your Inquiry
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate('/apply')}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                    >
                      Submit Your Inquiry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
