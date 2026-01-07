'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import {
  GraduationCap,
  CloudUpload,
  Brain,
  Play,
  Sparkles,
  Gamepad2,
  BarChart3,
  RocketIcon,
  PlayCircle,
  Menu,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { playSound, SOUNDS } from '@/utils/sounds';

// Demo quiz questions - always the same 3 questions about world capitals
const DEMO_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "¿Cuál es la capital de Francia?",
    options: [
      { letter: 'A', text: 'Londres', correct: false, color: 'bg-[#ff3355]', shadow: 'shadow-[0_4px_0_#cc2944]' },
      { letter: 'B', text: 'París', correct: true, color: 'bg-[#1368ce]', shadow: 'shadow-[0_4px_0_#0f52a3]' },
      { letter: 'C', text: 'Berlín', correct: false, color: 'bg-[#e2a900]', shadow: 'shadow-[0_4px_0_#b58700]' },
      { letter: 'D', text: 'Madrid', correct: false, color: 'bg-[#46178f]', shadow: 'shadow-[0_4px_0_#2f0f5e]' }
    ]
  },
  {
    id: 2,
    question: "¿Cuál es la capital de Japón?",
    options: [
      { letter: 'A', text: 'Seúl', correct: false, color: 'bg-[#ff3355]', shadow: 'shadow-[0_4px_0_#cc2944]' },
      { letter: 'B', text: 'Beijing', correct: false, color: 'bg-[#1368ce]', shadow: 'shadow-[0_4px_0_#0f52a3]' },
      { letter: 'C', text: 'Tokio', correct: true, color: 'bg-[#e2a900]', shadow: 'shadow-[0_4px_0_#b58700]' },
      { letter: 'D', text: 'Bangkok', correct: false, color: 'bg-[#46178f]', shadow: 'shadow-[0_4px_0_#2f0f5e]' }
    ]
  },
  {
    id: 3,
    question: "¿Cuál es la capital de Australia?",
    options: [
      { letter: 'A', text: 'Sídney', correct: false, color: 'bg-[#ff3355]', shadow: 'shadow-[0_4px_0_#cc2944]' },
      { letter: 'B', text: 'Melbourne', correct: false, color: 'bg-[#1368ce]', shadow: 'shadow-[0_4px_0_#0f52a3]' },
      { letter: 'C', text: 'Canberra', correct: true, color: 'bg-[#e2a900]', shadow: 'shadow-[0_4px_0_#b58700]' },
      { letter: 'D', text: 'Perth', correct: false, color: 'bg-[#46178f]', shadow: 'shadow-[0_4px_0_#2f0f5e]' }
    ]
  }
];

