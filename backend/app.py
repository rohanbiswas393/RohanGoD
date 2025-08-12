from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = 'employees.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            position TEXT NOT NULL,
            department TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/employees', methods=['POST'])
def register_employee():
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['name', 'email', 'phone', 'position', 'department']):
            return jsonify({'error': 'All fields are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO employees (name, email, phone, position, department)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['name'], data['email'], data['phone'], data['position'], data['department']))
        
        conn.commit()
        employee_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'message': 'Employee registered successfully',
            'employee_id': employee_id
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/employees', methods=['GET'])
def get_employees():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM employees ORDER BY created_at DESC')
        employees = cursor.fetchall()
        conn.close()
        
        employees_list = []
        for employee in employees:
            employees_list.append({
                'id': employee['id'],
                'name': employee['name'],
                'email': employee['email'],
                'phone': employee['phone'],
                'position': employee['position'],
                'department': employee['department'],
                'created_at': employee['created_at']
            })
        
        return jsonify(employees_list), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/employees/<int:employee_id>', methods=['GET'])
def get_employee(employee_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM employees WHERE id = ?', (employee_id,))
        employee = cursor.fetchone()
        conn.close()
        
        if employee is None:
            return jsonify({'error': 'Employee not found'}), 404
        
        employee_data = {
            'id': employee['id'],
            'name': employee['name'],
            'email': employee['email'],
            'phone': employee['phone'],
            'position': employee['position'],
            'department': employee['department'],
            'created_at': employee['created_at']
        }
        
        return jsonify(employee_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Backend is running'}), 200

if __name__ == '__main__':
    init_db()
    print("Starting Flask server...")
    print("Database initialized")
    app.run(debug=True, host='0.0.0.0', port=5000)