from rest_framework import generics
from .models import Report
from .serializers import ReportSerializer

class ReportListCreate(generics.ListCreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer # Fixed: was serializer_serializer

class ReportRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer