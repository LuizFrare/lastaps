from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.EventViewSet, basename='events')

urlpatterns = [
    # Categories must come before router to avoid conflict
    path('categories/', views.EventCategoryListView.as_view(), name='event-categories'),
    
    # Event-specific endpoints (must come before router)
    path('<int:event_id>/participants/', views.EventParticipantListView.as_view(), name='event-participants'),
    path('<int:event_id>/participants/<int:pk>/', views.EventParticipantDetailView.as_view(), name='event-participant-detail'),
    path('<int:event_id>/photos/', views.EventPhotoListView.as_view(), name='event-photos'),
    path('<int:event_id>/comments/', views.EventCommentListView.as_view(), name='event-comments'),
    path('<int:event_id>/resources/', views.EventResourceListView.as_view(), name='event-resources'),
    path('<int:event_id>/resources/<int:pk>/', views.EventResourceDetailView.as_view(), name='event-resource-detail'),
    path('<int:event_id>/report/', views.EventReportView.as_view(), name='event-report'),
    
    # Router must come last to not override specific paths
    path('', include(router.urls)),
]
