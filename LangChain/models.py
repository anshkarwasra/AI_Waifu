from pydantic import BaseModel,Field


class WaifuOutput(BaseModel):
    '''
    The output structure for the Waifu
    '''
    dialouge: str = Field(...,description="waifu's response to the user")
    bodyAnimation: str = Field(...,description="the animation the waifu would play while delievring that dialouge (if any)")
    mood: str = Field(...,description="current waifu's mood")
    expression: str = Field(...,description="facial expression to perform (if any)")
