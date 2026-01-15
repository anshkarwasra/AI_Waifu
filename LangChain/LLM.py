from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage,SystemMessage
from models import WaifuOutput

class Waifu:
    def __init__(self,ttsModel: str,modelConfig,personality: str,model="llama3.1:8b"):
        self.AiModel = ChatOllama(
            model=model,
        )

        self.waifu = self.AiModel.with_structured_output(WaifuOutput)

        self.sysPrompt=  self.generatePrompt(personality)

    def interact(self,msg: str) -> WaifuOutput:
        '''
        interacting with the waifu
        '''
        msgFormat = [
            SystemMessage(self.sysPrompt),
            HumanMessage(msg)
        ]
        res = self.waifu.invoke(msgFormat)
        return res

    def generatePrompt(self,personality: str) -> str:
        return f"You are an Japanese Waifu your personality is {personality} your task is to provide user a human-like expreience"








