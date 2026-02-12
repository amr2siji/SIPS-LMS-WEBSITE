import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState<'sips' | 'ibm' | 'certiport'>('ibm');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showModal, setShowModal] = useState(false);
  
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
          <img src="/cources/IC3 course.jpeg" alt="IC3 Digital Literacy" class="w-full max-w-3xl h-auto rounded-lg shadow-lg" />
        </div>
        
        <div>
          <h3 class="text-3xl font-bold text-gray-900 mb-4">What is IC3 DIGITAL LITERACY?</h3>
          <p class="text-gray-700 mb-4 text-lg leading-relaxed">IC3 Digital Literacy Certification is a stackable credential that validates each learner's level of proficiency, whether beginner, intermediate, or advanced. It measures against seven major domains that are essential to success. It aligns to multiple international standards to ensure it is the most comprehensive solution available.</p>
          <p class="text-gray-700 mb-6 text-lg leading-relaxed">The newest version, <strong>Global Standard Six</strong>, focuses on competency; allowing students to enter at the appropriate skill level and exit with mastery.</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg">
          <h4 class="text-2xl font-semibold text-gray-900 mb-4">Digital Literacy Domains</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead class="bg-green-600 text-white">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold border-b">OBJECTIVE DOMAIN</th>
                  <th class="px-4 py-3 text-left font-semibold border-b">SUBDOMAIN</th>
                  <th class="px-4 py-3 text-center font-semibold border-b">LEVEL 1</th>
                  <th class="px-4 py-3 text-center font-semibold border-b">LEVEL 2</th>
                  <th class="px-4 py-3 text-center font-semibold border-b">LEVEL 3</th>
                </tr>
              </thead>
              <tbody class="text-gray-700">
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium" rowspan="3">Technology Basics</td>
                  <td class="px-4 py-3">Explain fundamental software concepts</td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Customize digital environments</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Identify, troubleshoot, and resolve technical problems with assistance</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium" rowspan="2">Digital Citizenship</td>
                  <td class="px-4 py-3">Cultivate, manage, and protect your digital reputation</td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Apply digital etiquette standards</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium">Information Management</td>
                  <td class="px-4 py-3">Explain best practices for digital citizenship</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium" rowspan="3">Information Management</td>
                  <td class="px-4 py-3">Use and refine criteria for online searches</td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Manage online data collection, storage, and retrieval</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Evaluate digital information sources and multiple search results</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium" rowspan="3">Content Creation</td>
                  <td class="px-4 py-3">Create basic digital content</td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Responsibly repurpose digital resources</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Create, edit, and publish or present original digital media content for a specific audience</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium" rowspan="3">Communication</td>
                  <td class="px-4 py-3">Express yourself through digital means</td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Interact with others in a digital environment</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Customize the message and medium for a specific audience</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium" rowspan="3">Collaboration</td>
                  <td class="px-4 py-3">Identify digital etiquette standards for collaborative processes</td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Use digital tools and technologies to collaborate on the creation of content</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Use collaboration tools to work with others to examine issues and problems from multiple viewpoints</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium" rowspan="3">Safety and Security</td>
                  <td class="px-4 py-3">Identify threats and security measures in a digital environment</td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-4 py-3">Avoid mental health threats while using digital technologies (Catfishing, FOMO, etc.)</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
                  <td class="px-4 py-3 text-center"></td>
                </tr>
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3">Manage device security (encryption, biometric passwords, viruses)</td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center"></td>
                  <td class="px-4 py-3 text-center">✓</td>
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
          <img src="/cources/Microsoft Office Specializations.jpeg" alt="Microsoft Office Specialist" class="w-full max-w-3xl h-auto rounded-lg shadow-lg" />
        </div>
        
        <div>
          <h3 class="text-3xl font-bold text-gray-900 mb-4">About Microsoft Office Specialist (MOS)</h3>
          <p class="text-gray-700 mb-4 text-lg leading-relaxed">Microsoft Office Specialist (MOS) is the only endorsed certification by Microsoft that validates skills in Microsoft Office applications, including Word, Excel®, PowerPoint®, and Outlook®. Certifications are available for Microsoft Office 365 Apps, Microsoft Office 2019, and Microsoft Office 2016.</p>
          <p class="text-gray-700 mb-6 text-lg leading-relaxed">Candidates who take and pass MOS certification are empowered to stand out in the competitive job market, while simplifying daily tasks and fostering career growth.</p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
          <h4 class="text-2xl font-semibold text-gray-900 mb-4">Content Covered</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-4 rounded-lg shadow">
              <h5 class="font-bold text-blue-600 mb-2">Associate Level</h5>
              <ul class="space-y-2 text-gray-700">
                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Word Associate</li>
                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Excel Associate</li>
                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> PowerPoint Associate</li>
                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Outlook Associate</li>
              </ul>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
              <h5 class="font-bold text-purple-600 mb-2">Expert Level</h5>
              <ul class="space-y-2 text-gray-700">
                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Word Expert</li>
                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Excel Expert</li>
                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Access Expert</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-2xl font-semibold text-gray-900 mb-4">Learn, Practice, Certify, and Advance</h4>
          <p class="text-gray-700 mb-4 text-lg leading-relaxed">Certiport provides a full pathway for MOS certification success, including leading courseware, learning products, and state-of-the-art practice tests. Regardless of industry, it provides resources for educators and employers to increase Microsoft Office skills and empowers individuals to take and pass MOS certification.</p>
          
          <div class="bg-blue-50 p-6 rounded-lg mt-4">
            <h5 class="text-xl font-semibold text-gray-900 mb-3">Why Choose MOS?</h5>
            <ul class="space-y-2 text-gray-700">
              <li class="flex items-start"><span class="text-blue-600 mr-2 mt-1">●</span><span>The only Microsoft-endorsed certification for Office applications</span></li>
              <li class="flex items-start"><span class="text-blue-600 mr-2 mt-1">●</span><span>Recognized globally by employers across all industries</span></li>
              <li class="flex items-start"><span class="text-blue-600 mr-2 mt-1">●</span><span>Demonstrates proficiency in real-world Office tasks</span></li>
              <li class="flex items-start"><span class="text-blue-600 mr-2 mt-1">●</span><span>Enhances resume and career opportunities</span></li>
              <li class="flex items-start"><span class="text-blue-600 mr-2 mt-1">●</span><span>Available for Office 365, Office 2019, and Office 2016</span></li>
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
          <img src="/cources/ESB.jpeg" alt="Entrepreneurship and Small Business" class="w-full max-w-3xl h-auto rounded-lg shadow-lg" />
        </div>
        
        <div>
          <h3 class="text-3xl font-bold text-gray-900 mb-4">Objectives of the Entrepreneurship and Small Business Certification</h3>
          <p class="text-gray-700 mb-6 text-lg leading-relaxed">The ESB certification is built to test and validate foundational concepts and knowledge in entrepreneurship and small business management. These core concepts include: Entrepreneurial and small business concepts, marketing and sales, production and distribution, and business financials.</p>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
          <h4 class="text-2xl font-semibold text-gray-900 mb-4">Core Competency Areas</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-5 rounded-lg shadow-md">
              <h5 class="font-bold text-green-600 mb-3 text-lg">📊 Entrepreneurial Concepts</h5>
              <p class="text-gray-700 text-sm">Understanding the fundamentals of entrepreneurship, innovation, and business opportunity recognition</p>
            </div>
            <div class="bg-white p-5 rounded-lg shadow-md">
              <h5 class="font-bold text-blue-600 mb-3 text-lg">🎯 Marketing and Sales</h5>
              <p class="text-gray-700 text-sm">Developing effective marketing strategies, customer acquisition, and sales techniques for small businesses</p>
            </div>
            <div class="bg-white p-5 rounded-lg shadow-md">
              <h5 class="font-bold text-purple-600 mb-3 text-lg">🚚 Production and Distribution</h5>
              <p class="text-gray-700 text-sm">Managing operations, supply chain, and product/service delivery effectively</p>
            </div>
            <div class="bg-white p-5 rounded-lg shadow-md">
              <h5 class="font-bold text-orange-600 mb-3 text-lg">💰 Business Financials</h5>
              <p class="text-gray-700 text-sm">Understanding financial management, budgeting, cash flow, and basic accounting principles</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 p-6 rounded-lg">
          <h4 class="text-2xl font-semibold text-gray-900 mb-4">What You'll Learn</h4>
          <ul class="space-y-3 text-gray-700">
            <li class="flex items-start">
              <span class="text-green-600 font-bold mr-3 text-xl">✓</span>
              <span><strong>Business Planning:</strong> How to develop comprehensive business plans and strategies</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-600 font-bold mr-3 text-xl">✓</span>
              <span><strong>Financial Management:</strong> Essential accounting and financial decision-making skills</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-600 font-bold mr-3 text-xl">✓</span>
              <span><strong>Marketing Fundamentals:</strong> Creating effective marketing campaigns and sales strategies</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-600 font-bold mr-3 text-xl">✓</span>
              <span><strong>Operations Management:</strong> Streamlining production and distribution processes</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-600 font-bold mr-3 text-xl">✓</span>
              <span><strong>Risk Assessment:</strong> Identifying and managing business risks effectively</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-2xl font-semibold text-gray-900 mb-3">Who Should Take This Certification?</h4>
          <p class="text-gray-700 mb-4 text-lg">The ESB certification is ideal for aspiring entrepreneurs, small business owners, business students, and professionals looking to start or grow their own ventures. It provides a solid foundation in business principles and validates your readiness to launch and manage a successful small business.</p>
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
    setSelectedProgram(program);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProgram(null);
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

      {/* Programme Details Modal */}
      {showModal && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {activeTab === 'ibm' && <img src="/partners/IBM logo..jpeg" alt="IBM" className="h-8 w-auto" />}
                    {activeTab === 'certiport' && <img src="/partners/Certiport logo.svg" alt="Certiport" className="h-8 w-auto" />}
                    <span className="text-sm font-semibold bg-blue-800 px-3 py-1 rounded-full">
                      {activeTab === 'ibm' ? 'IBM Programme' : activeTab === 'certiport' ? 'Certiport Programme' : 'SIPS Programme'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedProgram.name}</h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <BookOpen className="mr-2 text-blue-600" size={24} />
                  Programme Overview
                </h3>
                <div 
                  className="text-gray-700 leading-relaxed text-justify"
                  dangerouslySetInnerHTML={{ __html: selectedProgram.detailedDescription || '' }}
                />
              </div>

              {/* Programme Benefits */}
              {selectedProgram.benefits && selectedProgram.benefits.length > 0 && (
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <Award className="mr-2 text-blue-600" size={24} />
                    What You'll Gain
                  </h3>
                  <ul className="space-y-2">
                    {selectedProgram.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Topics */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key Topics Covered
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedProgram.modules.map((module, index) => (
                    <div key={index} className="flex items-start bg-gray-50 p-3 rounded-lg">
                      <span className="text-blue-600 mr-2 font-bold">•</span>
                      <span className="text-sm text-gray-700">{module}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              {selectedProgram.targetAudience && selectedProgram.targetAudience.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <Users className="mr-2 text-blue-600" size={24} />
                    Who Should Enroll
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedProgram.targetAudience.map((audience, index) => (
                      <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-700">{audience}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Programme Details */}
              <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-xl">
                <div className="text-center">
                  <Clock className="mx-auto mb-2 text-blue-600" size={28} />
                  <p className="text-xs text-gray-600 font-semibold mb-1">Duration</p>
                  <p className="text-sm text-gray-900 font-medium">{selectedProgram.duration}</p>
                </div>
                <div className="text-center">
                  <Users className="mx-auto mb-2 text-blue-600" size={28} />
                  <p className="text-xs text-gray-600 font-semibold mb-1">Eligibility</p>
                  <p className="text-sm text-gray-900 font-medium">{selectedProgram.eligibility}</p>
                </div>
                <div className="text-center">
                  <Award className="mx-auto mb-2 text-blue-600" size={28} />
                  <p className="text-xs text-gray-600 font-semibold mb-1">Level</p>
                  <p className="text-sm text-gray-900 font-medium">{selectedProgram.level}</p>
                </div>
              </div>

              {/* Certification Info */}
              {selectedProgram.certificationInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-l-4 border-blue-600">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    <Award className="mr-2 text-blue-600" size={22} />
                    Certification
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedProgram.certificationInfo}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const url = activeTab === 'certiport' 
                    ? 'https://lpec.lk/academic-partners/certiport-certification/'
                    : selectedProgram.learnMoreUrl;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {activeTab === 'certiport' ? 'Visit Certiport Site' : 'Visit IBM Website'}
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                  navigate('/apply');
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Submit Your Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
