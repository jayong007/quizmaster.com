import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Clock, Trophy, Plus, Play, Pause, RotateCcw, CheckCircle, XCircle, Trash2, Sparkles, TrendingUp, Target, Zap, Star, Award, ChevronRight, BarChart3, FileText, Download, Share2, Moon, Sun, LogOut, User } from 'lucide-react';

export default function QuizMaster() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  
  // Load data from storage on mount
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('quizmaster_user');
    return saved ? JSON.parse(saved) : {
      name: 'Student',
      streak: 7,
      totalPoints: 2450,
      level: 12,
      avatar: '🎓',
      joinDate: new Date().toISOString()
    };
  });

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('quizmaster_subjects');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Mathematics', color: 'from-blue-500 to-cyan-500', icon: '📐', flashcards: 45, mastered: 32, studying: 13, progress: 71 },
      { id: 2, name: 'Physics', color: 'from-purple-500 to-pink-500', icon: '⚡', flashcards: 38, mastered: 25, studying: 13, progress: 66 },
      { id: 3, name: 'Biology', color: 'from-green-500 to-emerald-500', icon: '🧬', flashcards: 52, mastered: 40, studying: 12, progress: 77 },
      { id: 4, name: 'Chemistry', color: 'from-orange-500 to-red-500', icon: '🧪', flashcards: 41, mastered: 28, studying: 13, progress: 68 }
    ];
  });

  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem('quizmaster_flashcards');
    return saved ? JSON.parse(saved) : [
      { id: 1, subject: 'Mathematics', question: 'What is the Pythagorean theorem?', answer: 'a² + b² = c² - In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.', difficulty: 'easy', mastery: 80, lastReviewed: Date.now() - 86400000, flipped: false },
      { id: 2, subject: 'Physics', question: 'State Newton\'s Second Law of Motion', answer: 'F = ma - The force acting on an object equals its mass times acceleration. This fundamental law describes how force, mass, and acceleration are related.', difficulty: 'medium', mastery: 65, lastReviewed: Date.now() - 172800000, flipped: false },
      { id: 3, subject: 'Biology', question: 'What is photosynthesis?', answer: '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂ - Plants convert carbon dioxide and water into glucose and oxygen using sunlight.', difficulty: 'medium', mastery: 90, lastReviewed: Date.now() - 43200000, flipped: false }
    ];
  });

  const [studyTime, setStudyTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState({ correct: 0, incorrect: 0 });
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [newFlashcard, setNewFlashcard] = useState({ subject: '', question: '', answer: '', difficulty: 'medium' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  const [studyStats, setStudyStats] = useState(() => {
    const saved = localStorage.getItem('quizmaster_stats');
    return saved ? JSON.parse(saved) : {
      todayMinutes: 0,
      weekMinutes: 0,
      cardsReviewed: 0,
      accuracy: 0
    };
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('quizmaster_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('quizmaster_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('quizmaster_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem('quizmaster_stats', JSON.stringify(studyStats));
  }, [studyStats]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
        setStudyStats(prev => ({ 
          ...prev, 
          todayMinutes: Math.round((prev.todayMinutes || 0) + (1/60) * 100) / 100 
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const flipCard = (id) => {
    setFlashcards(flashcards.map(card => 
      card.id === id ? { ...card, flipped: !card.flipped } : card
    ));
  };

  const startQuiz = (subject = 'all') => {
    const quizCards = subject === 'all' 
      ? flashcards 
      : flashcards.filter(c => c.subject === subject);
    
    if (quizCards.length === 0) {
      alert('No flashcards available for quiz!');
      return;
    }
    
    setQuizMode(true);
    setCurrentQuizIndex(0);
    setQuizScore({ correct: 0, incorrect: 0 });
    setSelectedSubject(subject);
  };

  const answerQuestion = (correct) => {
    const cards = selectedSubject === 'all' 
      ? flashcards 
      : flashcards.filter(c => c.subject === selectedSubject);
    
    setQuizScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1)
    }));

    const currentCard = cards[currentQuizIndex];
    setFlashcards(flashcards.map(card => 
      card.id === currentCard.id 
        ? { ...card, mastery: Math.min(100, card.mastery + (correct ? 5 : -3)), lastReviewed: Date.now() }
        : card
    ));

    if (correct) {
      setUser(prev => ({ ...prev, totalPoints: prev.totalPoints + 10 }));
    }
    
    if (currentQuizIndex < cards.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      const finalCorrect = quizScore.correct + (correct ? 1 : 0);
      const finalIncorrect = quizScore.incorrect + (correct ? 0 : 1);
      const percentage = Math.round((finalCorrect / (finalCorrect + finalIncorrect)) * 100);
      
      setTimeout(() => {
        alert(`🎉 Quiz Complete!\n\nCorrect: ${finalCorrect}\nIncorrect: ${finalIncorrect}\nAccuracy: ${percentage}%\n\n+${finalCorrect * 10} points earned!`);
        setQuizMode(false);
        setStudyStats(prev => ({ 
          ...prev, 
          cardsReviewed: prev.cardsReviewed + cards.length,
          accuracy: Math.round(((prev.accuracy * prev.cardsReviewed) + (finalCorrect)) / (prev.cardsReviewed + cards.length))
        }));
      }, 500);
    }
  };

  const generateAIFlashcards = async () => {
    if (!aiTopic.trim()) return;
    
    setAiGenerating(true);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: `Generate 5 educational flashcards about "${aiTopic}". Return ONLY a JSON array with no preamble or markdown. Each object must have: subject (string), question (string), answer (detailed string), difficulty (easy/medium/hard). Example format: [{"subject":"Math","question":"What is...","answer":"...","difficulty":"easy"}]`
            }
          ],
        })
      });

      const data = await response.json();
      const text = data.content.find(item => item.type === "text")?.text || "";
      const cleanText = text.replace(/```json|```/g, "").trim();
      const generatedCards = JSON.parse(cleanText);
      
      const newCards = generatedCards.map((card, index) => ({
        id: Date.now() + index,
        subject: card.subject,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        mastery: 0,
        lastReviewed: Date.now(),
        flipped: false
      }));

      setFlashcards([...flashcards, ...newCards]);
      setUser(prev => ({ ...prev, totalPoints: prev.totalPoints + 50 }));
      alert(`✨ Generated ${newCards.length} AI-powered flashcards!\n+50 bonus points!`);
      setAiTopic('');
      setShowAiGenerator(false);
    } catch (error) {
      alert('Error generating flashcards. Please try again.');
      console.error(error);
    } finally {
      setAiGenerating(false);
    }
  };

  const addFlashcard = () => {
    if (newFlashcard.subject && newFlashcard.question && newFlashcard.answer) {
      setFlashcards([...flashcards, {
        id: Date.now(),
        ...newFlashcard,
        mastery: 0,
        lastReviewed: Date.now(),
        flipped: false
      }]);
      setNewFlashcard({ subject: '', question: '', answer: '', difficulty: 'medium' });
      setShowAddForm(false);
      setUser(prev => ({ ...prev, totalPoints: prev.totalPoints + 5 }));
    }
  };

  const deleteFlashcard = (id) => {
    if (confirm('Delete this flashcard?')) {
      setFlashcards(flashcards.filter(card => card.id !== id));
    }
  };

  const exportData = () => {
    const data = {
      user,
      flashcards,
      subjects,
      stats: studyStats,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizmaster-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetData = () => {
    if (confirm('⚠️ Reset all data? This cannot be undone!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const getFilteredCards = () => {
    return selectedSubject === 'all' 
      ? flashcards 
      : flashcards.filter(c => c.subject === selectedSubject);
  };

  const getMasteryColor = (mastery) => {
    if (mastery >= 80) return 'text-green-600 bg-green-100';
    if (mastery >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
    : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 text-gray-900';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-pink-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className={`${darkMode ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-white/10' : 'bg-white/80 border-purple-200'} backdrop-blur-xl rounded-3xl border shadow-2xl p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="text-yellow-400" size={40} />
                QuizMaster
              </h1>
              <p className={darkMode ? 'text-purple-200' : 'text-purple-700'}>AI-Powered Study & Quiz Platform</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-purple-100 hover:bg-purple-200'} transition-all`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-4xl">{user.avatar}</span>
                  <div>
                    <p className="font-semibold text-lg">{user.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Level {user.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full">
                    <Zap size={14} className="text-orange-400" />
                    <span>{user.streak} day</span>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Star size={14} className="text-yellow-400" />
                    <span>{user.totalPoints}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-purple-200'} backdrop-blur-xl rounded-2xl border p-2 mb-6 flex gap-2 overflow-x-auto`}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'flashcards', label: 'Flashcards', icon: FileText },
            { id: 'quiz', label: 'Quiz Mode', icon: Brain },
            { id: 'timer', label: 'Focus Timer', icon: Clock },
            { id: 'settings', label: 'Settings', icon: User }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : darkMode ? 'text-purple-200 hover:bg-white/10' : 'text-purple-700 hover:bg-purple-100'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Today', value: `${Math.round(studyStats.todayMinutes)}m`, icon: Clock, color: 'from-blue-600 to-cyan-600', change: '+12%' },
                { label: 'Cards', value: flashcards.length, icon: FileText, color: 'from-green-600 to-emerald-600', change: '+8' },
                { label: 'Reviewed', value: studyStats.cardsReviewed, icon: Target, color: 'from-purple-600 to-pink-600', change: '+24' },
                { label: 'Accuracy', value: `${studyStats.accuracy}%`, icon: Award, color: 'from-orange-600 to-red-600', change: '+5%' }
              ].map((stat, i) => (
                <div key={i} className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-purple-200'} backdrop-blur-xl rounded-2xl border p-6 hover:${darkMode ? 'bg-white/10' : 'bg-white'} transition-all`}>
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="text-purple-400" size={24} />
                    <span className="text-xs text-green-400">{stat.change}</span>
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('quiz')}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/50 transition-all text-left group text-white"
              >
                <Brain size={32} className="mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Quick Quiz</h3>
                <p className="text-purple-100 text-sm mb-3">Test your knowledge now</p>
                <div className="flex items-center text-sm font-semibold">
                  Start Quiz <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('flashcards');
                  setShowAiGenerator(true);
                }}
                className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/50 transition-all text-left group text-white"
              >
                <Sparkles size={32} className="mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">AI Generator</h3>
                <p className="text-blue-100 text-sm mb-3">Create cards with AI</p>
                <div className="flex items-center text-sm font-semibold">
                  Generate Now <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => setActiveTab('timer')}
                className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 hover:shadow-2xl hover:shadow-green-500/50 transition-all text-left group text-white"
              >
                <Clock size={32} className="mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Focus Session</h3>
                <p className="text-green-100 text-sm mb-3">Start studying now</p>
                <div className="flex items-center text-sm font-semibold">
                  Begin Session <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Progress */}
            <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-purple-200'} backdrop-blur-xl rounded-2xl border p-6`}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-purple-400" />
                Study Progress
              </h2>
              <div className="space-y-3">
                {subjects.slice(0, 4).map(subject => (
                  <div key={subject.id} className={`flex items-center justify-between p-4 ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-purple-50 hover:bg-purple-100'} rounded-xl transition-all`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-14 h-14 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                        {subject.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{subject.name}</h3>
                        <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                          <span>{subject.flashcards} cards</span>
                          <span>•</span>
                          <span>{subject.mastered} mastered</span>
                        </div>
                        <div className={`mt-2 w-full ${darkMode ? 'bg-white/10' : 'bg-purple-200'} rounded-full h-2`}>
                          <div
                            className={`bg-gradient-to-r ${subject.color} h-2 rounded-full transition-all`}
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{subject.progress}%</p>
                        <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>mastery</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Your Subjects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map(subject => (
                <div key={subject.id} className={`${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/80 border-purple-200 hover:bg-white'} backdrop-blur-xl rounded-2xl border p-6 transition-all`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
                        {subject.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{subject.name}</h3>
                        <p className={`${darkMode ? 'text-purple-300' : 'text-purple-600'} text-sm`}>{subject.flashcards} flashcards</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold mb-1">{subject.progress}%</p>
                      <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>complete</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-purple-300' : 'text-purple-600'}>Mastered</span>
                      <span className="font-semibold">{subject.mastered} cards</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-purple-300' : 'text-purple-600'}>Studying</span>
                      <span className="font-semibold">{subject.studying} cards</span>
                    </div>
                  </div>

                  <div className={`w-full ${darkMode ? 'bg-white/10' : 'bg-purple-200'} rounded-full h-3 mb-4`}>
                    <div
                      className={`bg-gradient-to-r ${subject.color} h-3 rounded-full transition-all`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSubject(subject.name);
                      startQuiz(subject.name);
                      setActiveTab('quiz');
                    }}
                    className={`w-full bg-gradient-to-r ${subject.color} py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-white`}
                  >
                    Start Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-3xl font-bold">Flashcards ({flashcards.length})</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAiGenerator(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 rounded-xl hover:shadow-lg transition-all text-white"
                >
                  <Sparkles size={20} />
                  AI Generate
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl hover:shadow-lg transition-all text-white"
                >
                  <Plus size={20} />
                  Add Card
                </button>
              </div>
            </div>

            {/* AI Generator Modal */}
            {showAiGenerator && (
              <div className={`${darkMode ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-white/10' : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300'} backdrop-blur-xl rounded-2xl border p-6`}>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="text-yellow-400" />
                  AI Flashcard Generator
                </h3>
                <p className={`${darkMode ? 'text-purple-200' : 'text-purple-700'} mb-4`}>Enter a topic and AI will create 5 comprehensive flashcards!</p>
                <input
                  type="text"
                  placeholder="e.g., Photosynthesis, World War II, Calculus..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-purple-300' : 'bg-white border-purple-300 text-gray-900 placeholder-purple-400'} border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4`}
                  onKeyPress={(e) => e.key === 'Enter' && generateAIFlashcards()}
                />
                <div className="flex gap-3">
                  <button
                    onClick={generateAIFlashcards}
                    disabled={aiGenerating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {aiGenerating ? '✨ Generating...' : '🚀 Generate 5 Flashcards'}
                  </button>
                  <button
                    onClick={() => setShowAiGenerator(false)}
                    className={`px-6 py-3 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-purple-100 hover:bg-purple-200'} rounded-xl transition-all`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Manual Add Form */}
            {showAddForm && (
              <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-purple-200'} backdrop-blur-xl rounded-2xl border p-6`}>
                <h3 className="text-2xl font-bold mb-4">Create New Flashcard</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Subject (e.g., Mathematics)"
                    value={newFlashcard.subject}
                    onChange={(e) => setNewFlashcard({...newFlashcard, subject: e.target.value})}
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-purple-300' : 'bg-white border-purple-300 text-gray-900 placeholder-purple-400'} border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                  <textarea
                    placeholder="Question"
                    value={newFlashcard.question}
                    onChange={(e) => setNewFlashcard({...newFlashcard, question: e.target.value})}
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-purple-300' : 'bg-white border-purple-300 text-gray-900 placeholder-purple-400'} border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    rows="2"
                  />
                  <textarea
                    placeholder="Answer"
                    value={newFlashcard.answer}
                    onChange={(e) => setNewFlashcard({...newFlashcard, answer: e.target.value})}
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-purple-300' : 'bg-white border-purple-300 text-gray-900 placeholder-purple-400'} border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    rows="3"
                  />
                  <select
                    value={newFlashcard.difficulty}
                    onChange={(e) => setNewFlashcard({...newFlashcard, difficulty: e.target.value})}
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-purple-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <div className="flex gap-3">
                    <button
                      onClick={addFlashcard}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all"
                    >
                      Add Flashcard (+5 pts)
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className={`px-6 py-3 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-purple-100 hover:bg-purple-200'} rounded-xl transition-all`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  selectedSubject === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-purple-100 hover:bg-purple-200'
                }`}
              >
                All Cards ({flashcards.length})
              </button>
              {[...new Set(flashcards.map(c => c.subject))].map(subject => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                    selectedSubject === subject
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-purple-100 hover:bg-purple-200'
                  }`}
                >
                  {subject} ({flashcards.filter(c => c.subject === subject).length})
                </button>
              ))}
            </div>

            {/* Flashcards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredCards().map(card => (
                <div key={card.id} className="relative group">
                  <div
                    onClick={() => flipCard(card.id)}
                    className={`${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/80 border-purple-200 hover:bg-white'} backdrop-blur-xl rounded-2xl border p-6 cursor-pointer transition-all min-h-64 flex flex-col`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-block ${darkMode ? 'bg-purple-600/30 text-purple-200' : 'bg-purple-100 text-purple-700'} text-xs font-semibold px-3 py-1 rounded-full`}>
                        {card.subject}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getMasteryColor(card.mastery)}`}>
                        {card.mastery}%
                      </span>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center">
                      {!card.flipped ? (
                        <div className="text-center">
                          <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'} mb-3`}>Question:</p>
                          <p className="text-lg font-semibold">{card.question}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'} mb-3`}>Answer:</p>
                          <p className={`text-base ${darkMode ? 'text-green-300' : 'text-green-700'}`}>{card.answer}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-white/10' : 'border-purple-200'}`}>
                      <div className={`flex justify-between items-center text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                        <span className="capitalize">{card.difficulty}</span>
                        <span>Click to flip</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFlashcard(card.id);
                    }}
                    className="absolute top-3 right-3 bg-red-500/80 backdrop-blur text-white p-2 rounded-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Mode */}
        {activeTab === 'quiz' && (
          <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-purple-200'} backdrop-blur-xl rounded-2xl border p-8`}>
            {!quizMode ? (
              <div className="text-center py-12">
                <Brain className="mx-auto text-purple-400 mb-6" size={80} />
                <h2 className="text-4xl font-bold mb-4">Quiz Mode</h2>
                <p className={`${darkMode ? 'text-purple-200' : 'text-purple-700'} text-lg mb-8`}>Test your knowledge and earn points!</p>
                
                <div className="max-w-md mx-auto space-y-4">
                  <button
                    onClick={() => startQuiz('all')}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all text-lg font-semibold"
                  >
                    Quiz All Cards ({flashcards.length})
                  </button>
                  
                  {[...new Set(flashcards.map(c => c.subject))].map(subject => (
                    <button
                      key={subject}
                      onClick={() => startQuiz(subject)}
                      className={`w-full ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-purple-100 hover:bg-purple-200'} px-8 py-4 rounded-xl transition-all text-lg font-semibold`}
                    >
                      Quiz {subject} ({flashcards.filter(c => c.subject === subject).length})
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                      Question {currentQuizIndex + 1} of {getFilteredCards().length}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-400" />
                        {quizScore.correct}
                      </span>
                      <span className="text-sm font-semibold flex items-center gap-2">
                        <XCircle size={16} className="text-red-400" />
                        {quizScore.incorrect}
                      </span>
                    </div>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-white/10' : 'bg-purple-200'} rounded-full h-3`}>
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                      style={{ width: `${((currentQuizIndex + 1) / getFilteredCards().length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20' : 'bg-gradient-to-br from-purple-100 to-pink-100'} rounded-2xl p-8 mb-8`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-block ${darkMode ? 'bg-purple-600/30 text-purple-200' : 'bg-purple-200 text-purple-800'} text-sm font-semibold px-4 py-2 rounded-full`}>
                      {getFilteredCards()[currentQuizIndex].subject}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'} capitalize`}>
                      {getFilteredCards()[currentQuizIndex].difficulty}
                    </span>
                  </div>
                  
                  <p className="text-2xl font-bold mb-6">
                    {getFilteredCards()[currentQuizIndex].question}
                  </p>
                  
                  <div className={`${darkMode ? 'bg-white/10' : 'bg-white/80'} rounded-xl p-6 backdrop-blur`}>
                    <p className={`text-lg ${darkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                      {getFilteredCards()[currentQuizIndex].answer}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => answerQuestion(true)}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 rounded-xl hover:shadow-2xl hover:shadow-green-500/50 transition-all text-xl font-bold"
                  >
                    <CheckCircle size={28} />
                    Got it Right!
                  </button>
                  <button
                    onClick={() => answerQuestion(false)}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-pink-600 text-white py-6 rounded-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all text-xl font-bold"
                  >
                    <XCircle size={28} />
                    Got it Wrong
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Focus Timer */}
        {activeTab === 'timer' && (
          <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-purple-200'} backdrop-blur-xl rounded-2xl border p-8`}>
            <div className="text-center max-w-2xl mx-auto">
              <Clock className="mx-auto text-purple-400 mb-6" size={80} />
              <h2 className="text-4xl font-bold mb-4">Focus Timer</h2>
              <p className={`${darkMode ? 'text-purple-200' : 'text-purple-700'} mb-12`}>Track your study sessions and stay focused</p>
              
              <div className="text-8xl font-bold mb-12 font-mono bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {formatTime(studyTime)}
              </div>

              <div className="flex justify-center gap-4 mb-12">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex items-center gap-3 px-12 py-6 rounded-2xl transition-all text-xl font-bold shadow-2xl text-white ${
                    isTimerRunning
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-yellow-500/50'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/50'
                  }`}
                >
                  {isTimerRunning ? <Pause size={32} /> : <Play size={32} />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                
                <button
                  onClick={() => {
                    setStudyTime(0);
                    setIsTimerRunning(false);
                  }}
                  className={`flex items-center gap-3 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-purple-100 hover:bg-purple-200'} px-12 py-6 rounded-2xl transition-all text-xl font-bold`}
                >
                  <RotateCcw size={32} />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { time: 25 * 60, label: '25 Minutes', desc: 'Pomodoro', icon: '🍅' },
                  { time: 45 * 60, label: '45 Minutes', desc: 'Deep Focus', icon: '🎯' },
                  { time: 60 * 60, label: '60 Minutes', desc: 'Extended', icon: '⚡' }
                ].map(preset => (
                  <button
                    key={preset.time}
                    onClick={() => {
                      setStudyTime(preset.time);
                      setIsTimerRunning(false);
                    }}
                    className={`${darkMode ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border-white/10' : 'bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-purple-200'} p-6 rounded-2xl transition-all border`}
                  >
                    <p className="text-3xl mb-2">{preset.icon}</p>
                    <p className="font-bold text-lg mb-1">{preset.label}</p>
                    <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>{preset.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-purple-200'} backdrop-blur-xl rounded-2xl border p-8`}>
            <h2 className="text-3xl font-bold mb-6">Settings</h2>
            
            <div className="space-y-6 max-w-2xl">
              <div className={`p-6 ${darkMode ? 'bg-white/5' : 'bg-purple-50'} rounded-xl`}>
                <h3 className="text-xl font-bold mb-4">Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'} mb-2`}>Name</label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      className={`w-full px-4 py-3 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-purple-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'} mb-2`}>Avatar Emoji</label>
                    <input
                      type="text"
                      value={user.avatar}
                      onChange={(e) => setUser({...user, avatar: e.target.value})}
                      className={`w-full px-4 py-3 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-purple-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      maxLength="2"
                    />
                  </div>
                </div>
              </div>

              <div className={`p-6 ${darkMode ? 'bg-white/5' : 'bg-purple-50'} rounded-xl`}>
                <h3 className="text-xl font-bold mb-4">Data Management</h3>
                <div className="space-y-3">
                  <button
                    onClick={exportData}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <Download size={20} />
                    Export All Data
                  </button>
                  <button
                    onClick={resetData}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all"
                  >
                    <Trash2 size={20} />
                    Reset All Data
                  </button>
                </div>
              </div>

              <div className={`p-6 ${darkMode ? 'bg-white/5' : 'bg-purple-50'} rounded-xl`}>
                <h3 className="text-xl font-bold mb-4">Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={darkMode ? 'text-purple-300' : 'text-purple-600'}>Total Flashcards</p>
                    <p className="text-2xl font-bold">{flashcards.length}</p>
                  </div>
                  <div>
                    <p className={darkMode ? 'text-purple-300' : 'text-purple-600'}>Total Points</p>
                    <p className="text-2xl font-bold">{user.totalPoints}</p>
                  </div>
                  <div>
                    <p className={darkMode ? 'text-purple-300' : 'text-purple-600'}>Study Time</p>
                    <p className="text-2xl font-bold">{Math.round(studyStats.todayMinutes)}m</p>
                  </div>
                  <div>
                    <p className={darkMode ? 'text-purple-300' : 'text-purple-600'}>Accuracy</p>
                    <p className="text-2xl font-bold">{studyStats.accuracy}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className={`text-sm ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
          QuizMaster - Master Any Subject with AI 🚀
        </p>
      </div>
    </div>
  );
}