USE CiberCheck;
GO

-- Insertar Usuarios
INSERT INTO Users (FirstName, LastName, Email, Role, PasswordHash) VALUES
('Alvaro', 'Coello', 'palcoell@cibertec.edu.pe', 'profesor', '$2a$12$a4/15tNZryeIdDd7nKzo2uWM3tC7Qbbi03O3jGO76ZvEEGReMeeW6'), -- Password: profe123
('María', 'González', 'mgonzalez@cibertec.edu.pe', 'profesor', '$2a$12$a4/15tNZryeIdDd7nKzo2uWM3tC7Qbbi03O3jGO76ZvEEGReMeeW6'), -- Password: profe123
('Carlos', 'Rodríguez', 'crodriguez@cibertec.edu.pe', 'profesor', '$2a$12$a4/15tNZryeIdDd7nKzo2uWM3tC7Qbbi03O3jGO76ZvEEGReMeeW6'), -- Password: profe123

-- Estudiantes principales (IDs 4-7)
('Claudio', 'Chumpitaz', 'i201623590@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'), -- Password: estudiante123
('Angely', 'Eusebio', 'i202408695@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'), -- Password: estudiante123
('Juan', 'Blas', 'i202408624@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'), -- Password: estudiante123
('Jason', 'Vila', 'i202409323@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'), -- Password: estudiante123

