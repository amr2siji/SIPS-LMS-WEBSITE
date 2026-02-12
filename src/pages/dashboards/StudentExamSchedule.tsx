import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';

interface ExamSchedule {
  id: string;
  examDate: string;
  startTime: string;
  endTime: string;
  location: string;
  examType: string;
  instructions: string;
  moduleId: string;
  moduleName: string;
  examName: string;
  description?: string;
  duration?: number;
  maxMarks?: number;
}

export function StudentExamSchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (user) {
      loadExamSchedules();
    }
  }, [user]);

  const loadExamSchedules = async () => {
    try {
      setLoading(true);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(
        `${API_BASE_URL}/api/student/exams`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const examsData = result.data || [];

      // Format the data to match our interface
      const formattedExams: ExamSchedule[] = examsData.map((exam: any) => ({
        id: exam.id,
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        location: exam.location || 'TBA',
        examType: exam.examType || 'Written',
        instructions: exam.instructions || '',
        moduleId: exam.moduleId,
        moduleName: exam.moduleName || 'Unknown Module',
        examName: exam.examName || 'Exam',
        description: exam.description,
        duration: exam.duration,
        maxMarks: exam.maxMarks
      }));

      setExamSchedules(formattedExams);
    } catch (error) {
      console.error('Error loading exam schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredExams = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'upcoming':
        return examSchedules.filter(exam => new Date(exam.examDate) >= today);
      case 'past':
        return examSchedules.filter(exam => new Date(exam.examDate) < today);
      default:
        return examSchedules;
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'midterm':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'final':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'quiz':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'practical':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDaysUntilExam = (examDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil < 0) return 'bg-gray-100 border-gray-300';
    if (daysUntil <= 3) return 'bg-red-50 border-red-300';
    if (daysUntil <= 7) return 'bg-amber-50 border-amber-300';
    if (daysUntil <= 14) return 'bg-yellow-50 border-yellow-300';
    return 'bg-green-50 border-green-300';
  };

  const formatTime = (time: string) => {
    if (!time) return 'TBA';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupExamsByDate = (exams: ExamSchedule[]) => {
    const grouped: { [date: string]: ExamSchedule[] } = {};
    exams.forEach(exam => {
      if (!grouped[exam.examDate]) {
        grouped[exam.examDate] = [];
      }
      grouped[exam.examDate].push(exam);
    });
    return grouped;
  };

  const filteredExams = getFilteredExams();
  const groupedExams = groupExamsByDate(filteredExams);
  const upcomingCount = examSchedules.filter(exam => getDaysUntilExam(exam.examDate) >= 0).length;
  const pastCount = examSchedules.filter(exam => getDaysUntilExam(exam.examDate) < 0).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <nav className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <div className="h-8 w-px bg-white/20"></div>
              <div>
                <h1 className="text-2xl font-bold text-white">Exam Schedule</h1>
                <p className="text-sm text-emerald-100">View your upcoming examinations</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Exams</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{examSchedules.length}</h3>
                <p className="text-sm text-blue-600 font-medium">Scheduled</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <Calendar className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Upcoming Exams</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{upcomingCount}</h3>
                <p className="text-sm text-green-600 font-medium">To be taken</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Completed Exams</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{pastCount}</h3>
                <p className="text-sm text-purple-600 font-medium">Past exams</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                <BookOpen className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('upcoming')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                filter === 'upcoming'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Exams ({examSchedules.length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                filter === 'past'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Past ({pastCount})
            </button>
          </div>
        </div>

        {/* Exam Schedule List */}
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Exams Found</h3>
            <p className="text-gray-600">
              {filter === 'upcoming' && 'You have no upcoming exams scheduled.'}
              {filter === 'past' && 'No past exams to display.'}
              {filter === 'all' && 'No exam schedules available yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedExams)
              .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
              .map((date) => {
                const daysUntil = getDaysUntilExam(date);
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

                return (
                  <div key={date} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Date Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{dayName}</h3>
                          <p className="text-indigo-100 text-sm">{formattedDate}</p>
                        </div>
                        {daysUntil >= 0 && (
                          <div className="text-right">
                            <div className="text-2xl font-bold">{daysUntil}</div>
                            <div className="text-xs text-indigo-100">
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Day' : 'Days'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Exams for this date */}
                    <div className="p-6 space-y-4">
                      {groupedExams[date].map((exam) => {
                        const urgencyColor = getUrgencyColor(daysUntil);
                        return (
                          <div
                            key={exam.id}
                            className={`border-2 rounded-xl p-5 transition-all hover:shadow-md ${urgencyColor}`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="text-indigo-600" size={20} />
                                  <h4 className="text-lg font-bold text-gray-900">{exam.moduleName}</h4>
                                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getExamTypeColor(exam.examType)}`}>
                                    {exam.examType}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <span className="font-semibold">{exam.examName}</span>
                                  {exam.maxMarks && (
                                    <>
                                      <span>•</span>
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                        {exam.maxMarks} Marks
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                                <Clock className="text-purple-600" size={20} />
                                <div>
                                  <div className="text-xs text-gray-600 font-medium">Time</div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                                <MapPin className="text-red-600" size={20} />
                                <div>
                                  <div className="text-xs text-gray-600 font-medium">Location</div>
                                  <div className="text-sm font-bold text-gray-900">{exam.location}</div>
                                </div>
                              </div>

                              {exam.duration && (
                                <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                                  <Calendar className="text-green-600" size={20} />
                                  <div>
                                    <div className="text-xs text-gray-600 font-medium">Duration</div>
                                    <div className="text-sm font-bold text-gray-900">{exam.duration} minutes</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {exam.instructions && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                                  <div>
                                    <div className="text-sm font-semibold text-amber-900 mb-1">Instructions</div>
                                    <div className="text-sm text-amber-800">{exam.instructions}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
