# determines if the services are mock or live

from django.conf import settings
from pages.services import FinancialDataService, MockFinancialDataService
from billings.services import PaymentService, MockPaymentService
import os
from dotenv import load_dotenv


load_dotenv()
if os.getenv("MOCK") == "True":
    financial_data_service = MockFinancialDataService()
    payment_service = MockPaymentService()
else:
    financial_data_service = FinancialDataService()
    payment_service = PaymentService()