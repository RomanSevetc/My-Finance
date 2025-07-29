from django.db import models
from django.conf import settings

class Transaction(models.Model):
    INCOME = 'income'
    EXPENSE = 'expense'
    TYPE_CHOICES = [
        (INCOME, 'Доход'),
        (EXPENSE, 'Расход'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    date = models.DateField()
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.get_transaction_type_display()}: {self.category} ({self.amount})"