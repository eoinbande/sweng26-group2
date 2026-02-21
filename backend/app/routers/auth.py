from fastapi import APIRouter
from ..Tables import create_user #we import the functions related to Auth
from pydantic import BaseModel, Field
from fastapi import HTTPException

#CREATION of USER(when a person created a new account) endpoint
#USE GET(FrontEnd will send a request to GET data from Supabase)
#USE POsT(FrontEnd will send a request to POST data to Supabase)

account_router = APIRouter()

class RequestUser(BaseModel):
    user_id: str
    name: str = Field(min_length = 1) #user NEEDS to put a username
    email: str
    

#USE POST HTTP REQUEST TO STORE DATA IN SUPABASE
@account_router.post("/profiles")
def write_account(user: RequestUser):
    try:
        result = create_user(
        user_id = user.user_id,
        name = user.name,
        email = user.email
        )
        return {"message": "User successfully created", "user": result.data}

    except Exception as e:
        raise HTTPException(
            status_code = 500,
            detail = f"Error creating user: {str(e)}"
        )


#since user is creating account, we dont need to GET data, only validate it


