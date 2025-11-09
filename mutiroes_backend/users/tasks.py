"""
Celery tasks for user notifications and gamification
"""
from celery import shared_task
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task
def update_user_statistics(user_id):
    """
    Update user statistics after event participation
    """
    try:
        from .models import UserStats, EventParticipant
        
        user = User.objects.get(id=user_id)
        stats, created = UserStats.objects.get_or_create(user=user)
        
        # Count confirmed participations
        confirmed_events = EventParticipant.objects.filter(
            user=user,
            status='confirmed'
        ).count()
        
        stats.total_events_participated = confirmed_events
        stats.save()
        
        logger.info(f"Updated stats for user {user_id}")
        return f"Updated stats for user {user_id}"
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return None


@shared_task
def check_and_award_badges(user_id):
    """
    Check if user qualifies for new badges and award them
    """
    try:
        from .models import UserStats, Badge, UserBadge
        
        user = User.objects.get(id=user_id)
        stats = UserStats.objects.filter(user=user).first()
        
        if not stats:
            return "No stats found for user"
        
        # Check badge criteria
        badge_criteria = {
            'first_event': stats.total_events_participated >= 1,
            'five_events': stats.total_events_participated >= 5,
            'ten_events': stats.total_events_participated >= 10,
            'organizer': stats.total_events_organized >= 1,
        }
        
        awarded = []
        for badge_type, qualifies in badge_criteria.items():
            if qualifies:
                badge = Badge.objects.filter(badge_type=badge_type).first()
                if badge:
                    user_badge, created = UserBadge.objects.get_or_create(
                        user=user,
                        badge=badge
                    )
                    if created:
                        awarded.append(badge.name)
        
        logger.info(f"Awarded {len(awarded)} badges to user {user_id}")
        return f"Awarded badges: {', '.join(awarded)}"
        
    except Exception as exc:
        logger.error(f"Error awarding badges: {str(exc)}")
        return None


@shared_task
def send_push_notification(user_id, title, message):
    """
    Send push notification to user (placeholder for future implementation)
    """
    try:
        user = User.objects.get(id=user_id)
        
        # TODO: Implement actual push notification service (FCM, APNS, etc)
        logger.info(f"Push notification to {user.email}: {title} - {message}")
        
        return f"Notification sent to {user.email}"
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return None
