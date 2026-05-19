# from fastapi import FastAPI
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# from crewai import Agent, Task, Crew, LLM
# from dotenv import load_dotenv
# import os

# load_dotenv()

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Configure LLM
# llm = LLM(
#     model=os.getenv("MODEL"),
#     api_key=os.getenv("OPENAI_API_KEY"),
#     base_url=os.getenv("OPENAI_BASE_URL")
# )

# class UserQuestion(BaseModel):
#     question: str

# @app.post("/analyze")
# def analyze_question(data: UserQuestion):

#     question = data.question

#     research_agent = Agent(
#         role="Research Agent",
#         goal="Research the topic",
#         backstory="Expert researcher",
#         llm=llm,
#         verbose=True
#     )

#     comparison_agent = Agent(
#         role="Comparison Agent",
#         goal="Compare options with pros and cons",
#         backstory="Expert analyst",
#         llm=llm,
#         verbose=True
#     )

#     recommendation_agent = Agent(
#         role="Recommendation Agent",
#         goal="Give final recommendation",
#         backstory="Expert advisor",
#         llm=llm,
#         verbose=True
#     )

#     roadmap_agent = Agent(
#         role="Roadmap Agent",
#         goal="Create action plan",
#         backstory="Expert planner",
#         llm=llm,
#         verbose=True
#     )

#     task1 = Task(
#         description=f"Research this question: {question}",
#         agent=research_agent
#     )

#     task2 = Task(
#         description=f"Compare options for: {question}",
#         agent=comparison_agent
#     )

#     task3 = Task(
#         description=f"Give recommendation for: {question}",
#         agent=recommendation_agent
#     )

#     task4 = Task(
#         description=f"Create roadmap for: {question}",
#         agent=roadmap_agent
#     )

#     crew = Crew(
#         agents=[
#             research_agent,
#             comparison_agent,
#             recommendation_agent,
#             roadmap_agent
#         ],
#         tasks=[
#             task1,
#             task2,
#             task3,
#             task4
#         ],
#         verbose=True
#     )

#     result = crew.kickoff()

#     return {
#         "result": str(result)
#     }













# from fastapi import FastAPI
# from pydantic import BaseModel
# from dotenv import load_dotenv
# from openai import OpenAI
# import os

# load_dotenv()

# app = FastAPI()

# client = OpenAI(
#     api_key=os.getenv("OPENAI_API_KEY"),
#     base_url=os.getenv("OPENAI_BASE_URL")
# )

# class UserQuestion(BaseModel):
#     question: str

# @app.post("/analyze")
# def analyze_question(data: UserQuestion):

#     response = client.chat.completions.create(
#         model="deepseek/deepseek-chat",
#         messages=[
#             {
#                 "role": "user",
#                 "content": data.question
#             }
#         ]
#     )

#     return {
#         "result": response.choices[0].message.content
#     }














# from fastapi import FastAPI
# from pydantic import BaseModel
# from dotenv import load_dotenv
# from openai import OpenAI
# import os

# load_dotenv()

# app = FastAPI()

# client = OpenAI(
#     api_key=os.getenv("OPENAI_API_KEY"),
#     base_url=os.getenv("OPENAI_BASE_URL")
# )

# class UserQuestion(BaseModel):
#     question: str

# @app.get("/")
# def home():
#     return {"message": "Backend working"}

# @app.post("/analyze")
# def analyze_question(data: UserQuestion):

#     response = client.chat.completions.create(
#         model="deepseek/deepseek-chat",
#         messages=[
#             {
#                 "role": "user",
#                 "content": data.question
#             }
#         ]
#     )

#     return {
#         "result": response.choices[0].message.content
#     }













from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, LLM
import os

load_dotenv()

app = FastAPI(title="AI Decision Multi-Agent System", version="1.0.0")

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*").strip()
if allowed_origins_env in ("", "*"):
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_api_key = os.getenv("OPENAI_API_KEY")
groq_api_key = os.getenv("GROQ_API_KEY")
model = os.getenv("MODEL", "groq/llama-3.1-8b-instant")
base_url = os.getenv("OPENAI_BASE_URL")

if groq_api_key:
    llm = LLM(
        model=model,
        api_key=groq_api_key,
        temperature=0.5,
        max_tokens=250,
    )
elif openai_api_key:
    llm = LLM(
        model=model,
        api_key=openai_api_key,
        base_url=base_url,
        temperature=0.5,
        max_tokens=250,
    )
else:
    raise RuntimeError(
        "No API key configured. Set GROQ_API_KEY for Groq or OPENAI_API_KEY for OpenAI/OpenRouter."
    )

class UserQuestion(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "AI Decision Multi-Agent System Running"}