-- Estudiantes adicionales (IDs 8-20)
('Ana', 'López', 'i202507323@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Luis', 'Martínez', 'i202507324@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Carmen', 'Sánchez', 'i202507325@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Miguel', 'Torres', 'i202507326@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Laura', 'Ramírez', 'i202507327@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Pedro', 'Flores', 'i202507328@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Sofia', 'Morales', 'i202507329@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Diego', 'Castro', 'i202507330@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Valentina', 'Ruiz', 'i202507331@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Javier', 'Mendoza', 'i202507332@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Isabella', 'Vargas', 'i202507333@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Andrés', 'Silva', 'i202507334@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),
('Camila', 'Ortiz', 'i202507335@cibertec.edu.pe', 'estudiante', '$2a$12$sDIyJPxIp3/hkt34lKVHtOOWKIc2hD0giexx/ltkQm1YOwYKS5Awi'),

-- Administrador
('Admin', 'Cibertec', 'admin@cibertec.edu.pe', 'administrador', '$2a$12$1SBNQdnlIKKTA3.Z/Lms5u7t0ky.BIXGSt1rmqiwcROdvTu1gNN2m'); -- Password: admin123
GO

-- Insertar Cursos (todos dictados por el profesor Alvaro Coello)
INSERT INTO Courses (Name, Code, Slug, Color) VALUES
('Desarrollo de Aplicaciones Móviles I', 'DAM-I', 'desarrollo-de-aplicaciones-moviles-i', '#dc2626'),
('Seguridad de Aplicaciones', 'SEG-APP', 'seguridad-de-aplicaciones', '#2563eb'),
('Lenguaje de Programación II', 'LP-II', 'lenguaje-de-programacion-ii', '#7c3aed'),
('Desarrollo de Servicios Web I', 'DSW-I', 'desarrollo-de-servicios-web-i', '#059669'),
('Desarrollo de Aplicaciones Web I', 'DAW-I', 'desarrollo-de-aplicaciones-web-i', '#ea580c'),
('Base de Datos Avanzado I', 'BDA-I', 'base-de-datos-avanzado-i', '#ec4899');
GO

-- Insertar Secciones (todas con el profesor Alvaro Coello - TeacherId = 1)
INSERT INTO Sections (CourseId, TeacherId, Name, Slug, IsVirtual) VALUES
-- Desarrollo de Aplicaciones Móviles I (2 secciones)
(1, 1, '1001', 'seccion-1001', 0),
(1, 1, '1002', 'seccion-1002', 1),
-- Seguridad de Aplicaciones (2 secciones)
(2, 1, '2001', 'seccion-2001', 0),
(2, 1, '2002', 'seccion-2002', 1),
-- Lenguaje de Programación II (2 secciones)
(3, 1, '3001', 'seccion-3001', 0),
(3, 1, '3002', 'seccion-3002', 1),
-- Desarrollo de Servicios Web I (1 sección)
(4, 1, '4001', 'seccion-4001', 0),
-- Desarrollo de Aplicaciones Web I (1 sección)
(5, 1, '5001', 'seccion-5001', 1),
-- Base de Datos Avanzado I (1 sección)
(6, 1, '6001', 'seccion-6001', 1);
GO

-- Insertar Estudiantes en Secciones (los 4 estudiantes principales + otros en todas las secciones)
INSERT INTO StudentsSections (StudentId, SectionId) VALUES
-- Sección 1: DAM-I 1001 (Presencial) - TODOS los estudiantes incluyendo los 4 principales
(4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1), (10, 1), (11, 1), (12, 1), (13, 1),
-- Sección 2: DAM-I 1002 (Virtual) - TODOS los estudiantes incluyendo los 4 principales
(4, 2), (5, 2), (6, 2), (7, 2), (14, 2), (15, 2), (16, 2), (17, 2), (18, 2), (19, 2),
-- Sección 3: SEG-APP 2001 - Los 4 principales + otros
(4, 3), (5, 3), (6, 3), (7, 3), (8, 3), (9, 3), (10, 3), (11, 3),
-- Sección 4: SEG-APP 2002 (Virtual) - Los 4 principales + otros
(4, 4), (5, 4), (6, 4), (7, 4), (12, 4), (13, 4), (14, 4), (15, 4),
-- Sección 5: LP-II 3001 - Los 4 principales + otros
(4, 5), (5, 5), (6, 5), (7, 5), (16, 5), (17, 5), (18, 5), (19, 5),
-- Sección 6: LP-II 3002 (Virtual) - Los 4 principales + otros
(4, 6), (5, 6), (6, 6), (7, 6), (8, 6), (9, 6), (10, 6), (11, 6),
-- Sección 7: DSW-I 4001 - Los 4 principales + otros
(4, 7), (5, 7), (6, 7), (7, 7), (12, 7), (13, 7), (14, 7), (15, 7),
-- Sección 8: DAW-I 5001 (Virtual) - Los 4 principales + otros
(4, 8), (5, 8), (6, 8), (7, 8), (16, 8), (17, 8), (18, 8), (19, 8),
-- Sección 9: BDA-I 6001 (Virtual) - Los 4 principales + otros
(4, 9), (5, 9), (6, 9), (7, 9), (8, 9), (9, 9), (10, 9), (11, 9);
GO

-- Insertar Sesiones
INSERT INTO Sessions (SectionId, SessionNumber, Date, StartTime, EndTime, Topic) VALUES
-- ========================================================================================
-- SESIONES DE HOY 30/10/2025 - MÚLTIPLES SESIONES PARA LOS 4 ESTUDIANTES PRINCIPALES
-- ========================================================================================

-- HOY: DAM-I 1001 (Presencial) - 3 sesiones en diferentes horarios
(1, 1, '2025-10-30', '08:00', '10:00', 'Introducción a Kotlin y Android Studio'),
(1, 2, '2025-10-30', '10:30', '12:30', 'Variables y Tipos de Datos en Kotlin'),
(1, 3, '2025-10-30', '14:00', '16:00', 'Funciones y Control de Flujo'),

-- HOY: DAM-I 1002 (Virtual) - 2 sesiones
(2, 1, '2025-10-30', '16:30', '18:30', 'Introducción a Jetpack Compose'),
(2, 2, '2025-10-30', '19:00', '21:00', 'Composables Básicos'),

-- HOY: SEG-APP 2001 - 1 sesión adicional
(3, 1, '2025-10-30', '08:00', '10:00', 'Fundamentos de Seguridad en Apps'),

-- HOY: LP-II 3001 - 1 sesión adicional
(5, 1, '2025-10-30', '11:00', '13:00', 'Fundamentos de Java'),

-- HOY: DSW-I 4001 - 1 sesión adicional
(7, 1, '2025-10-30', '15:00', '17:00', 'Introducción a Node.js'),

-- ========================================================================================
-- SESIONES DE MAÑANA 31/10/2025 - EN DIFERENTES CURSOS
-- ========================================================================================

-- MAÑANA: DAM-I 1001 (Presencial)
(1, 4, '2025-10-31', '08:00', '10:00', 'Actividades y Ciclo de Vida en Android'),

-- MAÑANA: SEG-APP 2002 (Virtual)
(4, 1, '2025-10-31', '10:30', '12:30', 'Introducción a Ciberseguridad'),

-- MAÑANA: LP-II 3002 (Virtual)
(6, 1, '2025-10-31', '14:00', '16:00', 'Introducción a Programación Avanzada'),

-- MAÑANA: DAW-I 5001 (Virtual)
(8, 1, '2025-10-31', '16:30', '18:30', 'HTML5 y CSS3 Avanzado'),

-- ========================================================================================
-- SESIONES FUTURAS - NOVIEMBRE EN ADELANTE
-- ========================================================================================

-- Sección 1: DAM-I 1001 (Presencial) - Continuación
(1, 5, '2025-11-04', '08:00', '10:00', 'Layouts y Views en Android'),
(1, 6, '2025-11-06', '08:00', '10:00', 'RecyclerView y Adaptadores'),
(1, 7, '2025-11-11', '08:00', '10:00', 'Intents y Navegación entre Activities'),
(1, 8, '2025-11-13', '08:00', '10:00', 'Persistencia de Datos con Room'),
(1, 9, '2025-11-18', '08:00', '10:00', 'ViewModel y LiveData'),
(1, 10, '2025-11-20', '08:00', '10:00', 'Consumo de API REST con Retrofit'),
(1, 11, '2025-11-25', '08:00', '10:00', 'Gestión de Imágenes con Glide'),
(1, 12, '2025-11-27', '08:00', '10:00', 'Fragments y Navigation Component'),
(1, 13, '2025-12-02', '08:00', '10:00', 'Material Design y UI Avanzada'),
(1, 14, '2025-12-04', '08:00', '10:00', 'Proyecto Final - Parte 1'),

-- Sección 2: DAM-I 1002 (Virtual) - Continuación
(2, 3, '2025-11-06', '10:00', '12:00', 'State Management en Compose'),
(2, 4, '2025-11-13', '10:00', '12:00', 'Navegación en Compose'),
(2, 5, '2025-11-20', '10:00', '12:00', 'LazyColumn y Listas'),
(2, 6, '2025-11-27', '10:00', '12:00', 'Integración con ViewModel'),
(2, 7, '2025-12-04', '10:00', '12:00', 'Theming y Material You'),
(2, 8, '2025-12-11', '10:00', '12:00', 'Animaciones en Compose'),

-- Sección 3: SEG-APP 2001
(3, 2, '2025-11-05', '14:00', '16:00', 'OWASP Mobile Top 10'),
(3, 3, '2025-11-10', '14:00', '16:00', 'Autenticación y Autorización'),
(3, 4, '2025-11-12', '14:00', '16:00', 'Cifrado de Datos'),
(3, 5, '2025-11-17', '14:00', '16:00', 'Seguridad en APIs REST'),
(3, 6, '2025-11-19', '14:00', '16:00', 'Almacenamiento Seguro'),

-- Sección 4: SEG-APP 2002 (Virtual)
(4, 2, '2025-11-07', '08:00', '10:00', 'Pruebas de Penetración'),
(4, 3, '2025-11-14', '08:00', '10:00', 'Análisis de Vulnerabilidades'),
(4, 4, '2025-11-21', '08:00', '10:00', 'Secure Coding Practices'),
(4, 5, '2025-11-28', '08:00', '10:00', 'SSL/TLS y Certificados'),

-- Sección 5: LP-II 3001
(5, 2, '2025-11-06', '14:00', '16:00', 'POO en Java'),
(5, 3, '2025-11-11', '14:00', '16:00', 'Colecciones en Java'),
(5, 4, '2025-11-13', '14:00', '16:00', 'Generics y Streams'),
(5, 5, '2025-11-18', '14:00', '16:00', 'Manejo de Excepciones'),

-- Sección 6: LP-II 3002 (Virtual)
(6, 2, '2025-11-08', '09:00', '11:00', 'Patrones de Diseño'),
(6, 3, '2025-11-15', '09:00', '11:00', 'Clean Code'),
(6, 4, '2025-11-22', '09:00', '11:00', 'Testing Unitario'),

-- Sección 7: DSW-I 4001
(7, 2, '2025-11-05', '10:00', '12:00', 'Express.js Basics'),
(7, 3, '2025-11-10', '10:00', '12:00', 'RESTful APIs'),
(7, 4, '2025-11-12', '10:00', '12:00', 'Middleware y Routing'),
(7, 5, '2025-11-17', '10:00', '12:00', 'Autenticación JWT'),

-- Sección 8: DAW-I 5001 (Virtual)
(8, 2, '2025-11-07', '14:00', '16:00', 'JavaScript ES6+'),
(8, 3, '2025-11-14', '14:00', '16:00', 'DOM Manipulation'),
(8, 4, '2025-11-21', '14:00', '16:00', 'Fetch API y Promesas'),
(8, 5, '2025-11-28', '14:00', '16:00', 'Introducción a React'),

-- Sección 9: BDA-I 6001 (Virtual)
(9, 1, '2025-11-01', '14:00', '16:00', 'SQL Avanzado'),
(9, 2, '2025-11-08', '14:00', '16:00', 'Procedimientos Almacenados'),
(9, 3, '2025-11-15', '14:00', '16:00', 'Triggers y Views'),
(9, 4, '2025-11-22', '14:00', '16:00', 'Optimización de Consultas');
GO