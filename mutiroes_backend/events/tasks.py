"""
Celery tasks for asynchronous processing
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Event, EventParticipant
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task(bind=True, max_retries=3)
def send_event_notification_email(self, event_id, user_id, notification_type):
    """
    Send event-related notification emails
    """
    try:
        event = Event.objects.get(id=event_id)
        user = User.objects.get(id=user_id)
        
        subject_map = {
            'registration': f'Confirmação de inscrição - {event.title}',
            'reminder': f'Lembrete: {event.title} acontece em breve!',
            'update': f'Atualização do evento - {event.title}',
            'cancellation': f'Cancelamento do evento - {event.title}',
        }
        
        message = f"""
        Olá {user.first_name},
        
        Este é um email sobre o evento: {event.title}
        Data: {event.start_date.strftime('%d/%m/%Y %H:%M')}
        Local: {event.address}, {event.city} - {event.state}
        
        Atenciosamente,
        Equipe Mutirões
        """
        
        send_mail(
            subject=subject_map.get(notification_type, 'Notificação de evento'),
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Email sent to {user.email} for event {event_id}")
        return f"Email sent successfully to {user.email}"
        
    except Exception as exc:
        logger.error(f"Error sending email: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


@shared_task
def send_bulk_event_reminders(event_id):
    """
    Send reminder emails to all participants of an event
    """
    try:
        event = Event.objects.get(id=event_id)
        participants = EventParticipant.objects.filter(
            event=event,
            status='confirmed'
        ).select_related('user')
        
        sent_count = 0
        for participant in participants:
            send_event_notification_email.delay(
                event_id=event.id,
                user_id=participant.user.id,
                notification_type='reminder'
            )
            sent_count += 1
        
        logger.info(f"Scheduled {sent_count} reminder emails for event {event_id}")
        return f"Scheduled {sent_count} reminder emails"
        
    except Event.DoesNotExist:
        logger.error(f"Event {event_id} not found")
        return f"Event {event_id} not found"


@shared_task
def process_event_report_statistics(event_id):
    """
    Process and calculate event report statistics
    """
    try:
        from .models import EventReport
        
        event = Event.objects.get(id=event_id)
        report = EventReport.objects.filter(event=event).first()
        
        if not report:
            logger.warning(f"No report found for event {event_id}")
            return "No report found"
        
        # Calculate environmental impact metrics
        impact_data = {
            'carbon_offset': report.trees_planted * 22,  # kg CO2 per tree/year
            'waste_diverted': report.trash_collected_kg + report.recyclable_material_kg,
            'area_impact': report.area_cleaned_m2,
        }
        
        logger.info(f"Processed statistics for event {event_id}: {impact_data}")
        return impact_data
        
    except Event.DoesNotExist:
        logger.error(f"Event {event_id} not found")
        return None


@shared_task
def generate_monthly_impact_report():
    """
    Generate monthly environmental impact report across all events
    """
    from datetime import datetime, timedelta
    from .models import EventReport
    
    try:
        last_month = datetime.now() - timedelta(days=30)
        reports = EventReport.objects.filter(
            created_at__gte=last_month
        )
        
        total_impact = {
            'total_participants': sum(r.total_participants for r in reports),
            'total_hours': sum(r.total_hours for r in reports),
            'total_trash': sum(r.trash_collected_kg for r in reports),
            'total_trees': sum(r.trees_planted for r in reports),
            'total_area': sum(r.area_cleaned_m2 for r in reports),
            'total_recyclable': sum(r.recyclable_material_kg for r in reports),
        }
        
        logger.info(f"Monthly impact report generated: {total_impact}")
        return total_impact
        
    except Exception as exc:
        logger.error(f"Error generating monthly report: {str(exc)}")
        return None


@shared_task
def cleanup_expired_events():
    """
    Mark events as inactive if they have passed
    """
    from datetime import datetime
    
    try:
        now = datetime.now()
        expired_events = Event.objects.filter(
            end_date__lt=now,
            status='published'
        )
        
        count = expired_events.update(status='completed')
        logger.info(f"Marked {count} events as completed")
        return f"Marked {count} events as completed"
        
    except Exception as exc:
        logger.error(f"Error cleaning up events: {str(exc)}")
        return None
