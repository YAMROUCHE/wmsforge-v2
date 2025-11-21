import { useState, useEffect } from 'react';
import { Star, X, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { fetchAPI } from '../lib/api';
import { logger } from '@/lib/logger';
import { useNotifications } from '@/contexts/NotificationContext';

interface ReviewPromptProps {
  onDismiss?: () => void;
}

export default function ReviewPrompt({ onDismiss }: ReviewPromptProps) {
  const { addNotification } = useNotifications();
  const [shouldShow, setShouldShow] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkIfShouldShow();
  }, []);

  const checkIfShouldShow = async () => {
    try {
      const response = await fetchAPI('/api/testimonials/prompt/should-show') as any;
      if (response.shouldShow) {
        setShouldShow(true);
        // Track that prompt was shown
        await fetchAPI('/api/testimonials/prompt/track', {
          method: 'POST',
          body: JSON.stringify({
            prompt_type: 'in_app',
            was_clicked: false
          })
        });
      }
    } catch (error) {
      logger.error('Error checking review prompt:', error);
    }
  };

  const handleDismiss = async () => {
    setShouldShow(false);
    if (onDismiss) onDismiss();
  };

  const handleLeaveReview = async (type: 'internal' | 'g2' | 'capterra') => {
    // Track click
    await fetchAPI('/api/testimonials/prompt/track', {
      method: 'POST',
      body: JSON.stringify({
        prompt_type: type === 'internal' ? 'in_app' : 'external',
        was_clicked: true
      })
    });

    if (type === 'internal') {
      setShowForm(true);
    } else if (type === 'g2') {
      window.open('https://www.g2.com/products/1wms-io/reviews/start', '_blank');
      handleDismiss();
    } else if (type === 'capterra') {
      window.open('https://www.capterra.com/reviews/new/1wms-io', '_blank');
      handleDismiss();
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem('wms_user') || '{}');

      await fetchAPI('/api/testimonials', {
        method: 'POST',
        body: JSON.stringify({
          rating,
          title,
          comment,
          author_name: user.name || 'Anonymous',
          author_role: user.role || null,
          author_company: user.organizationName || null
        })
      });

      addNotification({
        type: 'success',
        title: 'Avis envoyé',
        message: 'Merci pour votre avis ! Il sera examiné par notre équipe.'
      });
      setShouldShow(false);
      if (onDismiss) onDismiss();
    } catch (error) {
      logger.error('Error submitting review:', error);
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de la soumission de l\'avis. Veuillez réessayer.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldShow) return null;

  if (showForm) {
    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-4 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Partagez votre expérience
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Aidez-nous à améliorer 1WMS.io
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitReview}>
          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title (optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre (optionnel)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Résumé de votre expérience"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Commentaire *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Que pensez-vous de 1WMS.io ? Comment vous aide-t-il au quotidien ?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white h-24 resize-none"
              required
              minLength={10}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum 10 caractères
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={!rating || comment.length < 10 || isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer mon avis'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Retour
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-4 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Vous aimez 1WMS.io ?
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Partagez votre expérience en 2 minutes
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleLeaveReview('internal')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          Laisser un avis
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => handleLeaveReview('g2')}
            className="flex-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            G2
          </button>
          <button
            onClick={() => handleLeaveReview('capterra')}
            className="flex-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Capterra
          </button>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          💝 En remerciement, recevez 1 mois gratuit sur votre abonnement
        </p>
      </div>
    </div>
  );
}
