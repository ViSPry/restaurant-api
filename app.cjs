const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// 1. Налаштування підключення до MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // твій логін (зазвичай root)
    password: '',      // твій пароль до MySQL
    database: 'my_db' // назва твоєї бази даних
});

db.connect((err) => {
    if (err) {
        console.error('Помилка підключення до БД:', err);
        return;
    }
    console.log('Підключено до бази даних MySQL');
});

// --- CRUD для таблиці MENU (Меню) ---

// Отримати всі меню (GET)
app.get('/menu', (req, res) => {
    console.log('--- [1] Запит на /menu прийшов до сервера ---');
    
    db.query('SELECT * FROM menu', (err, results) => {
        if (err) {
            console.error('--- [!] ПОМИЛКА SQL:', err.message);
            return res.status(500).json({ error: err.message });
        }
        
        console.log('--- [2] База даних відповіла! Кількість рядків:', results.length);
        
        if (results.length === 0) {
            console.log('--- [!] Таблиця menu порожня! ---');
        }

        res.json(results);
        console.log('--- [3] Відповідь відправлена в браузер ---');
    });
});
// Створити нове меню (POST)
app.post('/menu', (req, res) => {
    const { menu_name, is_active } = req.body;
    const query = 'INSERT INTO menu (menu_name, created_at, is_active) VALUES (?, NOW(), ?)';
    db.query(query, [menu_name, is_active], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, message: 'Меню створено успішно' });
    });
});

// Оновити меню (PUT)
app.put('/menu/:id', (req, res) => {
    const { menu_name, is_active } = req.body;
    const query = 'UPDATE menu SET menu_name = ?, is_active = ? WHERE menu_id = ?';
    db.query(query, [menu_name, is_active, req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Меню оновлено' });
    });
});

// Видалити меню (DELETE)
app.delete('/menu/:id', (req, res) => {
    db.query('DELETE FROM menu WHERE menu_id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Меню видалено' });
    });
});

// --- CRUD для таблиці DISHES (Страви) ---
// Тестова зміна для PR
// Отримати всі страви з інформацією про кухаря (GET з JOIN)
app.get('/dishes', (req, res) => {
    const query = `
        SELECT dishes.dish_id, dishes.dish_name, dishes.price, employees.first_name as cook_name 
        FROM dishes 
        JOIN employees ON dishes.cook_id = employees.employee_id`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});