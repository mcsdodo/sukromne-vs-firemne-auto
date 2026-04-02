We are going to create a comparison calculator that would compare cost-efficiency of two types of car usage in an llm:
1. private car ownership with costs paid by company to employee
2. company car ownership with costs paid directly by company

# Private ownership
Employee is paid 0.256 EUR/km driven for business purposes. (make rate configurable)
Employee is paid for fuel costs, start with 1.5 EUR/liter incl VAT (make fuel price configurable).
All costs reimbursed to employee are written off by company as business costs.

# Company ownership
Company pays for all costs directly.
Company deducts 23% VAT on all costs. (make VAT configurable)
Company writes off 25% of car price without VAT per year.
Car price is 50000 EUR with VAT. (make car price configurable)

# Car costs
Insurance is 1500 EUR/year with VAT. (make insurance configurable)
Maintenance is 400 EUR/year with VAT. (make maintenance configurable)
The fuel consumption is 5.1 liters/100km but is adjusted by +10%. (make consumption configurable)
Company tax is 10% of all costs without VAT. (make company tax configurable)
Dividends tax is 7% of company profit. (make dividends tax configurable)

# Implementation details
Website should be static (hosted on github pages) with all calculations done in javascript on client side.
Choose appropriate technologies.