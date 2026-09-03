# CSV Import and Validation Dashboard

A full-stack web application for uploading CSV files, validating customer records, detecting duplicates, storing import data, and viewing import results through an interactive dashboard.

## Features

### CSV Upload
- Upload CSV files from the dashboard
- Drag and drop CSV files
- File type validation
- Upload processing feedback

### CSV Processing
- Background CSV processing using FastAPI
- Automatic import status updates
- Import status tracking: Pending, Processing, Completed, Failed

### Record Validation
- Required field validation
- Email validation
- Phone number validation
- Missing field detection

### Duplicate Detection
- Duplicate email addresses
- Duplicate phone numbers

### Import Dashboard
- Total records
- Valid records
- Invalid records
- Duplicate records

### Record Management
- View imported records
- Search records
- Filter valid, invalid, and duplicate records
- View validation errors
- Pagination

### Download
Users can download valid records as a CSV file.

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Database
- SQLite

---

## Project Structure

oneprism-csv-dashboard/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── import_job.py
│   │   │   └── import_record.py
│   │   ├── routes/
│   │   │   └── imports.py
│   │   ├── schemas/
│   │   │   └── import_schema.py
│   │   ├── services/
│   │   │   └── csv_service.py
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── imports/
│   │   │   └── layout/
│   │   ├── hooks/
│   │   │   └── useDebounce.ts
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── ImportDetailsPage.tsx
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
│
├── sample-data/
│   ├── customers.csv
│   ├── validation_test.csv
│   └── phase8.csv
│
├── .gitignore
└── README.md

---

## Application Flow

CSV Upload
    ↓
FastAPI API
    ↓
Background Processing
    ↓
CSV Validation
    ↓
Duplicate Detection
    ↓
SQLite Database
    ↓
Import Results Dashboard
    ↓
Search / Filter / Pagination
    ↓
Download Valid Records

---

# Installation

## Prerequisites

Make sure you have the following installed:

- Python 3.10 or higher
- Node.js
- npm

---

## Backend Setup

Navigate to the backend folder:

cd backend

Create a virtual environment:

python -m venv venv

Activate the virtual environment on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Start the FastAPI server:

uvicorn app.main:app --reload

The backend will run at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs

---

## Frontend Setup

Navigate to the frontend folder:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will usually run at:

http://localhost:5173

---

## How to Use

### 1. Start the Backend

cd backend
venv\Scripts\activate
uvicorn app.main:app --reload

### 2. Start the Frontend

Open another terminal:

cd frontend
npm run dev

### 3. Open the Application

http://localhost:5173

### 4. Upload a CSV File

Use one of the sample files located in:

sample-data/

For example:

phase8.csv

### 5. View Import Results

After uploading a CSV file, the application will:

1. Create an import job
2. Process the CSV in the background
3. Validate records
4. Detect duplicate records
5. Store results in SQLite
6. Update the import status
7. Display the results in the dashboard

---

## CSV Format

The CSV file should contain:

name
email
phone
company
city

Example:

name,email,phone,company,city
Pranav Nair,pranav.nair@example.com,9876543210,OnePrism,Bhilai
Aarav Sharma,aarav@example.com,9876543211,TechNova,Delhi
Priya Verma,priya@example.com,9876543212,DataWorks,Mumbai

---

## Validation Examples

The application can identify:

### Invalid Email
invalid-email

### Invalid Phone
12345

### Missing Email
name,,phone,company,city

### Missing Name
,email,phone,company,city

### Duplicate Email
Records with an already existing email address are marked as duplicates.

### Duplicate Phone
Records with an already existing phone number are marked as duplicates.

---

## API Features

The backend provides APIs for:

- Uploading CSV files
- Creating import jobs
- Checking import status
- Retrieving import history
- Retrieving imported records
- Searching records
- Filtering records
- Pagination
- Downloading valid records

---

## Frontend Features

The frontend provides:

- Responsive dashboard
- CSV file upload
- Drag and drop support
- Import history
- Automatic polling for import status
- Import summary cards
- Search with debounce
- Record filtering
- Pagination
- Validation error display
- Download valid records

---

## Testing

Use:

sample-data/customers.csv

For normal import testing.

sample-data/validation_test.csv

For validation testing.

sample-data/phase8.csv

For testing:

- Valid records
- Invalid records
- Duplicate records
- Search
- Filters
- Pagination

---

## Future Improvements

- User authentication
- PostgreSQL database support
- Advanced CSV validation rules
- Bulk import management
- Import cancellation
- Export reports
- Cloud deployment
- Docker support
- Automated unit and integration testing

---

## Author

Pranav Nair

---

## License

This project was created as part of a technical assessment and learning project.
