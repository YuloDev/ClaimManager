import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CommentsSection = ({ comments, onAddComment, userRole, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(date));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!newComment?.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment({
        content: newComment?.trim(),
        user: currentUser,
        timestamp: new Date(),
        type: 'comment'
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserInitials = (name) => {
    return name?.split(' ')?.map(n => n?.charAt(0))?.join('')?.toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-error text-error-foreground';
      case 'analyst':
        return 'bg-accent text-accent-foreground';
      case 'affiliate':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'analyst':
        return 'Analista';
      case 'affiliate':
        return 'Afiliado';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Comentarios ({comments?.length})
        </h3>
      </div>
      {/* Add Comment Form */}
      <div className="bg-card rounded-lg border border-border p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium">
                {getUserInitials(currentUser?.name)}
              </span>
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e?.target?.value)}
                className="mb-3"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser?.role)}`}>
                    {getRoleLabel(currentUser?.role)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewComment('')}
                    disabled={!newComment?.trim()}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    loading={isSubmitting}
                    disabled={!newComment?.trim()}
                  >
                    <Icon name="Send" size={16} className="mr-2" />
                    Comentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      {/* Comments List */}
      <div className="space-y-4">
        {comments?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageCircle" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay comentarios
            </h3>
            <p className="text-text-secondary">
              Sé el primero en añadir un comentario
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))?.map((comment) => (
                <div key={comment?.id} className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {getUserInitials(comment?.user?.name)}
                      </span>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-foreground">
                          {comment?.user?.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(comment?.user?.role)}`}>
                          {getRoleLabel(comment?.user?.role)}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {formatDate(comment?.timestamp)}
                        </span>
                      </div>

                      <div className="text-sm text-foreground leading-relaxed mb-3">
                        {comment?.content}
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-text-secondary hover:text-foreground">
                          <Icon name="ThumbsUp" size={14} className="mr-1" />
                          Me gusta
                        </Button>
                        <Button variant="ghost" size="sm" className="text-text-secondary hover:text-foreground">
                          <Icon name="MessageCircle" size={14} className="mr-1" />
                          Responder
                        </Button>
                        {(comment?.user?.id === currentUser?.id || userRole === 'admin') && (
                          <Button variant="ghost" size="sm" className="text-error hover:text-error">
                            <Icon name="Trash2" size={14} className="mr-1" />
                            Eliminar
                          </Button>
                        )}
                      </div>

                      {/* Attachments */}
                      {comment?.attachments && comment?.attachments?.length > 0 && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-text-secondary mb-2">Adjuntos:</p>
                          <div className="flex flex-wrap gap-2">
                            {comment?.attachments?.map((attachment, idx) => (
                              <div key={idx} className="flex items-center space-x-2 bg-card px-3 py-2 rounded border border-border">
                                <Icon name="Paperclip" size={14} className="text-text-secondary" />
                                <span className="text-xs text-foreground">{attachment?.name}</span>
                                <Button variant="ghost" size="sm" className="p-0 h-auto">
                                  <Icon name="Download" size={12} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment?.replies && comment?.replies?.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                          {comment?.replies?.map((reply) => (
                            <div key={reply?.id} className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium">
                                  {getUserInitials(reply?.user?.name)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-foreground">
                                    {reply?.user?.name}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(reply?.user?.role)}`}>
                                    {getRoleLabel(reply?.user?.role)}
                                  </span>
                                  <span className="text-xs text-text-secondary">
                                    {formatDate(reply?.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground">
                                  {reply?.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;