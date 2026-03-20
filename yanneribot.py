#!/usr/bin/env python3
"""
Yanneribot CLI - Chat con el equipo de desarrollo
Usage: python yanneribot.py
"""

import json
import os
import sys
import subprocess
from datetime import datetime

TEAM_DIR = ".antigravity/team"
TASKS_FILE = f"{TEAM_DIR}/tasks.json"
MAILBOX_DIR = f"{TEAM_DIR}/mailbox"
BROADCAST_FILE = f"{TEAM_DIR}/broadcast.msg"

class Yanneribot:
    def __init__(self):
        self.name = "Yanneribot"
        self.role = "Director del Equipo de Desarrollo"
        self.welcome = """
╔══════════════════════════════════════════════════════════════╗
║                    🤖 YANNERIBOT ACTIVO                      ║
║                                                                  ║
║  Soy el director del equipo de desarrollo de DavaSoft.         ║
║  Estoy aquí para ayudarte con:                                ║
║                                                                  ║
║    📋 Ver tareas del equipo                                   ║
║    ➕ Crear nuevas tareas                                     ║
║    🔍 Analizar código                                         ║
║    🐛 Debugging y errores                                     ║
║    📦 Agregar features                                        ║
║    💡 Sugerir mejores prácticas                               ║
║    📖 Explicar código existente                               ║
║                                                                  ║
║  Escribe tu pregunta o comando                                ║
║  Escribe 'ayuda' para ver todos los comandos                  ║
║  Escribe 'salir' para terminar                                ║
╚══════════════════════════════════════════════════════════════╝
"""
        
        self.commands = {
            "ayuda": self.show_help,
            "tareas": self.show_tasks,
            "tareas pendientes": self.show_pending_tasks,
            "tareas completadas": self.show_completed_tasks,
            "miembros": self.show_members,
            "estado": self.show_status,
            "broadcast": self.send_broadcast,
            "crear tarea": self.create_task,
            "asignar": self.assign_task,
            "log": self.show_activity_log,
            "buscar": self.search_code,
            "analizar": self.analyze_code,
            "build": self.run_build,
            "test": self.run_tests,
            "typecheck": self.run_typecheck,
            "salir": self.exit,
        }

    def show_help(self, args=""):
        return """
📋 COMANDOS DISPONIBLES:

   📌 CONSULTAS:
   • tareas          - Ver todas las tareas
   • tareas pendientes - Ver tareas por hacer
   • tareas completadas - Ver tareas terminadas
   • miembros        - Ver miembros del equipo
   • estado          - Ver estado del equipo
   • log             - Ver actividad reciente

   🔧 ACCIONES:
   • crear tarea <nombre> - Crear nueva tarea
   • asignar <tarea> <miembro> - Asignar tarea
   • broadcast <mensaje> - Enviar mensaje al equipo

   ⚙️ HERRAMIENTAS:
   • buscar <texto>   - Buscar en el código
   • analizar <archivo> - Analizar un archivo
   • build            - Ejecutar npm run build
   • test             - Ejecutar npm run test
   • typecheck        - Ejecutar TypeScript check

   🚀 UTILIDADES:
   • ayuda            - Mostrar esta ayuda
   • salir            - Terminar sesión
"""

    def load_tasks(self):
        if os.path.exists(TASKS_FILE):
            with open(TASKS_FILE, 'r') as f:
                return json.load(f)
        return {"tasks": [], "members": []}

    def show_tasks(self, args=""):
        data = self.load_tasks()
        response = "\n📋 LISTA DE TAREAS:\n"
        response += "─" * 60 + "\n"
        for task in data.get("tasks", []):
            status_icon = "✅" if task["status"] == "COMPLETED" else "⏳"
            response += f"{status_icon} #{task['id']} | {task['status']:12} | {task['assigned_to']:10} | {task['title']}\n"
        response += "─" * 60
        return response

    def show_pending_tasks(self, args=""):
        data = self.load_tasks()
        pending = [t for t in data.get("tasks", []) if t["status"] != "COMPLETED"]
        if not pending:
            return "✅ No hay tareas pendientes. ¡El equipo está libre!"
        
        response = "\n⏳ TAREAS PENDIENTES:\n"
        for task in pending:
            response += f"  #{task['id']} [{task['assigned_to']}] {task['title']}\n"
        return response

    def show_completed_tasks(self, args=""):
        data = self.load_tasks()
        completed = [t for t in data.get("tasks", []) if t["status"] == "COMPLETED"]
        if not completed:
            return "❌ No hay tareas completadas aún."
        
        response = "\n✅ TAREAS COMPLETADAS:\n"
        for task in completed:
            response += f"  ✓ #{task['id']} {task['title']}\n"
        return response

    def show_members(self, args=""):
        data = self.load_tasks()
        response = "\n👥 MIEMBROS DEL EQUIPO:\n"
        response += "─" * 50 + "\n"
        for member in data.get("members", []):
            status_icon = "🟢" if member["status"] == "ACTIVE" else "⚪"
            response += f"{status_icon} {member['name']:20} | {member['id']:12} | {member['status']}\n"
        response += "─" * 50
        return response

    def show_status(self, args=""):
        data = self.load_tasks()
        tasks = data.get("tasks", [])
        pending = len([t for t in tasks if t["status"] != "COMPLETED"])
        completed = len([t for t in tasks if t["status"] == "COMPLETED"])
        
        active_members = [m for m in data.get("members", []) if m["status"] == "ACTIVE"]
        
        return f"""
📊 ESTADO DEL EQUIPO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🟢 Miembros activos: {len(active_members)}
  ⏳ Tareas pendientes: {pending}
  ✅ Tareas completadas: {completed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    def send_broadcast(self, message):
        os.makedirs(TEAM_DIR, exist_ok=True)
        with open(BROADCAST_FILE, 'a') as f:
            msg = {"de": "director", "tipo": "BROADCAST", "mensaje": message, "timestamp": datetime.now().isoformat()}
            f.write(json.dumps(msg) + "\n")
        return f"📢 Broadcast enviado: {message}"

    def create_task(self, task_name):
        if not task_name:
            return "❌ Debes especificar el nombre de la tarea.\n   Uso: crear tarea <nombre>"
        
        data = self.load_tasks()
        new_id = max([t["id"] for t in data.get("tasks", [])], default=0) + 1
        
        new_task = {
            "id": new_id,
            "title": task_name,
            "status": "PENDING",
            "plan_approved": False,
            "assigned_to": "director",
            "dependencies": []
        }
        
        data.setdefault("tasks", []).append(new_task)
        
        with open(TASKS_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        
        return f"✅ Tarea creada: #{new_id} - {task_name}"

    def assign_task(self, args):
        parts = args.split()
        if len(parts) < 2:
            return "❌ Debes especificar tarea y miembro.\n   Uso: asignar <id_tarea> <miembro>"
        
        try:
            task_id = int(parts[0])
            member = parts[1]
        except ValueError:
            return "❌ ID de tarea inválido."
        
        data = self.load_tasks()
        for task in data.get("tasks", []):
            if task["id"] == task_id:
                task["assigned_to"] = member
                with open(TASKS_FILE, 'w') as f:
                    json.dump(data, f, indent=2)
                return f"✅ Tarea #{task_id} asignada a {member}"
        
        return f"❌ Tarea #{task_id} no encontrada."

    def show_activity_log(self, args=""):
        log_file = ".antigravity/team/broadcast.msg"
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                lines = f.readlines()
            if lines:
                return "📝 ACTIVIDAD RECIENTE:\n" + "".join(lines[-5:])
        return "📝 No hay actividad reciente."

    def search_code(self, query):
        if not query:
            return "❌ Debes especificar qué buscar.\n   Uso: buscar <texto>"
        
        try:
            result = subprocess.run(
                ["grep", "-r", "--include=*.ts", "--include=*.tsx", query, "lib/", "components/", "app/"],
                capture_output=True, text=True, cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
            if result.stdout:
                lines = result.stdout.strip().split('\n')[:10]
                return f"🔍 RESULTADOS DE BÚSQUEDA:\n" + '\n'.join(lines)
            return f"🔍 No se encontró '{query}' en el código."
        except Exception as e:
            return f"❌ Error buscando: {e}"

    def analyze_code(self, filename):
        if not filename:
            return "❌ Debes especificar el archivo a analizar.\n   Uso: analizar <archivo>"
        
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(base_path, filename)
        
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            response = f"📖 ANÁLISIS DE: {filename}\n"
            response += f"   Líneas: {len(lines)}\n"
            response += f"   Tamaño: {os.path.getsize(file_path)} bytes\n\n"
            
            # Análisis básico
            has_use_client = any("use client" in line for line in lines[:5])
            has_use_server = any("use server" in line for line in lines[:5])
            has_imports = any("import" in line for line in lines)
            
            if has_use_client:
                response += "   ⚠️ Componente de cliente (Client Component)\n"
            if has_use_server:
                response += "   ⚡ Componente de servidor (Server Component)\n"
            if has_imports:
                response += "   📦 Tiene imports\n"
            
            return response
        return f"❌ Archivo {filename} no encontrado."

    def run_build(self, args=""):
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        try:
            result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True, cwd=base_path, timeout=180)
            output = result.stdout[-1000:] if len(result.stdout) > 1000 else result.stdout
            return f"🔨 BUILD:\n{output}"
        except Exception as e:
            return f"❌ Error en build: {e}"

    def run_tests(self, args=""):
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        try:
            result = subprocess.run(["npm", "run", "test:ci"], capture_output=True, text=True, cwd=base_path, timeout=120)
            output = result.stdout[-1000:] if len(result.stdout) > 1000 else result.stdout
            return f"🧪 TESTS:\n{output}"
        except Exception as e:
            return f"❌ Error en tests: {e}"

    def run_typecheck(self, args=""):
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        try:
            result = subprocess.run(["npm", "run", "typecheck"], capture_output=True, text=True, cwd=base_path, timeout=120)
            if result.returncode == 0:
                return "✅ TypeScript: Sin errores"
            return f"❌ TypeScript:\n{result.stdout}"
        except Exception as e:
            return f"❌ Error: {e}"

    def exit(self, args=""):
        print("\n👋¡Hasta luego! Yanneribot/desactivado")
        sys.exit(0)

    def process_input(self, user_input):
        user_input = user_input.strip().lower()
        
        # Comandos directos
        for cmd, func in self.commands.items():
            if user_input.startswith(cmd):
                args = user_input[len(cmd):].strip()
                return func(args)
        
        # Respuestas para preguntas generales
        responses = {
            "hola": "¡Hola! 👋 Soy Yanneribot, el director de tu equipo de desarrollo. ¿En qué puedo ayudarte?",
            "hi": "¡Hola! 👋 Soy Yanneribot, el director de tu equipo de desarrollo. ¿En qué puedo ayudarte?",
            "hello": "¡Hola! 👋 Soy Yanneribot, el director de tu equipo de desarrollo. ¿En qué puedo ayudarte?",
            "que puedes hacer": self.show_help(""),
            "que haces": " Estoy activo y listo para ayudarte. Escribe 'ayuda' para ver lo que puedo hacer.",
            "estas vivo": "✅ ¡Estoy activo! Listo para ayudarte con el proyecto.",
            "estás activo": "✅ ¡Estoy activo! Listo para ayudarte con el proyecto.",
        }
        
        for key, response in responses.items():
            if key in user_input:
                return response
        
        return f"🤔 No entiendo '{user_input}'. Escribe 'ayuda' para ver comandos disponibles."

    def chat(self):
        print(self.welcome)
        
        while True:
            try:
                user_input = input("\n> ").strip()
                if not user_input:
                    continue
                print(self.process_input(user_input))
            except KeyboardInterrupt:
                self.exit("")
            except EOFError:
                break

if __name__ == "__main__":
    bot = Yanneribot()
    bot.chat()