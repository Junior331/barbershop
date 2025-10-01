import { cn } from "@/utils/utils";
import { Appointment, appointmentsService } from "@/services/appointments.service";

interface AppointmentsListProps {
  appointments: Appointment[];
  loading?: boolean;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export const AppointmentsList = ({
  appointments,
  loading = false,
  onAppointmentClick
}: AppointmentsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="loading loading-spinner loading-md"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">
          Nenhum agendamento encontrado para esta data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => {
        const statusInfo = appointmentsService.getStatusDisplay(appointment.status);

        return (
          <div
            key={appointment.id}
            className={cn(
              "bg-white rounded-lg border border-gray-200 p-4 shadow-sm",
              onAppointmentClick && "cursor-pointer hover:shadow-md transition-shadow"
            )}
            onClick={() => onAppointmentClick?.(appointment)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {appointment.client.name}
                  </h3>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      statusInfo.color,
                      statusInfo.bgColor
                    )}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <p className="flex items-center gap-1">
                    <span className="font-medium">Serviço:</span>
                    {appointment.service.name}
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="font-medium">Horário:</span>
                    {appointment.scheduledTime}
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="font-medium">Duração:</span>
                    {appointment.service.durationMinutes}min
                  </p>
                  {appointment.client.phone && (
                    <p className="flex items-center gap-1">
                      <span className="font-medium">Telefone:</span>
                      {appointment.client.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900 text-sm">
                  R$ {appointment.totalPrice.toFixed(2)}
                </p>
                {appointment.client.avatarUrl && (
                  <img
                    src={appointment.client.avatarUrl}
                    alt={appointment.client.name}
                    className="w-8 h-8 rounded-full mt-2 ml-auto"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};