export default function LandingPage() {
  // Auth state
  const { isSignedIn, isLoaded } = useUser();

  // Quiz demo state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = DEMO_QUIZ_QUESTIONS[currentQuestionIndex];

  // Handle answer selection
  const handleAnswerClick = (letter: string, correct: boolean) => {
    if (showResult) return; // Prevent clicking while showing result

    setSelectedAnswer(letter);
    setShowResult(true);
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    // Play sound effect
    playSound(correct ? SOUNDS.CORRECT : SOUNDS.INCORRECT);

    // Auto-advance after 1 second
    setTimeout(() => {
      if (currentQuestionIndex < DEMO_QUIZ_QUESTIONS.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Quiz completed
        setQuizCompleted(true);
      }
    }, 1000);
  };

  // Reset quiz to start over
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-[1440px] mx-auto">

        {/* Navbar */}
        <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between w-full max-w-[1280px] mx-auto">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="text-[#590df2] w-8 h-8" />
              <h2 className="text-[#590df2] dark:text-white text-2xl font-black tracking-tight">Tutorcito</h2>
            </Link>

            <div className="hidden md:flex flex-1 justify-end gap-6 items-center">
              <div className="flex items-center gap-6 mr-4">
                <a className="text-gray-600 dark:text-gray-300 text-sm font-semibold hover:text-[#590df2] transition-colors" href="#features">
                  Características
                </a>
                <a className="text-gray-600 dark:text-gray-300 text-sm font-semibold hover:text-[#590df2] transition-colors" href="#how-it-works">
                  Cómo funciona
                </a>
                <a className="text-gray-600 dark:text-gray-300 text-sm font-semibold hover:text-[#590df2] transition-colors" href="#pricing">
                  Precios
                </a>
              </div>

              {/* Conditional rendering based on auth state */}
              {!isLoaded ? (
                // Loading state - show skeleton
                <div className="flex gap-3">
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
                </div>
              ) : isSignedIn ? (
                // User is authenticated - show Dashboard button + avatar
                <div className="flex items-center gap-3">
                  <Button
                    asChild
                    className="h-10 px-6 bg-[#590df2] text-white hover:bg-[#450ab5] shadow-[0_4px_0_#450ab5] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all duration-150"
                  >
                    <Link href="/dashboard">
                      Dashboard
                    </Link>
                  </Button>

                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                        userButtonTrigger: "focus:shadow-none hover:opacity-80 transition-opacity"
                      }
                    }}
                    afterSignOutUrl="/"
                  />
                </div>
              ) : (
                // User is not authenticated - show login/signup buttons
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    asChild
                    className="h-10 px-5 border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <Link href="/sign-in">
                      <span>Iniciar sesión</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="h-10 px-6 bg-[#590df2] text-white hover:bg-[#450ab5] shadow-[0_4px_0_#450ab5] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all duration-150"
                  >
                    <Link href="/sign-in">
                      <span>Regístrate</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <button className="md:hidden text-gray-700 dark:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-4 md:px-8 pt-12 pb-20 md:pt-20 md:pb-28 relative overflow-hidden bg-white dark:bg-transparent border-b border-gray-200 dark:border-gray-800">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Blur Decorations */}
          <div className="absolute top-20 right-[10%] w-32 h-32 bg-[#e2a900]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-[10%] w-40 h-40 bg-[#1368ce]/20 rounded-full blur-3xl"></div>

          <div className="flex flex-col max-w-[1200px] w-full z-10">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

              {/* Left Content */}
              <div className="flex flex-col gap-6 lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 self-center lg:self-start bg-purple-50 dark:bg-purple-900/20 px-4 py-1.5 rounded-full border border-purple-100 dark:border-purple-800">
                  <Sparkles className="text-[#590df2] w-4 h-4" />
                  <span className="text-[#590df2] text-xs font-bold uppercase tracking-wide">
                    Creador de Cuestionarios con IA
                  </span>
                </div>

                <h1 className="text-gray-900 dark:text-white text-5xl md:text-6xl lg:text-[68px] font-black leading-[1.1] tracking-tight">
                  Convierte PDFs aburridos en <span className="text-[#590df2]">cuestionarios divertidos</span>
                </h1>

                <p className="text-gray-500 dark:text-gray-300 text-lg md:text-xl font-medium leading-relaxed max-w-[540px] mx-auto lg:mx-0">
                  Tutorcito genera instantáneamente juegos interactivos a partir de tus materiales de estudio. Sube tus apuntes, desafía a tus amigos y domina cualquier materia.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-8 bg-[#590df2] text-white text-lg font-bold shadow-[0_4px_0_#450ab5] hover:bg-[#450ab5] hover:-translate-y-1 active:translate-y-[2px] active:shadow-none transition-all duration-200"
                  >
                    <Link href="/sign-in">
                      <RocketIcon className="mr-2 h-5 w-5" />
                      <span>Crear Quiz Gratis</span>
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white text-lg font-bold hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 transition-all duration-200"
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    <span>Ver Demo</span>
                  </Button>
                </div>
              </div>

              {/* Right Content - Quiz Demo Card */}
              <div className="w-full lg:w-1/2 relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#e2a900] rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#1368ce] rounded-full opacity-20 blur-2xl"></div>

                <motion.div
                  className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-2xl border-b-8 border-gray-200 dark:border-gray-800 relative z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500 border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, rotate: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {!quizCompleted ? (
                    <>
                      {/* Quiz Header */}
                      <div className="flex justify-between items-center mb-6 px-2">
                        <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                          Pregunta {currentQuestionIndex + 1} de 3
                        </span>
                        <div className="px-3 py-1 bg-green-100 text-[#26890c] rounded-full text-xs font-bold flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          Fácil
                        </div>
                      </div>

                      {/* Question */}
                      <div className="mb-8 px-2">
                        <h3 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white leading-tight">
                          {currentQuestion.question}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentQuestion.options.map((option) => {
                          const isSelected = selectedAnswer === option.letter;
                          const isCorrectOption = option.correct;

                          // Determine visual state for each option
                          let bgColor = option.color; // Original Kahoot color
                          let shadow = option.shadow;
                          let textColor = 'text-white';
                          let iconBgColor = 'bg-black/20';
                          let iconTextColor = 'text-white';
                          let showIcon: 'letter' | 'check' | 'x' = 'letter';

                          if (showResult) {
                            if (isCorrectOption) {
                              // Always show correct answer in green when showing result
                              bgColor = 'bg-[#26890c]';
                              shadow = '';
                              showIcon = 'check';
                            } else if (isSelected && !isCorrectOption) {
                              // Show selected incorrect answer in red
                              bgColor = 'bg-[#ff3355]';
                              shadow = '';
                              showIcon = 'x';
                            } else {
                              // Show other incorrect answers in gray
                              bgColor = 'bg-gray-300 dark:bg-gray-700';
                              shadow = '';
                              textColor = 'text-gray-600 dark:text-gray-400';
                              iconBgColor = 'bg-gray-400 dark:bg-gray-600';
                              iconTextColor = 'text-gray-600 dark:text-gray-400';
                              showIcon = 'letter';
                            }
                          }

                          return (
                            <div
                              key={option.letter}
                              onClick={() => handleAnswerClick(option.letter, option.correct)}
                              className={`
                                ${bgColor} ${shadow}
                                p-4 rounded-xl cursor-pointer flex items-center gap-3 transform hover:-translate-y-1 transition-all duration-200
                                ${showResult ? '' : 'hover:scale-105'}
                              `}
                            >
                              <div className={`${iconBgColor} w-8 h-8 rounded flex items-center justify-center shrink-0 font-bold ${iconTextColor}`}>
                                {showIcon === 'check' && <Check className="w-5 h-5" />}
                                {showIcon === 'x' && <X className="w-5 h-5" />}
                                {showIcon === 'letter' && option.letter}
                              </div>
                              <span className={`font-bold text-sm md:text-base leading-snug ${textColor}`}>
                                {option.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer with Progress */}
                      <div className="mt-8 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div className="flex gap-1">
                          {DEMO_QUIZ_QUESTIONS.map((_, index) => (
                            <div
                              key={index}
                              className={`
                                ${index === currentQuestionIndex ? 'w-8 bg-[#590df2]' : 'w-2 bg-gray-300'}
                                h-2 rounded-full transition-all duration-300
                              `}
                            />
                          ))}
                        </div>
                        {showResult && (
                          <span className="text-sm font-bold text-gray-500">
                            {isCorrect ? '✓ Correcto' : '✗ Incorrecto'}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Completion Screen */
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="mb-6 relative">
                        <div className="w-24 h-24 rounded-full bg-[#590df2]/10 flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-[#590df2]" />
                        </div>
                      </div>

                      <h3 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white mb-4">
                        ¡Bien hecho!
                      </h3>

                      <div className="mb-6">
                        <p className="text-5xl font-black text-[#590df2] mb-2">
                          {score} de 3
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          respuestas correctas
                        </p>
                      </div>

                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                        Regístrate para crear tus propios quizzes y compartirlos con tus amigos
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button
                          asChild
                          className="flex-1 h-12 bg-[#590df2] text-white hover:bg-[#450ab5] shadow-[0_4px_0_#450ab5] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all"
                        >
                          <Link href="/sign-in">
                            <RocketIcon className="mr-2 h-4 w-4" />
                            Crear mi Cuenta
                          </Link>
                        </Button>

                        <Button
                          onClick={resetQuiz}
                          variant="outline"
                          className="flex-1 h-12 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reintentar
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white dark:bg-gray-900/50 overflow-hidden relative border-b border-gray-200 dark:border-gray-800">
          <div
            className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(#590df2 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />

          <div className="relative z-10 max-w-[1000px] mx-auto px-4 md:px-8">
            <div className="flex flex-col items-center text-center mb-16">
              <span className="px-3 py-1 bg-[#590df2]/10 text-[#590df2] font-bold rounded-full text-xs uppercase tracking-wider mb-3">
                Proceso Simple
              </span>
              <h2 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black">
                Cómo funciona
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-[28px] left-[16%] right-[16%] h-[3px] bg-gray-100 dark:bg-gray-800 -z-10"></div>

              {[
                {
                  icon: CloudUpload,
                  color: 'border-[#ff3355] text-[#ff3355]',
                  title: '1. Sube tu PDF',
                  description: 'Arrastra y suelta tus apuntes de estudio, libros de texto o diapositivas de clase.'
                },
                {
                  icon: Brain,
                  color: 'border-[#590df2] text-[#590df2]',
                  title: '2. Generación con IA',
                  description: 'Nuestra IA crea inteligentemente preguntas de opción múltiple identificando conceptos clave.'
                },
                {
                  icon: Play,
                  color: 'border-[#26890c] text-[#26890c]',
                  title: '3. Juega y Aprende',
                  description: '¡Lanza el cuestionario! Juega solo para superar tu puntuación más alta o organiza un juego en vivo.'
                }
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className={`w-14 h-14 rounded-full bg-white border-4 ${step.color} flex items-center justify-center shadow-lg mb-6 relative z-10 group-hover:scale-110 transition-transform`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white text-xl font-bold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium px-4">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-[#f2f2f7] dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black mb-4">
                ¿Por qué los estudiantes aman Tutorcito?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto font-medium">
                Todo lo que necesitas para gamificar tus sesiones de estudio y hacer que aprender sea realmente divertido.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: Sparkles,
                  color: 'bg-[#ff3355]/10 text-[#ff3355]',
                  hoverColor: 'hover:border-[#590df2]',
                  title: 'Magia de la IA',
                  description: 'Deja de escribir preguntas manualmente. Deja que nuestra IA inteligente analice tu texto, resúmenes y PDFs para crear preguntas perfectas al instante.'
                },
                {
                  icon: Gamepad2,
                  color: 'bg-[#1368ce]/10 text-[#1368ce]',
                  hoverColor: 'hover:border-[#1368ce]',
                  title: 'Aprendizaje Gamificado',
                  description: 'Compite con amigos en una interfaz colorida y dinámica inspirada en tus juegos de preguntas favoritos. Aprender no tiene por qué ser aburrido.'
                },
                {
                  icon: BarChart3,
                  color: 'bg-[#e2a900]/10 text-[#e2a900]',
                  hoverColor: 'hover:border-[#e2a900]',
                  title: 'Resultados Instantáneos',
                  description: 'Obtén retroalimentación inmediata sobre lo que sabes y lo que necesitas repasar. Sigue tu progreso a lo largo del tiempo con estadísticas detalladas.'
                }
              ].map((feature, index) => (
                <Card
                  key={index}
                  className={`group p-8 rounded-[2rem] bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 border-b-4 border-transparent ${feature.hoverColor}`}
                >
                  <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-gray-900 dark:text-white text-xl font-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="pricing" className="py-16 px-4 md:px-8 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-[1200px] mx-auto w-full bg-[#590df2] rounded-[2.5rem] overflow-hidden relative shadow-2xl transform hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#ff3355]/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

            <div className="flex flex-col md:flex-row items-center justify-between p-10 md:p-20 relative z-10 gap-10">
              <div className="flex flex-col gap-4 text-center md:text-left max-w-xl">
                <h2 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tight">
                  ¿Listo para aprobar tu próximo examen?
                </h2>
                <p className="text-white/90 text-lg font-medium">
                  Únete a miles de estudiantes que convierten sus apuntes en juegos interactivos hoy mismo.
                </p>
              </div>

              <Button
                size="lg"
                asChild
                className="h-14 px-8 bg-white text-[#590df2] text-lg font-bold shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:bg-gray-50 hover:-translate-y-1 active:translate-y-[2px] active:shadow-none transition-all"
              >
                <Link href="/sign-up">
                  Empieza Gratis
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-950 pt-16 pb-8">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-10">
            <div className="flex flex-col md:flex-row justify-between gap-10">
              <div className="flex flex-col gap-4 max-w-xs">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <GraduationCap className="text-[#590df2] w-8 h-8" />
                  <h2 className="text-xl font-black">Tutorcito</h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                  Haciendo el estudio divertido, un cuestionario a la vez. Potenciado por IA y gamificación.
                </p>
              </div>

              <div className="flex gap-12 md:gap-24 flex-wrap">
                <div className="flex flex-col gap-4">
                  <h4 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider">
                    Producto
                  </h4>
                  <a className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#590df2] transition-colors" href="#features">
                    Características
                  </a>
                  <a className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#590df2] transition-colors" href="#pricing">
                    Precios
                  </a>
                  <a className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#590df2] transition-colors" href="#">
                    Para Profesores
                  </a>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider">
                    Compañía
                  </h4>
                  <a className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#590df2] transition-colors" href="#">
                    Acerca de
                  </a>
                  <a className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#590df2] transition-colors" href="#">
                    Blog
                  </a>
                  <a className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#590df2] transition-colors" href="#">
                    Empleo
                  </a>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider">
                    Legal
                  </h4>
                  <a className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#590df2] transition-colors" href="#">
                    Privacidad
                  </a>
                  <a className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#590df2] transition-colors" href="#">
                    Términos
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-gray-600 text-sm font-medium">
                © 2024 Tutorcito. Todos los derechos reservados.
              </p>
              <div className="flex gap-6">
                <a className="text-gray-400 dark:text-gray-600 hover:text-[#590df2] transition-colors text-sm" href="#">
                  Twitter
                </a>
                <a className="text-gray-400 dark:text-gray-600 hover:text-[#590df2] transition-colors text-sm" href="#">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
