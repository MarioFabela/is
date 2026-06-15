from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime, timedelta
import difflib
import re
import unicodedata
import os # ✅ Importamos OS
from supabase import create_client, Client

# ✅ Leemos las llaves de forma segura (Render se las inyectará)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ibwevarwvaotbhcfmkzd.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2V2YXJ3dmFvdGJoY2Zta3pkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc2NjY4NiwiZXhwIjoyMDk1MzQyNjg2fQ.ZABS7dp5p0QqbaySDkdcsQEOpDl4FIZwwG4RuZMT6hU")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# ✅ Puedes asegurar el CORS aquí también si lo deseas, o dejarlo abierto ("*") si solo es una API de consulta
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

sesiones_chat: Dict[str, dict] = {}

# Iconos 
ICONO_AZUL = "M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V18H12V13Z"
ICONO_ROJO = "M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM14.59 11.41L13.18 10L12 11.18L10.82 10L9.41 11.41L10.59 12.6L9.41 13.79L10.82 15.2L12 14.02L13.18 15.2L14.59 13.79L13.41 12.6L14.59 11.41Z"
ICONO_REPROGRAMAR = "M13.5 13H15.5L12 16.5L8.5 13H10.5C10.5 11.62 11.62 10.5 13 10.5C13.43 10.5 13.83 10.61 14.17 10.8L15.31 9.66C14.66 9.24 13.87 9 13 9C10.79 9 9 10.79 9 13H7L10.5 16.5L14 13H13.5ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V8H19V20Z"

class MensajeUsuario(BaseModel):
    id_sesion: str
    mensaje: str

