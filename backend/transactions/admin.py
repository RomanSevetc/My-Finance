from django.contrib import admin
from .models import Transaction

class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'category', 'amount', 'date', 'description']
    list_filter = ['transaction_type', 'category', 'date']
    search_fields = ['category', 'description']
    date_hierarchy = 'date'

admin.site.register(Transaction, TransactionAdmin)