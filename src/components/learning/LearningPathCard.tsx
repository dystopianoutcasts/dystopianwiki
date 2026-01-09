import { Link } from 'react-router-dom';
import type { Difficulty } from '../../types/wiki';

interface LearningPathCardProps {
  stepNumber: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  isCompleted: boolean;
  isActive: boolean;
  url: string;
  estimatedMinutes?: number;
}

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function LearningPathCard({
  stepNumber,
  title,
  description,
  difficulty,
  isCompleted,
  isActive,
  url,
  estimatedMinutes,
}: LearningPathCardProps) {
  const cardClasses = [
    'learning-card',
    isCompleted && 'learning-card--completed',
    isActive && 'learning-card--active',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Link to={url} className={cardClasses}>
      <div className="learning-card__header">
        <span className="learning-card__step">{stepNumber}</span>
        {isCompleted && (
          <span className="learning-card__check" aria-label="Completed">
            &#10003;
          </span>
        )}
      </div>

      <h3 className="learning-card__title">{title}</h3>

      <p className="learning-card__description">{description}</p>

      <div className="learning-card__footer">
        <span className={`learning-card__difficulty learning-card__difficulty--${difficulty}`}>
          {difficultyLabels[difficulty]}
        </span>
        {estimatedMinutes && (
          <span className="learning-card__time">{estimatedMinutes} min</span>
        )}
      </div>
    </Link>
  );
}
