from django.contrib import admin
from django.urls import path
from reports.views import ReportListCreate, ReportRetrieveUpdateDestroy # Add this second view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', ReportListCreate.as_view(), name='report-list-create'),
    path('api/reports/<int:pk>/', ReportRetrieveUpdateDestroy.as_view(), name='report-detail'),
]