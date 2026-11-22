import os
import pandas as pd
import matplotlib.pyplot as plt

from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.chart import BarChart, Reference
from openpyxl.utils import get_column_letter


# ==========================================
# 1. SELECT EXCEL FILE
# ==========================================

print("====================================")
print("       SMART EXCEL AUTOMATION")
print("====================================")

file_name = input("Enter Excel file name: ")

file_path = os.path.join("data", file_name)

if not os.path.exists(file_path):
    print("Error: Excel file not found!")
    exit()


# ==========================================
# 2. READ EXCEL FILE
# ==========================================

try:
    data = pd.read_excel(file_path)
    print("\nExcel file loaded successfully!")

except Exception as error:
    print("Error reading Excel file:", error)
    exit()


# ==========================================
# 3. CHECK REQUIRED COLUMNS
# ==========================================

required_columns = [
    "Date",
    "Product",
    "Category",
    "Quantity",
    "Unit_Price"
]

for column in required_columns:

    if column not in data.columns:
        print("Error: Missing column:", column)
        exit()


# ==========================================
# 4. DATA CLEANING
# ==========================================

print("\nOriginal rows:", len(data))

data = data.drop_duplicates()

data["Date"] = pd.to_datetime(
    data["Date"],
    errors="coerce"
)

data["Quantity"] = pd.to_numeric(
    data["Quantity"],
    errors="coerce"
)

data["Unit_Price"] = pd.to_numeric(
    data["Unit_Price"],
    errors="coerce"
)

data["Product"] = data["Product"].astype("string").str.strip()
data["Category"] = data["Category"].astype("string").str.strip()

data = data.dropna(subset=required_columns)

data = data[
    (data["Product"] != "") &
    (data["Category"] != "") &
    (data["Quantity"] > 0) &
    (data["Unit_Price"] >= 0)
]

print("Cleaned rows:", len(data))


# ==========================================
# 5. SALES CALCULATIONS
# ==========================================

data["Total"] = data["Quantity"] * data["Unit_Price"]

total_sales = data["Total"].sum()

total_quantity = data["Quantity"].sum()

number_of_products = data["Product"].nunique()

print("\nTotal Sales:", total_sales, "DT")
print("Total Quantity Sold:", total_quantity)
print("Number of Products:", number_of_products)


# ==========================================
# 6. PRODUCT ANALYSIS
# ==========================================

product_summary = data.groupby("Product").agg(
    Quantity_Sold=("Quantity", "sum"),
    Revenue=("Total", "sum")
)

product_summary = product_summary.sort_values(
    by="Revenue",
    ascending=False
)

best_selling_product = product_summary["Quantity_Sold"].idxmax()

top_revenue_product = product_summary["Revenue"].idxmax()

print("\nProduct Analysis:")
print(product_summary)

print("\nBest-selling Product:", best_selling_product)
print("Top Revenue Product:", top_revenue_product)


# ==========================================
# 7. CREATE OUTPUT FOLDER
# ==========================================

os.makedirs("output", exist_ok=True)

report_path = "output/sales_report.xlsx"
chart_path = "output/sales_chart.png"


# ==========================================
# 8. CREATE EXCEL REPORT
# ==========================================

with pd.ExcelWriter(report_path, engine="openpyxl") as writer:

    data.to_excel(
        writer,
        sheet_name="Sales",
        index=False
    )

    product_summary.to_excel(
        writer,
        sheet_name="Product Summary"
    )

    # Dashboard
    dashboard = pd.DataFrame({
        "Metric": [
            "Total Sales",
            "Total Quantity Sold",
            "Number of Products",
            "Best-selling Product",
            "Top Revenue Product"
        ],
        "Value": [
            total_sales,
            total_quantity,
            number_of_products,
            best_selling_product,
            top_revenue_product
        ]
    })

    dashboard.to_excel(
        writer,
        sheet_name="Dashboard",
        index=False
    )


# ==========================================
# 9. FORMAT EXCEL REPORT
# ==========================================

from openpyxl import load_workbook

workbook = load_workbook(report_path)

header_fill = PatternFill(
    fill_type="solid",
    fgColor="1F4E78"
)

header_font = Font(
    bold=True,
    color="FFFFFF",
    size=11
)

for sheet in workbook.worksheets:

    sheet.freeze_panes = "A2"

    for cell in sheet[1]:

        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(
            horizontal="center"
        )

    # Adjust column widths
    for column in sheet.columns:

        max_length = 0
        column_letter = get_column_letter(column[0].column)

        for cell in column:

            if cell.value is not None:
                cell_length = len(str(cell.value))

                if cell_length > max_length:
                    max_length = cell_length

        sheet.column_dimensions[column_letter].width = max_length + 4


# Format sales prices
sales_sheet = workbook["Sales"]

for row in range(2, sales_sheet.max_row + 1):

    sales_sheet.cell(row, 5).number_format = '#,##0.00 "DT"'
    sales_sheet.cell(row, 6).number_format = '#,##0.00 "DT"'

# Format revenue
summary_sheet = workbook["Product Summary"]

for row in range(2, summary_sheet.max_row + 1):

    summary_sheet.cell(row, 3).number_format = '#,##0.00 "DT"'


# Add filters
for sheet in workbook.worksheets:

    sheet.auto_filter.ref = sheet.dimensions


# Add chart to Dashboard
dashboard_sheet = workbook["Dashboard"]

chart = BarChart()

chart.title = "Revenue by Product"
chart.y_axis.title = "Revenue (DT)"
chart.x_axis.title = "Product"

data_reference = Reference(
    summary_sheet,
    min_col=3,
    min_row=1,
    max_row=summary_sheet.max_row
)

categories = Reference(
    summary_sheet,
    min_col=1,
    min_row=2,
    max_row=summary_sheet.max_row
)

chart.add_data(data_reference, titles_from_data=True)
chart.set_categories(categories)

dashboard_sheet.add_chart(chart, "D2")

workbook.save(report_path)


# ==========================================
# 10. CREATE GRAPH IMAGE
# ==========================================

product_summary["Revenue"].plot(
    kind="bar",
    title="Revenue by Product",
    figsize=(10, 5)
)

plt.xlabel("Product")
plt.ylabel("Revenue (DT)")
plt.tight_layout()

plt.savefig(chart_path)
plt.close()


# ==========================================
# 11. FINAL RESULTS
# ==========================================

print("\n====================================")
print("       AUTOMATION COMPLETED")
print("====================================")

print("Excel Report:", report_path)
print("Chart Image:", chart_path)

print("\nYour report is ready!")

