
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO

app = FastAPI()

# Autoriser React à communiquer avec Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Smart Excel API is running!"}


@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    content = await file.read()

    df = pd.read_excel(BytesIO(content))

    required_columns = ["Product", "Quantity", "Unit_Price"]

    for column in required_columns:
        if column not in df.columns:
            return {
                "error": f"Missing required column: {column}"
            }

    df = df.dropna(subset=required_columns)

    df["Total"] = df["Quantity"] * df["Unit_Price"]

    product_summary = (
        df.groupby("Product")["Total"]
        .sum()
        .reset_index()
    )

    return {
        "filename": file.filename,
        "total_sales": round(float(df["Total"].sum()), 2),
        "total_rows": int(len(df)),
        "missing_values": int(df.isnull().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "best_product": str(
            df.groupby("Product")["Quantity"].sum().idxmax()
        ),
        "revenue_by_product": product_summary.to_dict(
            orient="records"
        )
    }
