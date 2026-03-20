---
name: Equipo Yanneribot (Multi-Agente)
description: Habilidad para coordinar múltiples agentes trabajando en paralelo en un proyecto Next.js, replicando la funcionalidad de 'Agent Teams'.
---

# Skill: Equipo Yanneribot (Multi-Agente)

Esta habilidad permite a Antigravity coordinar un equipo de agentes inteligentes trabajando en paralelo sobre el mismo proyecto Next.js, replicando la funcionalidad de "Agent Teams" de Claude Code.

## Configuración del Entorno
El equipo utiliza una carpeta oculta en la raíz del proyecto para comunicarse:
- `.antigravity/team/tasks.json` -> Lista maestra de tareas, estados y dependencias.
- `.antigravity/team/mailbox/` -> Mensajes individuales (.msg).
- `.antigravity/team/broadcast.msg` -> Mensajes globales para todo el equipo.
- `.antigravity/team/locks/` -> Semáforos para evitar edición simultánea de archivos.

## Roles del Equipo (Adaptado para Next.js)
1. **Director (Yanneribot)**: El líder. Divide el problema, asigna roles y aprueba planes.
2. **Arquitecto**: Define la estructura de carpetas (`app/`, `components/`, `lib/`), tipos de TypeScript y patrones de Server Actions.
3. **Especialista Frontend**: Implementa componentes React, manejo de estado (Zustand/Context) y estilos con Tailwind CSS.
4. **Especialista Backend & DB**: Gestiona rutas de API, Server Actions, y esquemas de Prisma.
5. **Marketer/UX Designer**: Utiliza herramientas como **Stitch** para prototipado, logos, copywriting y diseño de landing pages premium.
6. **Investigador**: Búsqueda de documentación de librerías, análisis de competencia y mejores prácticas de Next.js.
7. **Revisor (QA)**: Ejecuta tests (Vitest/Playwright), busca fallos de seguridad en `middleware.ts` y bugs de hidratación.

## Protocolo de Orquestación Avanzada

### 1. Modo de Planificación (Gatekeeping)
Antes de realizar cambios significativos, cada agente debe enviar un **Plan de Acción** al buzón de **Alejabot**.
- El agente se mantiene en modo `READ_ONLY` o `PLANNING` hasta que Alejabot responda con un mensaje de `APPROVED`.

### 2. Mensajería y Difusión (Broadcast)
- **Mensaje Directo**: Coordinación 1 a 1 entre especialistas (ej: Frontend pide un nuevo campo al Backend).
- **Broadcast**: Alejabot puede escribir en `broadcast.msg` para dar nuevas directrices a todo el equipo simultáneamente (ej: "Cambio de branding, actualizar variables de CSS").

### 3. Sincronización de Tareas y Dependencias
- Las tareas en `tasks.json` pueden tener una lista de `dependencies`. Una IA no debe reclamar una tarea si sus dependencias no están en estado `COMPLETED`.

## Reglas Críticas (Next.js)
- **Bloqueos de Archivos**: NUNCA editar un archivo si existe un `.lock` activo en `.antigravity/team/locks/`.
- **Integridad de Tipos**: El Arquitecto debe aprobar cambios en `types/` antes de que otros empiecen.
- **Liberación**: Al completar una tarea, el agente debe liberar sus "locks", correr `npm run build` (opcionalmente) y notificar a Alejabot.

---

## 3. Script de Orquestación (team_manager.py)
*Este script automatiza la gestión de las tareas y la comunicación en el entorno Next.js.*

```python
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
        with open(tasks_path, 'w') as f:
            json.dump({"tasks": [], "members": []}, f, indent=2)
    if not os.path.exists(f"{TEAM_DIR}/broadcast.msg"):
        with open(f"{TEAM_DIR}/broadcast.msg", 'w') as f: f.write("")
    print("✓ Infraestructura 'Equipo Alejabot' lista.")

def assign_task(title, assigned_to, deps=[]):
    """Asigna una nueva tarea con soporte para dependencias."""
    path = f"{TEAM_DIR}/tasks.json"
    if not os.path.exists(path):
        init_team()
    with open(path, 'r+') as f:
        data = json.load(f)
        task = {
            "id": len(data["tasks"]) + 1,
            "title": title,
            "status": "PENDING",
            "plan_approved": False,
            "assigned_to": assigned_to,
            "dependencies": deps
        }
        data["tasks"].append(task)
        f.seek(0)
        json.dump(data, f, indent=2)
    print(f"✓ Tarea {task['id']} ({title}) asignada a {assigned_to}.")

def broadcast(sender, text):
    """Envía un mensaje a todos los miembros del equipo."""
    msg = {"de": sender, "tipo": "BROADCAST", "mensaje": text}
    with open(f"{TEAM_DIR}/broadcast.msg", 'a') as f:
        f.write(json.dumps(msg) + "\n")
    print(f"✓ Mensaje global enviado por {sender}.")

def send_message(sender, receiver, text):
    """Envía un mensaje al buzón de un agente específico."""
    msg = {"de": sender, "mensaje": text}
    os.makedirs(f"{TEAM_DIR}/mailbox", exist_ok=True)
    with open(f"{TEAM_DIR}/mailbox/{receiver}.msg", 'a') as f:
        f.write(json.dumps(msg) + "\n")
    print(f"✓ Mensaje enviado a {receiver}.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "init": init_team()
        elif cmd == "assign" and len(sys.argv) > 3:
            assign_task(sys.argv[2], sys.argv[3], sys.argv[4:] if len(sys.argv) > 4 else [])
        elif cmd == "broadcast" and len(sys.argv) > 3:
            broadcast(sys.argv[2], sys.argv[3])
        elif cmd == "msg" and len(sys.argv) > 4:
            send_message(sys.argv[2], sys.argv[3], sys.argv[4])
```
