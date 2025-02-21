import { useEffect, useState } from 'react'
import './App.css'
import api from './api'
import {Trash,Pencil,MoveLeft,CircleUser} from 'lucide-react'

function App() {

  const [display,setDisplay] = useState<number>(0)
  const [username,setUsername] = useState<string>("")
  const [password,setPassword] = useState<string>("")
  const [ID,setID] = useState<number>(0)
  const [message,setMessage] = useState<string>("")
  const [category,setCategory] = useState<string>("Food")
  const [description,setDescription] = useState<string>("")
  const [amount,setAmount] = useState<number>(0)
  const [error,setError] = useState<string|null>(null)

  const Login = async () => {
    setError(null)
    if(username===""||password===""){
      setError("Please enter all fields")
      return
    }
    try{
      const response = await api.post("/login",{username:username,password:password})
      if(response.status===200){
        setMessage(response.data.message)
        setID(response.data.id)
        setCategory("None")
        alert("Login Successful")
        setDisplay(3)
        setUsername("")
        setPassword("")
      }
    }catch(error:any){
      console.error(error)
      if(error.response){
        setError(error.response.data.detail)
      }else{
        setError("Couldnt perform login")
      }
    }
  }

  const Register = async () => {
    setError(null)
    if(username===""||password===""){
      setError("Please enter all fields")
      return
    }
    try{
      const response = await api.post("/new-user",{username:username,password:password})
      if(response.status===201){
        setMessage(response.data.message)
        setUsername("")
        setPassword("")
        setDisplay(0)
      }
    }catch(error:any){
      console.error(error)
      if(error.response){
        setError(error.response.data.detail)
      }else{
        setError("Error: Couldnt create a new user")
      }
    }
  }

  const Add = async () => {
    setError(null)
    const selectedCategory = category === "None" ? "Food" : category;
    if(description===""||amount===0){
      setError("Please enter all fields")
      return
    }
    try{
      const response = await api.post("/add",{user_id:ID,category:selectedCategory,description:description,amount:amount})
      if(response.status===201){
        setMessage(response.data.message)
        setCategory("None")
        setDescription("")
        setAmount(0)
        setDisplay(3)
      }
    }catch(error:any){
      console.error(error)
      setError("Couldnt add expense")
    }
  }

  const [expenses,setExpenses] = useState<{id:number,user_id:number,category:string,description:string,amount:number}[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalAmount,setTotalAmount] = useState<number>(0)

  const GetExpenses = async () => {
    setError(null)
    try{
      const response = await api.get(`/expenses?user_id=${ID}&category=${category}&page=${currentPage}&limit=10`)
      if(response.status===200){
        setExpenses(response.data.expenses)
        setTotalPages(response.data.total_pages)
        setTotalAmount(response.data.total_amount)
      }
    }catch(error:any){
      console.error(error)
      setError("Error: Couldnt get expenses")
    }
  }

  useEffect(()=>{
    if(display===3){
      GetExpenses()
    }
  },[display,category,currentPage])

  const NextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const PrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const Delete = async (expense_id:number) => {
    setError(null)
    try{
      const response = await api.post(`/delete?user_id=${ID}&id=${expense_id}`)
      if(response.status===200){
        setMessage(response.data.message)
        GetExpenses()
      }
    }catch(error:any){
      console.error(error)
      setError("Error: Couldnt delete expense")
    }
  }

  const [expenseID,setExpenseID] = useState<number>(0)

  const View = async (expense_id:number) => {
    setError(null)
    setDisplay(4)
    try{
      const response = await api.post(`/view?user_id=${ID}&id=${expense_id}`)
      if(response.status===200){
        setCategory(response.data.category)
        setDescription(response.data.description)
        setAmount(response.data.amount)
        setExpenseID(expense_id)
      }
    }catch(error:any){
      console.error(error)
      setError("Error: Couldnt view expense")
    }
  }

  const ToDisplay3 = () => {
    setCategory("None")
    setDescription("")
    setAmount(0)
    setExpenseID(0)
    setDisplay(3)
    setFlag(0)
  }

  const [flag,setFlag] = useState<number>(0)

  const ToEdit = async (expense_id:number) => {
    setExpenseID(expense_id)
    setFlag(1)
    setDisplay(2)
    try{
      const response = await api.post(`/view?user_id=${ID}&id=${expense_id}`)
      if(response.status===200){
        setCategory(response.data.category)
        setDescription(response.data.description)
        setAmount(response.data.amount)
      }
    }catch(error:any){
      console.error(error)
      setError("Error: Couldnt view expense")
    }
  }

  const Edit = async () => {
    setError(null)
    const selectedCategory = category === "None" ? "Food" : category;
    if(description===""||amount===0){
      setError("Please enter all fields")
      return
    }
    try{
      const response = await api.post(`/edit?id=${expenseID}`,{user_id:ID,category:selectedCategory,description:description,amount:amount})
      if(response.status===200){
        setDisplay(3)
        setFlag(0)
        setCategory("None")
        setDescription("")
        setAmount(0)
        setExpenseID(0)
        setMessage(response.data.message)
      }
    }catch(error:any){
      console.error(error)
      setError("Error: Couldnt edit expense")
    }
  }

  const DefaultCategories = async () => {
    setError(null)
    try{
      const response = await api.post(`/category?category=Food`)
      if(response.status===201){
        setMessage(response.data.message)
        setCategory(category)
      }
    }catch(error:any){
      console.error(error)
      if(error.response){
        setError(error.response.data.detail)
      }else{
        setError("Error: Couldnt add category")
      }
    }
    try{
      const response = await api.post(`/category?category=Rent`)
      if(response.status===201){
        setMessage(response.data.message)
        setCategory(category)
      }
    }catch(error:any){
      console.error(error)
      if(error.response){
        setError(error.response.data.detail)
      }else{
        setError("Error: Couldnt add category")
      }
    }
    try{
      const response = await api.post(`/category?category=Transport`)
      if(response.status===201){
        setMessage(response.data.message)
        setCategory(category)
      }
    }catch(error:any){
      console.error(error)
      if(error.response){
        setError(error.response.data.detail)
      }else{
        setError("Error: Couldnt add category")
      }
    }
    try{
      const response = await api.post(`/category?category=Other`)
      if(response.status===201){
        setMessage(response.data.message)
        setCategory(category)
      }
    }catch(error:any){
      console.error(error)
      if(error.response){
        setError(error.response.data.detail)
      }else{
        setError("Error: Couldnt add category")
      }
    }
  }

  useEffect(()=>{
    DefaultCategories()
  },[])

  const [categories,setCategories] = useState<{category:string}[]>([])

  const GetCategories = async () => {
    setError(null)
    try{
      const response = await api.get("/categories")
      if(response.status===200){
        setCategories(response.data.categories)
      }
    }catch(error:any){
      console.error(error)
      setError("Error: Couldnt get categories")
    }
  }

  useEffect(()=>{
    GetCategories()
  },[category,display])

  const Category = async () => {
    setError(null)
    if(category===""){
      setError("Cant Enter an Empty Field")
    }
    try{
      const response = await api.post(`/category?category=${category}`)
      if(response.status===201){
        setMessage(response.data.message)
        setCategory(category)
        setDisplay(2)
      }
    }catch(error:any){
      console.error(error)
      if(error.response){
        setError(error.response.data.detail)
      }else{
        setError("Error: Couldnt add category")
      }
    }
  }

  const ToAddCategory = () => {
    setDisplay(6)
  }

  return (
    <div className='bg-green-400 min-w-screen min-h-screen'>
      {display===0 && 
        <div className='text-white flex justify-center items-center min-w-screen min-h-screen'>
          <div className='my-auto rounded-lg border-3 bg-white text-gray-500 px-5 py-5'>
            <h1 className='text-center font-bold text-2xl'>Welcome Back!</h1>
            <p className='text-center mt-2 text-lg text-gray-400 font-semibold'>Enter your details to login</p>
            <div className='mb-5 mt-7 flex justify-between'>
              <label className='mr-2 font-semibold'>Enter username:</label>
              <input type='text' value={username} onChange={(e)=>setUsername(e.target.value)} className={`px-1 placeholder:text-sm border-2 rounded`} placeholder='Enter your username...'/>
            </div>
            <div className='flex justify-between'>
              <label className='mr-2 font-semibold'>Enter password:</label>
              <input type='password' value={password} onChange={(e)=>setPassword(e.target.value)} className={`px-1 placeholder:text-sm border-2 rounded`} placeholder='Enter your password...'/>
            </div>
            <div className='flex justify-center mt-7'>
              <button className='cursor-pointer border-2 font-semibold px-2 py-1 hover:bg-gray-500 hover:text-white rounded-2xl' onClick={Login}>Login</button>
            </div>
            <p className='text-red-500 text-center mt-2'>{error}</p>
            <div className='text-center mt-5'>
              <p>Dont have an account ? <span className='hover:underline font-semibold cursor-pointer' onClick={()=>setDisplay(1)}>Sign Up</span></p>
            </div>
          </div>
        </div>
      }
      {display===1 && 
        <div className='text-white flex justify-center items-center min-w-screen min-h-screen'>
          <div className='my-auto rounded-lg border-3 bg-white text-gray-500 px-5 py-5'>
            <h1 className='text-center font-bold text-2xl'>Welcome!</h1>
            <p className='text-center mt-2 text-lg text-gray-400 font-semibold'>Enter your details to Register</p>
            <div className='mb-5 mt-7 flex justify-between'>
              <label className='mr-2 font-bold'>Enter username:</label>
              <input type='text' value={username} onChange={(e)=>setUsername(e.target.value)} className={`px-1 placeholder:text-sm border-2 rounded`} placeholder='Enter your username...'/>
            </div>
            <div className='flex justify-between'>
              <label className='mr-2 font-bold'>Enter password:</label>
              <input type='password' value={password} onChange={(e)=>setPassword(e.target.value)} className={`px-1 placeholder:text-sm border-2 rounded`} placeholder='Enter your password...'/>
            </div>
            <div className='flex justify-center mt-7'>
              <button className='cursor-pointer border-2 px-2 py-1 hover:bg-gray-500 hover:text-white rounded-2xl font-semibold' onClick={Register}>Register</button>
            </div>  
            <p className='text-red-500 text-center mt-2'>{error}</p>
          </div>
        </div>
      }
      {display===2 && 
        <div className='text-white flex justify-center items-center min-w-screen min-h-screen'>
          <div className='my-auto rounded-lg border-3 bg-white text-gray-500 px-5 py-5'>
            <div className='flex justify-between mb-3'>
              <p className='cursor-pointer hover:underline pt-1 mb-2' onClick={ToDisplay3}><MoveLeft className='inline mr-5'/>Back</p>
              <button onClick={ToAddCategory} className='border px-2 rounded bg-black text-white font-semibold cursor-pointer'>Add Category</button>
            </div>
            <h1 className='text-center font-bold text-2xl'>{flag===0 ? "Enter Expense Details":"Edit Expense Details"}</h1>
            <div className='mb-5 mt-7 flex justify-between'>
              <label className='mr-2 font-semibold w-full'>{flag===0 ? "Enter Category:":"Edit Category:"}</label>
              <select className='w-full border-2' value={category} onChange={(e)=>setCategory(e.target.value)}>
                {categories.map((cat, index) => (
                  <option key={index} value={cat.category}>
                  {cat.category}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex justify-between mb-5'>
              <label className='mr-2 font-semibold'>{flag===0 ? "Enter Description:":"Edit Description:"}</label>
              <input type='text' value={description} onChange={(e)=>setDescription(e.target.value)} className={`px-1 placeholder:text-sm border-2 rounded`} placeholder='Detail of expense...'/>
            </div>
            <div className='flex justify-between'>
              <label className='mr-2 font-semibold'>{flag===0 ? "Enter Amount:":"Edit Amount:"}</label>
              <input type='number' value={amount === 0 ? "":amount} onChange={(e)=>setAmount(Number(e.target.value))} className={`px-1 border-2 rounded`} min={0}/>
            </div>
            <div className='flex justify-center mt-7'>
              <button className='cursor-pointer border-2 px-2 py-1 font-semibold hover:bg-gray-500 hover:text-white rounded-2xl' onClick={flag===0 ? Add:Edit}>{flag===0 ? "Add Expense":"Edit Expense"}</button>
            </div>  
            <p className='text-red-500 text-center mt-2'>{error?error:""}</p>
          </div>
        </div>
      }
      {display === 3 && (
        <div className="text-gray-700">
          <div className='flex justify-between'>
            <div className='w-full flex justify-center'>
              <CircleUser size={80} onClick={()=>setDisplay(5)} className='bg-white rounded-full mt-8 ml-5 cursor-pointer'/>
            </div>
            <h1 className="pt-10 text-center font-bold text-6xl w-full text-gray-500">
              <span className="bg-white border-3 rounded px-5 pb-2">Expenses</span>
            </h1>
            <div className='w-full'></div>
          </div>

          <div className="max-w-4xl mx-auto mt-15 bg-white p-5 border-3 rounded-lg shadow">
            <div className='flex justify-between'>
              <div>
                <p className='font-semibold'>Filter Category:
                  <button className={`mx-2 border p-2 cursor-pointer rounded hover:bg-gray-500 hover:text-white ${category==="None"? "border-2 bg-black text-white":""}`} onClick={()=>setCategory("None")}>None</button>
                  <button className={`mx-2 border p-2 cursor-pointer rounded hover:bg-gray-500 hover:text-white ${category==="Food"? "border-2 bg-black text-white":""}`} onClick={()=>setCategory("Food")} >Food</button>
                  <button className={`mx-2 border p-2 cursor-pointer rounded hover:bg-gray-500 hover:text-white ${category==="Rent"? "border-2 bg-black text-white":""}`} onClick={()=>setCategory("Rent")} >Rent</button>
                  <button className={`mx-2 border p-2 cursor-pointer rounded hover:bg-gray-500 hover:text-white ${category==="Transport"? "border-2 bg-black text-white":""}`} onClick={()=>setCategory("Transport")}>Transport</button>
                  <button className={`ml-2 border p-2 cursor-pointer rounded hover:bg-gray-500 hover:text-white ${category==="Other"? "border-2 bg-black text-white":""}`} onClick={()=>setCategory("Other")}>Other</button>
                </p>
              </div>
              <div>
                <button className='font-semibold border p-2 bg-black text-white cursor-pointer rounded' onClick={()=>setDisplay(2)}>Add Expense</button>
              </div>
            </div>
            <h1 className='mt-10 text-center font-bold text-4xl'>Total Expenses: <span className='border-2 p-1 rounded'>${totalAmount}</span></h1>
            <h2 className="text-2xl font-semibold text-center my-5">Expense List</h2>

            {expenses.length === 0 ? (
              <p className="text-center text-gray-500 mt-3">No expenses found.</p>)
               : (
              <table className="w-full border-collapse mt-5">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Category</th>
                    <th className="border px-4 py-2">Description</th>
                    <th className="border px-4 py-2">Amount ($)</th>
                    <th className="border px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                  <tr key={expense.id} className="text-center hover:bg-gray-100">
                    <td className="border px-4 py-2">{expense.category}</td>
                    <td className="border px-4 py-2 max-w-xs truncate">{expense.description}</td>
                    <td className="border px-4 py-2">{expense.amount.toFixed(2)}</td>
                    <td className="border px-4 py-2">
                      <div className='flex justify-between'>
                        <p className='hover:underline cursor-pointer' onClick={()=>View(expense.id)}>View</p>
                        <Pencil className='cursor-pointer' onClick={()=>ToEdit(expense.id)}/>
                        <Trash className='cursor-pointer' color='red' onClick={()=>Delete(expense.id)}/>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-between items-center mt-5">
              <button className="border cursor-pointer p-2 rounded hover:bg-gray-500 hover:text-white" onClick={PrevPage} disabled={currentPage === 1}>Previous</button>
              <span className="font-semibold">{`Page ${currentPage} of ${totalPages}`}</span>
              <button className="border cursor-pointer p-2 rounded hover:bg-gray-500 hover:text-white" onClick={NextPage} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        </div>
      )}
      {display===4 && 
        <div className='w-[80%] min-h-screen mx-auto flex justify-center items-center'>
          <div className='bg-white w-full text-gray-500 border rounded'>
            <div className='flex justify-between mx-5 py-5 font-semibold text-lg'>
              <p className='cursor-pointer hover:underline pt-1' onClick={ToDisplay3}><MoveLeft className='inline mr-5'/>Back to Expense List</p>
              <h1 className='font-bold text-3xl'>Expense Information</h1>
              <button className='bg-black text-white px-2 rounded cursor-pointer' onClick={()=>ToEdit(expenseID)}>Edit Expense</button>
            </div>
            <div className='mx-5 my-5'>
              <div className='flex justify-between'>
                <p className='w-full text-center font-bold text-xl'>Category: <span className='font-semibold text-lg border-2 p-1 rounded'>{category}</span></p>
                <p className='w-full text-center font-bold text-xl'>Amount: <span className='font-semibold text-lg border-2 p-1 rounded'>{amount}</span></p>
              </div>
              <div>
                <p className='font-bold text-xl'>Description:</p>
                <p className='ml-5 font-semibold mt-2 text-lg mb-5 border-2 p-1 rounded'>{description}</p>
              </div>
            </div>
          </div>
        </div>
      }
      {display===5 && 
        <div className='w-[80%] min-h-screen mx-auto flex justify-center items-center'>
          <div className='bg-white w-full text-gray-500 border-3 rounded-md'>
            <div className='flex justify-between mx-5 py-5 font-semibold text-lg'>
              <p className='cursor-pointer hover:underline pt-1 w-full' onClick={(ToDisplay3)}><MoveLeft className='inline mr-5'/>Back to Expense List</p>
              <button className='font-bold text-3xl w-full pb-2'><span className='border pb-2 px-3 rounded bg-black text-white cursor-pointer' onClick={()=>setDisplay(0)}>Logout</span></button>
              <div className='w-full'></div>
            </div>
          </div>
        </div>
      }
      {display===6 && 
        <div className='w-[40%] min-h-screen mx-auto flex justify-center items-center'>
          <div className='bg-white w-full text-gray-500 border-3 rounded-md'>
            <div className='mx-5 py-5 font-semibold text-lg'>
              <p className='cursor-pointer hover:underline pt-1 w-full' onClick={()=>setDisplay(2)}><MoveLeft className='inline mr-5'/>Back</p>
              <div className='flex justify-between mb-5 mt-5'>
                <label className='mr-2 font-semibold'>Add New Category:</label>
                <input type='text' onChange={(e)=>setCategory(e.target.value)} className={`px-1 placeholder:text-sm border-2 rounded`} placeholder='Enter New Category...'/>
              </div>
              <div className='flex justify-center mt-8'>
                <button onClick={Category} className='pb-1 border px-2 rounded bg-black text-white font-semibold cursor-pointer'>Add Category</button>
              </div>
              <p className='text-red-500 my-2 text-center'>{error ? error:""}</p>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default App
