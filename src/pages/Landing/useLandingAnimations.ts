import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook pour gérer toutes les animations de la Landing page
 */
export function useLandingAnimations() {
  const [activeDemo, setActiveDemo] = useState('dashboard');
  const [userInteracted, setUserInteracted] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [currentStat1, setCurrentStat1] = useState(0);
  const [currentStat2, setCurrentStat2] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const statsRef = useRef<HTMLDivElement>(null);

  const demoSections = ['dashboard', 'products', 'inventory', 'orders', 'locations', 'waves', 'tasks', 'labor', 'reports', 'settings'];

  // Animation automatique en boucle
  useEffect(() => {
    if (userInteracted) return;
    const interval = setInterval(() => {
      setActiveDemo((current) => {
        const currentIndex = demoSections.indexOf(current);
        const nextIndex = (currentIndex + 1) % demoSections.length;
        return demoSections[nextIndex];
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [userInteracted]);

  // Animation des compteurs de stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [statsVisible]);

  // Compteur animé pour stat 1
  useEffect(() => {
    if (statsVisible && currentStat1 < 40) {
      const timer = setTimeout(() => {
        setCurrentStat1((prev) => Math.min(prev + 1, 40));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [statsVisible, currentStat1]);

  // Compteur animé pour stat 2
  useEffect(() => {
    if (statsVisible && currentStat2 < 95) {
      const timer = setTimeout(() => {
        setCurrentStat2((prev) => Math.min(prev + 2, 95));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [statsVisible, currentStat2]);

  // Animation des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation du workflow
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWorkflowStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDemoClick = (section: string) => {
    setUserInteracted(true);
    setActiveDemo(section);
  };

  return {
    activeDemo,
    userInteracted,
    statsVisible,
    currentStat1,
    currentStat2,
    currentTestimonial,
    activeWorkflowStep,
    sliderPosition,
    openFaqIndex,
    statsRef,
    demoSections,
    handleDemoClick,
    setSliderPosition,
    setOpenFaqIndex,
  };
}
