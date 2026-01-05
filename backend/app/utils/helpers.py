from datetime import datetime
from typing import Optional


def parse_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parse a date string to datetime object"""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return None


def format_date(dt: Optional[datetime]) -> Optional[str]:
    """Format datetime to string"""
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d")


def calculate_trip_duration(start_date: str, end_date: str) -> int:
    """Calculate the number of days in a trip"""
    start = parse_date(start_date)
    end = parse_date(end_date)
    if not start or not end:
        return 0
    return (end - start).days + 1
