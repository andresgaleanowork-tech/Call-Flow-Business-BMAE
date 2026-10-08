# -*- coding: utf-8 -*-
"""
roles.py — Mapeo contractual GitHub Teams → roles BMAE (§4.1) + matriz
RBAC/ABAC (§4.3). La tabla vive AQUÍ (una sola fuente); el frontend
(`frontend-auth/roles.js`) se genera por espejo literal.
"""

from __future__ import annotations

# Mapeo EXACTO del Prompt Maestro §4.1
MAPEO_TEAMS = {
    "comerciales": ["BMAE Comercial"],
    "ingenieros": ["BMAE Ingeniero"],
    "admin": ["System Manager", "BMAE Admin"],
    "partners": ["BMAE Partner (ReadOnly)"],
}

# Matriz RBAC + ABAC (§4.3) — capacidades por rol, en el vocabulario del maestro
MATRIZ = {
    "Publico/Lead": {
        "frontend": ["landing", "comparador-basico"],
        "twenty": ["crear-lead"],
        "erpnext": [],
        "verifactu": [],
    },
    "BMAE Partner (ReadOnly)": {
        "frontend": ["comparador-b2b", "solo-lectura"],
        "twenty": ["sus-leads"],
        "erpnext": [],
        "verifactu": [],
    },
    "BMAE Comercial": {
        "frontend": ["comparador-completo", "pdf"],
        "twenty": ["crud-sus-deals", "crud-cups"],
        "erpnext": ["lectura-tarifas"],
        "verifactu": [],
    },
    "BMAE Comercial Senior": {
        "frontend": ["historico-global"],
        "twenty": ["deals-equipo"],
        "erpnext": ["facturas-cartera"],
        "verifactu": [],
    },
    "BMAE Ingeniero": {
        "frontend": ["estudio-fv", "proyectos"],
        "twenty": ["oportunidades-tecnicas"],
        "erpnext": ["projects", "stock"],
        "verifactu": [],
    },
    "BMAE Administracion": {
        "frontend": ["dashboard-financiero"],
        "twenty": ["solo-lectura"],
        "erpnext": ["contabilidad"],
        "verifactu": ["emision", "envio"],
    },
    "System Manager": {
        "frontend": ["vista-360"],
        "twenty": ["control-total"],
        "erpnext": ["system-manager"],
        "verifactu": ["config", "auditoria"],
    },
    "BMAE Admin": {
        "frontend": ["vista-360"],
        "twenty": ["control-total"],
        "erpnext": ["system-manager"],
        "verifactu": ["config", "auditoria"],
    },
}


def roles_de_teams(teams: list) -> list:
    """teams: lista de slugs de equipos GitHub (sin org). Devuelve roles
    canonizados deduplicados, orden estable; sin membership → Publico/Lead
    se maneja aparte (sin sesión), aquí se devuelve vacío."""

    salida: list = []
    for t in teams:
        slug = str(t).strip().lower().removeprefix("bmae/")
        for rol in MAPEO_TEAMS.get(slug, []):
            if rol not in salida:
                salida.append(rol)
    return salida


def puede(roles: list, raiz: str, capacidad: str) -> bool:
    """Autorización declarativa: ¿alguno de los roles concede la
    capacidad en el dominio indicado? (~ matriz §4.3)"""

    for rol in roles:
        if capacidad in MATRIZ.get(rol, {}).get(raiz, []):
            return True
    return False


__all__ = ["MAPEO_TEAMS", "MATRIZ", "roles_de_teams", "puede"]
