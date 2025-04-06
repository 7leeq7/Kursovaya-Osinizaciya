require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware для логирования всех запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    next();
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Database setup
const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        console.error('Database path:', process.env.DB_PATH);
    } else {
        console.log('Connected to SQLite database at:', process.env.DB_PATH);
        console.log('Database connection successful');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    console.log('Starting database initialization...');
    db.serialize(() => {
        // Roles table
        console.log('Creating roles table...');
        db.run(`CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating roles table:', err);
            } else {
                console.log('Roles table created successfully');
                
                // Добавляем роли
                const roles = [
                    { name: 'admin', description: 'Администратор системы с полным доступом' },
                    { name: 'employee', description: 'Сотрудник компании с ограниченным доступом' },
                    { name: 'guest', description: 'Гость с минимальными правами' }
                ];
                
                // Проверяем существование ролей
                db.get('SELECT COUNT(*) as count FROM roles', [], (err, result) => {
                    if (err) {
                        console.error('Error checking roles:', err);
                    } else if (result.count === 0) {
                        // Добавляем роли только если таблица пуста
                        roles.forEach(role => {
                            db.run(
                                'INSERT INTO roles (name, description) VALUES (?, ?)',
                                [role.name, role.description],
                                function(err) {
                                    if (err) {
                                        console.error('Error inserting role:', err);
                                    } else {
                                        console.log('Role added successfully:', role.name);
                                    }
                                }
                            );
                        });
                    }
                });
            }
        });

        // Users table
        console.log('Creating users table...');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role_id INTEGER NOT NULL,
            phone TEXT,
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
            } else {
                console.log('Users table created successfully');
                
                // Проверяем наличие колонки role_id в таблице users
                db.all("PRAGMA table_info(users)", [], (err, columns) => {
                    if (err) {
                        console.error('Error checking table structure:', err);
                        return;
                    }
                    
                    // Проверяем наличие колонки role_id
                    const hasRoleIdColumn = columns.some(col => col.name === 'role_id');
                    
                    if (!hasRoleIdColumn) {
                        console.log('Adding role_id column to users table...');
                        // Добавляем колонку role_id если она отсутствует
                        db.run(`ALTER TABLE users ADD COLUMN role_id INTEGER NOT NULL DEFAULT 3`, (err) => {
                            if (err) {
                                console.error('Error adding role_id column:', err);
                            } else {
                                console.log('role_id column added successfully');
                            }
                        });
                    } else {
                        console.log('role_id column already exists');
                    }
                });
                
                // Создаем тестовых пользователей
                db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
                    if (err) {
                        console.error('Error checking users:', err);
                    } else if (result.count === 0) {
                        const testUsers = [
                            {
                                username: 'admin',
                                email: 'admin@test.com',
                                password: 'admin123',
                                role_id: 1
                            },
                            {
                                username: 'employee',
                                email: 'employee@test.com',
                                password: 'employee123',
                                role_id: 2
                            },
                            {
                                username: 'guest',
                                email: 'guest@test.com',
                                password: 'guest123',
                                role_id: 3
                            }
                        ];
                        
                        testUsers.forEach(user => {
                            bcrypt.hash(user.password, 10, (err, hashedPassword) => {
                                if (err) {
                                    console.error('Error hashing password:', err);
                                    return;
                                }
                                
                                db.run('INSERT INTO users (username, email, password, role_id, first_order_discount) VALUES (?, ?, ?, ?, ?)',
                                    [user.username, user.email, hashedPassword, user.role_id, true],
                                    function(err) {
                                        if (err) {
                                            console.error('Error creating user:', err);
                                        } else {
                                            console.log('User created successfully:', user.username);
                                        }
                                    }
                                );
                            });
                        });
                    }
                });
            }
        });

        // Categories table (новая таблица)
        console.log('Creating categories table...');
        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating categories table:', err);
            } else {
                console.log('Categories table created successfully');
                
                // Добавляем категории
                const categories = [
                    { name: 'Частный сектор', description: 'Услуги для частных домов и участков' },
                    { name: 'Промышленность', description: 'Услуги для промышленных предприятий' },
                    { name: 'Утилизация', description: 'Услуги по утилизации отходов' },
                    { name: 'Абонентское обслуживание', description: 'Регулярное обслуживание по графику' },
                    { name: 'Консультации', description: 'Экспертные консультации и оценка' },
                    { name: 'Экстренные вызовы', description: 'Срочные выезды и аварийные ситуации' }
                ];
                
                // Проверяем существование категорий
                db.get('SELECT COUNT(*) as count FROM categories', [], (err, result) => {
                    if (err) {
                        console.error('Error checking categories:', err);
                    } else if (result.count === 0) {
                        // Добавляем категории только если таблица пуста
                        categories.forEach(category => {
                            db.run(
                                'INSERT INTO categories (name, description) VALUES (?, ?)',
                                [category.name, category.description],
                                function(err) {
                                    if (err) {
                                        console.error('Error inserting category:', err);
                                    } else {
                                        console.log('Category added successfully:', category.name);
                                    }
                                }
                            );
                        });
                    }
                });
            }
        });

        // Services table (обновленная таблица с foreign key)
        console.log('Creating services table...');
        db.run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            duration TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )`, (err) => {
            if (err) {
                console.error('Error creating services table:', err);
            } else {
                console.log('Services table created successfully');
                
                // Проверяем наличие колонки category в таблице services (старый формат)
                db.all("PRAGMA table_info(services)", [], (err, columns) => {
                    if (err) {
                        console.error('Error checking services table structure:', err);
                        return;
                    }
                    
                    const hasCategoryColumn = columns.some(col => col.name === 'category');
                    const hasCategoryIdColumn = columns.some(col => col.name === 'category_id');
                    
                    if (hasCategoryColumn && !hasCategoryIdColumn) {
                        console.log('Migrating services from old format to new format...');
                        
                        // Получаем все услуги в старом формате
                        db.all("SELECT * FROM services", [], (err, oldServices) => {
                            if (err) {
                                console.error('Error fetching old services:', err);
                                return;
                            }
                            
                            if (oldServices && oldServices.length > 0) {
                                console.log(`Found ${oldServices.length} services to migrate`);
                                
                                // Создаем временную таблицу для хранения услуг
                                db.run("CREATE TABLE temp_services AS SELECT * FROM services", (err) => {
                                    if (err) {
                                        console.error('Error creating temp table:', err);
                                        return;
                                    }
                                    
                                    // Удаляем оригинальную таблицу
                                    db.run("DROP TABLE services", (err) => {
                                        if (err) {
                                            console.error('Error dropping original services table:', err);
                                            return;
                                        }
                                        
                                        // Создаем новую таблицу с правильной структурой
                                        db.run(`CREATE TABLE services (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            title TEXT NOT NULL,
                                            description TEXT NOT NULL,
                                            price DECIMAL(10,2) NOT NULL,
                                            duration TEXT NOT NULL,
                                            category_id INTEGER NOT NULL,
                                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                            FOREIGN KEY (category_id) REFERENCES categories (id)
                                        )`, (err) => {
                                            if (err) {
                                                console.error('Error recreating services table:', err);
                                                return;
                                            }
                                            
                                            // Для каждой услуги находим соответствующую категорию и добавляем в новую таблицу
                                            oldServices.forEach(service => {
                                                db.get("SELECT id FROM categories WHERE name = ?", [service.category], (err, category) => {
                                                    if (err) {
                                                        console.error(`Error finding category for service ${service.title}:`, err);
                                                        return;
                                                    }
                                                    
                                                    const categoryId = category ? category.id : 1; // По умолчанию первая категория
                                                    
                                                    db.run(
                                                        "INSERT INTO services (id, title, description, price, duration, category_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                                        [service.id, service.title, service.description, service.price, service.duration, categoryId, service.created_at],
                                                        (err) => {
                                                            if (err) {
                                                                console.error(`Error migrating service ${service.title}:`, err);
                                                            } else {
                                                                console.log(`Migrated service: ${service.title}`);
                                                            }
                                                        }
                                                    );
                                                });
                                            });
                                            
                                            // Удаляем временную таблицу
                                            db.run("DROP TABLE temp_services", (err) => {
                                                if (err) {
                                                    console.error('Error dropping temp table:', err);
                                                }
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });

        // Orders table
        console.log('Creating orders table...');
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            service_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            discount_applied BOOLEAN DEFAULT 0,
            final_price REAL NOT NULL,
            address TEXT,
            scheduled_time DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (service_id) REFERENCES services(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating orders table:', err);
            } else {
                console.log('Orders table created successfully or already exists');
                
                // Проверяем, существует ли столбец address в таблице orders
                db.all("PRAGMA table_info(orders)", [], (err, rows) => {
                    if (err) {
                        console.error('Error checking orders table columns:', err);
                        return;
                    }
                    
                    // Проверяем, есть ли столбец address
                    const hasAddressColumn = rows.some(row => row.name === 'address');
                    
                    if (!hasAddressColumn) {
                        console.log('Adding address column to orders table...');
                        // Добавляем столбец address, если его нет
                        db.run("ALTER TABLE orders ADD COLUMN address TEXT", (err) => {
                            if (err) {
                                console.error('Error adding address column to orders table:', err);
                            } else {
                                console.log('Address column added to orders table successfully');
                            }
                        });
                    }
                });
            }
        });
        
        // Feedback table (новая таблица)
        console.log('Creating feedback table...');
        db.run(`CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            order_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (order_id) REFERENCES orders (id)
        )`, (err) => {
            if (err) {
                console.error('Error creating feedback table:', err);
            } else {
                console.log('Feedback table created successfully');
            }
        });
    });
    console.log('Database initialization completed');
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Role-based authorization middleware
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        db.get('SELECT role_id FROM users WHERE id = ?', [req.user.userId], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching user role' });
            }
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Добавляем прямую проверку по role_id (1 - админ, 2 - сотрудник)
            if (allowedRoles.includes('admin') && user.role_id === 1) {
                req.userRole = 'admin';
                return next();
            }
            
            if (allowedRoles.includes('employee') && user.role_id === 2) {
                req.userRole = 'employee';
                return next();
            }
            
            // Если проверка по role_id не прошла, проверяем по имени роли
            db.get('SELECT name FROM roles WHERE id = ?', [user.role_id], (err, role) => {
                if (err) {
                    return res.status(500).json({ error: 'Error fetching role' });
                }
                
                if (!role) {
                    return res.status(404).json({ error: 'Role not found' });
                }
                
                // Логируем информацию о проверке роли для отладки
                console.log('Checking user role:', {
                    userId: req.user.userId,
                    role_id: user.role_id,
                    role_name: role.name,
                    allowedRoles,
                    isAdmin: role.name === 'admin' || role.name === 'administrator',
                    isEmployee: role.name === 'employee'
                });
                
                // Проверяем все варианты названий ролей
                if (allowedRoles.includes('admin') && 
                   (role.name === 'admin' || role.name === 'administrator' || 
                    role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'administrator')) {
                    req.userRole = 'admin';
                    return next();
                }
                
                if (allowedRoles.includes('employee') && 
                   (role.name === 'employee' || role.name === 'сотрудник' || 
                    role.name.toLowerCase() === 'employee' || role.name.toLowerCase() === 'сотрудник')) {
                    req.userRole = 'employee';
                    return next();
                }
                
                if (allowedRoles.includes(role.name)) {
                    req.userRole = role.name;
                    return next();
                }
                
                return res.status(403).json({ error: 'Недостаточно прав для выполнения операции' });
            });
        });
    };
};

// Auth routes
app.post('/api/register', async (req, res) => {
    const { username, email, password, phone, address, role_id } = req.body;
    
    try {
        // Проверяем обязательные поля
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля' });
        }

        // Проверяем, существует ли пользователь
        const existingUser = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [username, email],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // По умолчанию все новые пользователи получают роль "guest" (id=3)
        const userRoleId = role_id || 3;

        // Создаем пользователя
        const result = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password, phone, address, role_id) VALUES (?, ?, ?, ?, ?, ?)',
                [username, email, hashedPassword, phone || null, address || null, userRoleId],
                function(err) {
                    if (err) reject(err);
                    resolve(this);
                }
            );
        });

        // Создаем токен
        const token = jwt.sign(
            { userId: result.lastID },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Получаем данные созданного пользователя и роль
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.id, u.username, u.email, u.phone, u.address, r.name as role 
                FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = ?`,
                [result.lastID],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        res.json({ token, user });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
    }
});

app.post('/api/login', (req, res) => {
    console.log('\n=== Login Request ===');
    console.log('Received login request:', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
        console.error('Missing email or password');
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    console.log('Searching for user in database...');
    db.get(
        `SELECT u.*, r.name as role_name 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.email = ?`, 
        [email], 
        async (err, user) => {
        if (err) {
            console.error('Login database error:', err);
            return res.status(500).json({ error: 'Ошибка при входе в систему' });
        }

        if (!user) {
            console.log('User not found:', { email });
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        console.log('User found:', { id: user.id, username: user.username, role: user.role_name, role_id: user.role_id });

        try {
            console.log('Comparing passwords...');
            const validPassword = await bcrypt.compare(password, user.password);
            console.log('Password validation:', { valid: validPassword });
            
            if (!validPassword) {
                console.log('Invalid password');
                return res.status(400).json({ error: 'Неверный email или пароль' });
            }

            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
            console.log('Login successful:', { userId: user.id, username: user.username, role: user.role_name, role_id: user.role_id });
            console.log('JWT token generated');
            res.json({ 
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role_name,
                    role_id: user.role_id
                }
            });
        } catch (error) {
            console.error('Password comparison error:', error);
            console.error('Stack trace:', error.stack);
            res.status(500).json({ error: 'Ошибка при входе в систему' });
        }
    });
});

// Task routes
app.get('/api/tasks', authenticateToken, (req, res) => {
    db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, tasks) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching tasks' });
            }
            res.json(tasks);
        }
    );
});

app.post('/api/tasks', authenticateToken, (req, res) => {
    const { title, description, due_date } = req.body;

    db.run('INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)',
        [req.user.id, title, description, due_date],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error creating task' });
            }
            
            db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, task) => {
                if (err) {
                    return res.status(500).json({ error: 'Error fetching created task' });
                }
                res.status(201).json(task);
            });
        }
    );
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
    const { title, description, status, due_date } = req.body;

    db.run(`UPDATE tasks 
           SET title = ?, description = ?, status = ?, due_date = ? 
           WHERE id = ? AND user_id = ?`,
        [title, description, status, due_date, req.params.id, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error updating task' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Task not found or unauthorized' });
            }
            
            db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, task) => {
                if (err) {
                    return res.status(500).json({ error: 'Error fetching updated task' });
                }
                res.json(task);
            });
        }
    );
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error deleting task' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Task not found or unauthorized' });
            }
            res.status(204).send();
        }
    );
});

// User profile routes
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get(
        `SELECT u.id, u.username, u.email, u.phone, u.address, r.name as role, u.role_id, u.first_order_discount,
        datetime(u.created_at, 'localtime') as created_at
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?`,
        [req.user.userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при получении профиля' });
            }
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            
            // Дополнительное логирование для отладки
            console.log('Sending profile data:', user);
            
            res.json(user);
        }
    );
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    const { username, email, phone, address } = req.body;
    
    try {
        // Проверяем обязательные поля
        if (!username || !email) {
            return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля' });
        }

        // Проверяем, не занято ли имя пользователя или email другим пользователем
        const existingUser = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
                [username, email, req.user.userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' });
        }

        // Обновляем данные пользователя
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET username = ?, email = ?, phone = ?, address = ? WHERE id = ?',
                [username, email, phone || null, address || null, req.user.userId],
                (err) => {
                    if (err) reject(err);
                    resolve(true);
                }
            );
        });

        // Получаем обновленные данные пользователя
        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id, username, email, phone, address FROM users WHERE id = ?',
                [req.user.userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        res.json(user);
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.status(500).json({ error: 'Ошибка при обновлении профиля' });
    }
});

// Изменение пароля
app.put('/api/profile/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    // Проверяем обязательные поля
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }

    // Получаем текущего пользователя
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE id = ?',
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем текущий пароль
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.user.userId],
        (err) => {
          if (err) reject(err);
          resolve(true);
        }
      );
    });

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при изменении пароля:', error);
    res.status(500).json({ error: 'Ошибка при изменении пароля' });
  }
});

// Services routes
app.get('/api/services', (req, res) => {
    db.all(
        `SELECT s.id, s.title, s.description, s.price, s.duration, c.name as category, c.id as category_id
        FROM services s
        JOIN categories c ON s.category_id = c.id
        ORDER BY s.id ASC`,
        [],
        (err, services) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при получении услуг' });
            }
            res.json(services);
        }
    );
});

// Получение занятых дат (чтобы пользователь не мог забронировать занятое время)
app.get('/api/orders/busy-times', (req, res) => {
    const { service_id, date_from, date_to } = req.query;
    
    // Формируем условие фильтрации по услуге, если указан service_id
    const serviceCondition = service_id ? 'AND service_id = ?' : '';
    const params = [];
    
    // Добавляем параметры в зависимости от условий
    if (service_id) {
        params.push(service_id);
    }
    
    // Добавляем фильтр по датам, если указаны date_from и date_to
    let dateCondition = '';
    if (date_from && date_to) {
        dateCondition = 'AND scheduled_time BETWEEN ? AND ?';
        params.push(date_from, date_to);
    } else if (date_from) {
        dateCondition = 'AND scheduled_time >= ?';
        params.push(date_from);
    } else if (date_to) {
        dateCondition = 'AND scheduled_time <= ?';
        params.push(date_to);
    }
    
    // Исключаем отмененные заказы
    const query = `
        SELECT o.scheduled_time, s.title, s.duration, o.status
        FROM orders o
        JOIN services s ON o.service_id = s.id
        WHERE o.status != 'cancelled' ${serviceCondition} ${dateCondition}
        ORDER BY o.scheduled_time ASC
    `;
    
    db.all(query, params, (err, busyTimes) => {
        if (err) {
            console.error('Error fetching busy times:', err);
            return res.status(500).json({ error: 'Ошибка при получении занятых дат' });
        }
        
        // Группируем занятые даты по дням
        const busyDays = {};
        
        busyTimes.forEach(item => {
            // Получаем дату без времени (только день)
            const scheduledDate = item.scheduled_time.split('T')[0];
            
            if (!busyDays[scheduledDate]) {
                busyDays[scheduledDate] = [];
            }
            
            busyDays[scheduledDate].push({
                time: item.scheduled_time,
                serviceName: item.title,
                duration: item.duration,
                status: item.status
            });
        });
        
        res.json({
            busy_times: busyTimes,
            busy_days: busyDays
        });
    });
});

// Проверка доступности даты и времени для бронирования
app.post('/api/orders/check-availability', (req, res) => {
    const { service_id, scheduled_time } = req.body;
    
    if (!service_id || !scheduled_time) {
        return res.status(400).json({ error: 'Необходимо указать услугу и дату' });
    }
    
    // Проверяем, что дата и время не в прошлом
    const selectedDateTime = new Date(scheduled_time);
    const currentDateTime = new Date();
    
    // Если выбран прошедший день
    if (selectedDateTime.setHours(0, 0, 0, 0) < currentDateTime.setHours(0, 0, 0, 0)) {
        return res.json({
            available: false,
            message: 'Невозможно создать заказ на прошедшую дату. Пожалуйста, выберите сегодняшний или будущий день.'
        });
    }
    
    // Восстанавливаем полные значения дат для дальнейшей проверки
    selectedDateTime.setTime(new Date(scheduled_time).getTime());
    currentDateTime.setTime(new Date().getTime());
    
    // Если выбран текущий день, но прошедшее время
    if (selectedDateTime.setHours(0, 0, 0, 0) === currentDateTime.setHours(0, 0, 0, 0)) {
        // Восстанавливаем полные значения дат после сравнения
        selectedDateTime.setTime(new Date(scheduled_time).getTime());
        currentDateTime.setTime(new Date().getTime());
        
        if (selectedDateTime < currentDateTime) {
            return res.json({
                available: false,
                message: 'Невозможно создать заказ на прошедшее время. Пожалуйста, выберите будущее время.'
            });
        }
    }
    
    // Если дата и время не в прошлом, они доступны
    res.json({
        available: true,
        message: 'Выбранная дата и время доступны для бронирования'
    });
});

// Обновляем маршрут создания заказа с проверкой времени
app.post('/api/orders', authenticateToken, (req, res) => {
    // Поддержка разных вариантов имен полей (camelCase и snake_case)
    const { 
        service_id, serviceId, 
        scheduled_time, scheduledTime,
        address
    } = req.body;
    
    const user_id = req.user.userId;
    
    // Используем первое непустое значение из возможных вариантов
    const finalServiceId = service_id || serviceId;
    const finalScheduledTime = scheduled_time || scheduledTime;
    
    // Логирование для отладки
    console.log('Creating order with data:', {
        originalBody: req.body,
        finalServiceId,
        finalScheduledTime,
        address
    });
    
    if (!finalServiceId || !finalScheduledTime) {
        return res.status(400).json({ 
            error: 'Все поля обязательны',
            required: ['service_id/serviceId', 'scheduled_time/scheduledTime'],
            received: req.body 
        });
    }
    
    // Проверяем, что дата и время не в прошлом
    const selectedDateTime = new Date(finalScheduledTime);
    const currentDateTime = new Date();
    
    // Если выбран прошедший день
    if (selectedDateTime.setHours(0, 0, 0, 0) < currentDateTime.setHours(0, 0, 0, 0)) {
        return res.status(400).json({
            error: 'Невозможно создать заказ на прошедшую дату. Пожалуйста, выберите сегодняшний или будущий день.',
            available: false
        });
    }
    
    // Восстанавливаем полные значения дат для дальнейшей проверки
    selectedDateTime.setTime(new Date(finalScheduledTime).getTime());
    currentDateTime.setTime(new Date().getTime());
    
    // Если выбран текущий день, но прошедшее время
    if (selectedDateTime.setHours(0, 0, 0, 0) === currentDateTime.setHours(0, 0, 0, 0)) {
        // Восстанавливаем полные значения дат после сравнения
        selectedDateTime.setTime(new Date(finalScheduledTime).getTime());
        currentDateTime.setTime(new Date().getTime());
        
        if (selectedDateTime < currentDateTime) {
            return res.status(400).json({
                error: 'Невозможно создать заказ на прошедшее время. Пожалуйста, выберите будущее время.',
                available: false
            });
        }
    }
    
    // Если дата и время не в прошлом, продолжаем создание заказа
    // Получаем информацию о пользователе и услуге
    db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        db.get('SELECT * FROM services WHERE id = ?', [finalServiceId], (err, service) => {
            if (err || !service) {
                return res.status(404).json({ error: 'Услуга не найдена' });
            }
            
            // Создаем заказ с адресом
            db.run(
                'INSERT INTO orders (user_id, service_id, status, discount_applied, final_price, scheduled_time, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [user_id, finalServiceId, 'pending', false, service.price, finalScheduledTime, address || ''],
                function(err) {
                    if (err) {
                        console.error('Error creating order:', err);
                        return res.status(500).json({ error: 'Ошибка при создании заказа' });
                    }
                    
                    // Возвращаем созданный заказ
                    db.get(
                        `SELECT o.*, s.title as service_title, s.description as service_description, s.duration 
                        FROM orders o
                        JOIN services s ON o.service_id = s.id
                        WHERE o.id = ?`,
                        [this.lastID],
                        (err, order) => {
                            if (err) {
                                return res.status(500).json({ error: 'Ошибка при получении заказа' });
                            }
                            res.status(201).json(order);
                        }
                    );
                }
            );
        });
    });
});

// Получение заказов пользователя
app.get('/api/orders', authenticateToken, (req, res) => {
    const user_id = req.user.userId;
    
    db.get('SELECT role_id FROM users WHERE id = ?', [user_id], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        // Если это администратор или сотрудник - показываем все заказы
        if (user.role_id === 1 || user.role_id === 2) {
            db.all(
                `SELECT o.*, 
                  s.title as service_title, 
                  s.title as title,
                  s.description,
                  s.duration,
                  u.username as user_name, 
                  u.email as user_email,
                  o.address,
                  datetime(o.created_at, 'localtime') as created_at,
                  datetime(o.scheduled_time, 'localtime') as scheduled_time
                FROM orders o
                JOIN services s ON o.service_id = s.id
                JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC`,
                [],
                (err, orders) => {
                    if (err) {
                        console.error('Error fetching admin orders:', err);
                        return res.status(500).json({ error: 'Ошибка при получении заказов' });
                    }
                    res.json(orders);
                }
            );
        } else {
            // Для обычных пользователей - только их заказы
            db.all(
                `SELECT o.*, 
                  s.title as service_title, 
                  s.title as title,
                  s.description,
                  s.duration,
                  o.address,
                  datetime(o.created_at, 'localtime') as created_at,
                  datetime(o.scheduled_time, 'localtime') as scheduled_time
                FROM orders o
                JOIN services s ON o.service_id = s.id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC`,
                [user_id],
                (err, orders) => {
                    if (err) {
                        console.error('Error fetching user orders:', err);
                        return res.status(500).json({ error: 'Ошибка при получении заказов' });
                    }
                    res.json(orders);
                }
            );
        }
    });
});

// Обновление заказа
app.patch('/api/orders/:id', authenticateToken, authorizeRole(['admin', 'employee']), (req, res) => {
    const { id } = req.params;
    const { service_id, scheduled_time, address } = req.body;
    
    // Проверяем, существует ли заказ
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при проверке заказа' });
        }
        
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        // Проверяем, существует ли выбранная услуга
        db.get('SELECT * FROM services WHERE id = ?', [service_id], (err, service) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при проверке услуги' });
            }
            
            if (!service) {
                return res.status(404).json({ error: 'Услуга не найдена' });
            }
            
            // Обновляем заказ
            db.run(
                'UPDATE orders SET service_id = ?, scheduled_time = ?, address = ?, final_price = ? WHERE id = ?',
                [service_id, scheduled_time, address, service.price, id],
                function(err) {
                    if (err) {
                        console.error('Error updating order:', err);
                        return res.status(500).json({ error: 'Ошибка при обновлении заказа' });
                    }
                    
                    if (this.changes === 0) {
                        return res.status(404).json({ error: 'Заказ не найден или не был изменен' });
                    }
                    
                    // Возвращаем обновленный заказ
                    db.get(
                        `SELECT o.*, 
                          s.title as service_title, 
                          s.description as service_description,
                          s.duration
                        FROM orders o
                        JOIN services s ON o.service_id = s.id
                        WHERE o.id = ?`,
                        [id],
                        (err, updatedOrder) => {
                            if (err) {
                                return res.status(500).json({ error: 'Ошибка при получении обновленного заказа' });
                            }
                            
                            res.json(updatedOrder);
                        }
                    );
                }
            );
        });
    });
});

// Добавить услугу (только для админов и сотрудников)
app.post('/api/services', authenticateToken, authorizeRole(['admin', 'employee']), (req, res) => {
    const { title, description, price, duration, category_id } = req.body;
    
    if (!title || !description || !price || !duration || !category_id) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    db.run(
        'INSERT INTO services (title, description, price, duration, category_id) VALUES (?, ?, ?, ?, ?)',
        [title, description, price, duration, category_id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при добавлении услуги' });
            }
            
            db.get(
                `SELECT s.id, s.title, s.description, s.price, s.duration, c.name as category, c.id as category_id
                FROM services s
                JOIN categories c ON s.category_id = c.id
                WHERE s.id = ?`,
                [this.lastID],
                (err, service) => {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка при получении добавленной услуги' });
                    }
                    res.status(201).json(service);
                }
            );
        }
    );
});

// Обновление услуги (только для админов и сотрудников)
app.put('/api/services/:id', authenticateToken, authorizeRole(['admin', 'employee']), (req, res) => {
    const { id } = req.params;
    const { title, description, price, duration, category_id } = req.body;
    
    if (!title || !description || !price || !duration || !category_id) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    // Проверяем, существует ли услуга
    db.get('SELECT * FROM services WHERE id = ?', [id], (err, service) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при проверке услуги' });
        }
        
        if (!service) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }
        
        // Обновляем услугу
        db.run(
            'UPDATE services SET title = ?, description = ?, price = ?, duration = ?, category_id = ? WHERE id = ?',
            [title, description, price, duration, category_id, id],
            function(err) {
                if (err) {
                    console.error('Error updating service:', err);
                    return res.status(500).json({ error: 'Ошибка при обновлении услуги' });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Услуга не найдена или не была изменена' });
                }
                
                // Возвращаем обновленную услугу
                db.get(
                    `SELECT s.id, s.title, s.description, s.price, s.duration, c.name as category, c.id as category_id
                    FROM services s
                    JOIN categories c ON s.category_id = c.id
                    WHERE s.id = ?`,
                    [id],
                    (err, updatedService) => {
                        if (err) {
                            return res.status(500).json({ error: 'Ошибка при получении обновленной услуги' });
                        }
                        
                        res.json(updatedService);
                    }
                );
            }
        );
    });
});

// Удаление услуги (только для админов)
app.delete('/api/services/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { id } = req.params;
    
    // Проверяем, используется ли услуга в заказах
    db.get('SELECT COUNT(*) as count FROM orders WHERE service_id = ?', [id], (err, result) => {
        if (err) {
            console.error('Ошибка при проверке использования услуги:', err);
            return res.status(500).json({ error: 'Ошибка при удалении услуги' });
        }
        
        // Если услуга используется в заказах, запрещаем удаление
        if (result.count > 0) {
            return res.status(400).json({ 
                error: 'Невозможно удалить услугу, так как она уже используется в заказах',
                count: result.count
            });
        }
        
        // Удаляем услугу
        db.run('DELETE FROM services WHERE id = ?', [id], function(err) {
            if (err) {
                console.error('Ошибка при удалении услуги:', err);
                return res.status(500).json({ error: 'Ошибка при удалении услуги' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Услуга не найдена' });
            }
            
            res.json({ 
                message: 'Услуга успешно удалена',
                id: parseInt(id)
            });
        });
    });
});

// Заполнение тестовых услуг
app.post('/api/init/services', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const services = [
        {
            title: 'Откачка септиков',
            description: 'Профессиональная откачка септиков и выгребных ям для частных домов',
            price: 2000,
            duration: '30-60 минут',
            category_id: 1 // Частный сектор
        },
        {
            title: 'Обслуживание предприятий',
            description: 'Комплексное обслуживание промышленных предприятий и производств',
            price: 5000,
            duration: '1-2 часа',
            category_id: 2 // Промышленность
        },
        {
            title: 'Откачка отстойников',
            description: 'Очистка и откачка промышленных отстойников любого объема',
            price: 15000,
            duration: '2-4 часа',
            category_id: 2 // Промышленность
        },
        {
            title: 'Утилизация отходов',
            description: 'Безопасная утилизация жидких бытовых отходов с соблюдением экологических норм',
            price: 3000,
            duration: '1-2 часа',
            category_id: 3 // Утилизация
        },
        {
            title: 'Регулярное обслуживание',
            description: 'Плановая откачка по графику с гибкой системой скидок',
            price: 1800,
            duration: '30-60 минут',
            category_id: 4 // Абонентское обслуживание
        },
        {
            title: 'Экспертиза и консультация',
            description: 'Профессиональная оценка состояния септиков и канализационных систем',
            price: 1500,
            duration: '1 час',
            category_id: 5 // Консультации
        },
        {
            title: 'Очистка канализации',
            description: 'Прочистка и промывка канализационных систем',
            price: 2500,
            duration: '1-3 часа',
            category_id: 1 // Частный сектор
        },
        {
            title: 'Аварийный выезд',
            description: 'Срочный выезд в случае переполнения или аварийной ситуации',
            price: 3500,
            duration: '30-60 минут',
            category_id: 6 // Экстренные вызовы
        }
    ];
    
    // Проверяем, есть ли уже услуги
    db.get('SELECT COUNT(*) as count FROM services', [], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при проверке услуг' });
        }
        
        if (result.count > 0) {
            return res.status(400).json({ error: 'Услуги уже существуют в системе' });
        }
        
        // Добавляем услуги
        const stmt = db.prepare('INSERT INTO services (title, description, price, duration, category_id) VALUES (?, ?, ?, ?, ?)');
        
        services.forEach(service => {
            stmt.run([service.title, service.description, service.price, service.duration, service.category_id], (err) => {
                if (err) {
                    console.error('Ошибка при добавлении услуги:', err);
                }
            });
        });
        
        stmt.finalize((err) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при добавлении услуг' });
            }
            res.json({ message: 'Услуги успешно добавлены', count: services.length });
        });
    });
});

// Маршруты для работы с категориями
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name ASC', [], (err, categories) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении категорий' });
        }
        res.json(categories);
    });
});

// Обновление статуса заказа (только для админов и сотрудников)
app.patch('/api/orders/:id/status', authenticateToken, authorizeRole(['admin', 'employee']), (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Некорректный статус' });
    }
    
    db.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при обновлении статуса' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Заказ не найден' });
            }
            
            res.json({ id, status, updated: true });
        }
    );
});

// Добавление отзыва к заказу
app.post('/api/feedback', authenticateToken, (req, res) => {
    const { order_id, rating, comment } = req.body;
    const user_id = req.user.userId;
    
    if (!order_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Некорректные данные отзыва' });
    }
    
    // Проверяем, существует ли заказ и принадлежит ли он пользователю
    db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [order_id, user_id], (err, order) => {
        if (err || !order) {
            return res.status(404).json({ error: 'Заказ не найден или не принадлежит пользователю' });
        }
        
        // Проверяем, есть ли уже отзыв на этот заказ
        db.get('SELECT * FROM feedback WHERE order_id = ?', [order_id], (err, existing) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при проверке отзыва' });
            }
            
            if (existing) {
                return res.status(400).json({ error: 'Отзыв для данного заказа уже существует' });
            }
            
            // Добавляем отзыв
            db.run(
                'INSERT INTO feedback (user_id, order_id, rating, comment) VALUES (?, ?, ?, ?)',
                [user_id, order_id, rating, comment || null],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка при добавлении отзыва' });
                    }
                    
                    res.status(201).json({
                        id: this.lastID,
                        user_id,
                        order_id,
                        rating,
                        comment
                    });
                }
            );
        });
    });
});

// Получение отзывов (публичный доступ)
app.get('/api/feedback', (req, res) => {
    db.all(
        `SELECT f.*, u.username, s.title as service_title 
        FROM feedback f
        JOIN users u ON f.user_id = u.id
        JOIN orders o ON f.order_id = o.id
        JOIN services s ON o.service_id = s.id
        ORDER BY f.created_at DESC`,
        [],
        (err, feedback) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при получении отзывов' });
            }
            res.json(feedback);
        }
    );
});

// Админские маршруты
app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
    db.all(
        `SELECT u.id, u.username, u.email, u.phone, u.address, r.name as role, u.created_at 
        FROM users u
        JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC`,
        [],
        (err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при получении пользователей' });
            }
            res.json(users);
        }
    );
});

// Изменение роли пользователя (только админ)
app.patch('/api/admin/users/:id/role', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { id } = req.params;
    const { role_id } = req.body;
    
    if (!role_id || ![1, 2, 3].includes(Number(role_id))) {
        return res.status(400).json({ error: 'Некорректный ID роли' });
    }
    
    db.run(
        'UPDATE users SET role_id = ? WHERE id = ?',
        [role_id, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при обновлении роли' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            
            db.get(
                `SELECT u.id, u.username, r.name as role 
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = ?`,
                [id],
                (err, user) => {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка при получении данных' });
                    }
                    res.json(user);
                }
            );
        }
    );
});

// Обновление профиля пользователя администратором
app.patch('/api/admin/users/:id/profile', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { username, email, phone, address, full_name, discount_amount, birthday } = req.body;
    
    console.log('Обновление профиля администратором:', {
        id,
        username,
        email,
        phone,
        address,
        full_name,
        discount_amount,
        birthday,
        body: req.body
    });
    
    try {
        // Проверяем обязательные поля
        if (!username || !email) {
            return res.status(400).json({ error: 'Имя пользователя и email обязательны для заполнения' });
        }

        // Проверяем, не занято ли имя пользователя или email другим пользователем
        const existingUser = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
                [username, email, id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' });
        }
        
        // Проверяем структуру таблицы users
        const columns = await new Promise((resolve, reject) => {
            db.all("PRAGMA table_info(users)", [], (err, columns) => {
                if (err) {
                    console.error('Ошибка при проверке структуры таблицы:', err);
                    reject(err);
                    return;
                }
                resolve(columns);
            });
        });
        
        // Получаем список имен колонок
        const columnNames = columns.map(column => column.name);
        console.log('Колонки в таблице users:', columnNames);
        
        // Формируем запрос динамически на основе существующих колонок
        let query = 'UPDATE users SET username = ?, email = ?';
        const params = [username, email];
        
        if (columnNames.includes('phone')) {
            query += ', phone = ?';
            params.push(phone || null);
        }
        
        if (columnNames.includes('address')) {
            query += ', address = ?';
            params.push(address || null);
        }
        
        if (columnNames.includes('full_name')) {
            query += ', full_name = ?';
            params.push(full_name || null);
        } else {
            // Если колонки full_name нет, пробуем использовать name
            if (columnNames.includes('name')) {
                query += ', name = ?';
                params.push(full_name || null);
            }
        }
        
        if (columnNames.includes('birthday')) {
            query += ', birthday = ?';
            params.push(birthday || null);
        }
        
        if (columnNames.includes('discount_amount')) {
            query += ', discount_amount = ?';
            params.push(discount_amount || 0);
        } else if (columnNames.includes('first_order_discount')) {
            // Если колонки discount_amount нет, но есть first_order_discount
            query += ', first_order_discount = ?';
            params.push(discount_amount && discount_amount > 0 ? 1 : 0);
        }
        
        query += ' WHERE id = ?';
        params.push(id);
        
        console.log('SQL-запрос:', query);
        console.log('Параметры:', params);

        // Обновляем данные пользователя
        await new Promise((resolve, reject) => {
            db.run(query, params, function(err) {
                if (err) {
                    console.error('Ошибка при обновлении профиля:', err);
                    reject(err);
                    return;
                }
                
                if (this.changes === 0) {
                    console.error('Пользователь не найден:', id);
                    reject(new Error('Пользователь не найден'));
                    return;
                }
                
                console.log('Профиль успешно обновлен:', id);
                resolve(true);
            });
        });

        // Получаем обновленные данные пользователя
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.id, u.username, u.email, u.phone, u.address, r.name as role
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        console.error('Ошибка при получении данных пользователя:', err);
                        reject(err);
                    } else {
                        // Добавляем поля, которые могут быть в таблице
                        if (columnNames.includes('full_name')) {
                            row.full_name = row.full_name || null;
                        }
                        if (columnNames.includes('birthday')) {
                            row.birthday = row.birthday || null;
                        }
                        if (columnNames.includes('discount_amount')) {
                            row.discount_amount = row.discount_amount || 0;
                        }
                        resolve(row);
                    }
                }
            );
        });

        res.json(user);
    } catch (error) {
        console.error('Ошибка при обновлении профиля пользователя:', error);
        console.error('Стек ошибки:', error.stack);
        if (error.message === 'Пользователь не найден') {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.status(500).json({ error: 'Ошибка при обновлении профиля пользователя' });
    }
});

// Добавляю эндпоинт для восстановления услуг, если они пропали
app.post('/api/restore-services', authenticateToken, authorizeRole(['admin']), (req, res) => {
    // Проверяем, есть ли уже услуги
    db.get('SELECT COUNT(*) as count FROM services', [], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при проверке услуг' });
        }
        
        // Если услуги есть, пропускаем инициализацию
        if (result.count > 0) {
            return res.status(400).json({ 
                error: 'В системе уже есть услуги',
                count: result.count 
            });
        }
        
        // Массив услуг для инициализации
        const services = [
            {
                title: 'Откачка септиков',
                description: 'Профессиональная откачка септиков и выгребных ям для частных домов',
                price: 2000,
                duration: '30-60 минут',
                category_id: 1 // Частный сектор
            },
            {
                title: 'Обслуживание предприятий',
                description: 'Комплексное обслуживание промышленных предприятий и производств',
                price: 5000,
                duration: '1-2 часа',
                category_id: 2 // Промышленность
            },
            {
                title: 'Откачка отстойников',
                description: 'Очистка и откачка промышленных отстойников любого объема',
                price: 15000,
                duration: '2-4 часа',
                category_id: 2 // Промышленность
            },
            {
                title: 'Утилизация отходов',
                description: 'Безопасная утилизация жидких бытовых отходов с соблюдением экологических норм',
                price: 3000,
                duration: '1-2 часа',
                category_id: 3 // Утилизация
            },
            {
                title: 'Регулярное обслуживание',
                description: 'Плановая откачка по графику с гибкой системой скидок',
                price: 1800,
                duration: '30-60 минут',
                category_id: 4 // Абонентское обслуживание
            },
            {
                title: 'Экспертиза и консультация',
                description: 'Профессиональная оценка состояния септиков и канализационных систем',
                price: 1500,
                duration: '1 час',
                category_id: 5 // Консультации
            },
            {
                title: 'Очистка канализации',
                description: 'Прочистка и промывка канализационных систем',
                price: 2500,
                duration: '1-3 часа',
                category_id: 1 // Частный сектор
            },
            {
                title: 'Аварийный выезд',
                description: 'Срочный выезд в случае переполнения или аварийной ситуации',
                price: 3500,
                duration: '30-60 минут',
                category_id: 6 // Экстренные вызовы
            }
        ];
        
        // Проверяем наличие категорий перед добавлением услуг
        db.get('SELECT COUNT(*) as count FROM categories', [], (err, catResult) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при проверке категорий' });
            }
            
            if (catResult.count === 0) {
                return res.status(400).json({ error: 'Сначала необходимо добавить категории услуг' });
            }
            
            // Добавляем услуги
            const stmt = db.prepare('INSERT INTO services (title, description, price, duration, category_id) VALUES (?, ?, ?, ?, ?)');
            const addedServices = [];
            
            services.forEach(service => {
                stmt.run([service.title, service.description, service.price, service.duration, service.category_id], function(err) {
                    if (err) {
                        console.error('Ошибка при добавлении услуги:', err);
                    } else {
                        addedServices.push({
                            id: this.lastID,
                            ...service
                        });
                    }
                });
            });
            
            stmt.finalize((err) => {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при добавлении услуг' });
                }
                
                res.json({ 
                    message: 'Услуги успешно восстановлены', 
                    count: services.length,
                    services: addedServices
                });
            });
        });
    });
});

// Handle SPA routing - должен быть последним маршрутом
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 