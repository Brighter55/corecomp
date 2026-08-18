# determines if the services are mock or live

from pages.services import FinancialDataService, MockFinancialDataService
import os
from dotenv import load_dotenv


load_dotenv()
if os.getenv("MOCK") == "True":
    financial_data_service = MockFinancialDataService()
else:
    financial_data_service = FinancialDataService()
