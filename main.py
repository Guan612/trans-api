import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import json
from dotenv import load_dotenv

app = FastAPI()
load_dotenv()

# 1. 配置 CORS (跨域资源共享)，允许 Flutter 前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制域名，测试环境允许所有
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. 定义请求和响应模型
class TranslateRequest(BaseModel):
    text: str

class TranslateResponse(BaseModel):
    translation: str
    keywords: list[str]

api_key = os.getenv("API_KEY")

if not api_key:
    raise ValueError("未找到 API Key，请检查 .env 文件是否配置正确！")

# 3. 配置 AI 客户端 (这里以 DeepSeek 为例，也可换成通义千问等)
# 请在环境变量中设置 DEEPSEEK_API_KEY，或者直接填入字符串(不推荐用于生产)
client = OpenAI(
    api_key=api_key,
    base_url="https://api.siliconflow.cn" # 如果是用其他模型，修改这里
)

@app.post("/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    try:
        # 4. 构造 Prompt，强制要求 AI 返回 JSON 格式
        prompt = f"""
        请将以下中文翻译成英文，并提取3个英文关键词。
        内容：{request.text}
        
        请严格只返回 JSON 格式，不要包含 Markdown 标记或其他废话。格式如下：
        {{
            "translation": "翻译后的英文",
            "keywords": ["keyword1", "keyword2", "keyword3"]
        }}
        """

        response = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-V3.2", # 根据实际使用的模型修改模型名称
            messages=[
                {"role": "system", "content": "你是一个专业的翻译助手，只返回JSON格式数据。"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            response_format={ "type": "json_object" } # 如果模型支持JSON模式最好开启
        )

        # 5. 解析 AI 返回的内容
        content = response.choices[0].message.content
        data = json.loads(content)
        
        return TranslateResponse(
            translation=data.get("translation", ""),
            keywords=data.get("keywords", [])
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 启动命令: uvicorn main:app --reload