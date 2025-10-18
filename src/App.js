import React, { useState, useEffect } from 'react';
import { AlertCircle, Trophy, RotateCcw, Loader } from 'lucide-react';

const TriviaApp = () => {
  const [categories, setCategories] = useState({});
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryMapping = {
    9: 'General Knowledge',
    11: 'Film',
    12: 'Music',
    17: 'Science & Nature',
    18: 'Computers',
    21: 'Sports',
    22: 'Geography',
    23: 'History',
    27: 'Animals',
    31: 'Anime & Manga'
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Randomly select 5 categories
      const categoryIds = Object.keys(categoryMapping);
      const shuffled = categoryIds.sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, 5);
      
      const newCategories = {};
      
      // Fetch 5 questions for each category
      for (const categoryId of selectedIds) {
        const response = await fetch(
          `https://opentdb.com/api.php?amount=5&category=${categoryId}&type=multiple`
        );
        const data = await response.json();
        
        if (data.response_code === 0 && data.results) {
          const categoryName = categoryMapping[categoryId];
          newCategories[categoryName] = data.results.map((q, idx) => ({
            q: decodeHTML(q.question),
            a: decodeHTML(q.correct_answer),
            wrong: q.incorrect_answers.map(ans => decodeHTML(ans)),
            points: (idx + 1) * 100,
            difficulty: q.difficulty
          }));
        }
      }
      
      setCategories(newCategories);
      setLoading(false);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      setLoading(false);
    }
  };

  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleQuestionClick = (category, index) => {
    const key = `${category}-${index}`;
    if (answeredQuestions[key]) return;
    
    setCurrentQuestion({ category, index, key });
    setUserAnswer('');
    setFeedback(null);
  };

  const checkAnswer = (userAns, correctAns) => {
    const normalize = (str) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
    const normalizedUser = normalize(userAns);
    const normalizedCorrect = normalize(correctAns);
    
    // Check exact match or if one contains the other
    return normalizedUser === normalizedCorrect || 
           normalizedCorrect.includes(normalizedUser) ||
           normalizedUser.includes(normalizedCorrect);
  };

  const handleSubmit = () => {
    const question = categories[currentQuestion.category][currentQuestion.index];
    const isCorrect = checkAnswer(userAnswer, question.a);
    
    if (isCorrect) {
      setScore(score + question.points);
      setFeedback({ type: 'correct', message: 'Correct!' });
    } else {
      setFeedback({ type: 'incorrect', message: `Incorrect. The answer was: ${question.a}` });
    }
    
    setAnsweredQuestions({ ...answeredQuestions, [currentQuestion.key]: true });
  };

  const handleNext = () => {
    setCurrentQuestion(null);
    setUserAnswer('');
    setFeedback(null);
  };

  const resetGame = () => {
    setScore(0);
    setAnsweredQuestions({});
    setCurrentQuestion(null);
    setUserAnswer('');
    setFeedback(null);
    fetchQuestions();
  };

  const allAnswered = Object.keys(answeredQuestions).length === Object.keys(categories).length * 5;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-yellow-400 mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Loading Jeopardy Questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-red-500 text-white p-6 rounded-lg max-w-md text-center">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchQuestions}
            className="bg-white text-red-500 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
            JEOPARDY!
          </h1>
          <div className="flex items-center justify-center gap-8 mt-4">
            <div className="flex items-center gap-2 text-white text-xl">
              <Trophy className="text-yellow-400" size={28} />
              <span className="font-bold">${score}</span>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw size={18} />
              New Game
            </button>
          </div>
        </div>

        {/* Game Board */}
        {!currentQuestion ? (
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 shadow-2xl">
            {allAnswered && (
              <div className="text-center mb-6 p-4 bg-yellow-400 text-black rounded-lg">
                <h2 className="text-2xl font-bold">Game Complete!</h2>
                <p className="text-lg">Final Score: ${score}</p>
                <button
                  onClick={resetGame}
                  className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Play Again with New Questions
                </button>
              </div>
            )}
            <div className="grid grid-cols-5 gap-4">
              {Object.keys(categories).map((category) => (
                <div key={category} className="flex flex-col gap-3">
                  <div className="bg-blue-600 text-white text-center py-3 px-2 rounded font-bold text-xs uppercase min-h-[60px] flex items-center justify-center">
                    {category}
                  </div>
                  {categories[category].map((q, idx) => {
                    const key = `${category}-${idx}`;
                    const isAnswered = answeredQuestions[key];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuestionClick(category, idx)}
                        disabled={isAnswered}
                        className={`py-6 rounded font-bold text-2xl transition-all ${
                          isAnswered
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-400 text-yellow-400 hover:scale-105 cursor-pointer'
                        }`}
                      >
                        {isAnswered ? '—' : `$${q.points}`}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Question Modal
          <div className="bg-blue-600 rounded-lg p-8 shadow-2xl max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="text-yellow-400 text-sm font-bold uppercase mb-2">
                {currentQuestion.category}
              </div>
              <div className="text-yellow-400 text-3xl font-bold mb-4">
                ${categories[currentQuestion.category][currentQuestion.index].points}
              </div>
              <div className="text-white text-2xl font-medium leading-relaxed">
                {categories[currentQuestion.category][currentQuestion.index].q}
              </div>
            </div>

            {!feedback ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleSubmit()}
                  placeholder="What is..."
                  className="w-full px-4 py-3 text-lg rounded border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded text-lg transition-colors"
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  feedback.type === 'correct' ? 'bg-green-500' : 'bg-red-500'
                } text-white text-center`}>
                  <p className="text-xl font-bold">{feedback.message}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-6 rounded text-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaApp;