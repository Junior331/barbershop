// @ts-nocheck
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Layout } from "@/components/templates";
import { Card, Header } from "@/components/organisms";
import { Text, Title, Button, Input } from "@/components/elements";
import { formatter } from "@/utils/utils";
import { getIcons } from "@/assets/icons";
import { paymentsService } from "@/services";

interface PendingCardPayment {
  appointmentId: string;
  amount: number;
  method: string;
  description: string;
}

export const CardPayment = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState<PendingCardPayment | null>(null);
  const [processing, setProcessing] = useState(false);

  // Dados do cartão
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const [saveCard, setSaveCard] = useState(false);

  // Validação
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const data = localStorage.getItem('pendingCardPayment');
    if (!data) {
      toast.error('Dados de pagamento não encontrados');
      navigate('/');
      return;
    }

    const payment: PendingCardPayment = JSON.parse(data);
    setPaymentData(payment);
  }, [navigate]);

  // Formatação do número do cartão (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
      setErrors({ ...errors, cardNumber: '' });
    }
  };

  // Formatação da data de expiração (MM/YY)
  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    if (value.length <= 5) {
      setExpirationDate(value);
      setErrors({ ...errors, expirationDate: '' });
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCvv(value);
      setErrors({ ...errors, cvv: '' });
    }
  };

  const handleCardholderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCardholderName(value);
    setErrors({ ...errors, cardholderName: '' });
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Número do cartão (14-16 dígitos)
    if (!cardNumber || cardNumber.length < 14) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }

    // Nome do titular
    if (!cardholderName || cardholderName.length < 3) {
      newErrors.cardholderName = 'Nome do titular é obrigatório';
    }

    // Data de expiração
    if (!expirationDate || expirationDate.length !== 5) {
      newErrors.expirationDate = 'Data inválida';
    } else {
      const [month, year] = expirationDate.split('/');
      const monthNum = parseInt(month);
      const yearNum = parseInt('20' + year);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (monthNum < 1 || monthNum > 12) {
        newErrors.expirationDate = 'Mês inválido';
      } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        newErrors.expirationDate = 'Cartão expirado';
      }
    }

    // CVV
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Detectar bandeira do cartão
  const getCardBrand = (number: string): string => {
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('6')) return 'Elo';
    if (number.startsWith('3')) return 'Amex';
    return 'Cartão';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !paymentData) return;

    setProcessing(true);

    try {
      const [month, year] = expirationDate.split('/');

      const cardPaymentData = {
        appointmentId: paymentData.appointmentId,
        amount: paymentData.amount,
        cardNumber: cardNumber,
        securityCode: cvv,
        expirationMonth: parseInt(month),
        expirationYear: parseInt('20' + year),
        cardholderName: cardholderName,
        installments: installments,
        saveCard: saveCard,
        description: paymentData.description,
      };

      const result = await paymentsService.createCardPayment(cardPaymentData);

      if (result.status === 'paid') {
        toast.success('Pagamento aprovado! Seu agendamento foi confirmado.');
        localStorage.removeItem('pendingCardPayment');
        navigate(`/booking-confirmation/${appointmentId}`);
      } else if (result.status === 'pending') {
        toast.info('Pagamento em análise. Você receberá uma confirmação em breve.');
        localStorage.removeItem('pendingCardPayment');
        navigate(`/booking-confirmation/${appointmentId}`);
      } else {
        throw new Error('Pagamento não foi aprovado');
      }

    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Erro ao processar pagamento';

      if (errorMessage.includes('insufficient_amount') || errorMessage.includes('saldo')) {
        toast.error('Saldo insuficiente no cartão');
      } else if (errorMessage.includes('card_disabled') || errorMessage.includes('bloqueado')) {
        toast.error('Cartão bloqueado ou desabilitado');
      } else if (errorMessage.includes('invalid') || errorMessage.includes('inválido')) {
        toast.error('Dados do cartão inválidos. Verifique as informações.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!paymentData) return null;

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title="Pagamento com Cartão" backPath={`/payment`} />

        <div className="flex flex-col w-full justify-between items-start gap-6 px-4 pb-32 overflow-auto h-[calc(100vh-0px)]">

          {/* Valor a pagar */}
          <Card className="w-full">
            <div className="p-4 bg-[#6C8762] bg-opacity-10">
              <Text className="text-center text-sm text-gray-700 mb-1">
                Valor a pagar
              </Text>
              <Title className="text-center text-2xl text-[#6C8762]">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(paymentData.amount)}
              </Title>
            </div>
          </Card>

          {/* Formulário do Cartão */}
          <Card className="w-full">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <Title className="mb-2">Dados do Cartão</Title>

              {/* Número do Cartão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do cartão
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatCardNumber(cardNumber)}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C8762] ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength={19}
                  />
                  {cardNumber.length >= 1 && (
                    <div className="absolute right-3 top-3">
                      <Text className="text-xs font-medium text-gray-600">
                        {getCardBrand(cardNumber)}
                      </Text>
                    </div>
                  )}
                </div>
                {errors.cardNumber && (
                  <Text className="text-xs text-red-500 mt-1">{errors.cardNumber}</Text>
                )}
              </div>

              {/* Nome do Titular */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do titular (como está no cartão)
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={handleCardholderNameChange}
                  placeholder="NOME COMPLETO"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C8762] ${
                    errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cardholderName && (
                  <Text className="text-xs text-red-500 mt-1">{errors.cardholderName}</Text>
                )}
              </div>

              {/* Data de Expiração e CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validade
                  </label>
                  <input
                    type="text"
                    value={expirationDate}
                    onChange={handleExpirationChange}
                    placeholder="MM/AA"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C8762] ${
                      errors.expirationDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength={5}
                  />
                  {errors.expirationDate && (
                    <Text className="text-xs text-red-500 mt-1">{errors.expirationDate}</Text>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="000"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C8762] ${
                      errors.cvv ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <Text className="text-xs text-red-500 mt-1">{errors.cvv}</Text>
                  )}
                </div>
              </div>

              {/* Parcelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parcelas
                </label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C8762]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <option key={i} value={i}>
                      {i}x de {formatter({
                        type: "pt-BR",
                        currency: "BRL",
                        style: "currency",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(paymentData.amount / i)}
                      {i === 1 ? ' (sem juros)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salvar Cartão */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="checkbox checkbox-success"
                />
                <label htmlFor="saveCard" className="text-sm text-gray-700">
                  Salvar cartão para compras futuras
                </label>
              </div>
            </form>
          </Card>

          {/* Segurança */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <img
                src={getIcons("shield")}
                alt="Segurança"
                className="w-5 h-5 mt-0.5"
              />
              <div>
                <Text className="font-medium text-blue-800 mb-1">
                  Pagamento seguro
                </Text>
                <Text className="text-sm text-blue-700">
                  Seus dados são protegidos com criptografia de ponta a ponta.
                  Não armazenamos informações sensíveis do seu cartão.
                </Text>
              </div>
            </div>
          </div>

          {/* Espaçador */}
          <div className="h-20" />
        </div>

        {/* Botão fixo */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t pt-4 pb-6 px-4">
          <Button
            type="submit"
            className="max-w-80 m-auto h-14 w-full"
            onClick={handleSubmit}
            disabled={processing}
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm"></div>
                Processando pagamento...
              </div>
            ) : (
              `Pagar ${formatter({
                type: "pt-BR",
                currency: "BRL",
                style: "currency",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(paymentData.amount)}`
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};
