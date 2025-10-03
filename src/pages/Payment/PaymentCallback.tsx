// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Layout } from "@/components/templates";
import { Header } from "@/components/organisms";
import { Text, Title, Button, Loading } from "@/components/elements";
import { getIcons } from "@/assets/icons";
import { paymentsService } from "@/services";

export const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure' | 'pending'>('loading');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Parâmetros do Mercado Pago
        const collection_id = searchParams.get('collection_id');
        const collection_status = searchParams.get('collection_status');
        const payment_id = searchParams.get('payment_id');
        const status = searchParams.get('status');
        const external_reference = searchParams.get('external_reference');
        const payment_type = searchParams.get('payment_type');
        const merchant_order_id = searchParams.get('merchant_order_id');
        const preference_id = searchParams.get('preference_id');

        console.log('Payment callback params:', {
          collection_id,
          collection_status,
          payment_id,
          status,
          external_reference,
          payment_type,
        });

        // Verificar status do pagamento
        if (collection_status === 'approved' || status === 'approved') {
          setStatus('success');
          setPaymentInfo({
            paymentId: collection_id || payment_id,
            appointmentId: external_reference,
          });
          toast.success('Pagamento aprovado com sucesso!');
        } else if (collection_status === 'pending' || status === 'pending') {
          setStatus('pending');
          setPaymentInfo({
            paymentId: collection_id || payment_id,
            appointmentId: external_reference,
          });
          toast('Pagamento pendente. Aguardando confirmação...', { icon: '⏳' });
        } else {
          setStatus('failure');
          setPaymentInfo({
            paymentId: collection_id || payment_id,
            appointmentId: external_reference,
            reason: collection_status || status,
          });
          toast.error('Pagamento não aprovado.');
        }
      } catch (error) {
        console.error('Erro ao processar callback:', error);
        setStatus('failure');
        toast.error('Erro ao processar pagamento');
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  const handleContinue = () => {
    if (status === 'success' || status === 'pending') {
      // Redirecionar para meus agendamentos
      navigate('/mybookings');
    } else {
      // Redirecionar para página de serviços
      navigate('/schedule');
    }
  };

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-full w-full">
          <Loading />
          <Text className="mt-4">Processando pagamento...</Text>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title="Resultado do Pagamento" backPath="/mybookings" />

        <div className="flex flex-col w-full justify-center items-center gap-6 px-4 py-8">
          {status === 'success' && (
            <div className="w-full max-w-md">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                <img
                  src={getIcons("check")}
                  alt="Sucesso"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <Title className="text-green-800 mb-2">Pagamento Aprovado! ✅</Title>
                <Text className="text-green-700 mb-4">
                  Seu pagamento foi processado com sucesso e seu agendamento foi confirmado.
                </Text>
                {paymentInfo?.paymentId && (
                  <Text className="text-sm text-green-600">
                    ID do pagamento: {paymentInfo.paymentId}
                  </Text>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Text className="text-sm text-blue-800">
                  ℹ️ Você receberá uma confirmação por WhatsApp em breve.
                </Text>
              </div>

              <Button
                type="button"
                className="w-full mt-6"
                onClick={handleContinue}
              >
                Ver Meus Agendamentos
              </Button>
            </div>
          )}

          {status === 'pending' && (
            <div className="w-full max-w-md">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
                <div className="loading loading-spinner loading-lg text-yellow-600 mx-auto mb-4"></div>
                <Title className="text-yellow-800 mb-2">Pagamento Pendente ⏳</Title>
                <Text className="text-yellow-700 mb-4">
                  Seu pagamento está sendo processado. Isso pode levar alguns minutos.
                </Text>
                {paymentInfo?.paymentId && (
                  <Text className="text-sm text-yellow-600">
                    ID do pagamento: {paymentInfo.paymentId}
                  </Text>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Text className="text-sm text-blue-800">
                  ℹ️ Você receberá uma notificação quando o pagamento for confirmado.
                </Text>
              </div>

              <Button
                type="button"
                className="w-full mt-6"
                onClick={handleContinue}
              >
                Ver Meus Agendamentos
              </Button>
            </div>
          )}

          {status === 'failure' && (
            <div className="w-full max-w-md">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                <img
                  src={getIcons("error")}
                  alt="Erro"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <Title className="text-red-800 mb-2">Pagamento Não Aprovado ❌</Title>
                <Text className="text-red-700 mb-4">
                  Não foi possível processar seu pagamento.
                </Text>
                {paymentInfo?.reason && (
                  <Text className="text-sm text-red-600 mb-4">
                    Motivo: {paymentInfo.reason}
                  </Text>
                )}
              </div>

              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Text className="text-sm text-orange-800">
                  ⚠️ Seu agendamento não foi confirmado. Por favor, tente novamente com outro método de pagamento.
                </Text>
              </div>

              <Button
                type="button"
                className="w-full mt-6"
                onClick={handleContinue}
              >
                Tentar Novamente
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
