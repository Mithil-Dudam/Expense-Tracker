# Expense Tracker

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List,Annotated

from sqlalchemy import create_engine, asc, func
from sqlalchemy.orm import sessionmaker

from sqlalchemy import Column, Integer, String, Float, ForeignKey

from sqlalchemy.orm import Session,declarative_base

app=FastAPI()

origins = ['http://localhost:5173']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

URL_db = 'postgresql://postgres:password@localhost:5432/Expenses' 

engine = create_engine(URL_db)
sessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)
Base=declarative_base()

class Expenses(Base):
    __tablename__ = 'Expenses'
    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,ForeignKey("User.id"),index=True)
    category = Column(String,ForeignKey("Categories.category"),index=True)
    description = Column(String,index=True)
    amount = Column(Float,index=True)

class User(Base):
    __tablename__ = 'User'
    id = Column(Integer,primary_key=True,index=True)
    username = Column(String,index=True)
    password = Column(String,index=True)

class Categories(Base):
    __tablename__ = 'Categories'
    category = Column(String,primary_key=True,index=True)

class UserInfo(BaseModel):
    username:str
    password:str

class ExpenseInfo(BaseModel):
    user_id:int
    category:str
    description:str
    amount:float

Base.metadata.create_all(bind=engine)

def get_db():
    db=sessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency=Annotated[Session,Depends(get_db)]

@app.post("/new-user",status_code=status.HTTP_201_CREATED)
async def new_user(user:UserInfo,db:db_dependency):
    user_exits = db.query(User).filter(User.username==user.username).first()
    if user_exits:
        raise HTTPException(status_code=302,detail="Username already exits")
    db_user = User(username=user.username.strip(),password=user.password.strip())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message":"User Created Successfully"}


@app.post("/login",status_code=status.HTTP_200_OK)
async def login(user:UserInfo,db:db_dependency):
    user_exits = db.query(User).filter(User.username==user.username.strip(),User.password==user.password.strip()).first()
    if user_exits:
        return {"message":"Log In Successful","id":user_exits.id}
    raise HTTPException(status_code=404,detail="Invalid Username or Password!")

@app.post("/add",status_code=status.HTTP_201_CREATED)
async def add(expense:ExpenseInfo,db:db_dependency):
    db_expense = Expenses(user_id=expense.user_id,category=expense.category,description=expense.description.strip(),amount=expense.amount)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return {"message":"Expense Added Successfully"}

@app.get("/expenses",status_code=status.HTTP_200_OK)
async def expenses(user_id:int,category:str,db:db_dependency,page:int=1,limit:int=10):
    offset = (page - 1) * limit
    if category=="None":
        expenses = db.query(Expenses).filter(Expenses.user_id==user_id).order_by(Expenses.id.desc()).offset(offset).limit(limit).all()
        total_expenses = db.query(Expenses).filter(Expenses.user_id==user_id).count()
        total_amount = db.query(func.sum(Expenses.amount)).filter(Expenses.user_id==user_id).scalar() 
    else:
        expenses = db.query(Expenses).filter(Expenses.user_id==user_id,Expenses.category==category).order_by(Expenses.id.desc()).offset(offset).limit(limit).all()
        total_expenses = db.query(Expenses).filter(Expenses.user_id==user_id,Expenses.category==category).count()
        total_amount = db.query(func.sum(Expenses.amount)).filter(Expenses.user_id==user_id,Expenses.category==category).scalar() 

    total_pages = (total_expenses // limit) + (1 if total_expenses % limit != 0 else 0)
    return {"expenses":expenses,"page":page,"total_pages":total_pages,"total_amount":total_amount or 0}

@app.post("/delete",status_code=status.HTTP_200_OK)
async def delete(user_id:int,id:int,db:db_dependency):
    db_expense = db.query(Expenses).filter(Expenses.user_id==user_id,Expenses.id==id).first()
    db.delete(db_expense)
    db.commit()
    return {"message":"Expense Deleted Successfully"}

@app.post("/view",status_code=status.HTTP_200_OK)
async def view(user_id:int,id:int,db:db_dependency):
    db_expense = db.query(Expenses).filter(Expenses.user_id==user_id,Expenses.id==id).first()
    return {"category":db_expense.category,"description":db_expense.description,"amount":db_expense.amount}

@app.post("/edit",status_code=status.HTTP_200_OK)
async def edit(id:int,user:ExpenseInfo,db:db_dependency):
    db_expense = db.query(Expenses).filter(Expenses.user_id==user.user_id,Expenses.id==id).first()
    db_expense.category=user.category
    db_expense.description=user.description
    db_expense.amount=user.amount
    db.commit()
    db.refresh(db_expense)
    return {"message":"Expense Edited Successfully"}

@app.post("/category",status_code=status.HTTP_201_CREATED)
async def category(category:str,db:db_dependency):
    db_category = db.query(Categories).filter(func.lower(Categories.category)==category.lower().strip()).first()
    if db_category:
        raise HTTPException(status_code=302,detail="Category Already Exists")
    else:
        db_category = Categories(category=category)
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return {"message":"Category added successfully"}

@app.get("/categories",status_code=status.HTTP_200_OK)
async def categories(db:db_dependency):
    db_categories = db.query(Categories).all()
    return {"categories":db_categories}
