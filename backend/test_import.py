from app.api.v1.groups import GroupContributionRequest
print('Import successful')
model = GroupContributionRequest(amount=100, payment_method='wallet')
print(model.dict())