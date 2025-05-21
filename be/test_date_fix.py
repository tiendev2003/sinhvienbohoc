import random
from datetime import datetime, timedelta
from faker import Faker

# Initialize faker
fake = Faker('en_US')

def test_date_time_between_fix():
    print("Testing date_time_between fix...")
    
    # Using datetime objects instead of string notation
    end_date = datetime.now() - timedelta(days=365*18)  # 18 years ago
    start_date = datetime.now() - timedelta(days=365*25)  # 25 years ago
    date_of_birth = fake.date_time_between(start_date=start_date, end_date=end_date)
    
    print(f"Generated date: {date_of_birth}")
    print("Test successful!")

if __name__ == "__main__":
    test_date_time_between_fix()