# ==========================================
# UTILIDADES
# ==========================================
def limpiar_texto(texto: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn').lower()

def palabra_similar(palabra_usuario: str, lista_opciones: list, umbral: float = 0.7) -> Optional[str]:
    if not lista_opciones: return None
    match = difflib.get_close_matches(palabra_usuario, lista_opciones, n=1, cutoff=umbral)
    return match[0] if match else None

def expandir_numeros_escritos(texto: str) -> str:
    numeros = {
        "uno": "01", "dos": "02", "tres": "03", "cuatro": "04", "cinco": "05",
        "seis": "06", "siete": "07", "ocho": "08", "nueve": "09", "diez": "10",
        "once": "11", "doce": "12", "trece": "13", "catorce": "14", "quince": "15",
        "dieciseis": "16", "diecisiete": "17", "dieciocho": "18", "diecinueve": "19",
        "veinte": "20", "veintiuno": "21", "veintidos": "22", "veintitres": "23",
        "veinticuatro": "24", "veinticinco": "25", "veintiseis": "26", "veintisiete": "27",
        "veintiocho": "28", "veintinueve": "29", "treinta": "30", "treintaiuno": "31"
    }
    for palabra, num in numeros.items():
        texto = re.sub(r'\b' + palabra + r'\b', num, texto)
        texto = re.sub(palabra + r'(?=[a-z])', num, texto)
        texto = re.sub(r'(?<=[a-z])' + palabra, num, texto)
    return texto

def extraer_fecha_inteligente(texto: str):
    texto_orig = texto
    texto = limpiar_texto(texto)
    texto = expandir_numeros_escritos(texto)
    hoy = datetime.now()
    hoy_date = hoy.date()
    
    palabras_fecha = ["hoy", "mañana", "pasado mañana", "manana", "pasado manana"]
    mejor_match = palabra_similar(texto, palabras_fecha, umbral=0.7)
    if mejor_match:
        if mejor_match in ["hoy"]: return hoy.strftime("%Y-%m-%d")
        if mejor_match in ["mañana", "manana"]: return (hoy + timedelta(days=1)).strftime("%Y-%m-%d")
        if mejor_match in ["pasado mañana", "pasado manana"]: return (hoy + timedelta(days=2)).strftime("%Y-%m-%d")
    
    dias_semana = ["lunes", "martes", "miercoles", "miércoles", "jueves", "viernes", "sabado", "sábado", "domingo"]
    match_dia = palabra_similar(texto, dias_semana, umbral=0.7)
    if match_dia:
        target = match_dia.replace("sábado", "sabado").replace("miércoles", "miercoles")
        target_weekday = {"lunes":0, "martes":1, "miercoles":2, "jueves":3, "viernes":4, "sabado":5, "domingo":6}[target]
        today_weekday = hoy.weekday()
        days_ahead = (target_weekday - today_weekday) % 7
        if days_ahead == 0: days_ahead = 7
        return (hoy + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
    
    meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
    mes_match = palabra_similar(texto, meses, umbral=0.7)
    mes_num = None
    if mes_match:
        mes_num = {
            "enero":1,"febrero":2,"marzo":3,"abril":4,"mayo":5,"junio":6,"julio":7,"agosto":8,"septiembre":9,"octubre":10,"noviembre":11,"diciembre":12
        }[mes_match]
    
    patrones_fecha = [
        r'\b(\d{4})[/\-\.](\d{1,2})[/\-\.](\d{1,2})\b',
        r'\b(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{4})\b',
        r'\b(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{2})\b',
        r'\b(\d{1,2})(\d{2})(\d{4})\b',
        r'\b(\d{1,2})(\d{2})(\d{2})\b',
    ]
    for pat in patrones_fecha:
        m = re.search(pat, texto)
        if m:
            grupos = m.groups()
            if len(grupos) == 3:
                if len(grupos[0]) == 4: ano, mes, dia = grupos
                elif len(grupos[2]) == 4: dia, mes, ano = grupos
                else: dia, mes, ano = grupos
                
                if len(ano) == 2:
                    ano = f"20{ano}" if int(ano) < 30 else f"19{ano}"
                return f"{ano}-{int(mes):02d}-{int(dia):02d}"
    
    if mes_num:
        match_dia = re.search(r'(\d{1,2})', texto)
        if match_dia:
            dia = int(match_dia.group(1))
            ano = hoy.year
            fecha_candidata = datetime(ano, mes_num, dia)
            if fecha_candidata.date() < hoy_date:
                fecha_candidata = datetime(ano+1, mes_num, dia)
            return fecha_candidata.strftime("%Y-%m-%d")
    
    match_iso = re.search(r'\d{4}-\d{2}-\d{2}', texto_orig)
    if match_iso: return match_iso.group(0)
    return None

def extraer_hora_inteligente(texto: str):
    texto = limpiar_texto(texto)
    texto = expandir_numeros_escritos(texto)
    es_pm = any(p in texto for p in ['pm', 'p.m', 'tarde', 'noche'])
    match = re.search(r'\b(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])\b', texto)
    if match:
        h = int(match.group(1))
        m = int(match.group(2))
        if es_pm and h < 12: h += 12
        return f"{h:02d}:{m:02d}"
    match = re.search(r'\b(0?[1-9]|1[0-9]|2[0-3])\b', texto)
    if match:
        h = int(match.group(1))
        if es_pm and h < 12: h += 12
        return f"{h:02d}:00"
    return None

def es_fecha_pasada(fecha_str: str) -> bool:
    try:
        fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        hoy_obj = datetime.now().date()
        return fecha_obj < hoy_obj
    except:
        return True

def hora_es_pasada_hoy(fecha_str, hora_str):
    hoy = datetime.now()
    if fecha_str != hoy.strftime("%Y-%m-%d"): return False
    try:
        hora_cita = datetime.strptime(f"{fecha_str} {hora_str}", "%Y-%m-%d %H:%M")
        return hora_cita <= hoy + timedelta(hours=1)
    except:
        return True

def asegurar_perfil_existe(user_uuid: str):
    """Crea el perfil si no existe, usando upsert para evitar conflictos"""
    try:
        supabase.table("perfiles").upsert({
            "id": user_uuid,
            "email": f"{user_uuid.replace('-','')}@temp.local",
            "nombre_completo": "Usuario Temporal",
            "rol": "paciente",
            "activo": True
        }, on_conflict="id").execute()
    except Exception as e:
        print(f"Error asegurando perfil: {e}")

# ==========================================
# FUNCIONES DE NEGOCIO Y DISPONIBILIDAD
# ==========================================
def obtener_cita_activa(paciente_uuid):
    try:
        res = supabase.table("citas").select(
            "id, fecha_hora, estado, motivo, medicos(perfiles(nombre_completo))"
        ).eq("id_paciente_tutor", paciente_uuid).eq("estado", "programada").order("fecha_hora").limit(1).execute()
        if res.data:
            cita = res.data[0]
            fecha_hora = datetime.fromisoformat(cita["fecha_hora"].replace('Z', '+00:00'))
            nombre = "Médico"
            try: nombre = cita["medicos"]["perfiles"]["nombre_completo"]
            except: pass
            return {"doctor": nombre, "fecha": fecha_hora.strftime("%Y-%m-%d"), "hora": fecha_hora.strftime("%H:%M"), "estado": cita["estado"]}
    except: pass
    return None

def comprobar_citas_activas(paciente_uuid):
    try:
        res = supabase.table("citas").select("id").eq("id_paciente_tutor", paciente_uuid).eq("estado", "programada").execute()
        return len(res.data) > 0 if res.data else False
    except:
        return False

def generar_menu_dinamico(tiene_citas):
    opciones = [{"label": "Programar cita", "action": "programar cita", "color": "blue", "icon": ICONO_AZUL}]
    if tiene_citas:
        opciones.append({"label": "Reprogramar cita", "action": "reprogramar", "color": "blue", "icon": ICONO_REPROGRAMAR})
        opciones.append({"label": "Cancelar cita", "action": "cancelar", "color": "red", "icon": ICONO_ROJO})
    return opciones

def obtener_fechas_disponibles(medico_uuid, dias_a_buscar=4):
    # 1. Obtener duración real de consulta desde el perfil del médico
    res_medico = supabase.table("medicos").select("duracion_consulta_min").eq("id", medico_uuid).execute()
    duracion = 30
    if res_medico.data and res_medico.data[0].get("duracion_consulta_min"):
        duracion = res_medico.data[0]["duracion_consulta_min"]

    # 2. Obtener horarios sin pedir la columna eliminada
    res_horarios = supabase.table("horarios_atencion").select("dia_semana, hora_inicio, hora_fin").eq("medico_id", medico_uuid).execute()
    if not res_horarios.data: return []
    
    # 3. Agrupar en lista para soportar múltiples turnos (mañana y tarde)
    horarios_por_dia = {}
    for item in res_horarios.data:
        dia = item["dia_semana"]
        if dia not in horarios_por_dia: horarios_por_dia[dia] = []
        horarios_por_dia[dia].append(item)
    
    hoy = datetime.now()
    inicio_busqueda = hoy.strftime("%Y-%m-%dT00:00:00")
    fin_busqueda = (hoy + timedelta(days=40)).strftime("%Y-%m-%dT23:59:59")
    
    res_citas = supabase.table("citas").select("fecha_hora").eq("medico_id", medico_uuid).eq("estado", "programada").gte("fecha_hora", inicio_busqueda).lte("fecha_hora", fin_busqueda).execute()
    citas_ocupadas = [datetime.fromisoformat(c["fecha_hora"].replace('Z', '+00:00')) for c in (res_citas.data or [])]
    
    fechas = []
    # 4. Solución: Empezar a buscar desde HOY (0) en lugar de mañana (1)
    for i in range(0, 40):
        dia = hoy + timedelta(days=i)
        dia_semana = int(dia.strftime('%w'))
        
        if dia_semana in horarios_por_dia:
            bloques = horarios_por_dia[dia_semana]
            citas_del_dia = [c for c in citas_ocupadas if c.date() == dia.date()]
            
            hay_libre = False
            for bloque in bloques:
                inicio = datetime.strptime(bloque["hora_inicio"], "%H:%M:%S").time()
                fin = datetime.strptime(bloque["hora_fin"], "%H:%M:%S").time()
                
                actual_dt = datetime.combine(dia.date(), inicio)
                fin_dt = datetime.combine(dia.date(), fin)
                
                while actual_dt + timedelta(minutes=duracion) <= fin_dt:
                    # Regla estricta: Si la fecha evaluada es HOY, descartar horas pasadas
                    if dia.date() == hoy.date() and actual_dt.time() <= (hoy + timedelta(hours=1)).time():
                        actual_dt += timedelta(minutes=duracion)
                        continue

                    if not any(c.time() == actual_dt.time() for c in citas_del_dia):
                        hay_libre = True
                        break
                    actual_dt += timedelta(minutes=duracion)
                if hay_libre: break
                
            if hay_libre:
                fechas.append(dia.strftime("%Y-%m-%d"))
                if len(fechas) >= dias_a_buscar: break
    return fechas

def obtener_medicos_con_disponibilidad():
    try:
        res = supabase.table("medicos").select("id, perfiles(nombre_completo)").eq("activo", True).execute()
        if not res.data: return []
        
        disponibles = []
        for d in res.data:
            med_id = d["id"]
            nombre = "Médico"
            try: nombre = d["perfiles"]["nombre_completo"]
            except: pass
            
            fechas = obtener_fechas_disponibles(med_id, dias_a_buscar=1)
            if fechas:
                disponibles.append({"id": med_id, "nombre": nombre})
        return disponibles
    except Exception as e:
        print(f"Error obteniendo médicos con disponibilidad: {e}")
        return []

def obtener_horas_disponibles(medico_uuid, fecha_str):
    dt_fecha = datetime.strptime(fecha_str, "%Y-%m-%d")
    
    # Extraer la duración
    res_med = supabase.table("medicos").select("duracion_consulta_min").eq("id", medico_uuid).execute()
    duracion = 30
    if res_med.data and res_med.data[0].get("duracion_consulta_min"):
        duracion = res_med.data[0]["duracion_consulta_min"]

    # Extraer horarios
    res_horarios = supabase.table("horarios_atencion").select("hora_inicio, hora_fin").eq("medico_id", medico_uuid).eq("dia_semana", int(dt_fecha.strftime('%w'))).execute()
    if not res_horarios.data: return []
    
    slots = []
    for bloque in res_horarios.data:
        inicio = datetime.strptime(bloque["hora_inicio"], "%H:%M:%S")
        fin = datetime.strptime(bloque["hora_fin"], "%H:%M:%S")
        actual = inicio
        while actual + timedelta(minutes=duracion) <= fin:
            slots.append(actual.strftime("%H:%M"))
            actual += timedelta(minutes=duracion)
        
    inicio_dia = f"{fecha_str}T00:00:00"
    fin_dia = f"{fecha_str}T23:59:59"
    res_citas = supabase.table("citas").select("fecha_hora").eq("medico_id", medico_uuid).eq("estado", "programada").gte("fecha_hora", inicio_dia).lte("fecha_hora", fin_dia).execute()
    ocupadas = [datetime.fromisoformat(c["fecha_hora"].replace('Z', '+00:00')).strftime("%H:%M") for c in (res_citas.data or [])]
    slots_disponibles = [s for s in slots if s not in ocupadas]
    
    hoy = datetime.now()
    if fecha_str == hoy.strftime("%Y-%m-%d"):
        hora_minima = (hoy + timedelta(hours=1)).strftime("%H:%M")
        slots_disponibles = [s for s in slots_disponibles if s >= hora_minima]
    
    return sorted(list(set(slots_disponibles)))

def obtener_disponibilidad_global_por_fecha(fecha_str):
    try:
        dt_fecha = datetime.strptime(fecha_str, "%Y-%m-%d")
        dia_semana_db = int(dt_fecha.strftime('%w'))
        
        # Corregido: Ya no extrae duracion_min
        res_horarios = supabase.table("horarios_atencion").select(
            "hora_inicio, hora_fin, medico_id, medicos(id, duracion_consulta_min, perfiles(nombre_completo))"
        ).eq("dia_semana", dia_semana_db).execute()
        
        if not res_horarios.data: return []
        inicio_dia = f"{fecha_str}T00:00:00"
        fin_dia = f"{fecha_str}T23:59:59"
        res_citas = supabase.table("citas").select("fecha_hora, medico_id").eq("estado", "programada").gte("fecha_hora", inicio_dia).lte("fecha_hora", fin_dia).execute()
        
        citas_ocupadas = {}
        if res_citas.data:
            for cita in res_citas.data:
                m_id = cita["medico_id"]
                hora_str_db = datetime.fromisoformat(cita["fecha_hora"].replace('Z', '+00:00')).strftime("%H:%M")
                if m_id not in citas_ocupadas: citas_ocupadas[m_id] = []
                citas_ocupadas[m_id].append(hora_str_db)
                
        opciones = []
        hoy = datetime.now()
        for h_data in res_horarios.data:
            medico_uuid = h_data["medico_id"]
            nombre_medico = "Médico General"
            duracion = 30
            try:
                rel_medico = h_data.get("medicos", [{}])[0] if isinstance(h_data.get("medicos"), list) else h_data.get("medicos", {})
                duracion = rel_medico.get("duracion_consulta_min") or 30
                rel_perfil = rel_medico.get("perfiles", [{}])[0] if isinstance(rel_medico.get("perfiles"), list) else rel_medico.get("perfiles", {})
                nombre_medico = rel_perfil.get("nombre_completo", "Médico General")
            except: pass
            
            inicio = datetime.strptime(h_data["hora_inicio"], "%H:%M:%S")
            fin = datetime.strptime(h_data["hora_fin"], "%H:%M:%S")
            actual = inicio
            
            while actual + timedelta(minutes=duracion) <= fin:
                hora_slot = actual.strftime("%H:%M")
                if fecha_str == hoy.strftime("%Y-%m-%d"):
                    hora_minima = (hoy + timedelta(hours=1)).strftime("%H:%M")
                    if hora_slot < hora_minima:
                        actual += timedelta(minutes=duracion)
                        continue
                if medico_uuid not in citas_ocupadas or hora_slot not in citas_ocupadas[medico_uuid]:
                    opciones.append({"label": f"{nombre_medico} - {hora_slot}", "action": f"{nombre_medico} - {hora_slot}"})
                actual += timedelta(minutes=duracion)
        
        # Filtrar duplicados en caso de que existan solapamientos
        opciones_unicas = []
        vistos = set()
        for op in opciones:
            if op["action"] not in vistos:
                vistos.add(op["action"])
                opciones_unicas.append(op)
                
        return opciones_unicas
    except Exception as e:
        print("Error en disponibilidad global:", e)
        return []

# ==========================================
# ENDPOINT PRINCIPAL 
# ==========================================
@app.post("/api/chat-interno")
def chatbot_reglas(datos: MensajeUsuario):
    id_sesion = datos.id_sesion
    asegurar_perfil_existe(id_sesion)

    if id_sesion not in sesiones_chat:
        sesiones_chat[id_sesion] = {"estado": 0, "datos_cita": {}}

    tiene_citas = comprobar_citas_activas(id_sesion)
    cita_activa = obtener_cita_activa(id_sesion)

    mensaje_bruto = datos.mensaje.strip() if datos.mensaje else ""
    texto_limpio = limpiar_texto(mensaje_bruto)
    texto_sin_espacios = texto_limpio.replace(" ", "")

    estado = sesiones_chat[id_sesion]["estado"]

    def responder(texto, opciones, requiere_texto=False):
        return {
            "tipo": "options",
            "respuesta_bot": texto,
            "opciones": opciones,
            "cita_activa": cita_activa,
            "requires_text_input": requiere_texto
        }

    # RESCATE
    palabras_rescate = ["hola", "buenas", "que tal", "reiniciar", "menu", "volver", "inicio"]
    if estado != 0 and texto_limpio in palabras_rescate:
        sesiones_chat[id_sesion] = {"estado": 0, "datos_cita": {}}
        return responder("Reiniciado. ¿En qué te ayudo?", generar_menu_dinamico(tiene_citas), False)

    # REPROGRAMAR / CANCELAR
    if "reprogramar" in texto_sin_espacios and estado not in [10,11]:
        if tiene_citas:
            sesiones_chat[id_sesion]["estado"] = 0
            return responder("Para reprogramar, primero cancela. ¿Proceder?", [{"label":"Cancelar cita","action":"cancelar","color":"red"},{"label":"Regresar al inicio","action":"inicio"}], False)
        else:
            return responder("No tienes citas activas.", generar_menu_dinamico(False), False)

    if "cancelar" in texto_sin_espacios and estado not in [10,11]:
        try:
            citas = supabase.table("citas").select("id, fecha_hora, medicos(perfiles(nombre_completo))").eq("id_paciente_tutor", id_sesion).eq("estado","programada").execute()
            if not citas.data: return responder("No tienes citas programadas.", generar_menu_dinamico(False), False)
            sesiones_chat[id_sesion]["estado"] = 10
            botones = []
            for c in citas.data:
                try:
                    f = datetime.fromisoformat(c["fecha_hora"].replace('Z','+00:00'))
                    nombre = "Médico"
                    try: nombre = c["medicos"]["perfiles"]["nombre_completo"]
                    except: pass
                    botones.append({"label": f"{nombre} - {f.strftime('%Y-%m-%d %H:%M')}", "action": f"borrar_{c['id']}", "color": "red"})
                except: pass
            botones.append({"label": "Regresar al inicio", "action": "inicio", "color": "blue"})
            return responder("Selecciona la cita a cancelar:", botones, False)
        except:
            return responder("Error al cargar citas.", generar_menu_dinamico(tiene_citas), False)

    if estado == 10:
        if texto_limpio.startswith("borrar_"):
            cita_id = texto_limpio.split("_")[1]
            try:
                supabase.table("citas").update({"estado": "cancelada"}).eq("id", cita_id).execute()
                sesiones_chat[id_sesion] = {"estado": 0, "datos_cita": {}}
                nuevo_estado = comprobar_citas_activas(id_sesion)
                cita_activa = obtener_cita_activa(id_sesion)
                return responder("✅ Cita cancelada.", generar_menu_dinamico(nuevo_estado), False)
            except:
                sesiones_chat[id_sesion] = {"estado": 0, "datos_cita": {}}
                return responder("Error al cancelar.", generar_menu_dinamico(tiene_citas), False)
        else:
            sesiones_chat[id_sesion] = {"estado": 0, "datos_cita": {}}
            return responder("Cancelación abortada.", generar_menu_dinamico(tiene_citas), False)

    # ESTADO 0
    if estado == 0:
        if texto_sin_espacios in ["programarcita","agendar","cita"]:
            sesiones_chat[id_sesion]["estado"] = 1
            return responder("¿Cómo prefieres buscar?", [{"label":"Por médico","action":"medico"},{"label":"Por fecha","action":"fecha"}], False)
        if any(p in texto_sin_espacios for p in ["programar","agendar","cita"]):
            try:
                medicos_disp = obtener_medicos_con_disponibilidad()
                nombres_db = {m["nombre"].lower(): m["nombre"] for m in medicos_disp}
                match = palabra_similar(texto_limpio, list(nombres_db.keys()), umbral=0.6)
                if match:
                    nombre_oficial = nombres_db[match]
                    sesiones_chat[id_sesion]["estado"] = 5
                    return chatbot_reglas(MensajeUsuario(id_sesion=id_sesion, mensaje=nombre_oficial))
            except: pass
            sesiones_chat[id_sesion]["estado"] = 1
            return responder("¿Cómo deseas buscar?", [{"label":"Por médico","action":"medico"},{"label":"Por fecha","action":"fecha"}], False)
        return responder("¡Hola! ¿Qué deseas hacer?", generar_menu_dinamico(tiene_citas), False)

    # ESTADO 1
    if estado == 1:
        if "medico" in texto_sin_espacios:
            sesiones_chat[id_sesion]["estado"] = 5
            try:
                medicos_disp = obtener_medicos_con_disponibilidad()
                if not medicos_disp:
                    return responder("Lo siento, actualmente no hay médicos con horarios disponibles.", [{"label":"Regresar al inicio","action":"inicio"}], False)
                return responder("Selecciona un médico con disponibilidad:", [{"label":m["nombre"],"action":m["nombre"]} for m in medicos_disp], False)
            except:
                return responder("Error al obtener médicos.", [{"label":"Regresar al inicio","action":"inicio"}], False)
        elif "fecha" in texto_sin_espacios:
            sesiones_chat[id_sesion]["estado"] = 2
            return responder("Escribe una fecha (ej. 'mañana', '15 de junio', '2026-06-15'):", [{"label":"Regresar al inicio","action":"inicio"}], True)
        return responder("Elige una opción:", [{"label":"Por médico","action":"medico"},{"label":"Por fecha","action":"fecha"}], False)

    # ESTADO 2 (BÚSQUEDA POR FECHA)
    if estado == 2:
        if any(p in texto_sin_espacios for p in ["medico", "buscarmedico", "cambiarmedico", "pormedico"]):
            sesiones_chat[id_sesion]["estado"] = 5
            try:
                medicos_disp = obtener_medicos_con_disponibilidad()
                if not medicos_disp:
                    return responder("No hay médicos con disponibilidad actualmente.", [{"label":"Regresar al inicio","action":"inicio"}], False)
                return responder("Selecciona un médico:", [{"label":m["nombre"],"action":m["nombre"]} for m in medicos_disp], False)
            except:
                return responder("Error al obtener médicos.", [{"label":"Regresar al inicio","action":"inicio"}], False)
        
        fecha = extraer_fecha_inteligente(mensaje_bruto)
        if not fecha:
            return responder("No entendí la fecha. Prueba con '15 de junio' o 'mañana'.", [{"label":"Regresar al inicio","action":"inicio"}], True)
        if es_fecha_pasada(fecha):
            return responder("Esa fecha ya pasó. Elige una futura.", [{"label":"Regresar al inicio","action":"inicio"}], True)
        opciones = obtener_disponibilidad_global_por_fecha(fecha)
        if not opciones:
            # FIX: Cambiamos requiere_texto a True para que el usuario pueda escribir otra fecha si lo desea
            return responder(f"No hay horarios disponibles para {fecha}. Intenta con otra fecha o busca por médico.", [{"label":"Buscar por médico","action":"medico"}, {"label":"Regresar al inicio","action":"inicio"}], True) 
        sesiones_chat[id_sesion]["datos_cita"]["fecha"] = fecha
        sesiones_chat[id_sesion]["estado"] = 3
        return responder(f"Horarios disponibles para {fecha}:", opciones, False)

    # ESTADO 5 (selección de médico por nombre)
    if estado == 5:
        medicos_disp = obtener_medicos_con_disponibilidad()
        if not medicos_disp:
            return responder("No hay médicos disponibles en este momento.", [{"label":"Regresar al inicio","action":"inicio"}], False)

        nombres_db = {m["nombre"].lower(): m for m in medicos_disp}
        match = palabra_similar(texto_limpio, list(nombres_db.keys()), umbral=0.4)

        if match:
            medico_seleccionado = nombres_db[match]
            nombre_oficial = medico_seleccionado["nombre"]
            medico_uuid = medico_seleccionado["id"]

            sesiones_chat[id_sesion]["datos_cita"]["doctor"] = nombre_oficial
            sesiones_chat[id_sesion]["datos_cita"]["doctor_uuid"] = medico_uuid
            sesiones_chat[id_sesion]["estado"] = 5.5
            
            fechas = obtener_fechas_disponibles(medico_uuid)
            botones_fechas = [{"label":f, "action":f} for f in fechas]
            botones_fechas.append({"label":"Regresar al inicio","action":"inicio"})
            return responder(f"¿Qué fecha prefieres para {nombre_oficial}? (ej. '15 de junio', 'mañana')", botones_fechas, True)
        else:
            return responder("No entendí el nombre. Selecciona de la lista de médicos disponibles:", [{"label":m["nombre"],"action":m["nombre"]} for m in medicos_disp], False)

    # ESTADO 5.5 (fecha elegida para un médico específico)
    if estado == 5.5:
        if texto_sin_espacios in ["medico", "buscarotromedico", "otromedico", "cambiarmedico"]:
            sesiones_chat[id_sesion]["estado"] = 5
            try:
                medicos_disp = obtener_medicos_con_disponibilidad()
                if not medicos_disp:
                    return responder("Lo siento, actualmente no hay médicos con horarios disponibles.", [{"label":"Regresar al inicio","action":"inicio"}], False)
                return responder("Selecciona otro médico:", [{"label":m["nombre"],"action":m["nombre"]} for m in medicos_disp], False)
            except:
                return responder("Error al obtener médicos.", [{"label":"Regresar al inicio","action":"inicio"}], False)
        
        fecha_elegida = extraer_fecha_inteligente(mensaje_bruto)
        if not fecha_elegida:
            return responder("No entendí la fecha. Intenta con formato como '15 de junio' o 'mañana'.", [{"label":"Regresar al inicio","action":"inicio"}], True)
        if es_fecha_pasada(fecha_elegida):
            return responder("Esa fecha ya pasó. Elige una futura.", [{"label":"Regresar al inicio","action":"inicio"}], True)
            
        sesiones_chat[id_sesion]["datos_cita"]["fecha"] = fecha_elegida
        medico_uuid = sesiones_chat[id_sesion]["datos_cita"]["doctor_uuid"]
        horas = obtener_horas_disponibles(medico_uuid, fecha_elegida)
        
        if horas:
            sesiones_chat[id_sesion]["estado"] = 6
            botones_horas = [{"label":h, "action":h} for h in horas]
            botones_horas.append({"label":"Regresar al inicio","action":"inicio"})
            return responder(f"Horarios disponibles para {fecha_elegida}:", botones_horas, False)
        else:
            fechas_sugeridas = obtener_fechas_disponibles(medico_uuid, dias_a_buscar=3)
            if fechas_sugeridas:
                botones_suger = [{"label":f, "action":f} for f in fechas_sugeridas]
                botones_suger.append({"label":"Buscar otro médico","action":"medico"})
                # FIX: Cambiamos requiere_texto a True para permitir entradas manuales de fechas
                return responder(f"Lo siento, no hay horarios para {fecha_elegida}. Estas son las próximas fechas con disponibilidad:", botones_suger, True)
            else:
                # FIX: Cambiamos requiere_texto a True
                return responder("No hay horarios disponibles en los próximos días para este médico. Intenta con otra fecha u otro médico.", [{"label":"Buscar otro médico","action":"medico"}, {"label":"Regresar al inicio","action":"inicio"}], True)

    # ESTADO 6 (selección de hora)
    if estado == 6:
        if texto_sin_espacios in ["regresar", "volver", "inicio"]:
            sesiones_chat[id_sesion]["estado"] = 0
            return responder("Regresando al menú principal.", generar_menu_dinamico(tiene_citas), False)
        if texto_sin_espacios in ["fecha", "cambiarmedico", "medico"]:
            doctor = sesiones_chat[id_sesion]["datos_cita"].get("doctor")
            if doctor:
                sesiones_chat[id_sesion]["estado"] = 5.5
                return responder("Por favor, escribe otra fecha para el mismo médico.", [{"label":"Regresar al inicio","action":"inicio"}], True)
            else:
                sesiones_chat[id_sesion]["estado"] = 5
                medicos_disp = obtener_medicos_con_disponibilidad()
                return responder("Selecciona un médico:", [{"label":m["nombre"],"action":m["nombre"]} for m in medicos_disp], False)
        
        hora = extraer_hora_inteligente(mensaje_bruto)
        if hora:
            fecha = sesiones_chat[id_sesion]["datos_cita"]["fecha"]
            if hora_es_pasada_hoy(fecha, hora):
                # FIX: Cambiamos requiere_texto a True por si quieren teclear la hora nueva
                return responder("Esa hora ya pasó o no alcanzarías a llegar. Por favor elige una hora más tarde.", [{"label":"Ver horarios de nuevo","action":f"fecha_{fecha}"}, {"label":"Regresar al inicio","action":"inicio"}], True)
            sesiones_chat[id_sesion]["datos_cita"]["hora"] = hora
            sesiones_chat[id_sesion]["datos_cita"]["motivo"] = ""
            sesiones_chat[id_sesion]["estado"] = 4
            return responder("¡Horario apartado! Escribe tus síntomas o motivo de consulta:", [{"label":"Confirmar Cita","action":"confirmar cita","color":"blue"}], True)
        else:
            return responder("No entendí la hora. Ejemplo: '10:00' o '10am'.", [{"label":"Regresar al inicio","action":"inicio"}], True)

    if estado == 3:
        if " - " in mensaje_bruto:
            partes = mensaje_bruto.split(" - ")
            nombre_medico = partes[0].strip()
            hora_str = partes[1].strip()
            try:
                perfil = supabase.table("perfiles").select("id").eq("nombre_completo", nombre_medico).execute()
                if not perfil.data: return responder("Médico no encontrado.", [{"label":"Regresar al inicio","action":"inicio"}], False)
                medico = supabase.table("medicos").select("id").eq("perfil_id", perfil.data[0]["id"]).execute()
                if not medico.data: return responder("Médico sin registro activo.", [{"label":"Regresar al inicio","action":"inicio"}], False)
                medico_uuid = medico.data[0]["id"]
                fecha = sesiones_chat[id_sesion]["datos_cita"]["fecha"]
                if hora_es_pasada_hoy(fecha, hora_str):
                    return responder("Esa hora ya pasó para hoy. Elige otra.", [{"label":"Ver horarios de nuevo","action":"fecha"}, {"label":"Regresar al inicio","action":"inicio"}], False)
                sesiones_chat[id_sesion]["datos_cita"].update({"doctor": nombre_medico, "doctor_uuid": medico_uuid, "hora": hora_str, "motivo": ""})
                sesiones_chat[id_sesion]["estado"] = 4
                return responder(f"Horario apartado con {nombre_medico} a las {hora_str}.\nEscribe tus síntomas o motivo:", [{"label":"Confirmar Cita","action":"confirmar cita","color":"blue"}], True)
            except Exception as e:
                print(e)
                return responder("Error al procesar la selección.", [{"label":"Regresar al inicio","action":"inicio"}], False)
        return responder("Selecciona una opción de la lista.", [{"label":"Regresar al inicio","action":"inicio"}], False)

    # ESTADO 4 (síntomas y confirmación)
    if estado == 4:
        if "confirmar" in texto_sin_espacios:
            motivo = sesiones_chat[id_sesion]["datos_cita"].get("motivo", "").strip()
            if not motivo: motivo = "Consulta general"
            doctor = sesiones_chat[id_sesion]["datos_cita"]["doctor"]
            medico_uuid = sesiones_chat[id_sesion]["datos_cita"]["doctor_uuid"]
            fecha = sesiones_chat[id_sesion]["datos_cita"]["fecha"]
            hora = sesiones_chat[id_sesion]["datos_cita"]["hora"]
            paciente_uuid = id_sesion
            try:
                dt_local = datetime.strptime(f"{fecha} {hora}", "%Y-%m-%d %H:%M")
                dt_utc = dt_local + timedelta(hours=6)
                fecha_hora_iso = dt_utc.isoformat() + "Z"
                nueva_cita = {
                    "id_paciente_tutor": paciente_uuid,
                    "id_paciente_cita": paciente_uuid,
                    "medico_id": medico_uuid,
                    "fecha_hora": fecha_hora_iso,
                    "estado": "programada",
                    "motivo": motivo,
                    "sintomas": "No especificado"
                }
                supabase.table("citas").insert(nueva_cita).execute()
                sesiones_chat[id_sesion] = {"estado": 0, "datos_cita": {}}
                return responder(f"✅ Cita guardada con éxito!\n{doctor} - {fecha} {hora}\nMotivo: {motivo}", generar_menu_dinamico(True), False)
            except Exception as e:
                print("Error insertando cita:", e)
                return responder(f"Error al guardar: {str(e)}. Por favor contacta a soporte.", [{"label":"Regresar al inicio","action":"inicio","color":"red"}], False)
        else:
            motivo_actual = sesiones_chat[id_sesion]["datos_cita"].get("motivo", "")
            sesiones_chat[id_sesion]["datos_cita"]["motivo"] = f"{motivo_actual} {mensaje_bruto}".strip()
            return responder(f"Síntoma anotado: '{mensaje_bruto}'. ¿Algo más? Si no, presiona 'Confirmar Cita'.", [{"label":"Confirmar Cita","action":"confirmar cita","color":"blue"}], True)

    return responder("No entendí. Regresemos al inicio.", generar_menu_dinamico(tiene_citas), False)