import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const [state, setState] = useState('Sign Up')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const apiUrl = backendUrl + '/api/user';
    let response;

    try {
      console.log(state);
      if (state === 'Sign Up') {
        response = await axios.post(`${apiUrl}/register`, { name, email, password });
      } else if (state === 'Forgot password') {
        response = await axios.post(`${apiUrl}/forgot-password`, { email });
      } else {
        response = await axios.post(`${apiUrl}/login`, { email, password });
      }

      const { data } = response;

      if (data.success) {
        if (state !== 'Forgot password') {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
        toast.success(data.message);
        setState("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Something went wrong!');
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>
          {state === 'Sign Up' ? 'Create Account' : state === 'Forgot password' ? 'Forgot Password' : 'Login'}
        </p>
        {state === 'Forgot password'
          ? <p>Please enter your email to reset your password</p>
          : <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>
        }

        {state === 'Sign Up' && (
          <div className='w-full '>
            <p>Full Name</p>
            <input onChange={(e) => setName(e.target.value)} value={name} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="text" required />
          </div>
        )}

        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
        </div>

        {state !== 'Forgot password' && (
          <div className='w-full '>
            <p>Password</p>
            <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
          </div>
        )}

        <button className='bg-primary text-white w-full py-2 my-2 rounded-md text-base'>
          {state === 'Sign Up' ? 'Create account' : state === 'Forgot password' ? 'Send reset link' : 'Login'}
        </button>

        {state === 'Sign Up' ? (
          <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
        ) : state === 'Forgot password' ? (
          <p>Remembered your password? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Click here to log in</span></p>
        ) : (
          <>
            <p>Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
            <p><span onClick={() => setState('Forgot password')} className='text-primary underline cursor-pointer'>Forgot password</span></p>
          </>
        )}
      </div>
    </form>
  )
}

export default Login