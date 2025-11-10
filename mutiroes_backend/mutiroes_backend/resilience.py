"""
Resilience patterns: Circuit Breaker, Retry, and Fault Tolerance
"""
from functools import wraps
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)
from pybreaker import CircuitBreaker
import logging
import requests
from django.core.cache import cache

logger = logging.getLogger(__name__)

# Circuit Breakers for external services
external_api_breaker = CircuitBreaker(
    fail_max=5,
    reset_timeout=60,
    name='external_api_breaker'
)

database_breaker = CircuitBreaker(
    fail_max=3,
    reset_timeout=30,
    name='database_breaker'
)

redis_breaker = CircuitBreaker(
    fail_max=3,
    reset_timeout=30,
    name='redis_breaker'
)


def with_circuit_breaker(breaker):
    """
    Decorator to apply circuit breaker to a function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return breaker.call(func, *args, **kwargs)
            except Exception as e:
                logger.error(f"Circuit breaker {breaker.name} failed: {str(e)}")
                raise
        return wrapper
    return decorator


def with_retry(
    max_attempts=3,
    wait_min=1,
    wait_max=10,
    exceptions=(Exception,)
):
    """
    Decorator to add retry logic with exponential backoff
    """
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=wait_min, max=wait_max),
        retry=retry_if_exception_type(exceptions),
        before_sleep=before_sleep_log(logger, logging.WARNING)
    )


@with_circuit_breaker(external_api_breaker)
@with_retry(max_attempts=3, exceptions=(requests.RequestException,))
def call_external_api(url, method='GET', **kwargs):
    """
    Make resilient HTTP call to external API
    """
    try:
        response = requests.request(method, url, timeout=10, **kwargs)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"External API call failed: {url} - {str(e)}")
        raise


@with_circuit_breaker(redis_breaker)
@with_retry(max_attempts=2)
def get_from_cache(key, default=None):
    """
    Resilient cache get operation
    """
    try:
        return cache.get(key, default)
    except Exception as e:
        logger.error(f"Cache get failed for key {key}: {str(e)}")
        return default


@with_circuit_breaker(redis_breaker)
@with_retry(max_attempts=2)
def set_to_cache(key, value, timeout=300):
    """
    Resilient cache set operation
    """
    try:
        cache.set(key, value, timeout)
        return True
    except Exception as e:
        logger.error(f"Cache set failed for key {key}: {str(e)}")
        return False


class ResilientDatabaseQuery:
    """
    Context manager for resilient database queries
    """
    
    def __init__(self, max_retries=2):
        self.max_retries = max_retries
        self.retry_count = 0
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            if self.retry_count < self.max_retries:
                self.retry_count += 1
                logger.warning(f"Database query failed, retry {self.retry_count}/{self.max_retries}")
                return True  # Suppress exception and retry
            else:
                logger.error(f"Database query failed after {self.max_retries} retries")
                return False  # Propagate exception
        return False


def with_fallback(fallback_value=None):
    """
    Decorator to provide fallback value on failure
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.warning(f"Function {func.__name__} failed, using fallback: {str(e)}")
                return fallback_value
        return wrapper
    return decorator


# Health check with circuit breaker status
def get_circuit_breaker_status():
    """
    Get status of all circuit breakers
    """
    breakers = [external_api_breaker, database_breaker, redis_breaker]
    return {
        breaker.name: {
            'state': breaker.current_state,
            'fail_count': breaker.fail_counter,
            'last_failure': str(breaker.last_failure_time) if breaker.last_failure_time else None
        }
        for breaker in breakers
    }
