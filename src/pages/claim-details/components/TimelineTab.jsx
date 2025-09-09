import React from 'react';
import Icon from '../../../components/AppIcon';

const TimelineTab = ({ timeline }) => {
  const getEventIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'created':
        return 'Plus';
      case 'submitted':
        return 'Send';
      case 'document_uploaded':
        return 'Upload';
      case 'under_review':
        return 'Eye';
      case 'approved':
        return 'CheckCircle';
      case 'rejected':
        return 'XCircle';
      case 'comment_added':
        return 'MessageCircle';
      case 'document_validated':
        return 'FileCheck';
      case 'payment_processed':
        return 'CreditCard';
      case 'withdrawn':
        return 'ArrowLeft';
      default:
        return 'Circle';
    }
  };

  const getEventColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'created':
        return 'text-accent bg-accent';
      case 'submitted':
        return 'text-primary bg-primary';
      case 'document_uploaded':
        return 'text-secondary bg-secondary';
      case 'under_review':
        return 'text-warning bg-warning';
      case 'approved':
        return 'text-success bg-success';
      case 'rejected':
        return 'text-error bg-error';
      case 'comment_added':
        return 'text-accent bg-accent';
      case 'document_validated':
        return 'text-success bg-success';
      case 'payment_processed':
        return 'text-success bg-success';
      case 'withdrawn':
        return 'text-muted-foreground bg-muted-foreground';
      default:
        return 'text-muted-foreground bg-muted-foreground';
    }
  };

  const getEventTitle = (type) => {
    switch (type?.toLowerCase()) {
      case 'created':
        return 'Reclamación Creada';
      case 'submitted':
        return 'Reclamación Enviada';
      case 'document_uploaded':
        return 'Documento Subido';
      case 'under_review':
        return 'En Revisión';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      case 'comment_added':
        return 'Comentario Añadido';
      case 'document_validated':
        return 'Documento Validado';
      case 'payment_processed':
        return 'Pago Procesado';
      case 'withdrawn':
        return 'Retirada';
      default:
        return 'Evento';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(date));
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(date));
  };

  const groupEventsByDate = (events) => {
    const groups = {};
    events?.forEach(event => {
      const date = new Date(event.timestamp)?.toDateString();
      if (!groups?.[date]) {
        groups[date] = [];
      }
      groups?.[date]?.push(event);
    });
    return groups;
  };

  const groupedEvents = groupEventsByDate(timeline);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Cronología de la Reclamación
        </h3>
        <div className="text-sm text-text-secondary">
          {timeline?.length} eventos registrados
        </div>
      </div>
      {Object.keys(groupedEvents)?.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Clock" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay eventos
          </h3>
          <p className="text-text-secondary">
            Los eventos de la reclamación aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents)?.sort(([a], [b]) => new Date(b) - new Date(a))?.map(([date, events]) => (
              <div key={date} className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center">
                  <div className="bg-muted px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-foreground">
                      {new Intl.DateTimeFormat('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })?.format(new Date(date))}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-border ml-4"></div>
                </div>

                {/* Events for this date */}
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>
                  
                  <div className="space-y-6">
                    {events?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))?.map((event, index) => (
                        <div key={event?.id} className="relative flex items-start space-x-4">
                          {/* Timeline dot */}
                          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getEventColor(event?.type)}`}>
                            <Icon 
                              name={getEventIcon(event?.type)} 
                              size={20} 
                              className="text-white" 
                            />
                          </div>

                          {/* Event content */}
                          <div className="flex-1 bg-card rounded-lg border border-border p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="text-sm font-medium text-foreground">
                                    {getEventTitle(event?.type)}
                                  </h4>
                                  <span className="text-xs text-text-secondary">
                                    {formatTime(event?.timestamp)}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-text-secondary mb-2">
                                  {event?.description}
                                </p>

                                {event?.user && (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium">
                                        {event?.user?.name?.charAt(0)}
                                      </span>
                                    </div>
                                    <span className="text-xs text-text-secondary">
                                      {event?.user?.name} - {event?.user?.role}
                                    </span>
                                  </div>
                                )}

                                {/* Additional details */}
                                {event?.details && (
                                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                    <div className="space-y-1">
                                      {Object.entries(event?.details)?.map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-xs">
                                          <span className="text-text-secondary capitalize">
                                            {key?.replace('_', ' ')}:
                                          </span>
                                          <span className="text-foreground font-medium">
                                            {typeof value === 'object' ? JSON.stringify(value) : value}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Attachments */}
                                {event?.attachments && event?.attachments?.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs text-text-secondary mb-2">Adjuntos:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {event?.attachments?.map((attachment, idx) => (
                                        <div key={idx} className="flex items-center space-x-1 bg-muted px-2 py-1 rounded text-xs">
                                          <Icon name="Paperclip" size={12} />
                                          <span>{attachment?.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TimelineTab;