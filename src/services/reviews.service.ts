import { api } from './api';

export interface Review {
  id: string;
  clientId: string;
  barberId: string;
  appointmentId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  barber: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  appointment: {
    id: string;
    scheduledTo: string;
    scheduledTime: string;
    service: {
      id: string;
      name: string;
      imageUrl?: string;
    };
  };
}

export interface CreateReviewDto {
  appointmentId: string;
  barberId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface BarberRatingStats {
  barberId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number; // rating -> count
  };
}

class ReviewsService {
  // Criar uma nova avaliação
  async create(dto: CreateReviewDto): Promise<Review> {
    const response = await api.post('/reviews', dto);
    return response.data;
  }

  // Atualizar uma avaliação existente
  async update(reviewId: string, dto: UpdateReviewDto): Promise<Review> {
    const response = await api.patch(`/reviews/${reviewId}`, dto);
    return response.data;
  }

  // Obter avaliação por ID
  async getById(reviewId: string): Promise<Review> {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  }

  // Obter avaliações de um barbeiro
  async getByBarber(
    barberId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(`/reviews/barber/${barberId}?${params}`);
    return response.data;
  }

  // Obter minhas avaliações (como cliente)
  async getMyReviews(
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(`/reviews/my-reviews?${params}`);
    return response.data;
  }

  // Obter avaliação específica de um agendamento
  async getByAppointment(appointmentId: string): Promise<Review | null> {
    try {
      const response = await api.get(`/reviews/appointment/${appointmentId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Verificar se posso avaliar um agendamento
  async canReviewAppointment(appointmentId: string): Promise<{ canReview: boolean; reason?: string }> {
    const response = await api.get(`/reviews/can-review/${appointmentId}`);
    return response.data;
  }

  // Obter estatísticas de avaliação de um barbeiro
  async getBarberRatingStats(barberId: string): Promise<BarberRatingStats> {
    const response = await api.get(`/reviews/stats/barber/${barberId}`);
    return response.data;
  }

  // Excluir uma avaliação (apenas para admins ou o próprio cliente)
  async delete(reviewId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }

  // Métodos de conveniência para trabalhar com avaliações

  // Formatar nota com estrelas
  formatRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '★'.repeat(fullStars) +
           (hasHalfStar ? '☆' : '') +
           '☆'.repeat(emptyStars);
  }

  // Obter cor baseada na nota
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-lime-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  }

  // Obter texto descritivo da nota
  getRatingText(rating: number): string {
    if (rating >= 4.5) return 'Excelente';
    if (rating >= 4.0) return 'Muito Bom';
    if (rating >= 3.5) return 'Bom';
    if (rating >= 3.0) return 'Regular';
    if (rating >= 2.0) return 'Ruim';
    return 'Muito Ruim';
  }

  // Validar dados de avaliação
  validateReview(rating: number, comment?: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rating || rating < 1 || rating > 5) {
      errors.push('A nota deve estar entre 1 e 5 estrelas');
    }

    if (comment && comment.trim().length < 10) {
      errors.push('O comentário deve ter pelo menos 10 caracteres');
    }

    if (comment && comment.trim().length > 500) {
      errors.push('O comentário deve ter no máximo 500 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Formatar data da avaliação
  formatReviewDate(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hoje';
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      return `${diffInDays} dias atrás`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} semana${weeks > 1 ? 's' : ''} atrás`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} ano${years > 1 ? 's' : ''} atrás`;
    }
  }

  // Calcular porcentagem de cada estrela na distribuição
  calculateRatingPercentages(distribution: { [key: number]: number }, total: number): { [key: number]: number } {
    const percentages: { [key: number]: number } = {};

    for (let i = 1; i <= 5; i++) {
      const count = distribution[i] || 0;
      percentages[i] = total > 0 ? Math.round((count / total) * 100) : 0;
    }

    return percentages;
  }

  // Gerar resumo de avaliações
  generateReviewSummary(stats: BarberRatingStats): string {
    const { averageRating, totalReviews } = stats;

    if (totalReviews === 0) {
      return 'Nenhuma avaliação ainda';
    }

    const ratingText = this.getRatingText(averageRating);
    const starsText = averageRating.toFixed(1);

    return `${starsText} ★ • ${ratingText} • ${totalReviews} avaliação${totalReviews > 1 ? 'ões' : ''}`;
  }
}

export const reviewsService = new ReviewsService();