@app.post("/analyze")
def analyze_question(data: UserQuestion):

    question = data.question

    # AGENT 1
    research_agent = Agent(
        role="Research Agent",
        goal="Research and explain the topic clearly",
        backstory="Expert researcher and analyst",
        llm=llm,
        verbose=True
    )

    # AGENT 2
    comparison_agent = Agent(
        role="Comparison Agent",
        goal="Compare options with pros and cons",
        backstory="Expert comparison specialist",
        llm=llm,
        verbose=True
    )

    # AGENT 3
    risk_agent = Agent(
        role="Risk Analysis Agent",
        goal="Find risks and disadvantages",
        backstory="Expert risk analyst",
        llm=llm,
        verbose=True
    )

    # AGENT 4
    recommendation_agent = Agent(
        role="Recommendation Agent",
        goal="Give final recommendation",
        backstory="Expert advisor",
        llm=llm,
        verbose=True
    )

    # TASKS
    task1 = Task(
    description=f"""
    Research this question:
    {question}

    Explain the topic clearly.
    """,
    expected_output="Detailed research explanation",
    agent=research_agent
)

    task2 = Task(
    description=f"""
    Compare the options for:
    {question}

    Give pros and cons.
    """,
    expected_output="Comparison with pros and cons",
    agent=comparison_agent
)

    task3 = Task(
    description=f"""
    Find risks, challenges, and disadvantages for:
    {question}
    """,
    expected_output="List of risks and disadvantages",
    agent=risk_agent
)

    task4 = Task(
    description=f"""
    Give the best final recommendation for:
    {question}

    Also provide action steps.
    """,
    expected_output="Final recommendation and roadmap",
    agent=recommendation_agent
)
    # CREW
    crew = Crew(
        agents=[
            research_agent,
            comparison_agent,
            risk_agent,
            recommendation_agent
        ],
        tasks=[
            task1,
            task2,
            task3,
            task4
        ],
        verbose=True
    )

    try:
        result = crew.kickoff()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {exc}")

    return {
        "question": question,
        "final_result": str(result)
    }



















# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# from crewai import Agent, Task, Crew, LLM
# import os

# # LOAD ENV VARIABLES
# load_dotenv()

# # FASTAPI APP
# app = FastAPI(
#     title="AI Decision Multi-Agent System",
#     version="1.0.0"
# )

# # CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # OPENROUTER API KEY
# openrouter_api_key = os.getenv("OPENROUTER_API_KEY")

# if not openrouter_api_key:
#     raise RuntimeError("OPENROUTER_API_KEY not found in environment variables")

# # OPENROUTER LLM
# llm = LLM(
#     model="openrouter/openai/gpt-3.5-turbo",
#     api_key=openrouter_api_key,
#     base_url="https://openrouter.ai/api/v1",
#     temperature=0.5,
#     max_tokens=500
# )

# # REQUEST MODEL
# class UserQuestion(BaseModel):
#     question: str

# # HOME ROUTE
# @app.get("/")
# def home():
#     return {
#         "message": "AI Decision Multi-Agent System Running Successfully"
#     }

# # ANALYZE ROUTE
# @app.post("/analyze")
# def analyze_question(data: UserQuestion):

#     question = data.question

#     try:

#         # AGENT 1 — RESEARCH
#         research_agent = Agent(
#             role="Research Agent",
#             goal="Research and explain the topic clearly",
#             backstory="Expert researcher and analyst",
#             llm=llm,
#             verbose=True
#         )

#         # AGENT 2 — COMPARISON
#         comparison_agent = Agent(
#             role="Comparison Agent",
#             goal="Compare options with pros and cons",
#             backstory="Expert comparison specialist",
#             llm=llm,
#             verbose=True
#         )

#         # AGENT 3 — RISK ANALYSIS
#         risk_agent = Agent(
#             role="Risk Analysis Agent",
#             goal="Find risks and disadvantages",
#             backstory="Expert risk analyst",
#             llm=llm,
#             verbose=True
#         )

#         # AGENT 4 — FINAL RECOMMENDATION
#         recommendation_agent = Agent(
#             role="Recommendation Agent",
#             goal="Give final recommendation with action steps",
#             backstory="Expert advisor and strategist",
#             llm=llm,
#             verbose=True
#         )

#         # TASK 1
#         task1 = Task(
#             description=f"""
#             Research this question deeply:

#             {question}

#             Explain clearly with important insights.
#             """,
#             expected_output="Detailed research explanation",
#             agent=research_agent
#         )

#         # TASK 2
#         task2 = Task(
#             description=f"""
#             Compare all possible options for:

#             {question}

#             Give pros and cons clearly.
#             """,
#             expected_output="Comparison with pros and cons",
#             agent=comparison_agent
#         )

#         # TASK 3
#         task3 = Task(
#             description=f"""
#             Find risks, disadvantages, and challenges related to:

#             {question}
#             """,
#             expected_output="Risks and disadvantages",
#             agent=risk_agent
#         )

#         # TASK 4
#         task4 = Task(
#             description=f"""
#             Based on all analysis,
#             give the BEST final recommendation for:

#             {question}

#             Also provide practical action steps.
#             """,
#             expected_output="Final recommendation and action steps",
#             agent=recommendation_agent
#         )

#         # CREW
#         crew = Crew(
#             agents=[
#                 research_agent,
#                 comparison_agent,
#                 risk_agent,
#                 recommendation_agent
#             ],
#             tasks=[
#                 task1,
#                 task2,
#                 task3,
#                 task4
#             ],
#             verbose=True
#         )

#         # RUN CREW
#         result = crew.kickoff()

#         return {
#             "question": question,
#             "final_result": str(result)
#         }

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Agent execution failed: {str(e)}"
#         )