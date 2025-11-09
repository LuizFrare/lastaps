"""
Health check views for monitoring and service discovery
"""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import redis
import logging
from .resilience import get_circuit_breaker_status

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Comprehensive health check endpoint
    """
    health_status = {
        "status": "healthy",
        "checks": {
            "database": check_database(),
            "cache": check_cache(),
            "redis": check_redis(),
        },
        "circuit_breakers": get_circuit_breaker_status()
    }
    
    # Overall status
    all_healthy = all(check["status"] == "ok" for check in health_status["checks"].values())
    health_status["status"] = "healthy" if all_healthy else "unhealthy"
    
    status_code = 200 if all_healthy else 503
    return JsonResponse(health_status, status=status_code)


def readiness_check(request):
    """
    Readiness probe - can the service handle requests?
    """
    try:
        # Check database
        connection.ensure_connection()
        
        return JsonResponse({
            "status": "ready",
            "message": "Service is ready to handle requests"
        })
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return JsonResponse({
            "status": "not_ready",
            "message": str(e)
        }, status=503)


def liveness_check(request):
    """
    Liveness probe - is the service running?
    """
    return JsonResponse({
        "status": "alive",
        "message": "Service is running"
    })


def check_database():
    """Check database connection"""
    try:
        connection.ensure_connection()
        return {"status": "ok", "message": "Database connection successful"}
    except Exception as e:
        logger.error(f"Database check failed: {str(e)}")
        return {"status": "error", "message": str(e)}


def check_cache():
    """Check Django cache"""
    try:
        cache.set('health_check', 'ok', 10)
        value = cache.get('health_check')
        if value == 'ok':
            return {"status": "ok", "message": "Cache working"}
        return {"status": "error", "message": "Cache not working properly"}
    except Exception as e:
        logger.error(f"Cache check failed: {str(e)}")
        return {"status": "error", "message": str(e)}


def check_redis():
    """Check Redis connection"""
    try:
        from django.conf import settings
        r = redis.from_url(settings.CELERY_BROKER_URL)
        r.ping()
        return {"status": "ok", "message": "Redis connection successful"}
    except Exception as e:
        logger.error(f"Redis check failed: {str(e)}")
        return {"status": "error", "message": str(e)}
