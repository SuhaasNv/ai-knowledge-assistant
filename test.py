def calculate_sg_tax(annual_income):
    """
    Calculate Singapore income tax based on YA 2024 progressive rates.
    """

    # (Upper limit, tax rate) per bracket
    brackets = [
        (20000, 0.00),
        (30000, 0.02),
        (40000, 0.035),
        (80000, 0.07),
        (120000, 0.115),
        (160000, 0.15),
        (200000, 0.18),
        (240000, 0.19),
        (280000, 0.195),
        (320000, 0.20),
        (500000, 0.22),
        (1000000, 0.23),
        (float("inf"), 0.24)  # Excess of 1M
    ]

    tax = 0
    previous_limit = 0

    for limit, rate in brackets:
        if annual_income > limit:
            taxable_income = limit - previous_limit
            tax += taxable_income * rate
            previous_limit = limit
        else:
            taxable_income = annual_income - previous_limit
            tax += taxable_income * rate
            break

    return tax


def net_income_calculator(monthly_salary, rent, utilities, invest_in_stocks=False):
    """
    Calculates monthly and yearly savings after tax, stock purchase, and expenses.
    """

    annual_salary = monthly_salary * 12
    tax = calculate_sg_tax(annual_salary)

    # Annual net income after tax
    net_annual_income = annual_salary - tax

    # Deduct 15% stock purchase (if opted in)
    stock_deduction = 0
    if invest_in_stocks:
        stock_deduction = 0.15 * annual_salary
        net_annual_income -= stock_deduction

    # Deduct rent + utilities
    yearly_expenses = (rent + utilities) * 12
    final_savings = net_annual_income - yearly_expenses

    # Monthly equivalent
    net_monthly_income = net_annual_income / 12
    final_monthly_savings = final_savings / 12

    return {
        "Annual Salary (Before Tax)": annual_salary,
        "Tax Payable": tax,
        "Stock Deduction": stock_deduction,
        "Net Annual Income": net_annual_income,
        "Final Yearly Savings": final_savings,
        "Net Monthly Income": net_monthly_income,
        "Final Monthly Savings": final_monthly_savings
    }


# -------------------------------
# Example Usage
# -------------------------------

monthly_salary = float(input("Enter your monthly salary (SGD): "))
rent = float(input("Enter your monthly house rent (SGD): "))
utilities = float(input("Enter your monthly utilities (SGD): "))
stock_choice = input("Do you want to invest 15% of salary in stocks? (yes/no): ").lower() == "yes"

result = net_income_calculator(monthly_salary, rent, utilities, stock_choice)

print("\n--- Results ---")
for k, v in result.items():
    print(f"{k}: ${v:,.2f}")