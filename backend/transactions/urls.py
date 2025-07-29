from django.urls import path
from . import views

urlpatterns = [
    path('transactions/create', views.CreateTransactionView.as_view(), name='create_transaction'),
    path('transactions/', views.GetTransactionsView.as_view(), name='get_transactions'),
    path('transactions/categories', views.GetTransactionCategoriesView.as_view(), name='get_transaction_categories'),
    path('transactions/summary', views.GetTransactionSummaryView.as_view(), name='get_transaction_summary'),
    path('transactions/<int:transaction_id>', views.DeleteTransactionView.as_view(), name='delete_transaction'),
]
