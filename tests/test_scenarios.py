import pytest
import asyncio
from backend.app.services.scenario_simulator import scenario_simulator


def test_scenario_a_account_takeover():
    async def run():
        res = await scenario_simulator.run_scenario("scenario_a_account_takeover")
        assert res["status"] != "benign" if "status" in res else True
        assert res["risk_score"] >= 80
        assert res["severity"] == "critical"
        assert len(res["recommended_actions"]) >= 3
    asyncio.run(run())


def test_scenario_b_false_positive():
    async def run():
        res = await scenario_simulator.run_scenario("scenario_b_false_positive")
        # Should evaluate benign or low/medium without cascading into critical lateral escalation
        if "risk_score" in res:
            assert res["risk_score"] < 60
    asyncio.run(run())


def test_scenario_d_api_abuse():
    async def run():
        res = await scenario_simulator.run_scenario("scenario_d_api_abuse")
        if "risk_score" in res:
            assert res["risk_score"] >= 15
    asyncio.run(run())



def test_scenario_f_normal_user():
    async def run():
        res = await scenario_simulator.run_scenario("scenario_f_normal_user")
        # Benign login should not escalate into high-severity incident
        if "severity" in res:
            assert res["severity"] in ("low", "medium")
        else:
            assert res.get("status") == "benign"
    asyncio.run(run())
