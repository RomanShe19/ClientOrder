"""
Интеллектуальный анализ заявок: температура лида, отдел, потребность в персональном менеджере.
"""

from typing import TypedDict


class LeadAnalysis(TypedDict):
    temperature: str  # "hot" | "warm" | "cold"
    score: int  # 0-100
    personal_manager_needed: bool
    department: str
    worth_time: bool
    reason_summary: str


# Критерии для оценки (больше = горячее)
BUDGET_SCORES = {
    "до 100 000 ₽": 0,
    "100 000 — 500 000 ₽": 25,
    "500 000 — 1 000 000 ₽": 50,
    "1 000 000 — 5 000 000 ₽": 75,
    "5 000 000+ ₽": 100,
}

COMPANY_SIZE_SCORES = {
    "1-10": 0,
    "11-50": 35,
    "51-200": 65,
    "200+": 100,
}

CLIENT_ROLE_SCORES = {
    "employee": 0,
    "manager": 50,
    "owner": 100,
}

DEADLINE_SCORES = {
    "1_week": 100,
    "1_month": 75,
    "3_months": 40,
    "6_months+": 0,
}

# Ниши с повышенным приоритетом (B2B, крупные бюджеты)
PRIORITY_NICHES = {
    "Финансы и банкинг",
    "IT и технологии",
    "E-commerce",
    "Здравоохранение",
    "Производство",
}

# Ключевые слова в комментариях, усиливающие срочность
URGENCY_KEYWORDS = [
    "срочно", "горит", "критично", "срочно", "asap", "немедленно",
    "регулятор", "инвестор", "запуск", "квартал", "следующий месяц",
    "не успеем", "должны быть готовы", "в течение недели", "сегодня",
]


def analyze_lead(
    budget: str,
    company_size: str,
    client_role: str,
    result_deadline: str,
    business_niche: str | None = None,
    task_volume: str | None = None,
    comments: str | None = None,
) -> LeadAnalysis:
    """
    Возвращает анализ заявки: температура, отдел, нужен ли персональный менеджер.
    """
    score = 0
    reasons: list[str] = []

    # Бюджет (вес 30%)
    budget_score = BUDGET_SCORES.get(budget, 25)
    score += budget_score * 0.30
    if budget_score >= 75:
        reasons.append("высокий бюджет")
    elif budget_score <= 25:
        reasons.append("низкий бюджет")

    # Размер компании (вес 20%)
    size_score = COMPANY_SIZE_SCORES.get(company_size, 30)
    score += size_score * 0.20
    if size_score >= 65:
        reasons.append("крупная компания")
    elif size_score == 0:
        reasons.append("микробизнес")

    # Роль (вес 20%)
    role_score = CLIENT_ROLE_SCORES.get(client_role, 30)
    score += role_score * 0.20
    if role_score == 100:
        reasons.append("ЛПР (владелец)")
    elif role_score == 0:
        reasons.append("не ЛПР (сотрудник)")

    # Дедлайн (вес 25%)
    deadline_score = DEADLINE_SCORES.get(result_deadline, 40)
    score += deadline_score * 0.25
    if deadline_score >= 75:
        reasons.append("жёсткий дедлайн")
    elif deadline_score == 0:
        reasons.append("гибкие сроки")

    # Ниша (бонус +5)
    if business_niche and business_niche.strip() in PRIORITY_NICHES:
        score += 5
        reasons.append("приоритетная ниша")

    # Комментарии — анализ срочности
    if comments:
        comment_lower = comments.lower()
        for kw in URGENCY_KEYWORDS:
            if kw.lower() in comment_lower:
                score = min(100, score + 10)
                reasons.append("срочность в комментарии")
                break

    # Объём задачи — длинные описания часто = серьёзный проект
    if task_volume and len(task_volume.strip()) > 80:
        score = min(100, score + 5)

    score = min(100, max(0, round(score)))

    # Температура
    if score >= 70:
        temperature = "hot"
        temp_label = "Горячий"
    elif score >= 40:
        temperature = "warm"
        temp_label = "Тёплый"
    else:
        temperature = "cold"
        temp_label = "Холодный"

    # Стоит ли тратить время
    worth_time = score >= 45

    # Нужен ли персональный менеджер
    personal_manager_needed = score >= 60 or (
        size_score >= 65 and budget_score >= 50
    )

    # Отдел (по нише и типу задачи)
    department = _resolve_department(business_niche, budget_score, score)

    reason_summary = "; ".join(reasons) if reasons else "стандартная заявка"

    return LeadAnalysis(
        temperature=temperature,
        score=score,
        personal_manager_needed=personal_manager_needed,
        department=department,
        worth_time=worth_time,
        reason_summary=reason_summary,
    )


def _resolve_department(niche: str | None, budget_score: int, score: int) -> str:
    """Определение отдела по нише и бюджету."""
    if not niche:
        return "Продажи (общий)" if score >= 40 else "Входящие"
    niche_lower = niche.lower()
    if any(x in niche_lower for x in ["финансы", "банкинг"]):
        return "Корпоративные продажи"
    if any(x in niche_lower for x in ["it", "e-commerce", "производство"]):
        return "B2B продажи"
    if any(x in niche_lower for x in ["здравоохранение", "образование"]):
        return "Госсектор и B2G"
    if any(x in niche_lower for x in ["маркетинг", "реклама", "seo"]):
        return "Маркетинговые услуги"
    if any(x in niche_lower for x in ["логистика", "производство"]):
        return "Автоматизация"
    if budget_score >= 75:
        return "VIP / Ключевые клиенты"
    return "Продажи (общий)"
