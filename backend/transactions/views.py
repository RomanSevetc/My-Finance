from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from .models import Transaction
from decimal import Decimal
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class CreateTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        API endpoint для создания новой транзакции
        """
        try:
            data = request.data

            required_fields = ['amount', 'transaction_type', 'category', 'date']
            for field in required_fields:
                if field not in data:
                    return Response({'error': f'Missing required field: {field}'}, status=status.HTTP_400_BAD_REQUEST)

            if not data['category'].strip():
                return Response({'error': 'Category cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

            if data['transaction_type'] not in [Transaction.INCOME, Transaction.EXPENSE]:
                return Response({'error': 'Invalid transaction type'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                amount = Decimal(data['amount'])
            except (ValueError, TypeError):
                return Response({'error': 'Amount must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format, expected YYYY-MM-DD'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Создание транзакции
            transaction = Transaction.objects.create(
                user=request.user,
                amount=amount,
                transaction_type=data['transaction_type'],
                category=data['category'],
                description=data.get('description', ''),
                date=date
            )

            return Response({
                'id': transaction.id,
                'amount': str(transaction.amount),
                'transaction_type': transaction.transaction_type,
                'category': transaction.category,
                'description': transaction.description,
                'date': transaction.date.strftime('%Y-%m-%d'),
                'message': 'Transaction created successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating transaction: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetTransactionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        API endpoint для получения списка транзакций с фильтрацией
        """
        try:
            transactions = Transaction.objects.filter(user=request.user).order_by('-date')

            # Фильтрация по типу (доход/расход)
            transaction_type = request.query_params.get('transaction_type')
            if transaction_type in [Transaction.INCOME, Transaction.EXPENSE]:
                transactions = transactions.filter(transaction_type=transaction_type)

            # Фильтрация по периоду
            period = request.query_params.get('period', 'all')
            if period == 'month':
                transactions = transactions.filter(date__gte=timezone.now() - timedelta(days=30))
            elif period == '3months':
                transactions = transactions.filter(date__gte=timezone.now() - timedelta(days=90))
            elif period == 'year':
                transactions = transactions.filter(date__gte=timezone.now() - timedelta(days=365))

            # Подготовка данных для ответа
            transactions_data = [{
                'id': t.id,
                'amount': str(t.amount),
                'transaction_type': t.transaction_type,
                'category': t.category,
                'description': t.description,
                'date': t.date.strftime('%Y-%m-%d'),
                'type_display': t.get_transaction_type_display(),
            } for t in transactions]

            return Response({'transactions': transactions_data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching transactions: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetTransactionCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        API endpoint для получения уникальных категорий пользователя
        """
        try:
            categories = Transaction.objects.filter(
                user=request.user
            ).values_list('category', flat=True).distinct()

            return Response({'categories': list(categories)}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetTransactionSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        API endpoint для получения сводки по транзакциям (для аналитики)
        """
        try:
            now = timezone.now()
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            income = Transaction.objects.filter(
                user=request.user,
                transaction_type=Transaction.INCOME,
                date__gte=month_start
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            expenses = Transaction.objects.filter(
                user=request.user,
                transaction_type=Transaction.EXPENSE,
                date__gte=month_start
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            return Response({
                'income': str(income),
                'expenses': str(expenses),
                'balance': str(income - expenses),
                'period_start': month_start.strftime('%Y-%m-%d'),
                'period_end': now.strftime('%Y-%m-%d')
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching summary: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, transaction_id):
        """
        API endpoint для удаления транзакции по ID
        """
        try:
            logger.info(f"Attempting to delete transaction with ID: {transaction_id} for user: {request.user}")
            transaction = Transaction.objects.filter(id=transaction_id, user=request.user).first()
            if not transaction:
                return Response({'error': 'Transaction not found or not owned by user'},
                                status=status.HTTP_404_NOT_FOUND)

            transaction.delete()
            logger.info(f"Transaction with ID: {transaction_id} deleted successfully")
            return Response({'message': 'Transaction deleted successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error deleting transaction: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
