from uuid import uuid4


class ContractInteraction:
    async def deploy_equb_group(self, wallet_address, contribution_amount, duration_weeks, frequency):
        return f"0x{uuid4().hex[:40]}"

    async def make_contribution(self, contract_address, wallet_address, amount):
        return f"0x{uuid4().hex}"
