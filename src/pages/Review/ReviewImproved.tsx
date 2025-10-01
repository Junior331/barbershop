// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { getIcons } from "@/assets/icons";
import { cn, formatter } from "@/utils/utils";
import { Layout } from "@/components/templates";
import { Card, Header } from "@/components/organisms";
import {
  Text,
  Title,
  Button,
  Loading,
  CircleIcon,
} from "@/components/elements";

import { appointmentsService, reviewsService } from "@/services";
import type { Appointment, Review, CreateReviewDto } from "@/services";

export const ReviewImproved = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!appointmentId) {
        toast.error('ID do agendamento não encontrado');
        navigate('/mybookings');
        return;
      }

      try {
        setLoading(true);

        // Carregar dados em paralelo
        const [appointmentData, existingReviewData, canReviewData] = await Promise.all([
          appointmentsService.getById(appointmentId),
          reviewsService.getByAppointment(appointmentId),
          reviewsService.canReviewAppointment(appointmentId)
        ]);

        setAppointment(appointmentData);
        setExistingReview(existingReviewData);
        setCanReview(canReviewData.canReview);

        // Se já existe avaliação, preencher o formulário
        if (existingReviewData) {
          setRating(existingReviewData.rating);
          setComment(existingReviewData.comment || "");
        }

        if (!canReviewData.canReview && !existingReviewData) {
          toast.error(canReviewData.reason || 'Não é possível avaliar este agendamento');
          navigate('/mybookings');
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do agendamento');
        navigate('/mybookings');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [appointmentId, navigate]);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async () => {
    if (!appointment || !rating) return;

    // Validar dados
    const validation = reviewsService.validateReview(rating, comment);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setSubmitting(true);

    try {
      const reviewData: CreateReviewDto = {
        appointmentId: appointment.id,
        barberId: appointment.barberId,
        rating,
        comment: comment.trim() || undefined
      };

      if (existingReview) {
        // Atualizar avaliação existente
        await reviewsService.update(existingReview.id, {
          rating,
          comment: comment.trim() || undefined
        });
        toast.success('Avaliação atualizada com sucesso!');
      } else {
        // Criar nova avaliação
        await reviewsService.create(reviewData);
        toast.success('Avaliação enviada com sucesso!');
      }

      navigate('/mybookings');

    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    const confirm = window.confirm('Tem certeza que deseja excluir sua avaliação?');
    if (!confirm) return;

    try {
      setSubmitting(true);
      await reviewsService.delete(existingReview.id);
      toast.success('Avaliação excluída com sucesso!');
      navigate('/mybookings');
    } catch (error: any) {
      console.error('Erro ao excluir avaliação:', error);
      toast.error('Erro ao excluir avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingText = (rating: number): string => {
    return reviewsService.getRatingText(rating);
  };

  if (loading) return <Loading />;
  if (!appointment) return <Loading />;

  const displayRating = hoverRating || rating;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header
          title={existingReview ? "Editar Avaliação" : "Avaliar Serviço"}
          backPath="/mybookings"
        />

        <div className="flex flex-col w-full justify-start items-start gap-4 px-4 pb-6 overflow-auto">

          {/* Informações do agendamento */}
          <Card className="w-full">
            <div className="p-4">
              <Title className="mb-4">Detalhes do Serviço</Title>

              {/* Serviço */}
              <div className="flex items-center gap-3 mb-4">
                <CircleIcon className="!w-16 !h-16">
                  <img
                    src={appointment.service.imageUrl || getIcons("fallback")}
                    alt={appointment.service.name}
                    className="w-full h-full object-cover"
                  />
                </CircleIcon>
                <div className="flex-1">
                  <Title className="text-lg">{appointment.service.name}</Title>
                  <Text className="text-gray-600">
                    {appointment.service.durationMinutes} minutos
                  </Text>
                  <Text className="text-[#6C8762] font-medium">
                    {formatter({
                      type: "pt-BR",
                      currency: "BRL",
                      style: "currency",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(appointment.totalPrice)}
                  </Text>
                </div>
              </div>

              {/* Barbeiro */}
              <div className="flex items-center gap-3 mb-4">
                <CircleIcon className="!w-12 !h-12">
                  <img
                    src={appointment.barber.avatarUrl || getIcons("fallback")}
                    alt={appointment.barber.name}
                    className="w-full h-full object-cover"
                  />
                </CircleIcon>
                <div>
                  <Text className="font-medium">{appointment.barber.name}</Text>
                  <Text className="text-gray-600 text-sm">{appointment.barber.role}</Text>
                </div>
              </div>

              {/* Data e local */}
              <div className="flex items-center gap-3 text-gray-600">
                <img
                  src={getIcons("calendar_outlined_green")}
                  alt="Data"
                  className="w-5 h-5"
                />
                <Text className="text-sm">
                  {new Date(appointment.scheduledTo).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} às {appointment.scheduledTime}
                </Text>
              </div>

              <div className="flex items-center gap-3 text-gray-600 mt-2">
                <img
                  src={getIcons("location_outlined_green")}
                  alt="Local"
                  className="w-5 h-5"
                />
                <Text className="text-sm">{appointment.barberShop.name}</Text>
              </div>
            </div>
          </Card>

          {/* Formulário de avaliação */}
          <Card className="w-full">
            <div className="p-4">
              <Title className="mb-4">
                {existingReview ? "Sua Avaliação" : "Como foi sua experiência?"}
              </Title>

              {/* Avaliação por estrelas */}
              <div className="mb-6">
                <Text className="mb-3 text-center">Dê uma nota para o serviço:</Text>
                <div className="flex justify-center items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                    >
                      <img
                        src={getIcons(star <= displayRating ? "star_solid_green" : "star_outlined_green")}
                        alt={`${star} estrela${star > 1 ? 's' : ''}`}
                        className={cn(
                          "w-8 h-8 transition-all",
                          star <= displayRating ? "opacity-100" : "opacity-50"
                        )}
                      />
                    </motion.button>
                  ))}
                </div>

                {displayRating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <Text className={cn(
                      "font-medium",
                      reviewsService.getRatingColor(displayRating)
                    )}>
                      {getRatingText(displayRating)}
                    </Text>
                  </motion.div>
                )}
              </div>

              {/* Comentário */}
              <div className="mb-6">
                <Text className="mb-3">Conte como foi sua experiência:</Text>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Deixe um comentário sobre o serviço, atendimento, ambiente... (opcional)"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#6C8762] focus:border-transparent"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <Text className="text-xs text-gray-500">
                    Mínimo 10 caracteres (opcional)
                  </Text>
                  <Text className={cn(
                    "text-xs",
                    comment.length > 450 ? "text-red-500" : "text-gray-500"
                  )}>
                    {comment.length}/500
                  </Text>
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <Button
                  type="button"
                  className="w-full h-12"
                  onClick={handleSubmit}
                  disabled={!rating || submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="loading loading-spinner loading-sm"></div>
                      {existingReview ? "Atualizando..." : "Enviando..."}
                    </div>
                  ) : (
                    existingReview ? "Atualizar Avaliação" : "Enviar Avaliação"
                  )}
                </Button>

                {existingReview && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    Excluir Avaliação
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Dicas para uma boa avaliação */}
          {!existingReview && (
            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <img
                  src={getIcons("info")}
                  alt="Info"
                  className="w-5 h-5 mt-0.5"
                />
                <div>
                  <Text className="font-medium text-blue-800 mb-2">
                    Dicas para uma boa avaliação:
                  </Text>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Comente sobre a qualidade do corte e acabamento</li>
                    <li>• Mencione o atendimento e pontualidade do barbeiro</li>
                    <li>• Fale sobre o ambiente e limpeza da barbearia</li>
                    <li>• Seja honesto e construtivo em seus comentários</li>
                    <li>• Sua avaliação ajuda outros clientes e o barbeiro</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Histórico da avaliação existente */}
          {existingReview && (
            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
              <Text className="text-sm text-gray-600 mb-2">
                Avaliação criada em: {reviewsService.formatReviewDate(existingReview.createdAt)}
              </Text>
              {existingReview.updatedAt !== existingReview.createdAt && (
                <Text className="text-sm text-gray-600">
                  Última atualização: {reviewsService.formatReviewDate(existingReview.updatedAt)}
                </Text>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};