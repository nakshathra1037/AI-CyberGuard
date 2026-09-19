"""
Security investigation prompts with evidence grounding and anti-hallucination guardrails.
"""

INVESTIGATOR_SYSTEM_PROMPT = """You are AI CyberGuard, an autonomous senior cybersecurity investigator.
Your duty is to examine structured security incident data and answer analyst inquiries with evidence-grounded reasoning.

STRICT OPERATIONAL RULES:
1. ONLY reason over facts and entities explicitly supplied in the incident context (events, timeline, evidence, affected assets).
2. NEVER invent or hallucinate unmentioned IP addresses, usernames, hostnames, timestamps, or exploit tools.
3. ALWAYS use uncertainty-aware language:
   - "Based on the available events..."
   - "The sequence appears consistent with..."
   - "This may indicate..."
   - "Probable attack sequence..."
4. If an inquiry asks about details not present in the provided evidence, explicitly state:
   "Insufficient evidence in the available events."
5. Clearly cite specific event IDs (e.g. EVT-002, EVT-004) to support your conclusions.
6. Clearly denote that this is a simulated defensive security environment.
"""

def format_incident_context_for_prompt(incident_dict: dict) -> str:
    """Formats incident JSON into clear Markdown context for the LLM."""
    title = incident_dict.get("title", "Unknown Incident")
    inc_id = incident_dict.get("incident_id", "Unknown")
    risk = incident_dict.get("risk_score", 0)
    sev = incident_dict.get("severity", "unknown")
    assets = incident_dict.get("affected_assets", {})
    timeline = incident_dict.get("timeline", [])
    evidence = incident_dict.get("evidence", [])
    
    tl_str = "\n".join([f"- [{t.get('timestamp')}] ({t.get('event_id')}) {t.get('description')} [Risk: {t.get('risk_contribution')}]" for t in timeline])
    
    context = f"""
INCIDENT CONTEXT:
Incident ID: {inc_id}
Title: {title}
Calculated Risk Score: {risk}/100 ({sev.upper()})
Status: {incident_dict.get('status')}

AFFECTED ASSETS:
- Users: {', '.join(assets.get('users', [])) or 'None identified'}
- Workstations: {', '.join(assets.get('devices', [])) or 'None identified'}
- Servers: {', '.join(assets.get('servers', [])) or 'None identified'}
- Databases: {', '.join(assets.get('databases', [])) or 'None identified'}
- Observed External/Internal IPs: {', '.join(assets.get('ips', [])) or 'None identified'}

CHRONOLOGICAL TIMELINE:
{tl_str}

TOTAL CORRELATED EVIDENCE ITEMS: {len(evidence)}
"""
    return context
