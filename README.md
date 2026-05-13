# Project Manager

O aplicație full-stack pentru managementul proiectelor cu frontend Angular și backend Node.js/TypeScript.

## Structura Proiectului

```
project-manager/
├── client/                 # Angular frontend
├── server/                 # Node.js/Express backend
│   └── src/
│       ├── config/         # Configurare bază de date
│       ├── controllers/    # Controllere pentru request-uri
│       ├── entities/       # Entități TypeORM
│       ├── middleware/     # Middleware Auth & Admin
│       ├── routes/         # Rute API
│       ├── seeds/          # Seeders bază de date
│       └── types/          # Declarații TypeScript
├── docs/                   # Documentație
│   ├── Project_Manager.md  # Definiția Produsului
│   └── Architecture.md     # Arhitectură Tehnică
└── README.md
```

---

## Ghid de Instalare pentru Windows

### Cerințe preliminare

Pentru a rula acest proiect pe Windows, aveți nevoie de următoarele programe instalate:

| Program | Versiune | Link Download |
|---------|----------|---------------|
| **Node.js** | 18+ (recomandat LTS) | [https://nodejs.org/](https://nodejs.org/) |
| **MySQL** | 8.0+ | [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/) |
| **Git** | Ultima versiune | [https://git-scm.com/download/win](https://git-scm.com/download/win) |
| **Visual Studio Code** (opțional) | Ultima versiune | [https://code.visualstudio.com/](https://code.visualstudio.com/) |

---

### Pasul 1: Instalare Node.js

1. Descărcați installerul Node.js de la [nodejs.org](https://nodejs.org/)
2. Alegeți versiunea **LTS** (Long Term Support)
3. Rulați installerul și urmați pașii:
   - Accept License Agreement
   - Alegeți locația de instalare (default este OK)
   - **Important**: Bifați opțiunea "Add to PATH"
4. Verificați instalarea deschizând **Command Prompt** (cmd) și rulând:
   ```cmd
   node --version
   npm --version
   ```
   Ar trebui să vedeți versiunile instalate (ex: v20.x.x și 10.x.x)

---

### Pasul 2: Instalare MySQL

1. Descărcați **MySQL Installer** de la [dev.mysql.com](https://dev.mysql.com/downloads/installer/)
2. Alegeți versiunea "mysql-installer-community" (cea mai mare)
3. Rulați installerul și selectați **Custom** setup
4. Selectați următoarele componente:
   - **MySQL Server 8.0.x**
   - **MySQL Workbench** (opțional, pentru interfață grafică)
5. Configurați serverul:
   - Authentication Method: **Use Strong Password Encryption**
   - Setați parola pentru utilizatorul **root** (rețineți această parolă!)
   - Windows Service: Lăsați bifat "Configure MySQL Server as a Windows Service"
6. Finalizați instalarea

#### Verificare MySQL
Deschideți **Command Prompt** și rulați:
```cmd
mysql -u root -p
```
Introduceți parola setată la instalare. Dacă vedeți `mysql>`, instalarea este completă.

---

### Pasul 3: Instalare Git

1. Descărcați Git de la [git-scm.com](https://git-scm.com/download/win)
2. Rulați installerul cu setările default
3. Verificați instalarea:
   ```cmd
   git --version
   ```

---

### Pasul 4: Clonare sau Descărcare Proiect

**Opțiunea A - Cu Git:**
```cmd
cd C:\Projects
git clone <url-repository>
cd task-management
```

**Opțiunea B - Descărcare ZIP:**
1. Descărcați proiectul ca arhivă ZIP
2. Extrageți în `C:\Projects\task-management`

---

### Pasul 5: Configurare Bază de Date

1. Deschideți **MySQL Workbench** sau **Command Prompt**
2. Conectați-vă la MySQL:
   ```cmd
   mysql -u root -p
   ```
3. Creați baza de date:
   ```sql
   CREATE DATABASE project_manager;
   exit;
   ```

---

### Pasul 6: Configurare și Pornire Server (Backend)

1. Deschideți **Command Prompt** și navigați la folderul server:
   ```cmd
   cd C:\Projects\task-management\server
   ```

2. Instalați dependențele:
   ```cmd
   npm install
   ```

3. Creați fișierul de configurare `.env`:
   ```cmd
   copy .env.example .env
   ```

4. Editați fișierul `.env` cu Notepad sau VS Code:
   ```cmd
   notepad .env
   ```

   Modificați valorile astfel:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=parola_voastra_mysql
   DB_DATABASE=project_manager
   SESSION_SECRET=o_cheie_secreta_complexa
   CLIENT_URL=http://localhost:4200
   ```

5. Porniți serverul:
   ```cmd
   npm run dev
   ```

   Ar trebui să vedeți:
   ```
   Connected to MySQL database
   Admin user created successfully
     Email: admin@admin.com
     Password: admin123
   Server running on http://localhost:3000
   ```

**Lăsați această fereastră deschisă!**

---

### Pasul 7: Configurare și Pornire Client (Frontend)

1. Deschideți o **nouă fereastră** Command Prompt
2. Navigați la folderul client:
   ```cmd
   cd C:\Projects\task-management\client
   ```

3. Instalați dependențele:
   ```cmd
   npm install
   ```

4. Porniți aplicația Angular:
   ```cmd
   npm start
   ```

   Așteptați până vedeți:
   ```
   Application bundle generation complete.
   ➜  Local:   http://localhost:4200/
   ```

5. Deschideți browser-ul la adresa: **http://localhost:4200**

---

### Pasul 8: Autentificare

Folosiți credențialele default pentru admin:
- **Email:** admin@admin.com
- **Password:** admin123

---

## Rezolvarea Problemelor Frecvente

### Eroare: "node is not recognized as an internal or external command"
**Soluție:** Node.js nu este în PATH. Reinstalați Node.js și asigurați-vă că bifați "Add to PATH".

### Eroare: "mysql is not recognized..."
**Soluție:** Adăugați MySQL în PATH:
1. Căutați "Environment Variables" în Windows
2. Editați variabila `Path`
3. Adăugați: `C:\Program Files\MySQL\MySQL Server 8.0\bin`

### Eroare: "Access denied for user 'root'@'localhost'"
**Soluție:** Parola din fișierul `.env` nu corespunde cu cea setată la instalare MySQL.

### Eroare: "Unknown database 'project_manager'"
**Soluție:** Creați baza de date manual (vezi Pasul 5).

### Eroare: "EADDRINUSE: address already in use"
**Soluție:** Portul este ocupat. Închideți alte aplicații sau modificați portul în `.env`.

### Aplicația nu se încarcă în browser
**Soluție:**
1. Asigurați-vă că ambele servere rulează (backend și frontend)
2. Verificați că nu aveți erori în consolele Command Prompt
3. Încercați să ștergeți cache-ul browser-ului (Ctrl+Shift+Delete)

---

## Comenzi Utile

| Comandă | Descriere | Director |
|---------|-----------|----------|
| `npm run dev` | Pornește serverul în modul dezvoltare | `/server` |
| `npm start` | Pornește aplicația Angular | `/client` |
| `npm install` | Instalează dependențele | oricare |
| `npm run build` | Compilează pentru producție | `/client` |

---

## Structura API

### Autentificare
| Metodă | Endpoint | Descriere |
|--------|----------|-----------|
| POST | /api/auth/login | Autentificare utilizator |
| POST | /api/auth/register | Înregistrare utilizator |
| POST | /api/auth/logout | Delogare |
| GET | /api/auth/me | Obține utilizatorul curent |

### Utilizatori (doar Admin)
| Metodă | Endpoint | Descriere |
|--------|----------|-----------|
| GET | /api/users | Lista utilizatorilor |
| GET | /api/users/:id | Obține utilizator după ID |
| POST | /api/users | Creează utilizator |
| PUT | /api/users/:id | Actualizează utilizator |
| DELETE | /api/users/:id | Șterge utilizator |

### Proiecte
| Metodă | Endpoint | Descriere |
|--------|----------|-----------|
| GET | /api/projects | Lista proiectelor |
| GET | /api/projects/:id | Obține proiect |
| POST | /api/projects | Creează proiect (Admin) |
| PUT | /api/projects/:id | Actualizează proiect (Admin) |
| DELETE | /api/projects/:id | Șterge proiect (Admin) |
| GET | /api/projects/:id/members | Lista membrilor |
| POST | /api/projects/:id/members | Adaugă membru (Admin) |
| DELETE | /api/projects/:id/members/:userId | Elimină membru (Admin) |

### Task-uri
| Metodă | Endpoint | Descriere |
|--------|----------|-----------|
| GET | /api/projects/:projectId/tasks | Lista task-urilor proiectului |
| GET | /api/tasks/:id | Obține task |
| POST | /api/projects/:projectId/tasks | Creează task |
| PUT | /api/tasks/:id | Actualizează task |
| DELETE | /api/tasks/:id | Șterge task |

### Dashboard
| Metodă | Endpoint | Descriere |
|--------|----------|-----------|
| GET | /api/dashboard/stats | Statistici dashboard |

---

## Stack Tehnologic

### Backend
- Node.js + TypeScript
- Express.js
- TypeORM + MySQL
- bcrypt (hashing parole)
- express-session (autentificare)

### Frontend
- Angular 21
- Angular Material
- RxJS

---

## Documentație

- [Definiția Produsului](docs/Project_Manager.md)
- [Arhitectură](docs/Architecture.md)

---

## Credențiale Default

| Rol | Email | Parolă |
|-----|-------|--------|
| Administrator | admin@admin.com | admin123 |

**Important:** Schimbați parola administratorului după prima autentificare în producție!
