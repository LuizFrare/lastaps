from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    
    # User management
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', views.UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('profile/<str:username>/', views.UserPublicProfileView.as_view(), name='user-public-profile'),
    
    # Badges and skills
    path('badges/', views.UserBadgeListView.as_view(), name='badges'),
    path('skills/', views.UserSkillListView.as_view(), name='skills'),
    
    # User skills
    path('skills/my/', views.UserSkillLevelListView.as_view(), name='user-skills'),
    path('skills/my/<int:pk>/', views.UserSkillLevelDetailView.as_view(), name='user-skill-detail'),
    
    # User availability
    path('availability/', views.UserAvailabilityListView.as_view(), name='user-availability'),
    path('availability/<int:pk>/', views.UserAvailabilityDetailView.as_view(), name='user-availability-detail'),
    
    # User badges
    path('badges/earned/', views.UserBadgeEarnedListView.as_view(), name='user-badges-earned'),
    path('badges/earn/<int:badge_id>/', views.earn_badge, name='earn-badge'),
    
    # User settings
    path('notifications/settings/', views.UserNotificationSettingsView.as_view(), name='user-notification-settings'),
    
    # User actions
    path('change-password/', views.change_password, name='change-password'),
    path('stats/', views.user_stats, name='user-stats'),
    path('search/', views.search_users, name='search-users'),
    path('timeline/', views.user_timeline, name='user-timeline'),
    path('recommendations/', views.user_recommendations, name='user-recommendations'),
]
