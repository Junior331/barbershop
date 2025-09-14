import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { getIcons } from '@/assets/icons';
import { cn } from '@/utils/utils';
import { reviewsService } from '@/services/reviews.service';
import type { Review, BarberRatingStats } from '@/services/reviews.service';
import { CircleIcon, Text, Title, Button, Loading } from '@/components/elements';

interface BarberReviewsProps {
  barberId: string;
  className?: string;
  showStats?: boolean;
  limit?: number;
}

export const BarberReviews = ({
  barberId,
  className,
  showStats = true,
  limit = 10
}: BarberReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<BarberRatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadReviews(1);
    if (showStats) {
      loadStats();
    }
  }, [barberId, showStats]);

  const loadReviews = async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await reviewsService.getByBarber(barberId, pageNum, limit);

      if (append) {
        setReviews(prev => [...prev, ...response.data]);
      } else {
        setReviews(response.data);
      }

      setHasMore(response.meta.page < response.meta.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await reviewsService.getBarberRatingStats(barberId);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadReviews(page + 1, true);
    }
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  if (loading) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Loading />
      </div>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className={className}>
      {/* Estatísticas */}
      {showStats && stats && stats.totalReviews > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#6C8762]">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <img
                    key={star}
                    src={getIcons(star <= Math.round(stats.averageRating) ? "star_solid_green" : "star_outlined_green")}
                    alt="Estrela"
                    className="w-4 h-4"
                  />
                ))}
              </div>
              <Text className="text-sm text-gray-600">
                {stats.totalReviews} avaliação{stats.totalReviews > 1 ? 'ões' : ''}
              </Text>
            </div>

            <div className="flex-1">
              {/* Distribuição das estrelas */}
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <Text className="text-sm w-3">{rating}</Text>
                    <img
                      src={getIcons("star_solid_green")}
                      alt="Estrela"
                      className="w-3 h-3"
                    />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#6C8762] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <Text className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lista de avaliações */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <img
            src={getIcons("star_outlined_green")}
            alt="Sem avaliações"
            className="w-16 h-16 opacity-50 mx-auto mb-4"
          />
          <Title className="text-gray-500 mb-2">Nenhuma avaliação ainda</Title>
          <Text className="text-gray-400">
            Este barbeiro ainda não recebeu avaliações
          </Text>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              {/* Cabeçalho da avaliação */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CircleIcon className="!w-10 !h-10">
                    <img
                      src={review.client.avatarUrl || getIcons("fallback")}
                      alt={review.client.name}
                      className="w-full h-full object-cover"
                    />
                  </CircleIcon>
                  <div>
                    <Text className="font-medium">{review.client.name}</Text>
                    <Text className="text-sm text-gray-500">
                      {reviewsService.formatReviewDate(review.createdAt)}
                    </Text>
                  </div>
                </div>

                {/* Avaliação */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <img
                      key={star}
                      src={getIcons(star <= review.rating ? "star_solid_green" : "star_outlined_green")}
                      alt="Estrela"
                      className="w-4 h-4"
                    />
                  ))}
                </div>
              </div>

              {/* Serviço realizado */}
              {review.appointment && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded">
                  <CircleIcon className="!w-6 !h-6">
                    <img
                      src={review.appointment.service.imageUrl || getIcons("fallback")}
                      alt={review.appointment.service.name}
                      className="w-full h-full object-cover"
                    />
                  </CircleIcon>
                  <Text className="text-sm font-medium">
                    {review.appointment.service.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    • {new Date(review.appointment.scheduledTo).toLocaleDateString('pt-BR')}
                  </Text>
                </div>
              )}

              {/* Comentário */}
              {review.comment && (
                <Text className="text-gray-700 leading-relaxed">
                  "{review.comment}"
                </Text>
              )}
            </motion.div>
          ))}

          {/* Botões de carregamento */}
          {reviews.length > 3 && (
            <div className="text-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={toggleShowAll}
                className="mb-3"
              >
                {showAll ? 'Ver menos avaliações' : `Ver todas as ${reviews.length} avaliações`}
              </Button>
            </div>
          )}

          {showAll && hasMore && (
            <div className="text-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="loading loading-spinner loading-sm"></div>
                    Carregando...
                  </div>
                ) : (
                  'Carregar mais avaliações'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};