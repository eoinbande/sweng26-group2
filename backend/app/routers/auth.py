from fastapi import APIRouter
from ..Tables import create_user #we import the functions related to Auth
from pydantic import BaseModel

#CREATION of USER(when a person created a new account) endpoint
#USE GET(FrontEnd will send a request to GET data from Supabase)
#USE POsT(FrontEnd will send a request to POST data to Supabase)

account_router = APIRouter()

class RequestUser(BaseModel):
    user_id: str
    name: str
    email: str
    

#USE POST HTTP REQUEST TO STORE DATA IN SUPABASE
@account_router.post("/profiles")
def write_account(user: RequestUser):
    result = create_user(
        user_id = user.user_id,
        name = user.name,
        email = user.email
    )
    return {"message": "User successfully created", "user": result.data}


#since user is creating account, we dont need to GET data, only validate it


