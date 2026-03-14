import json
import os
import sys

TEAM_DIR = ".antigravity/team"


def init_team():
    """Inicializa la infraestructura del equipo."""
    os.makedirs(f"{TEAM_DIR}/mailbox", exist_ok=True)
    os.makedirs(f"{TEAM_DIR}/locks", exist_ok=True)
    tasks_path = f"{TEAM_DIR}/tasks.json"
    if not os.path.exists(tasks_path):
        with open(tasks_path, "w") as f:
            json.dump({"tasks": [], "members": []}, f, indent=2)
    if not os.path.exists(f"{TEAM_DIR}/broadcast.msg"):
        with open(f"{TEAM_DIR}/broadcast.msg", "w") as f:
            f.write("")
    print("✓ Infraestructura 'Equipo Yanneribot' lista.")


def _read_tasks(path):
    """Lee y parsea tasks.json de forma segura."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_tasks(path, data):
    """
    Escribe tasks.json de forma segura.
    FIX Bug 1: usa truncate() después de seek(0) para evitar basura
    al final del archivo cuando el nuevo JSON es más corto.
    """
    with open(path, "r+", encoding="utf-8") as f:
        f.seek(0)
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.truncate()  # ← elimina cualquier byte residual


def assign_task(title, assigned_to, deps=None):
    """
    Asigna una nueva tarea con soporte para dependencias.

    FIX Bug 2: deps=None en lugar de deps=[] para evitar el bug
    de argumento mutable compartido entre llamadas.

    FIX Bug 3: valida que las dependencias existan antes de crear la tarea.
    """
    # FIX Bug 2: inicializar la lista dentro de la función
    if deps is None:
        deps = []

    path = f"{TEAM_DIR}/tasks.json"
    if not os.path.exists(path):
        init_team()

    data = _read_tasks(path)

    # FIX Bug 3: validar que todas las dependencias existen
    existing_ids = {str(t["id"]) for t in data["tasks"]}
    invalid_deps = [d for d in deps if str(d) not in existing_ids]
    if invalid_deps:
        print(f"✗ Error: dependencias inexistentes: {invalid_deps}. Tarea no creada.")
        sys.exit(1)

    task = {
        "id": len(data["tasks"]) + 1,
        "title": title,
        "status": "PENDING",
        "plan_approved": False,
        "assigned_to": assigned_to,
        "dependencies": [str(d) for d in deps],  # normalizar a strings
    }
    data["tasks"].append(task)
    _write_tasks(path, data)
    print(f"✓ Tarea {task['id']} ({title}) asignada a {assigned_to}.")


def complete_task(task_id):
    """
    Marca una tarea como COMPLETED y libera su lock si existe.
    Notifica si otras tareas estaban bloqueadas esperando esta.
    """
    path = f"{TEAM_DIR}/tasks.json"
    if not os.path.exists(path):
        print("✗ Error: tasks.json no existe. Ejecuta 'init' primero.")
        sys.exit(1)

    data = _read_tasks(path)
    task_id_str = str(task_id)
    found = False

    for task in data["tasks"]:
        if str(task["id"]) == task_id_str:
            task["status"] = "COMPLETED"
            found = True
            print(f"✓ Tarea {task_id} marcada como COMPLETED.")
            break

    if not found:
        print(f"✗ Error: tarea {task_id} no encontrada.")
        sys.exit(1)

    _write_tasks(path, data)

    # Liberar lock si existe
    lock_path = f"{TEAM_DIR}/locks/{task_id}.lock"
    if os.path.exists(lock_path):
        os.remove(lock_path)
        print(f"✓ Lock de tarea {task_id} liberado.")

    # Informar tareas que ahora están desbloqueadas
    unblocked = [
        t for t in data["tasks"]
        if task_id_str in t.get("dependencies", []) and t["status"] == "PENDING"
    ]
    if unblocked:
        print(f"  → Tareas ahora desbloqueadas: {[t['id'] for t in unblocked]}")


def broadcast(sender, text):
    """Envía un mensaje a todos los miembros del equipo."""
    msg = {"de": sender, "tipo": "BROADCAST", "mensaje": text}
    with open(f"{TEAM_DIR}/broadcast.msg", "a", encoding="utf-8") as f:
        f.write(json.dumps(msg, ensure_ascii=False) + "\n")
    print(f"✓ Mensaje global enviado por {sender}.")


def send_message(sender, receiver, text):
    """Envía un mensaje al buzón de un agente específico."""
    msg = {"de": sender, "mensaje": text}
    os.makedirs(f"{TEAM_DIR}/mailbox", exist_ok=True)
    with open(f"{TEAM_DIR}/mailbox/{receiver}.msg", "a", encoding="utf-8") as f:
        f.write(json.dumps(msg, ensure_ascii=False) + "\n")
    print(f"✓ Mensaje enviado a {receiver}.")


def status():
    """Muestra el estado actual de todas las tareas."""
    path = f"{TEAM_DIR}/tasks.json"
    if not os.path.exists(path):
        print("✗ No hay proyecto iniciado. Ejecuta 'init' primero.")
        sys.exit(1)

    data = _read_tasks(path)
    tasks = data.get("tasks", [])
    if not tasks:
        print("Sin tareas registradas.")
        return

    icons = {"PENDING": "⏳", "IN_PROGRESS": "🔄", "COMPLETED": "✅", "BLOCKED": "🔒"}
    print(f"\n{'ID':<4} {'Estado':<14} {'Agente':<20} {'Título'}")
    print("-" * 65)
    for t in tasks:
        icon = icons.get(t["status"], "?")
        deps = f" [deps: {t['dependencies']}]" if t.get("dependencies") else ""
        print(f"{t['id']:<4} {icon} {t['status']:<12} {t['assigned_to']:<20} {t['title']}{deps}")
    print()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: team_manager.py <comando> [args]")
        print("  init")
        print("  assign <titulo> <agente> [dep_id ...]")
        print("  complete <task_id>")
        print("  broadcast <remitente> <mensaje>")
        print("  msg <remitente> <destinatario> <mensaje>")
        print("  status")
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "init":
        init_team()
    elif cmd == "assign" and len(sys.argv) > 3:
        assign_task(sys.argv[2], sys.argv[3], sys.argv[4:] if len(sys.argv) > 4 else None)
    elif cmd == "complete" and len(sys.argv) > 2:
        complete_task(sys.argv[2])
    elif cmd == "broadcast" and len(sys.argv) > 3:
        broadcast(sys.argv[2], sys.argv[3])
    elif cmd == "msg" and len(sys.argv) > 4:
        send_message(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == "status":
        status()
    else:
        print(f"✗ Comando desconocido o argumentos insuficientes: {cmd}")
        sys.exit(1)